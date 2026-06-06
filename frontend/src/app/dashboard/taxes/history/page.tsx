"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  deleteTaxCalculation,
  getCurrentUser,
  getMyTaxRules,
  getTaxCalculationSummary,
  getTaxCalculations,
  getTaxRules
} from "@/lib/api";
import {
  formatDateTime,
  formatIncomeType,
  formatMoney,
  formatTaxRuleType
} from "@/lib/format";
import type { User } from "@/types/auth";
import type {
  TaxCalculation,
  TaxCalculationFilters,
  TaxCalculationSummary,
  TaxRule
} from "@/types/tax";

export default function TaxHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [taxCalculations, setTaxCalculations] = useState<TaxCalculation[]>([]);
  const [summary, setSummary] = useState<TaxCalculationSummary | null>(null);
  const [filters, setFilters] = useState<TaxCalculationFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async (nextFilters = filters) => {
    setError("");

    try {
      const [rulesResponse, myRulesResponse, calculationsResponse, summaryResponse] =
        await Promise.all([
          getTaxRules(),
          getMyTaxRules(),
          getTaxCalculations(nextFilters),
          getTaxCalculationSummary()
        ]);

      setTaxRules([...rulesResponse.taxRules, ...myRulesResponse.taxRules]);
      setTaxCalculations(calculationsResponse.taxCalculations);
      setSummary(summaryResponse.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить историю");
    }
  };

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then(async (response) => {
        if (isMounted) {
          setUser(response.user);
          await loadData({});
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

  const handleFilterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadData(filters);
  };

  const handleResetFilters = async () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    await loadData(emptyFilters);
  };

  const handleDelete = async (calculation: TaxCalculation) => {
    const confirmed = window.confirm("Удалить выбранный расчёт налога?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteTaxCalculation(calculation.id);
      await loadData(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить расчёт");
    }
  };

  if (isLoading) {
    return <LoadingState text="Загружаем историю расчётов..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardNav userRole={user.role} />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <PageHeader
          description="Сохранённые налоговые расчёты с категорией дохода, выбранным правилом, суммой налога и чистым результатом."
          eyebrow="Налоги"
          title="История расчётов"
        />

        <ErrorMessage className="mb-6" message={error} />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard
            label="Сумма дохода"
            tone="blue"
            value={formatMoney(summary?.totalIncomeAmount ?? "0.00")}
          />
          <StatCard
            label="Сумма налога"
            tone="slate"
            value={formatMoney(summary?.totalTaxAmount ?? "0.00")}
          />
          <StatCard
            label="Чистый доход"
            tone="emerald"
            value={formatMoney(summary?.totalNetAmount ?? "0.00")}
          />
          <StatCard label="Количество" value={`${summary?.count ?? 0}`} />
        </div>

        <form
          className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:grid-cols-4"
          onSubmit={handleFilterSubmit}
        >
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="dateFrom">
              Дата от
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="dateFrom"
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  dateFrom: event.target.value || undefined
                }))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="dateTo">
              Дата до
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="dateTo"
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  dateTo: event.target.value || undefined
                }))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="taxRuleId">
              Правило
            </label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="taxRuleId"
              value={filters.taxRuleId ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  taxRuleId: event.target.value || undefined
                }))
              }
            >
              <option value="">Все правила</option>
              {taxRules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.isCustom ? "Моя ставка: " : ""}
                  {rule.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button className="flex-1" type="submit">
              Найти
            </Button>
            <Button onClick={handleResetFilters} type="button" variant="secondary">
              Сброс
            </Button>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Дата</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Доход</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Категория</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Тип дохода</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Правило</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Тип правила</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Налог</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Чистый доход</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxCalculations.map((calculation) => (
                  <tr className="transition hover:bg-slate-50/80" key={calculation.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDateTime(calculation.calculatedAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {calculation.income.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {calculation.income.category?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <Badge tone="blue">
                        {formatIncomeType(calculation.income.category?.incomeType)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      <div>{calculation.taxRule.name}</div>
                      {calculation.taxRule.isCustom ? (
                        <Badge className="mt-1" tone="indigo">
                          Моя ставка
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={calculation.taxRule.ruleType === "PROGRESSIVE" ? "indigo" : "slate"}>
                        {formatTaxRuleType(calculation.taxRule.ruleType)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-red-700">
                      {formatMoney(calculation.taxAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-700">
                      {formatMoney(calculation.netAmount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="font-medium text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(calculation)}
                        type="button"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {taxCalculations.length === 0 ? (
            <div className="p-5">
              <EmptyState
                description="Выполните первый автоматический расчёт или измените фильтры."
                title="Расчёты не найдены"
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
