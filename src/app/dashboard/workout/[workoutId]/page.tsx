import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./components/edit-workout-form";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({
  params,
}: EditWorkoutPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { workoutId } = await params;
  const workoutIdNum = parseInt(workoutId, 10);

  if (isNaN(workoutIdNum)) {
    notFound();
  }

  const workout = await getWorkoutById(workoutIdNum, userId);

  if (!workout) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm workout={workout} />
        </CardContent>
      </Card>
    </div>
  );
}
