# Data Fetching Standards

## Critical Rule: Server Components Only

**ALL data fetching in this application MUST be done via Server Components.**

This is non-negotiable. Do NOT fetch data via:
- Route Handlers (API routes)
- Client Components
- `useEffect` hooks
- External fetch calls from the client
- Any other method

**ONLY Server Components are allowed to fetch data.**

## Database Query Architecture

### Data Directory Structure

All database queries MUST be performed through helper functions located in the `/data` directory.

```
/data
├── workouts.ts      # Workout-related queries
├── exercises.ts     # Exercise-related queries
├── users.ts         # User-related queries
└── ...              # Additional domain-specific files
```

### Drizzle ORM Requirement

**ALL database queries MUST use Drizzle ORM.**

- **DO NOT** use raw SQL queries
- **DO NOT** use `db.execute()` with SQL strings
- **DO NOT** bypass Drizzle's query builder

```typescript
// CORRECT - Using Drizzle ORM
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

// WRONG - Raw SQL (NEVER DO THIS)
export async function getWorkouts(userId: string) {
  return await db.execute(`SELECT * FROM workouts WHERE user_id = '${userId}'`);
}
```

## User Data Isolation (Security Critical)

**A logged-in user can ONLY access their own data. They MUST NOT be able to access any other user's data.**

### Mandatory User Filtering

Every data helper function that accesses user-specific data MUST:

1. Accept the `userId` as a parameter
2. Filter ALL queries by `userId`
3. Never expose data belonging to other users

```typescript
// CORRECT - Always filter by userId
export async function getUserWorkouts(userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(workoutId: string, userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // CRITICAL: Always include userId check
      )
    );
}

// WRONG - Missing userId filter (SECURITY VULNERABILITY)
export async function getWorkoutById(workoutId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId)); // User could access anyone's workout!
}
```

### Server Component Usage

In Server Components, always get the current user and pass their ID to data helpers:

```typescript
// app/workouts/page.tsx (Server Component)
import { auth } from "@clerk/nextjs/server";
import { getUserWorkouts } from "@/data/workouts";

export default async function WorkoutsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workouts = await getUserWorkouts(userId);

  return <WorkoutsList workouts={workouts} />;
}
```

## Summary Checklist

Before writing any data fetching code, verify:

- [ ] Data is fetched in a Server Component (not Client Component or Route Handler)
- [ ] Database query is in a helper function within `/data` directory
- [ ] Query uses Drizzle ORM (no raw SQL)
- [ ] Query filters by `userId` to ensure data isolation
- [ ] User authentication is verified before fetching data
