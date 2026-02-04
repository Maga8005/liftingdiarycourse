import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkoutForm } from "./components/workout-form";

interface NewWorkoutPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function NewWorkoutPage({
  searchParams,
}: NewWorkoutPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const defaultDate = params.date ? new Date(params.date + "T00:00:00") : new Date();
  const validDate = isNaN(defaultDate.getTime()) ? new Date() : defaultDate;

  return (
    <div className="container mx-auto p-6 max-w-md">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutForm defaultDate={validDate} />
        </CardContent>
      </Card>
    </div>
  );
}
