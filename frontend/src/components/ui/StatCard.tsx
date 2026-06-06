import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "blue" | "emerald" | "indigo" | "slate";
  className?: string;
};

const toneClasses = {
  blue: "from-blue-50 to-white text-blue-700",
  emerald: "from-emerald-50 to-white text-emerald-700",
  indigo: "from-indigo-50 to-white text-indigo-700",
  slate: "from-slate-50 to-white text-slate-700"
};

export function StatCard({
  className = "",
  hint,
  label,
  tone = "slate",
  value
}: StatCardProps) {
  return (
    <article
      className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${toneClasses[tone]} p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </div>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </article>
  );
}
