"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface WorkoutCalendarProps {
  selectedDate: Date;
}

export function WorkoutCalendar({ selectedDate }: WorkoutCalendarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;

    setOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    // Use local date methods to avoid timezone conversion issues
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    params.set("date", `${year}-${month}-${day}`);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(selectedDate, "do MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
