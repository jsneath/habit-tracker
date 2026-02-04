"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useHabitsStore } from "@/lib/stores/habits-store";
import { useCompletionsStore } from "@/lib/stores/completions-store";
import { getDateKey } from "@/lib/utils";

interface DayDetailProps {
  date: Date | null;
  onClose: () => void;
}

export function DayDetail({ date, onClose }: DayDetailProps) {
  const { habits, getActiveHabits } = useHabitsStore();
  const { completions, isHabitCompletedOnDate } = useCompletionsStore();

  if (!date) return null;

  const dateKey = getDateKey(date);
  const dayCompletions = completions.filter((c) => c.completedAt === dateKey);
  const activeHabits = getActiveHabits();

  const completedHabits = activeHabits.filter((habit) =>
    isHabitCompletedOnDate(habit.id, date)
  );
  const missedHabits = activeHabits.filter(
    (habit) => !isHabitCompletedOnDate(habit.id, date)
  );

  const completionRate =
    activeHabits.length > 0
      ? Math.round((completedHabits.length / activeHabits.length) * 100)
      : 0;

  return (
    <Dialog open={!!date} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{format(date, "EEEE, MMMM d, yyyy")}</DialogTitle>
          <DialogDescription>
            {completedHabits.length} of {activeHabits.length} habits completed (
            {completionRate}%)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Completed habits */}
          {completedHabits.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Completed
              </h4>
              <div className="space-y-2">
                {completedHabits.map((habit) => {
                  const completion = dayCompletions.find(
                    (c) => c.habitId === habit.id
                  );
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: habit.color }}
                      >
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {habit.emoji} {habit.name}
                        </p>
                        {completion?.note && (
                          <p className="text-xs text-muted-foreground">
                            {completion.note}
                          </p>
                        )}
                      </div>
                      {completion?.mood && (
                        <Badge variant="outline">
                          {["", "😢", "😕", "😐", "🙂", "😄"][completion.mood]}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Missed habits */}
          {missedHabits.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Missed
              </h4>
              <div className="space-y-2">
                {missedHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-dashed"
                  >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {habit.emoji} {habit.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeHabits.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No habits to track for this day
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
