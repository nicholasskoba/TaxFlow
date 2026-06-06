import Link from "next/link";
import type { ReactNode } from "react";

type QuickActionCardProps = {
  href: string;
  title: string;
  description: string;
  accent?: "blue" | "emerald" | "indigo";
  meta?: ReactNode;
};

const accentClasses = {
  blue: "from-blue-50 to-white border-blue-100 text-blue-700",
  emerald: "from-emerald-50 to-white border-emerald-100 text-emerald-700",
  indigo: "from-indigo-50 to-white border-indigo-100 text-indigo-700"
};

export function QuickActionCard({
  accent = "blue",
  description,
  href,
  meta,
  title
}: QuickActionCardProps) {
  return (
    <Link
      className={`group block rounded-2xl border bg-gradient-to-br p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg ${accentClasses[accent]}`}
      href={href}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm transition group-hover:translate-x-0.5">
          →
        </span>
      </div>
      {meta ? <div className="mt-4">{meta}</div> : null}
    </Link>
  );
}
