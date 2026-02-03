# Routing Standards

## Overview

This document outlines the mandatory routing coding standards for the Lifting Diary project. All application routes MUST follow these standards to ensure consistent navigation patterns and proper security.

## Route Architecture

### Dashboard-Centric Routing

**All authenticated application routes MUST be nested under `/dashboard`.**

The `/dashboard` route serves as the root for all authenticated user functionality:

```
/dashboard                     # Main dashboard (workout calendar)
/dashboard/workout/new         # Create new workout
/dashboard/workout/[workoutId] # View/edit specific workout
/dashboard/settings            # User settings (future)
/dashboard/profile             # User profile (future)
```

### Public Routes

Only the following routes are accessible without authentication:

```
/                    # Landing page
/sign-in             # Clerk sign-in page
/sign-up             # Clerk sign-up page
```

## Route Protection

### Middleware Configuration

**Route protection is implemented via Next.js middleware using Clerk.**

The middleware in `src/middleware.ts` handles authentication:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Page-Level Protection

**Even with middleware protection, all dashboard pages MUST verify authentication.**

This provides defense-in-depth security:

```typescript
// CORRECT - Always verify auth in dashboard pages
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
```

## Rules

### 1. All New Features Under /dashboard

**NEVER create authenticated routes outside of `/dashboard`.**

```typescript
// CORRECT
src/app/dashboard/workout/new/page.tsx
src/app/dashboard/exercises/page.tsx
src/app/dashboard/history/page.tsx

// WRONG - Routes outside dashboard
src/app/workout/new/page.tsx        // Should be under /dashboard
src/app/exercises/page.tsx          // Should be under /dashboard
src/app/user/settings/page.tsx      // Should be under /dashboard
```

### 2. Dynamic Route Segments

**Use Next.js dynamic route segments for resource-specific pages.**

```
src/app/dashboard/workout/[workoutId]/page.tsx
src/app/dashboard/exercise/[exerciseId]/page.tsx
```

Access dynamic parameters using the params prop:

```typescript
interface PageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function WorkoutPage({ params }: PageProps) {
  const { workoutId } = await params;
  // Use workoutId
}
```

### 3. Navigation Within Dashboard

**Use `next/link` for all internal navigation.**

```typescript
import Link from "next/link";

// CORRECT
<Link href="/dashboard">Dashboard</Link>
<Link href="/dashboard/workout/new">New Workout</Link>
<Link href={`/dashboard/workout/${workoutId}`}>View Workout</Link>

// WRONG - Using anchor tags
<a href="/dashboard">Dashboard</a>
```

### 4. Programmatic Navigation

**Use `next/navigation` for programmatic routing.**

```typescript
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

// Server Components - use redirect
export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  // After successful action
  redirect("/dashboard");
}

// Client Components - use useRouter
"use client";
export function ClientComponent() {
  const router = useRouter();

  const handleSubmit = async () => {
    // After action
    router.push("/dashboard");
  };
}
```

### 5. Dashboard Layout

**Create a shared layout for dashboard routes.**

```typescript
// src/app/dashboard/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen">
      <DashboardNav />
      <main>{children}</main>
    </div>
  );
}
```

### 6. URL Search Parameters

**Use searchParams for filtering and state that should be shareable.**

```typescript
interface PageProps {
  searchParams: Promise<{ date?: string; filter?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedDate = params.date ? new Date(params.date + "T00:00:00") : new Date();
  // Use params for filtering
}
```

## Route Structure Reference

### Current Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Landing page | No |
| `/sign-in` | Clerk sign-in | No |
| `/sign-up` | Clerk sign-up | No |
| `/dashboard` | Main dashboard with calendar | Yes |
| `/dashboard/workout/[workoutId]` | View/edit workout | Yes |

### Future Routes (Follow This Pattern)

| Route | Purpose |
|-------|---------|
| `/dashboard/workout/new` | Create new workout |
| `/dashboard/exercises` | Exercise library |
| `/dashboard/history` | Workout history |
| `/dashboard/settings` | User settings |
| `/dashboard/profile` | User profile |

## Prohibited Practices

Do NOT:

- Create authenticated routes outside `/dashboard`
- Use `<a>` tags instead of `<Link>` for internal navigation
- Skip authentication checks in dashboard pages
- Create public routes that access user data
- Use relative paths for navigation (always use absolute paths starting with `/`)
- Implement custom authentication redirects outside of Clerk

## Summary Checklist

Before creating new routes, verify:

- [ ] Route is nested under `/dashboard` if it requires authentication
- [ ] Page includes authentication check with redirect
- [ ] Navigation uses `next/link` or `next/navigation`
- [ ] Dynamic routes use proper `[param]` syntax
- [ ] Search params are properly typed with `Promise<>`
- [ ] Route follows the established naming conventions

## Violations

Any PR containing routes that bypass the `/dashboard` structure or lack proper authentication will be rejected.
