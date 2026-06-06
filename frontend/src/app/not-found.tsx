import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-10">
              <Link
                className="text-xl font-bold tracking-tight text-slate-950"
                href="/"
              >
                TaxFlow
              </Link>
              <p className="mt-10 text-sm font-semibold uppercase tracking-wide text-brand-700">
                404
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                Страница не найдена
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Похоже, этот раздел недоступен или был перемещён.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-800"
                  href="/"
                >
                  На главную
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  href="/dashboard"
                >
                  В кабинет
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-gradient-to-br from-brand-50 via-white to-emerald-50 p-8 lg:border-l lg:border-t-0">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Финансовый обзор
                  </p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    KZT
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  <Metric label="Доходы" value="₸ 1 240 000" />
                  <Metric label="Налоги" value="₸ 124 000" />
                  <Metric label="Чистый результат" value="₸ 1 116 000" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}
