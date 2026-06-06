import type { ReactNode } from "react";

type DataTableProps = {
  children: ReactNode;
  className?: string;
};

export function DataTable({ children, className = "" }: DataTableProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export const dataTableHeadClass = "bg-slate-50 text-slate-600";
export const dataTableHeaderCellClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide";
export const dataTableBodyClass = "divide-y divide-slate-100";
export const dataTableRowClass = "transition hover:bg-slate-50/80";
export const dataTableCellClass = "px-4 py-3 text-slate-700";
export const dataTableAmountCellClass =
  "px-4 py-3 text-right font-semibold text-slate-950";
