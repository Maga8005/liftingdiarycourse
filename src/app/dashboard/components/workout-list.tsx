import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WorkoutWithExercises } from "@/data/workouts";

interface WorkoutListProps {
  workouts: WorkoutWithExercises[];
}

export function WorkoutList({ workouts }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No workouts logged for this date.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => {
        const duration = workout.completedAt
          ? Math.round(
              (workout.completedAt.getTime() - workout.startedAt.getTime()) /
                (1000 * 60)
            )
          : null;

        return (
          <Card key={workout.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">
                  {workout.name || "Workout"}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {format(workout.startedAt, "h:mm a")}
                </span>
              </div>
              {workout.exercises.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {workout.exercises.map((exercise) => (
                    <Badge key={exercise.id} variant="secondary">
                      {exercise.name}
                    </Badge>
                  ))}
                </div>
              )}
              {duration !== null && (
                <p className="text-sm text-muted-foreground">
                  Duration: {duration} min
                </p>
              )}
              {workout.completedAt === null && (
                <Badge variant="outline" className="mt-2">
                  In Progress
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
