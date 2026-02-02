"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createWorkout } from "@/data/workouts";

// Schema definitions
const createWorkoutSchema = z.object({
  name: z.string().max(255, "Name is too long").optional(),
  startedAt: z.coerce.date(),
});

// Exported types for use in components
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

// Server Actions
export async function createWorkoutAction(params: CreateWorkoutInput) {
  // 1. Validate input with Zod
  const validated = createWorkoutSchema.parse(params);

  // 2. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Call data helper function
  const workout = await createWorkout(userId, {
    name: validated.name,
    startedAt: validated.startedAt,
  });

  // 4. Revalidate cache
  revalidatePath("/dashboard");

  // 5. Redirect to workout page (or dashboard for now)
  redirect(`/dashboard?date=${validated.startedAt.toISOString().split("T")[0]}`);
}
