"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

// Schema definitions
const updateWorkoutSchema = z.object({
  id: z.coerce.number().int().positive("Invalid workout ID"),
  name: z.string().max(255, "Name is too long").optional(),
  startedAt: z.coerce.date(),
});

// Exported types for use in components
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

// Server Actions
export async function updateWorkoutAction(params: UpdateWorkoutInput) {
  // 1. Validate input with Zod
  const validated = updateWorkoutSchema.parse(params);

  // 2. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Call data helper function
  const result = await updateWorkout(userId, validated.id, {
    name: validated.name,
    startedAt: validated.startedAt,
  });

  if (!result) {
    throw new Error("Workout not found or you don't have permission to edit it");
  }

  // 4. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/workout/${validated.id}`);

  // 5. Redirect to dashboard with the workout date
  redirect(`/dashboard?date=${validated.startedAt.toISOString().split("T")[0]}`);
}
