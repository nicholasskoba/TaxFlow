"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

const adminItems = [
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/income-categories", label: "Категории доходов" },
  { href: "/admin/tax-rules", label: "Налоговые правила" },
  { href: "/admin/audit-logs", label: "Журнал действий" }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-950"
            href="/admin"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-card">
              TF
            </span>
            TaxFlow
            <Badge tone="indigo">Управление</Badge>
          </Link>
          <nav className="mt-4 flex flex-wrap gap-2">
            {adminItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-slate-950 text-white shadow-card"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Link
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          href="/dashboard"
        >
          Вернуться в кабинет
        </Link>
      </div>
    </header>
  );
}
