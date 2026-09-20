"use client";

import { useEffect, useRef } from "react";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { useToast } from "@/lib/useToast";

export default function OfflineBanner() {
  const online = useOnlineStatus();
  const { toast } = useToast();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      toast.info("Back online");
    }
  }, [online, toast]);

  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[90] bg-amber-500 px-4 py-2 text-center text-sm font-bold text-white">
      You&apos;re offline. You can still open pages we&apos;ve already loaded.
    </div>
  );
}
