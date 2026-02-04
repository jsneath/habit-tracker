"use client";

import { useCallback } from "react";
import { useCompletionsStore } from "@/lib/stores/completions-store";
import { useUserStore } from "@/lib/stores/user-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Completion } from "@/types";
import { getDateKey, isMilestoneDay, getMilestoneMessage } from "@/lib/utils";
import { toast } from "sonner";

export function useCompletions() {
  const {
    completions,
    isLoading,
    error,
    setCompletions,
    addCompletion: addCompletionToStore,
    updateCompletion: updateCompletionInStore,
    deleteCompletion: deleteCompletionFromStore,
    toggleCompletion: toggleCompletionInStore,
    setLoading,
    setError,
    getCompletionsForHabit,
    getCompletionsForDate,
    isHabitCompletedOnDate,
    getStreakForHabit,
  } = useCompletionsStore();

  const { user, isAnonymous } = useUserStore();
  const { triggerConfetti } = useUIStore();

  const supabase = createClient();

  // Fetch completions from Supabase
  const fetchCompletions = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase || isAnonymous) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("completions")
        .select("*")
        .order("completed_at", { ascending: false });

      if (error) throw error;

      const formattedCompletions: Completion[] = data.map((c) => ({
        id: c.id,
        habitId: c.habit_id,
        completedAt: c.completed_at,
        note: c.note,
        mood: c.mood,
        photoUrl: c.photo_url,
        createdAt: c.created_at,
      }));

      setCompletions(formattedCompletions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch completions"
      );
      toast.error("Failed to load completion history");
    } finally {
      setLoading(false);
    }
  }, [isAnonymous, supabase, setCompletions, setLoading, setError]);

  // Toggle completion with celebration
  const toggleCompletion = useCallback(
    async (habitId: string, date: Date = new Date()) => {
      const dateKey = getDateKey(date);
      const wasCompleted = isHabitCompletedOnDate(habitId, date);

      // Optimistic update
      const added = toggleCompletionInStore(habitId, date);

      // Check for milestone if completing
      if (added) {
        const newStreak = getStreakForHabit(habitId);
        if (isMilestoneDay(newStreak)) {
          const message = getMilestoneMessage(newStreak);
          triggerConfetti(message ?? undefined);
          if (message) {
            toast.success(message, {
              duration: 5000,
            });
          }
        }
      }

      if (isSupabaseConfigured() && supabase && !isAnonymous && user) {
        try {
          if (added) {
            const { error } = await supabase.from("completions").insert({
              habit_id: habitId,
              completed_at: dateKey,
            });
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from("completions")
              .delete()
              .eq("habit_id", habitId)
              .eq("completed_at", dateKey);
            if (error) throw error;
          }
        } catch (err) {
          // Rollback on error
          toggleCompletionInStore(habitId, date);
          toast.error("Failed to save completion");
          throw err;
        }
      }

      return added;
    },
    [
      isAnonymous,
      user,
      supabase,
      toggleCompletionInStore,
      isHabitCompletedOnDate,
      getStreakForHabit,
      triggerConfetti,
    ]
  );

  // Add completion with optional note/mood/photo
  const addCompletionWithDetails = useCallback(
    async (
      habitId: string,
      date: Date = new Date(),
      details: { note?: string; mood?: number; photoUrl?: string } = {}
    ) => {
      const dateKey = getDateKey(date);

      // Optimistic update
      const tempCompletion = addCompletionToStore({
        habitId,
        completedAt: dateKey,
        note: details.note ?? null,
        mood: details.mood ?? null,
        photoUrl: details.photoUrl ?? null,
      });

      // Check for milestone
      const newStreak = getStreakForHabit(habitId);
      if (isMilestoneDay(newStreak)) {
        const message = getMilestoneMessage(newStreak);
        triggerConfetti(message ?? undefined);
        if (message) {
          toast.success(message, { duration: 5000 });
        }
      }

      if (isSupabaseConfigured() && supabase && !isAnonymous && user) {
        try {
          const { data, error } = await supabase
            .from("completions")
            .insert({
              habit_id: habitId,
              completed_at: dateKey,
              note: details.note,
              mood: details.mood,
              photo_url: details.photoUrl,
            })
            .select()
            .single();

          if (error) throw error;

          // Update with real ID
          updateCompletionInStore(tempCompletion.id, { id: data.id });
          return data;
        } catch (err) {
          // Rollback on error
          deleteCompletionFromStore(tempCompletion.id);
          toast.error("Failed to save completion");
          throw err;
        }
      }

      return tempCompletion;
    },
    [
      isAnonymous,
      user,
      supabase,
      addCompletionToStore,
      updateCompletionInStore,
      deleteCompletionFromStore,
      getStreakForHabit,
      triggerConfetti,
    ]
  );

  // Update completion details
  const updateCompletion = useCallback(
    async (id: string, updates: Partial<Completion>) => {
      const oldCompletion = completions.find((c) => c.id === id);

      // Optimistic update
      updateCompletionInStore(id, updates);

      if (isSupabaseConfigured() && supabase && !isAnonymous && user) {
        try {
          const { error } = await supabase
            .from("completions")
            .update({
              note: updates.note,
              mood: updates.mood,
              photo_url: updates.photoUrl,
            })
            .eq("id", id);

          if (error) throw error;
        } catch (err) {
          // Rollback on error
          if (oldCompletion) updateCompletionInStore(id, oldCompletion);
          toast.error("Failed to update completion");
          throw err;
        }
      }
    },
    [isAnonymous, user, completions, supabase, updateCompletionInStore]
  );

  return {
    completions,
    isLoading,
    error,
    fetchCompletions,
    toggleCompletion,
    addCompletionWithDetails,
    updateCompletion,
    getCompletionsForHabit,
    getCompletionsForDate,
    isHabitCompletedOnDate,
    getStreakForHabit,
  };
}
