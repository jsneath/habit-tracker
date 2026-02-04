"use client";

import { useEffect } from "react";
import { useUserStore } from "@/lib/stores/user-store";
import { useHabitsStore } from "@/lib/stores/habits-store";
import { useCompletionsStore } from "@/lib/stores/completions-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Habit, Completion } from "@/types";

export function useRealtime() {
  const { user, isAnonymous } = useUserStore();
  const { setHabits, habits } = useHabitsStore();
  const { setCompletions, completions } = useCompletionsStore();

  useEffect(() => {
    if (!isSupabaseConfigured || isAnonymous || !user) return;

    const supabase = createClient();
    if (!supabase) return;

    // Subscribe to habits changes
    const habitsChannel = supabase
      .channel("habits-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "habits",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newHabit = formatHabit(payload.new);
            setHabits([...habits, newHabit]);
          } else if (payload.eventType === "UPDATE") {
            const updatedHabit = formatHabit(payload.new);
            setHabits(
              habits.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
            );
          } else if (payload.eventType === "DELETE" && payload.old) {
            const oldRecord = payload.old as { id: string };
            setHabits(habits.filter((h) => h.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    // Subscribe to completions changes
    const completionsChannel = supabase
      .channel("completions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "completions",
        },
        (payload) => {
          // Only process if the completion belongs to user's habit
          const habitIds = habits.map((h) => h.id);

          if (payload.eventType === "INSERT") {
            const newRecord = payload.new as { habit_id: string };
            if (habitIds.includes(newRecord.habit_id)) {
              const newCompletion = formatCompletion(payload.new);
              setCompletions([...completions, newCompletion]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedCompletion = formatCompletion(payload.new);
            if (habitIds.includes(updatedCompletion.habitId)) {
              setCompletions(
                completions.map((c) =>
                  c.id === updatedCompletion.id ? updatedCompletion : c
                )
              );
            }
          } else if (payload.eventType === "DELETE" && payload.old) {
            const oldRecord = payload.old as { id: string };
            setCompletions(completions.filter((c) => c.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(habitsChannel);
      supabase.removeChannel(completionsChannel);
    };
  }, [user, isAnonymous, habits, completions, setHabits, setCompletions]);
}

function formatHabit(data: Record<string, unknown>): Habit {
  return {
    id: data.id as string,
    userId: data.user_id as string | null,
    name: data.name as string,
    emoji: data.emoji as string,
    color: data.color as string,
    frequency: data.frequency as Habit["frequency"],
    reminderTime: data.reminder_time as string | null,
    reminderMessage: data.reminder_message as string | null,
    category: data.category as string | null,
    archived: data.archived as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

function formatCompletion(data: Record<string, unknown>): Completion {
  return {
    id: data.id as string,
    habitId: data.habit_id as string,
    completedAt: data.completed_at as string,
    note: data.note as string | null,
    mood: data.mood as number | null,
    photoUrl: data.photo_url as string | null,
    createdAt: data.created_at as string,
  };
}
