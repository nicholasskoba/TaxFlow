"use client";

type ErrorMessageProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function ErrorMessage({
  actionLabel,
  className = "",
  message,
  onAction,
  title
}: ErrorMessageProps) {
  if (message === "" || (!message && !title)) {
    return null;
  }

  const contentTitle = title ?? "Не удалось выполнить действие";

  return (
    <div
      className={`rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 ${className}`}
      role="alert"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">{contentTitle}</p>
          {message ? (
            <p className="mt-1 leading-6 text-red-700">{message}</p>
          ) : null}
        </div>
        {actionLabel && onAction ? (
          <button
            className="inline-flex rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            onClick={onAction}
            type="button"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
