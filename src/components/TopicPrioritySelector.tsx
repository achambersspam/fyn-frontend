"use client";

import { useState } from "react";

type TopicPrioritySelectorProps = {
  topic: string;
  priority: number;
  onPriorityChange: (priority: number) => void;
};

export default function TopicPrioritySelector({
  topic,
  priority,
  onPriorityChange,
}: TopicPrioritySelectorProps) {
  const [hoveredPriority, setHoveredPriority] = useState<number | null>(null);
  const displayPriority = hoveredPriority ?? priority;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPriorityChange(n)}
            onMouseEnter={() => setHoveredPriority(n)}
            onMouseLeave={() => setHoveredPriority(null)}
            onFocus={() => setHoveredPriority(n)}
            onBlur={() => setHoveredPriority(null)}
            className="p-0.5 transition-opacity hover:opacity-80 cursor-pointer"
            aria-label={`Set ${topic} priority to ${n}`}
          >
            <img
              src={n <= displayPriority ? "/pigeon-filled.svg" : "/pigeon-outline.svg"}
              alt=""
              aria-hidden="true"
              className="h-14 w-14 cursor-pointer select-none"
            />
          </button>
        ))}
      </div>
      <p className="text-sm font-medium text-[#37b4f3]">
        More pigeons = More time in your newsletter
      </p>
    </div>
  );
}
