import { ReactNode } from "react";

interface ConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "primary";
}

export function Confirm({
  open,
  title,
  message,
  confirmLabel = "confirm",
  onConfirm,
  onCancel,
  variant = "primary",
}: ConfirmProps) {
  if (!open) return null;

  const btnClass =
    variant === "danger"
      ? "bg-danger text-white hover:bg-danger/90"
      : "gradient-primary text-white hover:opacity-90";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-xl dark:border-dark-border dark:bg-dark-surface animate-slide-up">
        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
          {title}
        </h3>
        <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
          {message}
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary dark:border-dark-border dark:text-dark-text-secondary"
          >
            cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
