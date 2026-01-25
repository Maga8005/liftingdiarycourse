"use client";

import { useState } from "react";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock workout data for UI demonstration
const mockWorkouts = [
  {
    id: "1",
    name: "Upper Body Strength",
    time: "9:00 AM",
    exercises: ["Bench Press", "Pull-ups", "Shoulder Press"],
    duration: 45,
  },
  {
    id: "2",
    name: "Cardio Session",
    time: "6:00 PM",
    exercises: ["Treadmill", "Rowing"],
    duration: 30,
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Workout Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Calendar */}
        <div>
          <h2 className="text-lg font-medium mb-4">Select Date</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md border"
          />
        </div>

        {/* Right column - Workouts */}
        <div>
          <h2 className="text-lg font-medium mb-4">
            Workouts for {format(date, "do MMM yyyy")}
          </h2>

          {mockWorkouts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  No workouts logged for this date.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockWorkouts.map((workout) => (
                <Card key={workout.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{workout.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {workout.time}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {workout.exercises.map((exercise) => (
                        <Badge key={exercise} variant="secondary">
                          {exercise}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Duration: {workout.duration} min
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
