"use client";

import { useEffect, useState } from "react";

export function useDelayedVisibility(
  isVisible: boolean,
  delayMs = 300
): boolean {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShouldShow(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShouldShow(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delayMs, isVisible]);

  return shouldShow;
}
