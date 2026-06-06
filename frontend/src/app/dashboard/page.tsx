"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { IncomeTypeChart } from "@/components/charts/IncomeTypeChart";
import { MonthlyFinanceChart } from "@/components/charts/MonthlyFinanceChart";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Badge } from "@/components/ui/Badge";
import {
  DataTable,
  dataTableAmountCellClass,
  dataTableBodyClass,
  dataTableCellClass,
  dataTableHeadClass,
  dataTableHeaderCellClass,
  dataTableRowClass
} from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatCard } from "@/components/ui/StatCard";
import { getCurrentUser, getDashboardSummary } from "@/lib/api";
import { formatDate, formatIncomeType, formatMoney, formatRole } from "@/lib/format";
import type { User } from "@/types/auth";
import type { DashboardSummary } from "@/types/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getCurrentUser(), getDashboardSummary()])
      .then(([userResponse, summaryResponse]) => {
        if (isMounted) {
          setUser(userResponse.user);
          setSummary(summaryResponse.summary);
        }
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <LoadingState
        title="Загружаем финансовый обзор"
        description="Собираем доходы, налоги, графики и последние операции."
      />
    );
  }

  if (!user || !summary) {
    return null;
  }

  const firstName = user.fullName.split(" ")[0] || user.fullName;

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardNav userRole={user.role} />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <PageHeader
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={user.role === "ADMIN" ? "indigo" : "blue"}>
                {formatRole(user.role)}
              </Badge>
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-card">
                {user.email}
              </span>
            </div>
          }
          description="Сводка доходов, налогов и чистого результата. Следите за динамикой и последними операциями в одном рабочем пространстве."
          eyebrow="Финансовый обзор"
          title={`Добро пожаловать, ${firstName}`}
        />

        <ErrorMessage
          className="mb-6"
          message={error}
          title="Не удалось загрузить обзор"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Общий доход" tone="blue" value={formatMoney(summary.income.totalAmount)} />
          <StatCard
            label="Доход за текущий месяц"
            tone="indigo"
            value={formatMoney(summary.income.currentMonthAmount)}
          />
          <StatCard label="Всего налогов" tone="slate" value={formatMoney(summary.tax.totalTaxAmount)} />
          <StatCard label="Чистый доход" tone="emerald" value={formatMoney(summary.tax.totalNetAmount)} />
          <StatCard label="Количество доходов" value={summary.income.count} />
          <StatCard label="Количество расчётов" value={summary.tax.count} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <QuickActionCard
            accent="emerald"
            description="Зафиксируйте новое поступление в KZT и сразу включите его в аналитику."
            href="/dashboard/incomes/new"
            title="Добавить доход"
          />
          <QuickActionCard
            accent="blue"
            description="Выберите доход, а TaxFlow автоматически подберёт налоговое правило."
            href="/dashboard/taxes"
            title="Рассчитать налог"
          />
          <QuickActionCard
            accent="indigo"
            description="Посмотрите месячную, годовую или периодную аналитику и скачайте CSV."
            href="/dashboard/reports"
            title="Открыть отчёты"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <SectionCard
            className="xl:col-span-2"
            title="Динамика доходов и налогов"
            description="Сравнение доходов, налоговых обязательств и чистого результата за последние месяцы."
          >
            <div className="mt-4">
              <MonthlyFinanceChart data={summary.charts.monthly} />
            </div>
          </SectionCard>

          <SectionCard title="Структура доходов" description="Распределение поступлений по категориям.">
            <div className="mt-4">
              <CategoryChart data={summary.charts.byCategory} />
            </div>
          </SectionCard>

          <SectionCard title="Типы доходов" description="Поступления по финансовым направлениям.">
            <div className="mt-4">
              <IncomeTypeChart data={summary.charts.byIncomeType} />
            </div>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <SectionCard title="Последние доходы" description="Недавние поступления в вашем кабинете.">
            <div className="mt-4">
              <DataTable>
                <thead className={dataTableHeadClass}>
                  <tr>
                    <th className={dataTableHeaderCellClass}>Дата</th>
                    <th className={dataTableHeaderCellClass}>Категория</th>
                    <th className={`${dataTableHeaderCellClass} text-right`}>
                      Сумма
                    </th>
                  </tr>
                </thead>
                <tbody className={dataTableBodyClass}>
                  {summary.latest.incomes.map((income) => (
                    <tr className={dataTableRowClass} key={income.id}>
                      <td className={dataTableCellClass}>{formatDate(income.receivedAt)}</td>
                      <td className={dataTableCellClass}>
                        {income.category.name}
                        <Badge className="mt-1" tone="blue">
                          {formatIncomeType(income.category.incomeType)}
                        </Badge>
                      </td>
                      <td className={dataTableAmountCellClass}>
                        {formatMoney(income.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
              {summary.latest.incomes.length === 0 ? (
                <EmptyState
                  description="Добавьте первый доход, чтобы увидеть последние поступления."
                  title="Пока нет доходов"
                />
              ) : null}
            </div>
          </SectionCard>

          <SectionCard title="Последние налоговые расчёты" description="Свежие расчёты обязательств и чистого результата.">
            <div className="mt-4">
              <DataTable>
                <thead className={dataTableHeadClass}>
                  <tr>
                    <th className={dataTableHeaderCellClass}>Дата</th>
                    <th className={dataTableHeaderCellClass}>Правило</th>
                    <th className={`${dataTableHeaderCellClass} text-right`}>Налог</th>
                    <th className={`${dataTableHeaderCellClass} text-right`}>
                      Чистый доход
                    </th>
                  </tr>
                </thead>
                <tbody className={dataTableBodyClass}>
                  {summary.latest.taxCalculations.map((calculation) => (
                    <tr className={dataTableRowClass} key={calculation.id}>
                      <td className={dataTableCellClass}>
                        {formatDate(calculation.calculatedAt)}
                      </td>
                      <td className={dataTableCellClass}>{calculation.taxRule.name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-700">
                        {formatMoney(calculation.taxAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                        {formatMoney(calculation.netAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
              {summary.latest.taxCalculations.length === 0 ? (
                <EmptyState
                  description="После расчёта налогов здесь появится история."
                  title="Расчёты ещё не выполнялись"
                />
              ) : null}
            </div>
          </SectionCard>
        </div>
      </section>
    </main>
  );
}
