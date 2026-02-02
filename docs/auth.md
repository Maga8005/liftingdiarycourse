# Authentication Standards

## Overview

This document outlines the mandatory authentication coding standards for the Lifting Diary project.

## Authentication Provider

**Clerk is the ONLY approved authentication provider for this project.**

- Documentation: https://clerk.com/docs
- All authentication MUST be implemented using Clerk
- Do NOT implement custom authentication logic

## Architecture

### ClerkProvider Setup

The application MUST be wrapped with `ClerkProvider` in the root layout:

```typescript
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Middleware Protection

All routes are protected by Clerk middleware. The middleware configuration is in `middleware.ts`:

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## Rules

### 1. Use Clerk Components for UI

**ONLY use Clerk's pre-built components for authentication UI.**

Available components:

- `<SignInButton>` - Triggers sign-in flow
- `<SignUpButton>` - Triggers sign-up flow
- `<SignOutButton>` - Triggers sign-out
- `<UserButton>` - User profile dropdown with sign-out
- `<SignedIn>` - Renders children only when user is authenticated
- `<SignedOut>` - Renders children only when user is not authenticated

```typescript
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

// Example usage
<SignedOut>
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</SignedOut>
<SignedIn>
  <UserButton />
</SignedIn>
```

### 2. Server-Side Authentication

**In Server Components, ALWAYS use `auth()` from `@clerk/nextjs/server`.**

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // User is authenticated, proceed with page logic
  return <div>Protected content for user: {userId}</div>;
}
```

### 3. Client-Side Authentication

**In Client Components, use the `useAuth` or `useUser` hooks.**

```typescript
"use client";

import { useAuth, useUser } from "@clerk/nextjs";

export function ClientComponent() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Hello, {user?.firstName}</div>;
}
```

### 4. Protecting Pages

**All authenticated pages MUST verify the user before rendering.**

```typescript
// CORRECT - Always check authentication
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Safe to render protected content
  return <Dashboard />;
}

// WRONG - No authentication check (SECURITY VULNERABILITY)
export default async function DashboardPage() {
  return <Dashboard />; // Anyone can access!
}
```

### 5. User ID for Data Queries

**ALWAYS pass the authenticated `userId` to data fetching functions.**

See `docs/data-fetching.md` for detailed data isolation requirements.

```typescript
import { auth } from "@clerk/nextjs/server";
import { getUserWorkouts } from "@/data/workouts";

export default async function WorkoutsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Pass userId to ensure user can only access their own data
  const workouts = await getUserWorkouts(userId);

  return <WorkoutsList workouts={workouts} />;
}
```

## Prohibited Practices

Do NOT:

- Create custom authentication forms or flows
- Store passwords or authentication tokens manually
- Use session cookies outside of Clerk
- Implement custom JWT validation
- Use `localStorage` or `sessionStorage` for auth state
- Bypass Clerk middleware for protected routes

## Environment Variables

Required Clerk environment variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

**NEVER commit these values to version control.**

## Summary Checklist

Before writing any authentication code, verify:

- [ ] `ClerkProvider` wraps the application in root layout
- [ ] Clerk middleware is configured in `middleware.ts`
- [ ] Server Components use `auth()` from `@clerk/nextjs/server`
- [ ] Client Components use `useAuth` or `useUser` hooks
- [ ] Protected pages redirect unauthenticated users
- [ ] `userId` is passed to all data fetching functions
- [ ] No custom authentication logic is implemented

## Violations

Any PR containing custom authentication implementations or bypassing Clerk will be rejected.
