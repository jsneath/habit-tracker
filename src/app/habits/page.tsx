"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Archive, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitModal } from "@/components/habits/habit-modal";
import { StreakBadge } from "@/components/shared/streak-badge";
import { useHabits } from "@/lib/hooks/use-habits";
import { useCompletionsStore } from "@/lib/stores/completions-store";
import { useHabitsStore } from "@/lib/stores/habits-store";
import { useUIStore } from "@/lib/stores/ui-store";
import type { Habit } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function HabitsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("active");

  const { getActiveHabits, getArchivedHabits } = useHabitsStore();
  const { getStreakForHabit } = useCompletionsStore();
  const { deleteHabit, updateHabit, isLoading } = useHabits();
  const { openHabitModal } = useUIStore();

  const activeHabits = getActiveHabits();
  const archivedHabits = getArchivedHabits();

  const filteredHabits = useMemo(() => {
    const habits = activeTab === "active" ? activeHabits : archivedHabits;

    return habits.filter((habit) => {
      const matchesSearch = habit.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFrequency =
        frequencyFilter === "all" || habit.frequency.type === frequencyFilter;
      return matchesSearch && matchesFrequency;
    });
  }, [activeTab, activeHabits, archivedHabits, searchQuery, frequencyFilter]);

  const handleArchive = async (habit: Habit) => {
    await updateHabit(habit.id, { archived: !habit.archived });
  };

  const handleDelete = async (habitId: string) => {
    if (confirm("Are you sure you want to permanently delete this habit?")) {
      await deleteHabit(habitId);
    }
  };

  if (isLoading) {
    return <HabitsPageSkeleton />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
            <p className="text-muted-foreground">
              Manage all your habits in one place
            </p>
          </div>
          <Button onClick={() => openHabitModal()}>
            <Plus className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeHabits.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedHabits.length})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All frequencies</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="active" className="mt-4">
            {filteredHabits.length === 0 ? (
              <EmptyState
                title="No habits found"
                description={
                  searchQuery
                    ? "Try adjusting your search or filters"
                    : "Create your first habit to get started"
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredHabits.map((habit) => (
                  <HabitManageCard
                    key={habit.id}
                    habit={habit}
                    streak={getStreakForHabit(habit.id)}
                    onEdit={() => openHabitModal(habit.id)}
                    onArchive={() => handleArchive(habit)}
                    onDelete={() => handleDelete(habit.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            {filteredHabits.length === 0 ? (
              <EmptyState
                title="No archived habits"
                description="Archived habits will appear here"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredHabits.map((habit) => (
                  <HabitManageCard
                    key={habit.id}
                    habit={habit}
                    streak={getStreakForHabit(habit.id)}
                    onEdit={() => openHabitModal(habit.id)}
                    onArchive={() => handleArchive(habit)}
                    onDelete={() => handleDelete(habit.id)}
                    isArchived
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <HabitModal />
    </>
  );
}

interface HabitManageCardProps {
  habit: Habit;
  streak: number;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isArchived?: boolean;
}

function HabitManageCard({
  habit,
  streak,
  onEdit,
  onArchive,
  onDelete,
  isArchived,
}: HabitManageCardProps) {
  const frequencyLabel = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    custom: `Every ${habit.frequency.interval} days`,
  }[habit.frequency.type];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: habit.color + "20" }}
            >
              {habit.emoji}
            </div>
            <div>
              <CardTitle className="text-base">{habit.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {frequencyLabel}
                </Badge>
                {habit.category && (
                  <Badge variant="secondary" className="text-xs">
                    {habit.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <StreakBadge streak={streak} />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onArchive}>
            <Archive className="mr-1 h-3 w-3" />
            {isArchived ? "Restore" : "Archive"}
          </Button>
          {isArchived && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12 px-4 rounded-lg border border-dashed">
      <h3 className="font-medium text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function HabitsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-10 w-48" />
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
