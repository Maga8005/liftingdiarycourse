# Data Mutation Standards

## Critical Rule: Server Actions Only

**ALL data mutations in this application MUST be done via Server Actions.**

This is non-negotiable. Do NOT mutate data via:
- Route Handlers (API routes)
- Client-side fetch calls
- Direct database calls from components
- Any other method

**ONLY Server Actions are allowed to mutate data.**

## Server Action Architecture

### File Structure

All Server Actions MUST be colocated with their associated page/feature in files named `actions.ts`.

```
app/
├── workouts/
│   ├── page.tsx           # Server Component
│   ├── actions.ts         # Server Actions for workouts
│   └── components/        # Client Components
├── exercises/
│   ├── page.tsx
│   ├── actions.ts         # Server Actions for exercises
│   └── components/
└── settings/
    ├── page.tsx
    └── actions.ts         # Server Actions for settings
```

### Server Action File Template

```typescript
// app/workouts/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createWorkout, updateWorkout, deleteWorkout } from "@/data/workouts";

// Schema definitions at the top
const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

// Server Action implementation
export async function createWorkoutAction(params: z.infer<typeof createWorkoutSchema>) {
  // 1. Validate input with Zod
  const validated = createWorkoutSchema.parse(params);

  // 2. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Call data helper function
  await createWorkout(userId, validated);

  // 4. Revalidate cache
  revalidatePath("/workouts");
}
```

## Parameter Typing Rules

### Typed Parameters Required

**ALL Server Action parameters MUST be explicitly typed.**

```typescript
// CORRECT - Explicitly typed parameters
type CreateExerciseParams = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

export async function createExerciseAction(params: CreateExerciseParams) {
  // Implementation
}

// CORRECT - Using Zod inferred types
const exerciseSchema = z.object({
  name: z.string(),
  sets: z.number(),
  reps: z.number(),
  weight: z.number(),
});

export async function createExerciseAction(params: z.infer<typeof exerciseSchema>) {
  // Implementation
}
```

### FormData is Prohibited

**NEVER use FormData as a parameter type for Server Actions.**

```typescript
// WRONG - FormData is not allowed (NEVER DO THIS)
export async function createWorkoutAction(formData: FormData) {
  const name = formData.get("name");
  // This is not type-safe and is prohibited
}

// CORRECT - Use typed object parameters
export async function createWorkoutAction(params: { name: string; date: Date }) {
  // Type-safe implementation
}
```

## Zod Validation (Mandatory)

### All Parameters Must Be Validated

**EVERY Server Action MUST validate its parameters using Zod.**

```typescript
// CORRECT - Zod validation is mandatory
const updateWorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(100),
  date: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export async function updateWorkoutAction(params: z.infer<typeof updateWorkoutSchema>) {
  // Validate first - throws ZodError if invalid
  const validated = updateWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await updateWorkout(userId, validated);
  revalidatePath("/workouts");
}

// WRONG - No validation (NEVER DO THIS)
export async function updateWorkoutAction(params: { id: string; name: string }) {
  // Directly using params without validation is a security risk
  await updateWorkout(params);
}
```

### Schema Definition Patterns

Define schemas at the top of your `actions.ts` file:

```typescript
"use server";

import { z } from "zod";

// Define all schemas at the top of the file
const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

const updateWorkoutSchema = createWorkoutSchema.extend({
  id: z.string().uuid(),
});

const deleteWorkoutSchema = z.object({
  id: z.string().uuid(),
});

// Export types for use in components
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
```

## Data Helper Functions

### Database Calls via /data Directory

**ALL database mutations MUST be performed through helper functions in the `/data` directory.**

```
/data
├── workouts.ts      # Workout queries AND mutations
├── exercises.ts     # Exercise queries AND mutations
├── users.ts         # User queries AND mutations
└── ...              # Additional domain-specific files
```

### Data Helper Function Structure

```typescript
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Query functions
export async function getWorkoutById(userId: string, workoutId: string) {
  return await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

// Mutation functions
export async function createWorkout(
  userId: string,
  data: { name: string; date: Date; notes?: string }
) {
  return await db.insert(workouts).values({
    userId,
    name: data.name,
    date: data.date,
    notes: data.notes,
  });
}

export async function updateWorkout(
  userId: string,
  data: { id: string; name: string; date: Date; notes?: string }
) {
  return await db
    .update(workouts)
    .set({
      name: data.name,
      date: data.date,
      notes: data.notes,
    })
    .where(and(eq(workouts.id, data.id), eq(workouts.userId, userId)));
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

### User Data Isolation (Security Critical)

**ALL mutation helper functions MUST accept `userId` and filter by it.**

```typescript
// CORRECT - Always filter by userId
export async function deleteWorkout(userId: string, workoutId: string) {
  return await db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // CRITICAL: Prevents deleting other users' data
      )
    );
}

