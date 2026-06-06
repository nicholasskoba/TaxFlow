"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/api";
import type { UserRole } from "@/types/auth";

const navItems = [
  { href: "/dashboard", label: "Обзор" },
  { href: "/dashboard/incomes", label: "Доходы" },
  { href: "/dashboard/taxes", label: "Расчёт налогов" },
  { href: "/dashboard/taxes/history", label: "История" },
  { href: "/dashboard/my-tax-rules", label: "Мои ставки" },
  { href: "/dashboard/reports", label: "Отчёты" }
];

type DashboardNavProps = {
  userRole?: UserRole;
};

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleNavItems =
    userRole === "ADMIN"
      ? [...navItems, { href: "/admin", label: "Администрирование" }]
      : navItems;

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-950"
            href="/"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-card">
              TF
            </span>
            TaxFlow
            {userRole === "ADMIN" ? <Badge tone="indigo">Управление</Badge> : null}
          </Link>
          <nav className="mt-4 flex flex-wrap gap-2">
            {visibleNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  item.href !== "/dashboard/taxes" &&
                  pathname.startsWith(`${item.href}/`));

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

        <Button className="rounded-full" onClick={handleLogout} variant="secondary">
          Выйти
        </Button>
      </div>
    </header>
  );
}
