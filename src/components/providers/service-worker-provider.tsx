"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/offline/register-sw";

export function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <>{children}</>;
}
