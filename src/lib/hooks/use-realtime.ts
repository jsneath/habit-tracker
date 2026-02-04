"use client";

import { useEffect } from "react";
import { useUserStore } from "@/lib/stores/user-store";
import { useHabitsStore } from "@/lib/stores/habits-store";
import { useCompletionsStore } from "@/lib/stores/completions-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Habit, Completion } from "@/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtime() {
  const { user, isAnonymous } = useUserStore();
  const { setHabits, habits } = useHabitsStore();
  const { setCompletions, completions } = useCompletionsStore();

  const supabase = createClient();

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase || isAnonymous || !user) return;

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
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === "INSERT") {
            const newHabit = formatHabit(payload.new);
            setHabits([...habits, newHabit]);
          } else if (payload.eventType === "UPDATE") {
            const updatedHabit = formatHabit(payload.new);
            setHabits(
              habits.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
            );
          } else if (payload.eventType === "DELETE") {
            setHabits(habits.filter((h) => h.id !== payload.old.id));
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
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Only process if the completion belongs to user's habit
          const habitIds = habits.map((h) => h.id);

          if (payload.eventType === "INSERT") {
            if (habitIds.includes(payload.new.habit_id)) {
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
          } else if (payload.eventType === "DELETE") {
            setCompletions(completions.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(habitsChannel);
      supabase.removeChannel(completionsChannel);
    };
  }, [user, isAnonymous, habits, completions, supabase, setHabits, setCompletions]);
}

function formatHabit(data: any): Habit {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    emoji: data.emoji,
    color: data.color,
    frequency: data.frequency,
    reminderTime: data.reminder_time,
    reminderMessage: data.reminder_message,
    category: data.category,
    archived: data.archived,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function formatCompletion(data: any): Completion {
  return {
    id: data.id,
    habitId: data.habit_id,
    completedAt: data.completed_at,
    note: data.note,
    mood: data.mood,
    photoUrl: data.photo_url,
    createdAt: data.created_at,
  };
}
