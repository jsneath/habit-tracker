"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { INSPIRATIONAL_QUOTES } from "@/types";

export function InspirationCard() {
  const quote = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return INSPIRATIONAL_QUOTES[dayOfYear % INSPIRATIONAL_QUOTES.length];
  }, []);

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-medium">{quote}</p>
      </CardContent>
    </Card>
  );
}
