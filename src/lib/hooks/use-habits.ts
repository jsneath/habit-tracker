"use client";

import { useCallback } from "react";
import { useHabitsStore } from "@/lib/stores/habits-store";
import { useCompletionsStore } from "@/lib/stores/completions-store";
import { useUserStore } from "@/lib/stores/user-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Habit, HabitWithCompletions } from "@/types";
import { toast } from "sonner";

export function useHabits() {
  const {
    habits,
    isLoading,
    error,
    setHabits,
    addHabit: addHabitToStore,
    updateHabit: updateHabitInStore,
    deleteHabit: deleteHabitFromStore,
    setLoading,
    setError,
    getActiveHabits,
    getHabitsForToday,
  } = useHabitsStore();

  const { completions, getStreakForHabit, isHabitCompletedOnDate } =
    useCompletionsStore();

  const { user, isAnonymous } = useUserStore();

  // Fetch habits from Supabase
  const fetchHabits = useCallback(async () => {
    if (!isSupabaseConfigured || isAnonymous) return;

    const supabase = createClient();
    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return;

      const formattedHabits: Habit[] = data.map((h) => ({
        id: h.id,
        userId: h.user_id,
        name: h.name,
        emoji: h.emoji,
        color: h.color,
        frequency: h.frequency as Habit["frequency"],
        reminderTime: h.reminder_time,
        reminderMessage: h.reminder_message,
        category: h.category,
        archived: h.archived,
        createdAt: h.created_at,
        updatedAt: h.updated_at,
      }));

      setHabits(formattedHabits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch habits");
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, [isAnonymous, setHabits, setLoading, setError]);

  // Add habit
  const addHabit = useCallback(
    async (habitData: Omit<Habit, "id" | "userId" | "createdAt" | "updatedAt">) => {
      // Optimistic update
      const tempHabit = addHabitToStore({
        ...habitData,
        userId: user?.id ?? null,
      });

      if (isSupabaseConfigured && !isAnonymous && user) {
        const supabase = createClient();
        if (!supabase) {
          toast.success("Habit created!");
          return tempHabit;
        }

        try {
          const { data, error } = await supabase
            .from("habits")
            .insert({
              user_id: user.id,
              name: habitData.name,
              emoji: habitData.emoji,
              color: habitData.color,
              frequency: habitData.frequency as unknown as Record<string, unknown>,
              reminder_time: habitData.reminderTime,
              reminder_message: habitData.reminderMessage,
              category: habitData.category,
              archived: habitData.archived,
            })
            .select()
            .single();

          if (error) throw error;
          if (data) {
            // Update with real ID from database
            updateHabitInStore(tempHabit.id, { id: data.id });
          }
          toast.success("Habit created!");
          return data;
        } catch (err) {
          // Rollback on error
          deleteHabitFromStore(tempHabit.id);
          toast.error("Failed to create habit");
          throw err;
        }
      } else {
        toast.success("Habit created!");
        return tempHabit;
      }
    },
    [
      isAnonymous,
      user,
      addHabitToStore,
      updateHabitInStore,
      deleteHabitFromStore,
    ]
  );

  // Update habit
  const updateHabit = useCallback(
    async (id: string, updates: Partial<Habit>) => {
      // Store old values for rollback
      const oldHabit = habits.find((h) => h.id === id);

      // Optimistic update
      updateHabitInStore(id, updates);

      if (isSupabaseConfigured && !isAnonymous && user) {
        const supabase = createClient();
        if (!supabase) {
          toast.success("Habit updated!");
          return;
        }

        try {
          const { error } = await supabase
            .from("habits")
            .update({
              name: updates.name,
              emoji: updates.emoji,
              color: updates.color,
              frequency: updates.frequency as unknown as Record<string, unknown>,
              reminder_time: updates.reminderTime,
              reminder_message: updates.reminderMessage,
              category: updates.category,
              archived: updates.archived,
            })
            .eq("id", id);

          if (error) throw error;
          toast.success("Habit updated!");
        } catch (err) {
          // Rollback on error
          if (oldHabit) updateHabitInStore(id, oldHabit);
          toast.error("Failed to update habit");
          throw err;
        }
      } else {
        toast.success("Habit updated!");
      }
    },
    [isAnonymous, user, habits, updateHabitInStore]
  );

  // Delete habit
  const deleteHabit = useCallback(
    async (id: string) => {
      const oldHabit = habits.find((h) => h.id === id);

      // Optimistic update
      deleteHabitFromStore(id);

      if (isSupabaseConfigured && !isAnonymous && user) {
        const supabase = createClient();
        if (!supabase) {
          toast.success("Habit deleted");
          return;
        }

        try {
          const { error } = await supabase.from("habits").delete().eq("id", id);

          if (error) throw error;
          toast.success("Habit deleted");
        } catch (err) {
          // Rollback on error
          if (oldHabit) addHabitToStore(oldHabit);
          toast.error("Failed to delete habit");
          throw err;
        }
      } else {
        toast.success("Habit deleted");
      }
    },
    [isAnonymous, user, habits, deleteHabitFromStore, addHabitToStore]
  );

  // Get habits with completion data
  const getHabitsWithCompletions = useCallback((): HabitWithCompletions[] => {
    const today = new Date();
    return getActiveHabits().map((habit) => ({
      ...habit,
      completions: completions.filter((c) => c.habitId === habit.id),
      streak: getStreakForHabit(habit.id),
      isCompletedToday: isHabitCompletedOnDate(habit.id, today),
    }));
  }, [getActiveHabits, completions, getStreakForHabit, isHabitCompletedOnDate]);

  // Get today's habits with completion data
  const getTodayHabitsWithCompletions = useCallback((): HabitWithCompletions[] => {
    const today = new Date();
    return getHabitsForToday().map((habit) => ({
      ...habit,
      completions: completions.filter((c) => c.habitId === habit.id),
      streak: getStreakForHabit(habit.id),
      isCompletedToday: isHabitCompletedOnDate(habit.id, today),
    }));
  }, [getHabitsForToday, completions, getStreakForHabit, isHabitCompletedOnDate]);

  return {
    habits,
    isLoading,
    error,
    fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    getActiveHabits,
    getHabitsForToday,
    getHabitsWithCompletions,
    getTodayHabitsWithCompletions,
  };
}
