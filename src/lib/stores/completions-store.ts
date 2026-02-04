import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Completion } from "@/types";
import { generateId, getDateKey, calculateStreak } from "@/lib/utils";

interface CompletionsState {
  completions: Completion[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCompletions: (completions: Completion[]) => void;
  addCompletion: (
    completion: Omit<Completion, "id" | "createdAt">
  ) => Completion;
  updateCompletion: (id: string, updates: Partial<Completion>) => void;
  deleteCompletion: (id: string) => void;
  toggleCompletion: (habitId: string, date?: Date) => boolean; // Returns true if added, false if removed
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getCompletionsForHabit: (habitId: string) => Completion[];
  getCompletionsForDate: (date: Date) => Completion[];
  isHabitCompletedOnDate: (habitId: string, date: Date) => boolean;
  getStreakForHabit: (habitId: string) => number;
  getCompletionDatesForHabit: (habitId: string) => string[];
}

export const useCompletionsStore = create<CompletionsState>()(
  persist(
    (set, get) => ({
      completions: [],
      isLoading: false,
      error: null,

      setCompletions: (completions) => set({ completions }),

      addCompletion: (completionData) => {
        const newCompletion: Completion = {
          id: generateId(),
          ...completionData,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          completions: [...state.completions, newCompletion],
        }));

        return newCompletion;
      },

      updateCompletion: (id, updates) =>
        set((state) => ({
          completions: state.completions.map((completion) =>
            completion.id === id ? { ...completion, ...updates } : completion
          ),
        })),

      deleteCompletion: (id) =>
        set((state) => ({
          completions: state.completions.filter((c) => c.id !== id),
        })),

      toggleCompletion: (habitId, date = new Date()) => {
        const dateKey = getDateKey(date);
        const existing = get().completions.find(
          (c) => c.habitId === habitId && c.completedAt === dateKey
        );

        if (existing) {
          get().deleteCompletion(existing.id);
          return false;
        } else {
          get().addCompletion({
            habitId,
            completedAt: dateKey,
            note: null,
            mood: null,
            photoUrl: null,
          });
          return true;
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      getCompletionsForHabit: (habitId) =>
        get().completions.filter((c) => c.habitId === habitId),

      getCompletionsForDate: (date) => {
        const dateKey = getDateKey(date);
        return get().completions.filter((c) => c.completedAt === dateKey);
      },

      isHabitCompletedOnDate: (habitId, date) => {
        const dateKey = getDateKey(date);
        return get().completions.some(
          (c) => c.habitId === habitId && c.completedAt === dateKey
        );
      },

      getStreakForHabit: (habitId) => {
        const completions = get().completions.filter(
          (c) => c.habitId === habitId
        );
        const dates = completions.map((c) => c.completedAt);
        return calculateStreak(dates);
      },

      getCompletionDatesForHabit: (habitId) =>
        get()
          .completions.filter((c) => c.habitId === habitId)
          .map((c) => c.completedAt),
    }),
    {
      name: "completions-storage",
      partialize: (state) => ({ completions: state.completions }),
    }
  )
);
