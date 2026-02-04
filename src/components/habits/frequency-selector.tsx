"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HabitFrequency, FrequencyType } from "@/types";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

interface FrequencySelectorProps {
  value: HabitFrequency;
  onChange: (frequency: HabitFrequency) => void;
}

export function FrequencySelector({ value, onChange }: FrequencySelectorProps) {
  const handleTypeChange = (type: FrequencyType) => {
    if (type === "daily") {
      onChange({ type: "daily" });
    } else if (type === "weekly") {
      onChange({ type: "weekly", days: [1, 2, 3, 4, 5] }); // Default to weekdays
    } else if (type === "monthly") {
      onChange({ type: "monthly", days: [1] }); // Default to 1st
    } else if (type === "custom") {
      onChange({ type: "custom", interval: 2 }); // Default to every 2 days
    }
  };

  const handleDayToggle = (day: number) => {
    if (value.type !== "weekly") return;
    const currentDays = value.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();
    onChange({ ...value, days: newDays });
  };

  const handleIntervalChange = (interval: number) => {
    if (value.type !== "custom") return;
    onChange({ ...value, interval: Math.max(1, interval) });
  };

  return (
    <div className="space-y-3">
      <Label>Frequency</Label>

      <Select value={value.type} onValueChange={handleTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select frequency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Every day</SelectItem>
          <SelectItem value="weekly">Specific days of week</SelectItem>
          <SelectItem value="custom">Every X days</SelectItem>
        </SelectContent>
      </Select>

      {/* Weekly day selector */}
      {value.type === "weekly" && (
        <div className="flex gap-1 flex-wrap">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = value.days?.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`h-9 w-9 text-xs rounded-full transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Custom interval input */}
      {value.type === "custom" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Every</span>
          <Input
            type="number"
            min={1}
            max={365}
            value={value.interval || 2}
            onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">days</span>
        </div>
      )}
    </div>
  );
}
