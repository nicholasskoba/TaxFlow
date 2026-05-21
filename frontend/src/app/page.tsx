import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Учет доходов",
    description: "Единая база для фиксации поступлений, категорий и дат получения дохода."
  },
  {
    title: "Автоматический расчет налогов",
    description: "Подготовка к расчету обязательств по заданным налоговым правилам."
  },
  {
    title: "Отчеты и аналитика",
    description: "Будущие сводки по доходам, налогам и динамике финансовых показателей."
  },
  {
    title: "Защищенный личный кабинет",
    description: "Основа для авторизации, ролей пользователей и административного доступа."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase text-brand-700">
              Дипломный проект
            </p>
            <h1 className="text-4xl font-bold text-slate-950 sm:text-5xl">
              Bank Tax Accounting
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Банковское веб-приложение для учета доходов и автоматического
              расчета налоговых обязательств. Сейчас подготовлен чистый
              фундамент для дальнейшей разработки модулей.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button>Войти</Button>
              <Button variant="secondary">Зарегистрироваться</Button>
              <Button variant="ghost">Открыть dashboard</Button>
            </div>
          </div>

          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Текущий этап</p>
                <p className="text-xl font-semibold text-slate-950">Базовая структура</p>
              </div>
              <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                MVP
              </span>
            </div>
            <div className="space-y-3">
              <div className="rounded-md bg-white p-4">
                <p className="text-sm text-slate-500">Backend</p>
                <p className="font-medium text-slate-900">Express API + Prisma</p>
              </div>
              <div className="rounded-md bg-white p-4">
                <p className="text-sm text-slate-500">Frontend</p>
                <p className="font-medium text-slate-900">Next.js + Tailwind CSS</p>
              </div>
              <div className="rounded-md bg-white p-4">
                <p className="text-sm text-slate-500">Database</p>
                <p className="font-medium text-slate-900">PostgreSQL в Docker</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-950">
            Будущие возможности
          </h2>
          <p className="mt-2 text-slate-600">
            Эти блоки обозначают направления, которые будут расширяться на следующих этапах.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={feature.title}
            >
              <h3 className="text-base font-semibold text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
