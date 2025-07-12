import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { logger, generateRequestId, extractRequestContext } from "@/lib/logger";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Define onboarding routes that require authentication but should be accessible during onboarding
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const requestContext = extractRequestContext(req);

  // Create request-scoped logger
  const requestLogger = logger.child({
    requestId,
    ...requestContext,
    userAgent: req.headers.get("user-agent") || undefined,
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
  });

  requestLogger.info("Middleware: Processing request", {
    path: req.nextUrl.pathname,
    searchParams: req.nextUrl.searchParams.toString() || undefined,
  });

  try {
    const { userId, sessionClaims } = await auth();
    const url = req.nextUrl;

    // Log authentication status
    requestLogger.debug("Middleware: Authentication check", {
      userId: userId || "anonymous",
      hasSession: !!sessionClaims,
    });

    // If user is not authenticated and trying to access protected routes, redirect to sign-in
    if (!userId && (isProtectedRoute(req) || isOnboardingRoute(req))) {
      requestLogger.info("Middleware: Redirecting unauthenticated user to login", {
        targetPath: url.pathname,
        isProtected: isProtectedRoute(req),
        isOnboarding: isOnboardingRoute(req),
      });

      const response = NextResponse.redirect(new URL("/auth/login", req.url));
      requestLogger.response("Middleware: Redirect to login", 302, Date.now() - startTime, {
        redirectTo: "/auth/login",
      });
      return response;
    }

    // If user is authenticated
    if (userId) {
      // Check onboarding status from Clerk publicMetadata
      const onboardingComplete = (sessionClaims?.metadata as { onboardingComplete?: boolean })?.onboardingComplete;

      requestLogger.debug("Middleware: User onboarding status", {
        userId,
        onboardingComplete: !!onboardingComplete,
      });

      // If user is authenticated and trying to access auth pages (except SSO callbacks)
      const isAuthPage = url.pathname.startsWith("/auth") || url.pathname === "/sign-in" || url.pathname === "/sign-up";
      const isSSOCallback = url.pathname.includes("/sso-callback");

      if (isAuthPage && !isSSOCallback) {
        if (!onboardingComplete) {
          requestLogger.info("Middleware: Redirecting authenticated user to onboarding", {
            userId,
            fromPath: url.pathname,
          });

          const response = NextResponse.redirect(new URL("/onboarding", req.url));
          requestLogger.response("Middleware: Redirect to onboarding", 302, Date.now() - startTime, {
            redirectTo: "/onboarding",
          });
          return response;
        }

        requestLogger.info("Middleware: Redirecting authenticated user to dashboard", {
          userId,
          fromPath: url.pathname,
        });

        const response = NextResponse.redirect(new URL("/dashboard", req.url));
        requestLogger.response("Middleware: Redirect to dashboard", 302, Date.now() - startTime, {
          redirectTo: "/dashboard",
        });
        return response;
      }

      // If user hasn't completed onboarding and is trying to access dashboard
      if (!onboardingComplete && isProtectedRoute(req) && !isOnboardingRoute(req)) {
        requestLogger.info("Middleware: User needs to complete onboarding", {
          userId,
          targetPath: url.pathname,
        });

        const response = NextResponse.redirect(new URL("/onboarding", req.url));
        requestLogger.response("Middleware: Redirect to onboarding from protected route", 302, Date.now() - startTime, {
          redirectTo: "/onboarding",
        });
        return response;
      }

      // If user has completed onboarding and is trying to access onboarding routes
      if (onboardingComplete && isOnboardingRoute(req)) {
        requestLogger.info("Middleware: User already completed onboarding", {
          userId,
          targetPath: url.pathname,
        });

        const response = NextResponse.redirect(new URL("/dashboard", req.url));
        requestLogger.response("Middleware: Redirect completed user to dashboard", 302, Date.now() - startTime, {
          redirectTo: "/dashboard",
        });
        return response;
      }
    }

    // Allow the request to proceed
    requestLogger.debug("Middleware: Request proceeding", {
      userId: userId || "anonymous",
      finalPath: url.pathname,
    });

    const response = NextResponse.next();
    requestLogger.response("Middleware: Request processed successfully", 200, Date.now() - startTime);
    return response;
  } catch (error) {
    requestLogger.error(
      "Middleware: Unexpected error",
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      error instanceof Error ? error : undefined
    );

    // Return a 500 response for unexpected errors
    const response = NextResponse.json({ error: "Internal server error" }, { status: 500 });

    requestLogger.response("Middleware: Error response", 500, Date.now() - startTime);
    return response;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
