"use client";

import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heatmap } from "@/components/calendar/heatmap";
import { DayDetail } from "@/components/calendar/day-detail";
import { useHabitsStore } from "@/lib/stores/habits-store";
import { useCompletionsStore } from "@/lib/stores/completions-store";
import { getCompletionPercentage } from "@/lib/utils";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { getActiveHabits } = useHabitsStore();
  const { completions } = useCompletionsStore();

  const activeHabits = getActiveHabits();

  // Calculate monthly stats
  const monthCompletions = completions.filter((c) => {
    const date = new Date(c.completedAt);
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  });

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const totalPossibleCompletions = activeHabits.length * daysInMonth;
  const monthlyCompletionRate = getCompletionPercentage(
    monthCompletions.length,
    totalPossibleCompletions
  );

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Track your habit consistency over time
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[160px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={goToToday}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Today
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{monthlyCompletionRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{monthCompletions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activeHabits.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Days in Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{daysInMonth}</p>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Habit Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            {activeHabits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Add some habits to see your progress here
              </div>
            ) : (
              <Heatmap
                month={currentMonth}
                completions={completions}
                habitCount={activeHabits.length}
                onDayClick={setSelectedDate}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Day detail modal */}
      <DayDetail date={selectedDate} onClose={() => setSelectedDate(null)} />
    </>
  );
}
