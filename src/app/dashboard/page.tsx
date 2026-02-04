import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";

import { getWorkoutsByDate } from "@/data/workouts";
import { WorkoutCalendar } from "./components/workout-calendar";
import { WorkoutList } from "./components/workout-list";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Workout Dashboard</h1>
        <WorkoutCalendar selectedDate={validDate} />
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">
          Workouts for {format(validDate, "do MMM yyyy")}
        </h2>
        <WorkoutList workouts={workouts} />
      </div>
    </div>
  );
}
