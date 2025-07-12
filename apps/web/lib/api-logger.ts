/**
 * API Logging Middleware for Next.js Route Handlers
 * Provides consistent logging across all API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, generateRequestId, extractRequestContext, LogContext } from './logger';

export interface ApiLoggerOptions {
  excludeBody?: boolean;
  excludeQuery?: boolean;
  sanitizeHeaders?: string[];
  maxBodyLength?: number;
}

export type ApiHandler = (
  request: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse>;

export type LoggingApiHandler = (
  request: NextRequest,
  context?: { params?: Record<string, string> },
  requestLogger?: ReturnType<typeof logger.child>
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with comprehensive logging
 */
export function withApiLogging(
  handler: LoggingApiHandler,
  options: ApiLoggerOptions = {}
): ApiHandler {
  return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const requestContext = extractRequestContext(request);
    
    const {
      excludeBody = false,
      excludeQuery = false,
      sanitizeHeaders = ['authorization', 'cookie', 'x-api-key'],
      maxBodyLength = 1000
    } = options;

    // Create request-scoped logger
    const requestLogger = logger.child({
      requestId,
      ...requestContext,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      params: context?.params
    });

    // Log request start
    const logContext: LogContext = {
      contentLength: request.headers.get('content-length') || undefined,
      contentType: request.headers.get('content-type') || undefined,
    };

    if (!excludeQuery && request.nextUrl.searchParams.toString()) {
      logContext.query = request.nextUrl.searchParams.toString();
    }

    // Log sanitized headers (exclude sensitive ones)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (!sanitizeHeaders.includes(key.toLowerCase())) {
        headers[key] = value;
      } else {
        headers[key] = '[REDACTED]';
      }
    });
    logContext.headers = headers;

    requestLogger.request('API: Request received', request, logContext);

    let response: NextResponse;
    let responseBody: unknown;

    try {
      // Clone request for body reading if needed
      let bodyContent: unknown;
      if (!excludeBody && 
          request.method !== 'GET' && 
          request.method !== 'HEAD' &&
          request.headers.get('content-length') !== '0') {
        
        try {
          const clonedRequest = request.clone();
          const contentType = request.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            bodyContent = await clonedRequest.json();
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await clonedRequest.formData();
            bodyContent = Object.fromEntries(formData.entries());
          } else {
            const text = await clonedRequest.text();
            bodyContent = text.length > maxBodyLength 
              ? text.slice(0, maxBodyLength) + '...'
              : text;
          }

          requestLogger.debug('API: Request body parsed', {
            bodyType: typeof bodyContent,
            bodySize: JSON.stringify(bodyContent).length,
            sanitizedBody: sanitizeBodyForLogging(bodyContent)
          });
        } catch (bodyError) {
          requestLogger.warn('API: Failed to parse request body', {
            error: bodyError instanceof Error ? bodyError.message : 'Unknown error',
            contentType: request.headers.get('content-type')
          });
        }
      }

      // Call the actual handler
      response = await handler(request, context, requestLogger);

      // Try to capture response data for logging
      if (response.headers.get('content-type')?.includes('application/json')) {
        try {
          const clonedResponse = response.clone();
          responseBody = await clonedResponse.json();
        } catch {
          // Response might not be JSON or might be stream
          responseBody = '[Non-JSON Response]';
        }
      }

      const duration = Date.now() - startTime;
      
      requestLogger.response('API: Request completed successfully', response.status, duration, {
        responseSize: response.headers.get('content-length') || undefined,
        responseType: response.headers.get('content-type') || undefined,
        cacheControl: response.headers.get('cache-control') || undefined,
        responseBody: response.status >= 400 ? responseBody : undefined // Only log response body for errors
      });

      // Log performance warning for slow requests
      if (duration > 5000) {
        requestLogger.performance('API: Slow request detected', duration, {
          slowRequestThreshold: 5000
        });
      }

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      requestLogger.error('API: Request failed with error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        duration
      }, error instanceof Error ? error : undefined);

      // Create error response
      const errorResponse = NextResponse.json(
        { 
          error: 'Internal server error',
          requestId // Include request ID for debugging
        },
        { status: 500 }
      );

      requestLogger.response('API: Error response sent', 500, duration, {
        requestId
      });

      return errorResponse;
    }
  };
}

/**
 * Sanitizes request/response body for logging by removing sensitive fields
 */
function sanitizeBodyForLogging(body: unknown): unknown {
  if (typeof body !== 'object' || body === null) {
    return body;
  }

  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'authorization',
    'credit_card', 'creditCard', 'ssn', 'social_security',
    'api_key', 'apiKey', 'private_key', 'privateKey'
  ];

  const sanitized = { ...body as Record<string, unknown> };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Creates a standardized error response with logging
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  requestLogger?: ReturnType<typeof logger.child>,
  additionalContext?: LogContext
): NextResponse {
  const requestId = generateRequestId();
  
  if (requestLogger) {
    requestLogger.error(`API: ${message}`, {
      statusCode: status,
      requestId,
      ...additionalContext
    });
  } else {
    logger.error(`API: ${message}`, {
      statusCode: status,
      requestId,
      ...additionalContext
    });
  }

  return NextResponse.json(
    { 
      error: message,
      requestId
    },
    { status }
  );
}

/**
 * Creates a standardized success response with logging
 */
export function createSuccessResponse(
  data: unknown,
  status: number = 200,
  requestLogger?: ReturnType<typeof logger.child>,
  additionalContext?: LogContext
): NextResponse {
  if (requestLogger) {
    requestLogger.info('API: Success response created', {
      statusCode: status,
      dataType: typeof data,
      ...additionalContext
    });
  }

  return NextResponse.json(data, { status });
}