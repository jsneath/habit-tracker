export type FrequencyType = "daily" | "weekly" | "monthly" | "custom";

export interface HabitFrequency {
  type: FrequencyType;
  days?: number[]; // For weekly: 0-6 (Sun-Sat), for monthly: 1-31
  interval?: number; // For custom: every X days
}

export interface Habit {
  id: string;
  userId: string | null;
  name: string;
  emoji: string;
  color: string;
  frequency: HabitFrequency;
  reminderTime: string | null;
  reminderMessage: string | null;
  category: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Completion {
  id: string;
  habitId: string;
  completedAt: string;
  note: string | null;
  mood: number | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface HabitWithCompletions extends Habit {
  completions: Completion[];
  streak: number;
  isCompletedToday: boolean;
}

export interface DailyStats {
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
}

export interface HabitStats {
  habitId: string;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate7Days: number;
  completionRate30Days: number;
}

export interface User {
  id: string;
  email: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: "😢",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😄",
};

export const INSPIRATIONAL_QUOTES = [
  "Small wins build empires! 🚀",
  "Every day is a fresh start ✨",
  "Progress, not perfection 💪",
  "You're stronger than you think 🌟",
  "One habit at a time 🎯",
  "Consistency beats intensity 🔥",
  "Show up for yourself today 💫",
  "Your future self will thank you 🙏",
  "Make it happen! 🌈",
  "The only bad workout is the one that didn't happen 💪",
  "Discipline is choosing between what you want now and what you want most 🎯",
  "A year from now you'll wish you had started today ⏰",
  "The secret to getting ahead is getting started 🚀",
  "Don't break the chain! 🔗",
  "Atomic habits lead to remarkable results 🌱",
] as const;

export const DEFAULT_HABITS = [
  {
    name: "Drink water",
    emoji: "💧",
    color: "#3B82F6",
    frequency: { type: "daily" as FrequencyType },
    reminderMessage: "Stay hydrated! Your body will thank you 💧",
  },
  {
    name: "Morning exercise",
    emoji: "🏃",
    color: "#10B981",
    frequency: { type: "daily" as FrequencyType },
    reminderMessage: "Let's get moving! 🏃‍♂️",
  },
] as const;
