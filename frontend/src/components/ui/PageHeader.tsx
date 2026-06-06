import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  actions,
  description,
  eyebrow,
  title
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-card backdrop-blur lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
