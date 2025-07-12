# Authentication Documentation

This document explains how authentication works in the Xevon AI application, including the integration between Clerk and Prisma for user management.

## Overview

The application uses **Clerk** for authentication and authorization, integrated with a **Prisma** database for storing additional user data. This hybrid approach allows us to leverage Clerk's robust authentication features while maintaining our own user data model.

## Architecture Components

### 1. Clerk Authentication Provider

**Location**: `app/layout.tsx`

The entire application is wrapped with `ClerkProvider`, enabling authentication throughout the app:

```tsx
<ClerkProvider>
  <html lang="en" suppressHydrationWarning>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </body>
  </html>
</ClerkProvider>
```

### 2. Route Protection Middleware

**Location**: `middleware.ts`

The middleware handles automatic redirects based on authentication status:

- **Protected Routes**: `/dashboard/*` - Redirects unauthenticated users to `/auth/login`
- **Auth Routes**: `/auth/*` - Redirects authenticated users to `/dashboard`

```typescript
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // Protected dashboard routes
  if (pathname.startsWith('/dashboard') && !userId) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth') && userId) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});
```

### 3. Database Schema

**Location**: `prisma/schema.prisma`

The User model stores additional profile information and relationships:

```prisma
model User {
  id          String   @id @default(cuid())
  clerkId     String   @unique // Links to Clerk user
  email       String   @unique
  firstName   String?
  lastName    String?
  imageUrl    String?
  role        String   @default("user")
  company     String?
  plan        String   @default("free")
  timezone    String   @default("UTC")
  bio         String?
  isActive    Boolean  @default(true)
  lastSeenAt  DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  connectors  Connector[]
  reports     Report[]

  @@map("users")
}
```

### 4. User Synchronization Service

**Location**: `lib/services/user-service.ts`

The `UserService` class handles all user-related database operations:

#### Key Methods:

- **`syncUserFromClerk(clerkUser)`**: Creates or updates user data from Clerk
- **`getUserByClerkId(clerkId)`**: Retrieves user with relationships
- **`updateUserProfile(clerkId, profileData)`**: Updates user profile
- **`deleteUser(clerkId)`**: Removes user and cascaded data
- **`getUserStats(clerkId)`**: Gets user statistics and usage

#### Synchronization Strategy:

Uses the **upsert pattern** to ensure data consistency:

```typescript
const user = await prisma.user.upsert({
  where: { clerkId: clerkUser.id },
  update: {
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    imageUrl: userData.imageUrl,
    lastSeenAt: userData.lastSeenAt,
  },
  create: userData,
});
```

### 5. Webhook Integration

**Location**: `app/api/webhooks/clerk/route.ts`

Real-time synchronization between Clerk and our database using webhooks:

#### Supported Events:

- **`user.created`**: Automatically creates user in our database
- **`user.updated`**: Updates user information
- **`user.deleted`**: Removes user and related data

#### Security:

- Webhook verification using `svix` library
- Environment variable `CLERK_WEBHOOK_SECRET` for signature validation

```typescript
const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
const evt = wh.verify(payload, headers) as WebhookEvent;
```

### 6. Authentication Pages

**Locations**: `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`

Both pages use Clerk's pre-built components with custom styling:

- **Login**: `<SignIn />` component
- **Signup**: `<SignUp />` component

Custom appearance configuration maintains brand consistency:

```typescript
<SignIn 
  appearance={{
    elements: {
      rootBox: "w-full",
      card: "shadow-xl border-border/50",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      socialButtonsBlockButton: "border-border/50 hover:bg-muted/50",
      formFieldInput: "border-border/50",
      footerActionLink: "text-primary hover:text-primary/80",
    },
  }}
  redirectUrl="/dashboard"
/>
```

## Environment Variables

