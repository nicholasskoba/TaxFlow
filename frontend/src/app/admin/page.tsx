"use client";

import Link from "next/link";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";
import { PageHeader } from "@/components/ui/PageHeader";

const adminSections = [
  {
    href: "/admin/users",
    title: "Пользователи",
    description: "Просмотр профилей, фильтрация и управление уровнем доступа."
  },
  {
    href: "/admin/income-categories",
    title: "Категории доходов",
    description: "Управление справочником категорий и типами поступлений."
  },
  {
    href: "/admin/tax-rules",
    title: "Налоговые правила",
    description: "Настройка ставок, применяемых для автоматического расчёта."
  },
  {
    href: "/admin/audit-logs",
    title: "Журнал действий",
    description: "Контроль изменений и важных операций в системе."
  }
];

export default function AdminPage() {
  return (
    <AdminGuard>
      {(user) => (
        <main className="min-h-screen bg-slate-50">
          <AdminNav />
          <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <PageHeader
              description={`${user.fullName}, здесь собраны разделы управления пользователями, справочниками, налоговыми правилами и журналом действий.`}
              eyebrow="Администрирование"
              title="Управление системой"
            />

            <div className="grid gap-4 md:grid-cols-2">
              {adminSections.map((section) => (
                <Link
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50"
                  href={section.href}
                  key={section.href}
                >
                  <h2 className="text-lg font-semibold text-slate-950">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {section.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </main>
      )}
    </AdminGuard>
  );
}
