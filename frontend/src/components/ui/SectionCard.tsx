import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
};

export function SectionCard({
  children,
  className = "",
  description,
  title
}: SectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-lg ${className}`}
    >
      {title ? (
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
