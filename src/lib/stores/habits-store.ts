import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Habit, HabitFrequency } from "@/types";
import { generateId, getDateKey } from "@/lib/utils";

interface HabitsState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "updatedAt">) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getHabitById: (id: string) => Habit | undefined;
  getActiveHabits: () => Habit[];
  getArchivedHabits: () => Habit[];
  getHabitsForToday: () => Habit[];
}

const isHabitScheduledForDate = (habit: Habit, date: Date): boolean => {
  const { frequency } = habit;
  const dayOfWeek = date.getDay(); // 0-6 (Sun-Sat)
  const dayOfMonth = date.getDate(); // 1-31

  switch (frequency.type) {
    case "daily":
      return true;
    case "weekly":
      return frequency.days?.includes(dayOfWeek) ?? false;
    case "monthly":
      return frequency.days?.includes(dayOfMonth) ?? false;
    case "custom":
      if (!frequency.interval || !habit.createdAt) return false;
      const startDate = new Date(habit.createdAt);
      const diffTime = Math.abs(date.getTime() - startDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays % frequency.interval === 0;
    default:
      return false;
  }
};

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: [],
      isLoading: false,
      error: null,

      setHabits: (habits) => set({ habits }),

      addHabit: (habitData) => {
        const now = new Date().toISOString();
        const newHabit: Habit = {
          id: generateId(),
          ...habitData,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          habits: [...state.habits, newHabit],
        }));

        return newHabit;
      },

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
              : habit
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),

      archiveHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? { ...habit, archived: true, updatedAt: new Date().toISOString() }
              : habit
          ),
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      getHabitById: (id) => get().habits.find((h) => h.id === id),

      getActiveHabits: () => get().habits.filter((h) => !h.archived),

      getArchivedHabits: () => get().habits.filter((h) => h.archived),

      getHabitsForToday: () => {
        const today = new Date();
        return get()
          .habits.filter((h) => !h.archived)
          .filter((h) => isHabitScheduledForDate(h, today));
      },
    }),
    {
      name: "habits-storage",
      partialize: (state) => ({ habits: state.habits }),
    }
  )
);
