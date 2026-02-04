"use client";

import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { useUIStore } from "@/lib/stores/ui-store";

export function ConfettiTrigger() {
  const { showConfetti, hideConfetti } = useUIStore();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        hideConfetti();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti, hideConfetti]);

  if (!showConfetti) return null;

  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
      colors={["#10B981", "#3B82F6", "#8B5CF6", "#F97316", "#EC4899", "#EAB308"]}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 100 }}
    />
  );
}
