import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dumbbell, TrendingUp, Calendar, Target } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 font-sans dark:from-zinc-950 dark:to-zinc-900">
      <header className="flex justify-end items-center p-4">
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl space-y-16">
          {/* Hero Section */}
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-12 w-12 text-zinc-900 dark:text-zinc-50" />
              <h1 className="text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Lifting Diary
              </h1>
            </div>
            <p className="max-w-2xl text-xl leading-relaxed text-zinc-600 dark:text-zinc-400">
              Your personal fitness companion. Track your workouts, monitor your progress, and achieve your fitness goals with ease.
            </p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <SignInButton mode="modal">
                <Button size="lg" className="text-base font-semibold">
                  Get Started
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="lg" variant="outline" className="text-base font-semibold">
                  Create Account
                </Button>
              </SignUpButton>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
                  <Calendar className="h-6 w-6 text-zinc-900 dark:text-zinc-50" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Track Workouts
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Log your exercises, sets, reps, and weights with an intuitive interface.
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
                  <TrendingUp className="h-6 w-6 text-zinc-900 dark:text-zinc-50" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Monitor Progress
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Visualize your strength gains and track your improvements over time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:col-span-2 lg:col-span-1">
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
                  <Target className="h-6 w-6 text-zinc-900 dark:text-zinc-50" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Achieve Goals
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Set personal records and reach new milestones in your fitness journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
