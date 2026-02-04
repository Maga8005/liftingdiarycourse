"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { updateWorkoutAction, type UpdateWorkoutInput } from "../actions";
import type { ExerciseOption } from "@/data/exercises";

const formSchema = z.object({
  name: z.string().max(255, "Name is too long").optional(),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional().or(z.literal("")),
  exerciseIds: z.array(z.number()),
});

type FormValues = z.infer<typeof formSchema>;

interface EditWorkoutFormProps {
  workout: {
    id: number;
    name: string | null;
    startedAt: Date;
    completedAt: Date | null;
    exercises: { id: number; name: string; order: number }[];
  };
  availableExercises: ExerciseOption[];
}

function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function calculateDuration(startTime: string, endTime: string | undefined): string | null {
  if (!endTime) return null;

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);

  // Handle crossing midnight
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }

  if (totalMinutes === 0) return null;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes} min`;
  }
}

export function EditWorkoutForm({ workout, availableExercises }: EditWorkoutFormProps) {
  const [selectedExercises, setSelectedExercises] = useState<number[]>(
    workout.exercises.map((e) => e.id)
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workout.name ?? "",
      date: workout.startedAt,
      startTime: formatTime(workout.startedAt),
      endTime: workout.completedAt ? formatTime(workout.completedAt) : "",
      exerciseIds: workout.exercises.map((e) => e.id),
    },
  });

  const watchStartTime = form.watch("startTime");
  const watchEndTime = form.watch("endTime");

  const duration = useMemo(() => {
    return calculateDuration(watchStartTime, watchEndTime);
  }, [watchStartTime, watchEndTime]);

  // Group exercises by category
  const exercisesByCategory = useMemo(() => {
    return availableExercises.reduce((acc, exercise) => {
      if (!acc[exercise.category]) {
        acc[exercise.category] = [];
      }
      acc[exercise.category].push(exercise);
      return acc;
    }, {} as Record<string, ExerciseOption[]>);
  }, [availableExercises]);

  async function onSubmit(data: FormValues) {
    const startedAt = combineDateAndTime(data.date, data.startTime);
    const completedAt = data.endTime ? combineDateAndTime(data.date, data.endTime) : null;

    const params: UpdateWorkoutInput = {
      id: workout.id,
      name: data.name || undefined,
      startedAt,
      completedAt,
      exerciseIds: selectedExercises,
    };
    await updateWorkoutAction(params);
  }

  const toggleExercise = (exerciseId: number) => {
    setSelectedExercises((prev) => {
      const newSelected = prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId];
      form.setValue("exerciseIds", newSelected);
      return newSelected;
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workout Name (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Morning Push Day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "do MMM yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time (optional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {duration && (
          <div className="text-sm text-muted-foreground">
            Duration: <span className="font-medium text-foreground">{duration}</span>
          </div>
        )}

        <FormField
          control={form.control}
          name="exerciseIds"
          render={() => (
            <FormItem>
              <FormLabel>Exercises</FormLabel>
              <FormDescription>
                Select the exercises performed in this workout
              </FormDescription>
              <div className="space-y-4 mt-2 max-h-64 overflow-y-auto border rounded-md p-4">
                {Object.entries(exercisesByCategory).map(([category, exercises]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {exercises.map((exercise) => (
                        <div key={exercise.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`exercise-${exercise.id}`}
                            checked={selectedExercises.includes(exercise.id)}
                            onCheckedChange={() => toggleExercise(exercise.id)}
                          />
                          <label
                            htmlFor={`exercise-${exercise.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {exercise.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {availableExercises.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No exercises available. Add exercises to your database first.
                  </p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
