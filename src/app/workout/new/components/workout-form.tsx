"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { createWorkoutAction, type CreateWorkoutInput } from "../actions";

const formSchema = z.object({
  name: z.string().max(255, "Name is too long").optional(),
  startedAt: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface WorkoutFormProps {
  defaultDate?: Date;
}

export function WorkoutForm({ defaultDate }: WorkoutFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startedAt: defaultDate ?? new Date(),
    },
  });

  async function onSubmit(data: FormValues) {
    const params: CreateWorkoutInput = {
      name: data.name || undefined,
      startedAt: data.startedAt,
    };
    await createWorkoutAction(params);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workout Name (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Morning Push Day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startedAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "do MMM yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Workout"}
        </Button>
      </form>
    </Form>
  );
}
