import { db } from "@/db";
import { exercises } from "@/db/schema";
import { asc } from "drizzle-orm";

export type ExerciseOption = {
  id: number;
  name: string;
  category: string;
};

/**
 * Get all available exercises for selection.
 * This is reference data, not user-specific.
 */
export async function getAllExercises(): Promise<ExerciseOption[]> {
  const allExercises = await db
    .select({
      id: exercises.id,
      name: exercises.name,
      category: exercises.category,
    })
    .from(exercises)
    .orderBy(asc(exercises.category), asc(exercises.name));

  return allExercises;
}
