import { cn } from "../../lib/utils";

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  ON_TRIP: "bg-violet-50 text-violet-600 border border-violet-200",
  IN_SHOP: "bg-amber-50 text-amber-600 border border-amber-200",
  RETIRED: "bg-slate-100 text-slate-500 border border-slate-200",
  OFF_DUTY: "bg-orange-50 text-orange-600 border border-orange-200",
  SUSPENDED: "bg-rose-50 text-rose-600 border border-rose-200",
  DRAFT: "bg-slate-50 text-slate-500 border border-slate-200",
  DISPATCHED: "bg-blue-50 text-blue-600 border border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-600 border border-rose-200",
  ACTIVE: "bg-amber-50 text-amber-600 border border-amber-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusColors[status] || "bg-slate-50 text-slate-500 border border-slate-200"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
