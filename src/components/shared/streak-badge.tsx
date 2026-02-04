import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "default";
}

export function StreakBadge({
  streak,
  className,
  showIcon = true,
  size = "default",
}: StreakBadgeProps) {
  if (streak === 0) return null;

  const isHotStreak = streak >= 7;

  return (
    <Badge
      variant={isHotStreak ? "streak" : "secondary"}
      className={cn(
        "gap-1",
        size === "sm" && "text-xs px-1.5 py-0",
        className
      )}
    >
      {showIcon && (
        <Flame
          className={cn(
            "h-3 w-3",
            isHotStreak && "text-white animate-pulse"
          )}
        />
      )}
      <span>{streak}</span>
    </Badge>
  );
}
