"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

interface WorkoutCalendarProps {
  selectedDate: Date;
}

export function WorkoutCalendar({ selectedDate }: WorkoutCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;

    const params = new URLSearchParams(searchParams.toString());
    // Use local date methods to avoid timezone conversion issues
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    params.set("date", `${year}-${month}-${day}`);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      className="rounded-md border"
    />
  );
}
