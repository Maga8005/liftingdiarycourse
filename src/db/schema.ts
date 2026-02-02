import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// ============================================================================
// EXERCISES TABLE - Reference data for exercise types
// ============================================================================
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// WORKOUTS TABLE - Individual workout sessions linked to Clerk users
// ============================================================================
export const workouts = pgTable(
  "workouts",
  {
    id: serial("id").primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("workouts_clerk_user_id_idx").on(table.clerkUserId),
    index("workouts_started_at_idx").on(table.startedAt),
  ]
);

// ============================================================================
// WORKOUT EXERCISES TABLE - Junction table linking workouts to exercises
// ============================================================================
export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: serial("id").primaryKey(),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("workout_exercises_workout_id_idx").on(table.workoutId),
    index("workout_exercises_workout_order_idx").on(table.workoutId, table.order),
  ]
);

// ============================================================================
// SETS TABLE - Individual sets with weight and reps tracking
// ============================================================================
export const sets = pgTable(
  "sets",
  {
    id: serial("id").primaryKey(),
    workoutExerciseId: integer("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    weight: numeric("weight", { precision: 10, scale: 2 }),
    reps: integer("reps").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("sets_workout_exercise_id_idx").on(table.workoutExerciseId)]
);

// ============================================================================
// RELATIONS
// ============================================================================
export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one, many }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(sets),
  })
);

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

// Select types (for reading from database)
export type Exercise = InferSelectModel<typeof exercises>;
export type Workout = InferSelectModel<typeof workouts>;
export type WorkoutExercise = InferSelectModel<typeof workoutExercises>;
export type Set = InferSelectModel<typeof sets>;

// Insert types (for inserting into database)
export type NewExercise = InferInsertModel<typeof exercises>;
export type NewWorkout = InferInsertModel<typeof workouts>;
export type NewWorkoutExercise = InferInsertModel<typeof workoutExercises>;
export type NewSet = InferInsertModel<typeof sets>;
