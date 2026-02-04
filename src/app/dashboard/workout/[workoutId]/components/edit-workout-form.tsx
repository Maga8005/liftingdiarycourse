"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useState, useMemo, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  startHour: z.string(),
  startMinute: z.string(),
  endHour: z.string().optional(),
  endMinute: z.string().optional(),
  durationMinutes: z.number().min(0).optional(),
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

// Generate hour options (00-23)
const hourOptions = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);

// Generate minute options (00, 05, 10, ..., 55)
const minuteOptions = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0")
);

// Quick duration options in minutes
const quickDurations = [30, 45, 60, 75, 90, 120];

function calculateDurationFromTimes(
  startHour: string,
  startMinute: string,
  endHour?: string,
  endMinute?: string
): number | null {
  if (!endHour || !endMinute) return null;

  const startTotal = parseInt(startHour) * 60 + parseInt(startMinute);
  const endTotal = parseInt(endHour) * 60 + parseInt(endMinute);

  let duration = endTotal - startTotal;
  if (duration < 0) duration += 24 * 60; // Handle crossing midnight

  return duration;
}

function calculateEndTimeFromDuration(
  startHour: string,
  startMinute: string,
  durationMinutes: number
): { hour: string; minute: string } {
  const startTotal = parseInt(startHour) * 60 + parseInt(startMinute);
  let endTotal = startTotal + durationMinutes;

  // Handle crossing midnight
  if (endTotal >= 24 * 60) endTotal -= 24 * 60;

  const hour = Math.floor(endTotal / 60).toString().padStart(2, "0");
  const minute = (endTotal % 60).toString().padStart(2, "0");

  return { hour, minute };
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins} min`;
  }
}

function getInitialDuration(startedAt: Date, completedAt: Date | null): number | null {
  if (!completedAt) return null;
  const diff = completedAt.getTime() - startedAt.getTime();
  return Math.round(diff / (1000 * 60));
}

export function EditWorkoutForm({ workout, availableExercises }: EditWorkoutFormProps) {
  const [selectedExercises, setSelectedExercises] = useState<number[]>(
    workout.exercises.map((e) => e.id)
  );
  const [timeMode, setTimeMode] = useState<"endTime" | "duration">(
    workout.completedAt ? "endTime" : "duration"
  );

  const initialDuration = getInitialDuration(workout.startedAt, workout.completedAt);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workout.name ?? "",
      date: workout.startedAt,
      startHour: format(workout.startedAt, "HH"),
      startMinute: format(workout.startedAt, "mm"),
      endHour: workout.completedAt ? format(workout.completedAt, "HH") : undefined,
      endMinute: workout.completedAt ? format(workout.completedAt, "mm") : undefined,
      durationMinutes: initialDuration ?? undefined,
      exerciseIds: workout.exercises.map((e) => e.id),
    },
  });

  const watchStartHour = form.watch("startHour");
  const watchStartMinute = form.watch("startMinute");
  const watchEndHour = form.watch("endHour");
  const watchEndMinute = form.watch("endMinute");
  const watchDuration = form.watch("durationMinutes");

  // Calculate displayed duration based on mode
  const displayDuration = useMemo(() => {
    if (timeMode === "duration" && watchDuration) {
      return watchDuration;
    }
    return calculateDurationFromTimes(
      watchStartHour,
      watchStartMinute,
      watchEndHour,
      watchEndMinute
    );
  }, [timeMode, watchStartHour, watchStartMinute, watchEndHour, watchEndMinute, watchDuration]);

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

  const handleDurationChange = useCallback((minutes: number) => {
    form.setValue("durationMinutes", minutes);
    const { hour, minute } = calculateEndTimeFromDuration(
      form.getValues("startHour"),
      form.getValues("startMinute"),
      minutes
    );
    form.setValue("endHour", hour);
    form.setValue("endMinute", minute);
  }, [form]);

  const handleEndTimeChange = useCallback((field: "endHour" | "endMinute", value: string) => {
    form.setValue(field, value);
    const endHour = field === "endHour" ? value : form.getValues("endHour");
    const endMinute = field === "endMinute" ? value : form.getValues("endMinute");

    if (endHour && endMinute) {
      const duration = calculateDurationFromTimes(
        form.getValues("startHour"),
        form.getValues("startMinute"),
        endHour,
        endMinute
      );
      if (duration !== null) {
        form.setValue("durationMinutes", duration);
      }
    }
  }, [form]);

  async function onSubmit(data: FormValues) {
    const startedAt = new Date(data.date);
    startedAt.setHours(parseInt(data.startHour), parseInt(data.startMinute), 0, 0);

    let completedAt: Date | null = null;
    if (data.endHour && data.endMinute) {
      completedAt = new Date(data.date);
      completedAt.setHours(parseInt(data.endHour), parseInt(data.endMinute), 0, 0);
    }

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
    const newSelected = selectedExercises.includes(exerciseId)
      ? selectedExercises.filter((id) => id !== exerciseId)
      : [...selectedExercises, exerciseId];
    setSelectedExercises(newSelected);
    form.setValue("exerciseIds", newSelected);
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

        {/* Start Time */}
        <div className="space-y-2">
          <FormLabel>Start Time</FormLabel>
          <div className="flex gap-2 items-center">
            <FormField
              control={form.control}
              name="startHour"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {hourOptions.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <span className="text-lg font-medium">:</span>
            <FormField
              control={form.control}
              name="startMinute"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {minuteOptions.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* End Time / Duration Tabs */}
        <div className="space-y-2">
          <FormLabel>End Time / Duration</FormLabel>
          <Tabs value={timeMode} onValueChange={(v) => setTimeMode(v as "endTime" | "duration")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="endTime">End Time</TabsTrigger>
              <TabsTrigger value="duration">Duration</TabsTrigger>
            </TabsList>

            <TabsContent value="endTime" className="mt-3">
              <div className="flex gap-2 items-center">
                <FormField
                  control={form.control}
                  name="endHour"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => handleEndTimeChange("endHour", v)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent>
                        {hourOptions.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <span className="text-lg font-medium">:</span>
                <FormField
                  control={form.control}
                  name="endMinute"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => handleEndTimeChange("endMinute", v)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {minuteOptions.map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    form.setValue("endHour", undefined);
                    form.setValue("endMinute", undefined);
                    form.setValue("durationMinutes", undefined);
                  }}
                >
                  Clear
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="duration" className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {quickDurations.map((mins) => (
                  <Button
                    key={mins}
                    type="button"
                    variant={watchDuration === mins ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDurationChange(mins)}
                  >
                    {formatDuration(mins)}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Custom minutes"
                  className="w-32"
                  value={watchDuration ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      form.setValue("durationMinutes", undefined);
                      form.setValue("endHour", undefined);
                      form.setValue("endMinute", undefined);
                    } else {
                      handleDurationChange(parseInt(value) || 0);
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {displayDuration !== null && displayDuration > 0 && (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
            Duration: <span className="font-medium text-foreground">{formatDuration(displayDuration)}</span>
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
