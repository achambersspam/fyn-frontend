"use client";

import { useEffect, useMemo, useState } from "react";

interface LogoProps {
  variant?: "envelope" | "devices";
  className?: string;
}

export default function Logo({ variant = "envelope", className = "w-24 h-24" }: LogoProps) {
  const src = useMemo(
    () => (variant === "envelope" ? "/logo-envelope.png" : "/logo-devices.png"),
    [variant]
  );
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = src;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (g > 200 && r < 170 && b < 170) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const nextSrc = canvas.toDataURL("image/png");

      if (isMounted) {
        setProcessedSrc(nextSrc);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      <img
        src={processedSrc ?? src}
        alt="For You Newsletter"
        className="object-contain w-full h-full"
      />
    </div>
  );
}
