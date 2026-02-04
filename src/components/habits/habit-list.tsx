"use client";

import { useMemo } from "react";
import { HabitCard } from "./habit-card";
import { useHabits } from "@/lib/hooks/use-habits";
import { useUIStore } from "@/lib/stores/ui-store";
import { Skeleton } from "@/components/ui/skeleton";
import type { HabitWithCompletions } from "@/types";

export function HabitList() {
  const { getTodayHabitsWithCompletions, isLoading } = useHabits();
  const { showCompletedHabits } = useUIStore();

  const habits = getTodayHabitsWithCompletions();

  // Sort: incomplete first, then by name
  const sortedHabits = useMemo(() => {
    const filtered = showCompletedHabits
      ? habits
      : habits.filter((h) => !h.isCompletedToday);

    return [...filtered].sort((a, b) => {
      if (a.isCompletedToday !== b.isCompletedToday) {
        return a.isCompletedToday ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [habits, showCompletedHabits]);

  if (isLoading) {
    return <HabitListSkeleton />;
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">No habits for today</p>
        <p className="text-sm text-muted-foreground">
          Add a habit to get started!
        </p>
      </div>
    );
  }

  const completedCount = habits.filter((h) => h.isCompletedToday).length;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completedCount} of {habits.length} completed
        </span>
        <span className="font-medium text-primary">{Math.round(progress)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Habit cards */}
      <div className="space-y-3">
        {sortedHabits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>

      {/* Show completed toggle info */}
      {!showCompletedHabits && completedCount > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {completedCount} completed habit{completedCount > 1 ? "s" : ""} hidden
        </p>
      )}
    </div>
  );
}

function HabitListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2 w-full" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
