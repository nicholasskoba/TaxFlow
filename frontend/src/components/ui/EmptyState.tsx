"use client";

type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  actionLabel,
  description = "Добавьте данные, чтобы увидеть аналитику и историю операций.",
  onAction,
  title = "Пока нет данных"
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-card">
        <div className="h-3 w-3 rounded-full bg-brand-600" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          className="mt-5 inline-flex rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-800"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
