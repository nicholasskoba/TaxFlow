import { Skeleton } from "./Skeleton";

type LoadingVariant = "page" | "section" | "table" | "cards";

type LoadingStateProps = {
  title?: string;
  description?: string;
  text?: string;
  variant?: LoadingVariant;
};

export function LoadingState({
  description,
  text,
  title,
  variant = "page"
}: LoadingStateProps) {
  const contentTitle = title ?? text ?? "Загружаем данные";
  const contentDescription =
    description ?? "TaxFlow готовит актуальную финансовую информацию.";

  if (variant === "section") {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <LoadingHeader title={contentTitle} description={contentDescription} />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </section>
    );
  }

  if (variant === "table") {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 p-5">
          <LoadingHeader title={contentTitle} description={contentDescription} />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="grid grid-cols-4 gap-4 p-4" key={index}>
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
            key={index}
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-8 w-32" />
            <Skeleton className="mt-3 h-3 w-40" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              TaxFlow
            </p>
            <h1 className="mt-3 text-2xl font-bold text-slate-950">
              {contentTitle}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              {contentDescription}
            </p>
          </div>
          <LoadingDashboardSkeleton />
        </div>
      </div>
    </main>
  );
}

function LoadingHeader({
  description,
  title
}: {
  description: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function LoadingDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-56" />
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="grid grid-cols-4 gap-4" key={index}>
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
