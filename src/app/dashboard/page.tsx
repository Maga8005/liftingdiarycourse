import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Plus } from "lucide-react";

import { getWorkoutsByDate } from "@/data/workouts";
import { WorkoutCalendar } from "./components/workout-calendar";
import { WorkoutList } from "./components/workout-list";
import { Button } from "@/components/ui/button";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  // Append T00:00:00 to parse as local time instead of UTC
  const selectedDate = params.date ? new Date(params.date + "T00:00:00") : new Date();

  // Validate date - if invalid, use today
  const validDate = isNaN(selectedDate.getTime()) ? new Date() : selectedDate;

  const workouts = await getWorkoutsByDate(userId, validDate);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Workout Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/workout/new">
            <Plus className="mr-2 h-4 w-4" />
            Log New Workout
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-medium">Workouts for</h2>
          <WorkoutCalendar selectedDate={validDate} />
        </div>
        <WorkoutList workouts={workouts} />
      </div>
    </div>
  );
}
