"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const COMMON_EMOJIS = [
  "✅", "💪", "📚", "🏃", "💧", "🧘", "💤", "🥗", "✍️", "🎯",
  "🏋️", "🚴", "🧠", "💊", "🍎", "🥤", "☀️", "🌙", "🎨", "🎹",
  "💼", "📱", "🖥️", "🏠", "🧹", "🌱", "💰", "📖", "🎧", "🚿",
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-10 text-xl p-0"
        >
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-6 gap-1">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelect(emoji)}
              className={`h-9 w-9 text-xl rounded hover:bg-muted transition-colors ${
                value === emoji ? "bg-muted ring-2 ring-primary" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
