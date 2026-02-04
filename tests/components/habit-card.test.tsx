import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HabitCard } from "@/components/habits/habit-card";
import type { HabitWithCompletions } from "@/types";

// Mock the hooks
vi.mock("@/lib/hooks/use-completions", () => ({
  useCompletions: () => ({
    toggleCompletion: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/use-habits", () => ({
  useHabits: () => ({
    deleteHabit: vi.fn(),
  }),
}));

vi.mock("@/lib/stores/ui-store", () => ({
  useUIStore: () => ({
    openHabitModal: vi.fn(),
  }),
}));

const mockHabit: HabitWithCompletions = {
  id: "test-habit-1",
  userId: null,
  name: "Test Habit",
  emoji: "✅",
  color: "#10B981",
  frequency: { type: "daily" },
  reminderTime: null,
  reminderMessage: null,
  category: "Health",
  archived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completions: [],
  streak: 5,
  isCompletedToday: false,
};

describe("HabitCard", () => {
  it("renders habit name and emoji", () => {
    render(<HabitCard habit={mockHabit} />);

    expect(screen.getByText("Test Habit")).toBeInTheDocument();
    expect(screen.getByText("✅")).toBeInTheDocument();
  });

  it("shows streak badge when streak > 0", () => {
    render(<HabitCard habit={mockHabit} />);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows category when provided", () => {
    render(<HabitCard habit={mockHabit} />);

    expect(screen.getByText("Health")).toBeInTheDocument();
  });

  it("shows completed state correctly", () => {
    const completedHabit = { ...mockHabit, isCompletedToday: true };
    render(<HabitCard habit={completedHabit} />);

    expect(screen.getByText("Test Habit")).toHaveClass("line-through");
  });
});
