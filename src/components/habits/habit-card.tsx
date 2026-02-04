"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StreakBadge } from "@/components/shared/streak-badge";
import { Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompletions } from "@/lib/hooks/use-completions";
import { useUIStore } from "@/lib/stores/ui-store";
import { useHabits } from "@/lib/hooks/use-habits";
import type { HabitWithCompletions } from "@/types";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: HabitWithCompletions;
}

export function HabitCard({ habit }: HabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { toggleCompletion } = useCompletions();
  const { deleteHabit } = useHabits();
  const { openHabitModal } = useUIStore();

  const handleToggle = async () => {
    setIsAnimating(true);
    await toggleCompletion(habit.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleEdit = () => {
    openHabitModal(habit.id);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this habit?")) {
      await deleteHabit(habit.id);
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        habit.isCompletedToday && "bg-muted/50"
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Check button */}
        <button
          onClick={handleToggle}
          className={cn(
            "relative flex-shrink-0 h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            habit.isCompletedToday
              ? "border-transparent"
              : "border-muted-foreground/30 hover:border-primary"
          )}
          style={{
            backgroundColor: habit.isCompletedToday ? habit.color : "transparent",
          }}
          aria-label={
            habit.isCompletedToday ? "Mark as incomplete" : "Mark as complete"
          }
        >
          {habit.isCompletedToday ? (
            <Check
              className={cn(
                "h-6 w-6 text-white",
                isAnimating && "animate-check-bounce"
              )}
            />
          ) : (
            <span className="text-2xl">{habit.emoji}</span>
          )}

          {/* Pulse ring animation */}
          {isAnimating && habit.isCompletedToday && (
            <span
              className="absolute inset-0 rounded-full animate-pulse-ring"
              style={{ backgroundColor: habit.color }}
            />
          )}
        </button>

        {/* Habit info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "font-medium truncate",
                habit.isCompletedToday && "line-through text-muted-foreground"
              )}
            >
              {habit.name}
            </h3>
            <StreakBadge streak={habit.streak} size="sm" />
          </div>
          {habit.category && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {habit.category}
            </p>
          )}
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
