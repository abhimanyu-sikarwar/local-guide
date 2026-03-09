"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const bg = type === "error" ? "bg-destructive text-destructive-foreground" :
             type === "success" ? "bg-green-600 text-white" :
             "bg-foreground text-background";

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium max-w-[90vw] text-center ${bg}`}>
      {message}
    </div>
  );
}
