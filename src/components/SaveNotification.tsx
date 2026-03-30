"use client";

import { useEffect, useState } from "react";
import { Check } from "@/components/Icons";

interface SaveNotificationProps {
  show: boolean;
  message?: string;
  onDone?: () => void;
}

export default function SaveNotification({
  show,
  message = "Saved",
  onDone,
}: SaveNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex justify-center transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-white font-bold shadow-lg">
        <Check size={18} />
        <span>{message}</span>
      </div>
    </div>
  );
}