Required environment variables for authentication:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL="postgresql://..."
```

## Data Flow

### User Registration Flow:

1. User completes signup on `/auth/signup`
2. Clerk creates user account
3. Clerk sends `user.created` webhook
4. Webhook handler calls `UserService.syncUserFromClerk()`
5. User record created in Prisma database
6. User redirected to `/dashboard`

### User Login Flow:

1. User completes login on `/auth/login`
2. Clerk authenticates user
3. Middleware allows access to protected routes
4. User data loaded from Prisma database using `clerkId`

### Data Synchronization:

- **Real-time**: Webhook events for immediate sync
- **On-demand**: Service methods for manual operations
- **Consistency**: Upsert pattern prevents duplicate records

## Security Considerations

### Route Protection:
- Middleware-level authentication checks
- Automatic redirects for unauthorized access
- Protected API routes (can be added as needed)

### Data Privacy:
- Sensitive auth data managed by Clerk
- Profile data stored in our database
- Webhook signature verification

### Access Control:
- Role-based permissions (extensible)
- User activity tracking
- Cascade deletion for data cleanup

## Usage Examples

### Getting Current User in Server Components:

```typescript
import { auth } from '@clerk/nextjs/server';
import { UserService } from '@/lib/services/user-service';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/auth/login');
  }
  
  const user = await UserService.getUserByClerkId(userId);
  
  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
    </div>
  );
}
```

### Getting Current User in Client Components:

```typescript
import { useUser } from '@clerk/nextjs';

export default function UserProfile() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Hello, {user?.firstName}!</h1>
      <img src={user?.imageUrl} alt="Profile" />
    </div>
  );
}
```

### Updating User Profile:

```typescript
import { UserService } from '@/lib/services/user-service';

const handleUpdateProfile = async (profileData) => {
  try {
    await UserService.updateUserProfile(userId, {
      company: profileData.company,
      role: profileData.role,
      timezone: profileData.timezone,
      bio: profileData.bio,
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
};
```

## Troubleshooting

### Common Issues:

1. **User not found in database**: Check webhook configuration and ensure events are being received
2. **Redirect loops**: Verify middleware configuration and route patterns
3. **Webhook verification failed**: Confirm `CLERK_WEBHOOK_SECRET` is correctly set
4. **Database connection issues**: Check `DATABASE_URL` and Prisma client configuration

### Debug Steps:

1. Check Clerk dashboard for user creation events
2. Verify webhook endpoint is accessible
3. Review server logs for sync errors
4. Test database connection with Prisma Studio

## Onboarding Flow

### Overview

The application includes a comprehensive onboarding flow that guides new users through initial setup using Clerk's `publicMetadata` system. This ensures users configure their preferences and understand the platform before accessing the main dashboard.

### Onboarding Architecture

#### 1. **Metadata-Based Tracking**

The onboarding system uses two data sources:

- **Clerk publicMetadata**: `onboardingComplete` flag for middleware routing
- **Prisma Database**: Detailed onboarding progress and preferences

```typescript
// Clerk metadata structure
publicMetadata: {
  onboardingComplete: boolean;
  role?: string;
  company?: string;
  timezone?: string;
}

// Prisma User model additions
model User {
  // ... existing fields
  onboardingComplete Boolean  @default(false)
  onboardingStep     String?  // current step if incomplete
  preferences        Json?    // user preferences
}
```

#### 2. **Middleware Integration**

The middleware (`middleware.ts`) automatically redirects users based on onboarding status:

```typescript
// Check onboarding status from Clerk metadata
const onboardingComplete = sessionClaims?.metadata?.onboardingComplete;

// Redirect logic
if (!onboardingComplete && isProtectedRoute(req) && !isOnboardingRoute(req)) {
  return NextResponse.redirect(new URL("/onboarding", req.url));
}
```

#### 3. **Multi-Step Flow**

The onboarding consists of 4 progressive steps:

1. **Welcome Step** (`/components/onboarding/welcome-step.tsx`)
   - User profile information (role, company)
   - Display current user data from Clerk
   - Role selection from predefined options

2. **Preferences Step** (`/components/onboarding/preferences-step.tsx`)
   - Timezone configuration
   - Notification preferences (email, push)
   - Settings that affect user experience

3. **Connectors Step** (`/components/onboarding/connectors-step.tsx`)
   - Platform selection (Slack, Teams, GitHub, Discord)
   - Optional connector pre-selection
   - Can be skipped for later setup

4. **Completion Step** (`/components/onboarding/completion-step.tsx`)
   - Configuration summary
   - Feature highlights
   - Final setup and metadata update

### API Integration

#### **Onboarding Completion Endpoint**

**Location**: `/app/api/onboarding/complete/route.ts`

Handles the final onboarding step by updating both Clerk and database:

```typescript
// Update Clerk metadata
await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    onboardingComplete: true,
    role,
    company,
    timezone,
  },
});

