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
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Workout Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Calendar */}
        <div>
          <h2 className="text-lg font-medium mb-4">Select Date</h2>
          <WorkoutCalendar selectedDate={validDate} />
        </div>

        {/* Right column - Workouts */}
        <div>
          <h2 className="text-lg font-medium mb-4">
            Workouts for {format(validDate, "do MMM yyyy")}
          </h2>
          <WorkoutList workouts={workouts} />
        </div>
      </div>
    </div>
  );
}
