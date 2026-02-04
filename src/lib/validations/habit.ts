import { z } from "zod";

export const frequencySchema = z.object({
  type: z.enum(["daily", "weekly", "monthly", "custom"]),
  days: z.array(z.number().min(0).max(31)).optional(),
  interval: z.number().min(1).max(365).optional(),
});

export const habitSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less"),
  emoji: z.string().default("✅"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#10B981"),
  frequency: frequencySchema.default({ type: "daily" }),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format")
    .nullable()
    .optional(),
  reminderMessage: z
    .string()
    .max(100, "Message must be 100 characters or less")
    .nullable()
    .optional(),
  category: z.string().max(30).nullable().optional(),
});

export const completionSchema = z.object({
  habitId: z.string().uuid(),
  completedAt: z.string().date(),
  note: z.string().max(500).nullable().optional(),
  mood: z.number().min(1).max(5).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
});

export type HabitFormData = z.infer<typeof habitSchema>;
export type CompletionFormData = z.infer<typeof completionSchema>;
