import { cn } from "../../lib/utils";

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-success/10 text-success",
  ON_TRIP: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
  IN_SHOP: "bg-warning/10 text-warning",
  RETIRED: "bg-text-muted/10 text-text-muted",
  OFF_DUTY: "bg-accent-100 text-accent-700",
  SUSPENDED: "bg-danger/10 text-danger",
  DRAFT: "bg-surface-secondary text-text-secondary dark:bg-dark-surface-secondary dark:text-dark-text-secondary",
  DISPATCHED: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
  COMPLETED: "bg-success/10 text-success",
  CANCELLED: "bg-danger/10 text-danger",
  ACTIVE: "bg-warning/10 text-warning",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusColors[status] || "bg-surface-secondary text-text-secondary"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