// Update database record
await prisma.user.upsert({
  where: { clerkId: userId },
  update: {
    onboardingComplete: true,
    preferences: { notifications, selectedConnectors },
    // ... other fields
  },
  // ... create fallback
});
```

### State Management

#### **useOnboarding Hook**

**Location**: `/lib/hooks/use-onboarding.ts`

Provides centralized state management for the onboarding flow:

```typescript
const {
  currentStep,
  isCompleting,
  onboardingData,
  isOnboardingComplete,
  updateOnboardingData,
  completeOnboarding,
} = useOnboarding();
```

#### **Features**:
- Step navigation controls
- Data persistence across steps
- Completion status tracking
- Error handling for API calls

### User Experience

#### **Progressive Disclosure**
- Each step focuses on specific configuration areas
- Users can skip optional steps
- Progress indicator shows completion status
- Smooth animations between steps

#### **Data Validation**
- Required fields enforced before proceeding
- Form validation with user feedback
- Graceful error handling

#### **Responsive Design**
- Mobile-first responsive layout
- Touch-friendly interactions
- Consistent with auth page styling

### Route Protection

#### **Onboarding Routes**
- `/onboarding` - Main onboarding flow
- Protected by authentication middleware
- Accessible only during incomplete onboarding

#### **Redirect Logic**
1. **Unauthenticated users** → `/auth/login`
2. **Incomplete onboarding** → `/onboarding`
3. **Complete onboarding** → `/dashboard`
4. **Onboarding complete + onboarding route** → `/dashboard`

### Database Schema

The User model includes onboarding-specific fields:

```prisma
model User {
  // ... existing fields
  
  // Onboarding tracking
  onboardingComplete Boolean  @default(false)
  onboardingStep     String?  // current step if incomplete
  preferences        Json?    // user preferences collected during onboarding
}
```

### Usage Examples

#### **Checking Onboarding Status in Components**

```typescript
import { useUser } from '@clerk/nextjs';

export default function Dashboard() {
  const { user } = useUser();
  const isOnboardingComplete = user?.publicMetadata?.onboardingComplete;
  
  if (!isOnboardingComplete) {
    // This shouldn't happen due to middleware, but good fallback
    redirect('/onboarding');
  }
  
  return <DashboardContent />;
}
```

#### **Server-Side Onboarding Check**

```typescript
import { auth } from '@clerk/nextjs/server';

export default async function ServerComponent() {
  const { sessionClaims } = await auth();
  const onboardingComplete = sessionClaims?.metadata?.onboardingComplete;
  
  if (!onboardingComplete) {
    redirect('/onboarding');
  }
  
  return <ProtectedContent />;
}
```

### Customization

#### **Adding New Steps**
1. Create new step component in `/components/onboarding/`
2. Update `TOTAL_STEPS` in `/app/onboarding/page.tsx`
3. Add step logic to `getStepComponent()` function
4. Update progress indicator labels

#### **Modifying Data Collection**
1. Update `OnboardingData` type in `/app/onboarding/page.tsx`
2. Modify step components to collect new data
3. Update API endpoint to handle new fields
4. Add corresponding database fields if needed

### Troubleshooting

#### **Common Issues**

1. **Onboarding loops**: Check Clerk metadata sync and API endpoint
2. **Redirect conflicts**: Verify middleware route matchers
3. **Data persistence**: Ensure API calls complete successfully
4. **UI state issues**: Check step navigation logic

#### **Debug Steps**

1. Check Clerk dashboard for user metadata
2. Verify database user record creation
3. Review middleware logs for redirect logic
4. Test API endpoint directly

### Security Considerations

- Onboarding data validated server-side
- User authentication required for all onboarding routes
- Metadata updates use secure Clerk API
- Database operations use authenticated user context

## Next Steps

- Implement role-based access control based on onboarding data
- Add user preferences management in settings
- Set up user analytics and usage tracking
- Configure email notifications for account events
- Extend onboarding for team/organization setup