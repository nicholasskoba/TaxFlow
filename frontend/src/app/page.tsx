import Link from "next/link";

const benefits = [
  {
    title: "Учёт доходов",
    description: "Фиксируйте поступления, категории, даты и описания без лишних таблиц."
  },
  {
    title: "Автоматический расчёт налогов",
    description: "TaxFlow подбирает правило по категории дохода и считает обязательства."
  },
  {
    title: "Финансовая аналитика",
    description: "Следите за доходами, налогами и чистым результатом в одном кабинете."
  },
  {
    title: "Безопасный кабинет",
    description: "Персональные данные и финансовые операции доступны только владельцу аккаунта."
  }
];

const steps = [
  "Добавьте доход",
  "TaxFlow определит тип категории",
  "Налог рассчитается автоматически",
  "Отчёты покажут финансовую картину"
];

const metrics = [
  { label: "Доход за месяц", value: "655 000 ₸", tone: "text-blue-700" },
  { label: "Налоговые обязательства", value: "65 500 ₸", tone: "text-red-600" },
  { label: "Чистый доход", value: "589 500 ₸", tone: "text-emerald-700" },
  { label: "Категории доходов", value: "6", tone: "text-indigo-700" }
];

const linkButtonClasses =
  "inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link className="text-lg font-bold tracking-tight text-slate-950" href="/">
            TaxFlow
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              href="/login"
            >
              Войти
            </Link>
            <Link
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/register"
            >
              Создать аккаунт
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.13),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(5,150,105,0.13),_transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_520px] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-brand-700">
              Финансовый контроль доходов и налогов
            </p>
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              TaxFlow
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Учёт доходов, налогов и чистой прибыли в одном кабинете. TaxFlow
              помогает видеть финансовую картину спокойно, понятно и без хаоса
              в таблицах.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className={`${linkButtonClasses} bg-brand-700 text-white shadow-card hover:bg-brand-800`}
                href="/login"
              >
                Войти
              </Link>
              <Link
                className={`${linkButtonClasses} border border-slate-300 bg-white text-slate-900 hover:bg-slate-50`}
                href="/register"
              >
                Создать аккаунт
              </Link>
              <Link
                className={`${linkButtonClasses} text-slate-700 hover:bg-slate-100`}
                href="/dashboard"
              >
                Открыть кабинет
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-4 shadow-soft">
            <div className="rounded-[1.5rem] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Финансовый обзор</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">Май 2026</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  +18.4%
                </span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <div
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    key={metric.label}
                  >
                    <p className="text-xs font-medium text-slate-500">
                      {metric.label}
                    </p>
                    <p className={`mt-2 text-xl font-bold ${metric.tone}`}>
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
                <div className="flex h-36 items-end gap-2">
                  {[42, 58, 46, 74, 63, 88].map((height, index) => (
                    <div
                      className="flex flex-1 flex-col justify-end gap-1"
                      key={height}
                    >
                      <div
                        className="rounded-t-lg bg-brand-600"
                        style={{ height: `${height}%` }}
                      />
                      <div
                        className="rounded-t-lg bg-emerald-500"
                        style={{ height: `${Math.max(18, height - 22)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">
                  Динамика доходов и налоговых обязательств
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Всё для ежедневного финансового контроля
          </h2>
          <p className="mt-3 text-slate-600">
            TaxFlow объединяет учет, расчеты и аналитику в понятном интерфейсе.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((feature) => (
            <article
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-brand-100"
              key={feature.title}
            >
              <h3 className="text-base font-semibold text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              Как это работает
            </h2>
            <p className="mt-3 text-slate-600">
              От записи дохода до финансового отчета — несколько понятных шагов.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                key={step}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-semibold leading-6 text-slate-900">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