// WRONG - Missing userId filter (SECURITY VULNERABILITY)
export async function deleteWorkout(workoutId: string) {
  return await db
    .delete(workouts)
    .where(eq(workouts.id, workoutId)); // User could delete anyone's workout!
}
```

## Complete Example

### Server Action File

```typescript
// app/workouts/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createWorkout, updateWorkout, deleteWorkout } from "@/data/workouts";

// Schemas
const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  date: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

const updateWorkoutSchema = createWorkoutSchema.extend({
  id: z.string().uuid("Invalid workout ID"),
});

const deleteWorkoutSchema = z.object({
  id: z.string().uuid("Invalid workout ID"),
});

// Exported types
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

// Server Actions
export async function createWorkoutAction(params: CreateWorkoutInput) {
  const validated = createWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await createWorkout(userId, validated);
  revalidatePath("/workouts");
}

export async function updateWorkoutAction(params: UpdateWorkoutInput) {
  const validated = updateWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await updateWorkout(userId, validated);
  revalidatePath("/workouts");
}

export async function deleteWorkoutAction(params: z.infer<typeof deleteWorkoutSchema>) {
  const validated = deleteWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await deleteWorkout(userId, validated.id);
  revalidatePath("/workouts");
}
```

### Client Component Usage

```typescript
// app/workouts/components/workout-form.tsx
"use client";

import { createWorkoutAction, type CreateWorkoutInput } from "../actions";

export function WorkoutForm() {
  async function handleSubmit(data: CreateWorkoutInput) {
    await createWorkoutAction(data);
  }

  // Form implementation using shadcn/ui
}
```

## Redirects After Mutations

Use `redirect()` from `next/navigation` to navigate after successful mutations:

```typescript
import { redirect } from "next/navigation";

export async function createWorkoutAction(params: CreateWorkoutInput) {
  const validated = createWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await createWorkout(userId, validated);

  revalidatePath("/dashboard");
  redirect("/dashboard"); // Must be LAST - throws internally
}
```

### How redirect() Works

**Important:** `redirect()` throws a special `NEXT_REDIRECT` error that Next.js intercepts and handles **client-side**.

This means:
- The redirect navigation happens in the browser, not via HTTP 301/302
- Code after `redirect()` will **never execute** - it throws immediately
- **Never wrap `redirect()` in try/catch** - you'll accidentally catch the redirect error

```typescript
// WRONG - Will catch the redirect error
export async function createWorkoutAction(params: CreateWorkoutInput) {
  try {
    await createWorkout(userId, validated);
    redirect("/dashboard"); // This throws NEXT_REDIRECT
  } catch (error) {
    // This catches the redirect! Navigation won't happen
    console.error(error);
  }
}

// CORRECT - redirect() outside try/catch
export async function createWorkoutAction(params: CreateWorkoutInput) {
  try {
    await createWorkout(userId, validated);
  } catch (error) {
    throw new Error("Failed to create workout");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard"); // Safe - outside try/catch
}
```

## Summary Checklist

Before writing any data mutation code, verify:

- [ ] Mutation is performed via a Server Action (not Route Handler or client fetch)
- [ ] Server Action is in a colocated `actions.ts` file
- [ ] Server Action has `"use server"` directive at the top of the file
- [ ] Parameters are explicitly typed (no `FormData`)
- [ ] Parameters are validated with Zod before use
- [ ] Database mutation is in a helper function within `/data` directory
- [ ] Helper function uses Drizzle ORM (no raw SQL)
- [ ] Helper function accepts `userId` and filters by it
- [ ] User authentication is verified before mutating data
- [ ] Cache is revalidated after mutation (`revalidatePath`)
- [ ] `redirect()` is called last and outside of try/catch blocks

## Violations

Any PR containing:
- Server Actions with `FormData` parameters
- Server Actions without Zod validation
- Direct database calls outside of `/data` directory
- Missing `userId` filtering in data helpers
- `redirect()` wrapped in try/catch blocks

**Will be rejected.**
