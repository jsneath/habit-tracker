"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/ui-store";

export function QuickAddButton() {
  const { openHabitModal } = useUIStore();

  return (
    <Button
      onClick={() => openHabitModal()}
      size="lg"
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
      aria-label="Add new habit"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
