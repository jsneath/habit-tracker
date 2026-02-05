"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUIStore } from "@/lib/stores/ui-store";
import { useHabitsStore } from "@/lib/stores/habits-store";
import { useHabits } from "@/lib/hooks/use-habits";
import { habitSchema, type HabitFormData } from "@/lib/validations/habit";
import { HABIT_COLORS } from "@/lib/utils";
import { FrequencySelector } from "./frequency-selector";
import { EmojiPicker } from "./emoji-picker";
import { useWatch } from "react-hook-form";

const COMMON_EMOJIS = [
  "✅",
  "💪",
  "📚",
  "🏃",
  "💧",
  "🧘",
  "💤",
  "🥗",
  "✍️",
  "🎯",
];

export function HabitModal() {
  const { isHabitModalOpen, editingHabitId, closeHabitModal } = useUIStore();
  const { getHabitById } = useHabitsStore();
  const { addHabit, updateHabit } = useHabits();

  const editingHabit = editingHabitId ? getHabitById(editingHabitId) : null;
  const isEditing = !!editingHabit;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      emoji: "✅",
      color: "#10B981",
      frequency: { type: "daily" },
      reminderTime: null,
      reminderMessage: null,
      category: null,
    },
  });

  // Reset form when modal opens/closes or editing habit changes
  useEffect(() => {
    if (isHabitModalOpen) {
      if (editingHabit) {
        reset({
          name: editingHabit.name,
          emoji: editingHabit.emoji,
          color: editingHabit.color,
          frequency: editingHabit.frequency,
          reminderTime: editingHabit.reminderTime,
          reminderMessage: editingHabit.reminderMessage,
          category: editingHabit.category,
        });
      } else {
        reset({
          name: "",
          emoji: "✅",
          color: "#10B981",
          frequency: { type: "daily" },
          reminderTime: null,
          reminderMessage: null,
          category: null,
        });
      }
    }
  }, [isHabitModalOpen, editingHabit, reset]);

  const onSubmit = async (data: HabitFormData) => {
    try {
      if (isEditing && editingHabitId) {
        await updateHabit(editingHabitId, {
          ...data,
          reminderTime: data.reminderTime ?? null,
          reminderMessage: data.reminderMessage ?? null,
          category: data.category ?? null,
        });
      } else {
        await addHabit({
          ...data,
          reminderTime: data.reminderTime ?? null,
          reminderMessage: data.reminderMessage ?? null,
          category: data.category ?? null,
          archived: false,
        });
      }
      closeHabitModal();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const selectedEmoji = useWatch({ control, name: "emoji" });
  const selectedColor = useWatch({ control, name: "color" });
  const frequency = useWatch({ control, name: "frequency" });

  return (
    <Dialog open={isHabitModalOpen} onOpenChange={closeHabitModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Habit" : "New Habit"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your habit details below."
              : "Create a new habit to track. Start small and build consistency!"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name and Emoji */}
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <div className="flex gap-2">
              <EmojiPicker
                value={selectedEmoji}
                onChange={(emoji) => setValue("emoji", emoji)}
              />
              <Input
                id="name"
                placeholder="e.g., Drink water, Exercise"
                {...register("name")}
                className="flex-1"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue("color", color.value)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    selectedColor === color.value
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <FrequencySelector
            value={frequency}
            onChange={(freq) => setValue("frequency", freq)}
          />

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              placeholder="e.g., Health, Work, Personal"
              {...register("category")}
            />
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Reminder Time (optional)</Label>
            <Input
              id="reminderTime"
              type="time"
              {...register("reminderTime")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderMessage">Reminder Message (optional)</Label>
            <Input
              id="reminderMessage"
              placeholder="e.g., Time to exercise! 💪"
              {...register("reminderMessage")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeHabitModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
