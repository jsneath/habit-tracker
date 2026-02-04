"use client";

import { format } from "date-fns";
import { InspirationCard } from "@/components/shared/inspiration-card";
import { HabitList } from "@/components/habits/habit-list";
import { QuickAddButton } from "@/components/habits/quick-add-button";
import { HabitModal } from "@/components/habits/habit-modal";
import { ConfettiTrigger } from "@/components/shared/confetti-trigger";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUIStore } from "@/lib/stores/ui-store";
import { getGreeting } from "@/lib/utils";

export default function DashboardPage() {
  const { showCompletedHabits, setShowCompletedHabits } = useUIStore();
  const today = new Date();
  const greeting = getGreeting();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{greeting}!</h1>
          <p className="text-muted-foreground">
            {format(today, "EEEE, MMMM d")}
          </p>
        </div>

        {/* Daily inspiration */}
        <InspirationCard />

        {/* Controls */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today&apos;s Habits</h2>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-completed"
              checked={showCompletedHabits}
              onCheckedChange={setShowCompletedHabits}
            />
            <Label htmlFor="show-completed" className="text-sm text-muted-foreground">
              Show completed
            </Label>
          </div>
        </div>

        {/* Habit list */}
        <HabitList />
      </div>

      {/* Floating add button */}
      <QuickAddButton />

      {/* Modal for adding/editing habits */}
      <HabitModal />

      {/* Confetti celebration */}
      <ConfettiTrigger />
    </>
  );
}
