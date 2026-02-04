import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Modal states
  isHabitModalOpen: boolean;
  editingHabitId: string | null;
  isAuthModalOpen: boolean;

  // UI preferences
  showCompletedHabits: boolean;
  showTips: boolean;
  selectedDate: string; // ISO date string

  // Confetti trigger
  showConfetti: boolean;
  confettiMessage: string | null;

  // Actions
  openHabitModal: (editId?: string) => void;
  closeHabitModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setShowCompletedHabits: (show: boolean) => void;
  dismissTips: () => void;
  setSelectedDate: (date: string) => void;
  triggerConfetti: (message?: string) => void;
  hideConfetti: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isHabitModalOpen: false,
      editingHabitId: null,
      isAuthModalOpen: false,
      showCompletedHabits: true,
      showTips: true,
      selectedDate: new Date().toISOString().split("T")[0],
      showConfetti: false,
      confettiMessage: null,

      openHabitModal: (editId) =>
        set({
          isHabitModalOpen: true,
          editingHabitId: editId ?? null,
        }),

      closeHabitModal: () =>
        set({
          isHabitModalOpen: false,
          editingHabitId: null,
        }),

      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),

      setShowCompletedHabits: (show) => set({ showCompletedHabits: show }),

      dismissTips: () => set({ showTips: false }),

      setSelectedDate: (date) => set({ selectedDate: date }),

      triggerConfetti: (message) =>
        set({
          showConfetti: true,
          confettiMessage: message ?? null,
        }),

      hideConfetti: () =>
        set({
          showConfetti: false,
          confettiMessage: null,
        }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        showCompletedHabits: state.showCompletedHabits,
        showTips: state.showTips,
      }),
    }
  )
);
