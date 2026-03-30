"use client";

interface UnsavedChangesModalProps {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function UnsavedChangesModal({
  open,
  onSave,
  onDiscard,
  onCancel,
}: UnsavedChangesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800">
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Unsaved Changes
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You have unsaved changes. What would you like to do?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={onSave} className="flex-1 btn-primary py-3 text-sm">
            Save
          </button>
          <button
            onClick={onDiscard}
            className="flex-1 rounded-xl border-2 border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 transition-all dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
          >
            Discard
          </button>
          <button
            onClick={onCancel}
            className="flex-1 btn-outline py-3 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
