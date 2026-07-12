import { ReactNode, useState } from "react";
import { cn } from "../../lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  nextCursor?: string | null;
  onLoadMore?: () => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = "no records found",
  loading,
  nextCursor,
  onLoadMore,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted dark:text-dark-text-muted">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border dark:border-dark-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-secondary dark:border-dark-border dark:bg-dark-surface-secondary">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-b border-border transition-colors dark:border-dark-border",
                "hover:bg-surface-hover dark:hover:bg-dark-surface-hover",
                onRowClick && "cursor-pointer",
                i % 2 === 0 ? "bg-surface dark:bg-dark-surface" : "bg-surface-secondary/30 dark:bg-dark-surface-secondary/30"
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-text-primary dark:text-dark-text-primary", col.className)}>
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {nextCursor && onLoadMore && (
        <div className="flex justify-center border-t border-border p-3 dark:border-dark-border">
          <button
            onClick={onLoadMore}
            className="rounded-lg bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300"
          >
            load more
          </button>
        </div>
      )}
    </div>
  );
}
