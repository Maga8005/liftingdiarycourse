import { db } from "@/src/db";
import { workouts } from "@/src/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export type WorkoutWithExercises = {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  exercises: {
    id: number;
    name: string;
    order: number;
  }[];
};

/**
 * Get all workouts for a specific user on a specific date.
 * SECURITY: Always filters by userId to ensure users can only access their own data.
 */
export async function getWorkoutsByDate(
  userId: string,
  date: Date
): Promise<WorkoutWithExercises[]> {
  // Create date range for the entire day (start of day to start of next day)
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setDate(endOfDay.getDate() + 1);
  endOfDay.setHours(0, 0, 0, 0);

  const userWorkouts = await db.query.workouts.findMany({
    where: and(
      eq(workouts.clerkUserId, userId),
      gte(workouts.startedAt, startOfDay),
      lt(workouts.startedAt, endOfDay)
    ),
    with: {
      workoutExercises: {
        with: {
          exercise: true,
        },
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
      },
    },
    orderBy: (workouts, { asc }) => [asc(workouts.startedAt)],
  });

  return userWorkouts.map((workout) => ({
    id: workout.id,
    name: workout.name,
    startedAt: workout.startedAt,
    completedAt: workout.completedAt,
    exercises: workout.workoutExercises.map((we) => ({
      id: we.exercise.id,
      name: we.exercise.name,
      order: we.order,
    })),
  }));
}

/**
 * Get a single workout by ID for a specific user.
 * SECURITY: Always filters by userId to ensure users can only access their own data.
 */
export async function getWorkoutById(
  workoutId: number,
  userId: string
): Promise<WorkoutWithExercises | null> {
  const workout = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, workoutId),
      eq(workouts.clerkUserId, userId)
    ),
    with: {
      workoutExercises: {
        with: {
          exercise: true,
        },
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
      },
    },
  });

  if (!workout) {
    return null;
  }

  return {
    id: workout.id,
    name: workout.name,
    startedAt: workout.startedAt,
    completedAt: workout.completedAt,
    exercises: workout.workoutExercises.map((we) => ({
      id: we.exercise.id,
      name: we.exercise.name,
      order: we.order,
    })),
  };
}
