"use client";

import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  isFuture,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, getHeatmapLevel, getCompletionPercentage } from "@/lib/utils";
import type { Completion } from "@/types";

interface HeatmapProps {
  month: Date;
  completions: Completion[];
  habitCount: number;
  onDayClick?: (date: Date) => void;
}

export function Heatmap({ month, completions, habitCount, onDayClick }: HeatmapProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group completions by date
  const completionsByDate = useMemo(() => {
    const map = new Map<string, number>();
    completions.forEach((c) => {
      const dateKey = c.completedAt;
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    return map;
  }, [completions]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const completedCount = completionsByDate.get(dateKey) || 0;
            const percentage = getCompletionPercentage(completedCount, habitCount);
            const level = getHeatmapLevel(percentage);
            const isCurrentMonth = isSameMonth(day, month);
            const isTodayDate = isToday(day);
            const isFutureDate = isFuture(day);

            return (
              <Tooltip key={dateKey}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onDayClick?.(day)}
                    disabled={isFutureDate}
                    className={cn(
                      "aspect-square rounded-md text-sm transition-all",
                      !isCurrentMonth && "opacity-30",
                      isFutureDate && "cursor-not-allowed",
                      !isFutureDate && "hover:ring-2 hover:ring-primary",
                      isTodayDate && "ring-2 ring-primary",
                      `heatmap-${level}`
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center h-full w-full text-xs",
                        level >= 3 && "text-white font-medium"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{format(day, "MMM d, yyyy")}</p>
                    {!isFutureDate && (
                      <p className="text-xs text-muted-foreground">
                        {completedCount} of {habitCount} completed ({percentage}%)
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 pt-2">
          <span className="text-xs text-muted-foreground mr-2">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn("h-4 w-4 rounded-sm", `heatmap-${level}`)}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">More</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
