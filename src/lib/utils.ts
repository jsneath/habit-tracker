import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sortedDates = [...completedDates].sort().reverse();
  const today = getDateKey(new Date());
  const yesterday = getDateKey(new Date(Date.now() - 86400000));

  // Check if streak is current (completed today or yesterday)
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i - 1]);
    const previousDate = new Date(sortedDates[i]);
    const diffDays = Math.floor(
      (currentDate.getTime() - previousDate.getTime()) / 86400000
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getCompletionPercentage(
  completed: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getHeatmapLevel(percentage: number): 0 | 1 | 2 | 3 | 4 {
  if (percentage === 0) return 0;
  if (percentage < 25) return 1;
  if (percentage < 50) return 2;
  if (percentage < 75) return 3;
  return 4;
}

export const HABIT_COLORS = [
  { name: "Green", value: "#10B981" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Orange", value: "#F97316" },
  { name: "Pink", value: "#EC4899" },
  { name: "Red", value: "#EF4444" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Teal", value: "#14B8A6" },
] as const;

export const MILESTONE_DAYS = [7, 21, 30, 50, 66, 100, 365] as const;

export function isMilestoneDay(streak: number): boolean {
  return MILESTONE_DAYS.includes(streak as (typeof MILESTONE_DAYS)[number]);
}

export function getMilestoneMessage(streak: number): string | null {
  switch (streak) {
    case 7:
      return "One week strong! You're building momentum.";
    case 21:
      return "21 days! They say it takes 21 days to form a habit.";
    case 30:
      return "A full month! You're unstoppable!";
    case 50:
      return "50 days! Halfway to 100!";
    case 66:
      return "66 days - the magic number for habit formation!";
    case 100:
      return "100 DAYS! You're a habit master!";
    case 365:
      return "ONE YEAR! Incredible dedication!";
    default:
      return null;
  }
}
