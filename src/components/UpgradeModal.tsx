"use client";

import Link from "next/link";
import { X } from "@/components/Icons";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export default function UpgradeModal({
  open,
  onClose,
  message = "You've reached the limit for your current plan.",
}: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Upgrade Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-outline py-3 text-sm"
          >
            Cancel
          </button>
          <Link href="/subscription" className="flex-1" onClick={onClose}>
            <button className="w-full btn-primary py-3 text-sm">
              View Plans
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
