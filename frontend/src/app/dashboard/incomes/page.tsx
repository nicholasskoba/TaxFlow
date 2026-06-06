"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  deleteIncome,
  getCurrentUser,
  getIncomeCategories,
  getIncomeSummary,
  getIncomes
} from "@/lib/api";
import { formatDate, formatIncomeType, formatMoney } from "@/lib/format";
import type { User } from "@/types/auth";
import type { Income, IncomeCategory, IncomeFilters, IncomeSummary } from "@/types/income";

export default function IncomesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [filters, setFilters] = useState<IncomeFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async (nextFilters = filters) => {
    setError("");

    try {
      const [categoriesResponse, incomesResponse, summaryResponse] = await Promise.all([
        getIncomeCategories(),
        getIncomes(nextFilters),
        getIncomeSummary()
      ]);

      setCategories(categoriesResponse.categories);
      setIncomes(incomesResponse.incomes);
      setSummary(summaryResponse.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить доходы");
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

  const handleDelete = async (income: Income) => {
    const confirmed = window.confirm("Удалить выбранный доход?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteIncome(income.id);
      await loadData(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить доход");
    }
  };

  if (isLoading) {
    return <LoadingState text="Загружаем историю доходов..." />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardNav userRole={user?.role} />

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <PageHeader
          actions={
            <Link
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-800"
              href="/dashboard/incomes/new"
            >
              Добавить доход
            </Link>
          }
          description="История доходов с фильтрами по категории, дате и описанию. Все поступления собраны в одной читаемой таблице."
          eyebrow="Учёт доходов"
          title="Доходы"
        />

        <ErrorMessage className="mb-6" message={error} />

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <StatCard
            label="Общая сумма"
            tone="emerald"
            value={formatMoney(summary?.totalAmount ?? "0.00")}
          />
          <StatCard label="Количество записей" value={summary?.count ?? 0} />
        </div>

        <form
          className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:grid-cols-5"
          onSubmit={handleFilterSubmit}
        >
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="categoryId">
              Категория
            </label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="categoryId"
              value={filters.categoryId ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  categoryId: event.target.value || undefined
                }))
              }
            >
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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
            <label className="text-sm font-medium text-slate-700" htmlFor="search">
              Поиск
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="search"
              placeholder="Описание"
              type="search"
              value={filters.search ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value || undefined
                }))
              }
            />
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
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Категория
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Описание
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Сумма, ₸
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.map((income) => (
                  <tr className="transition hover:bg-slate-50/80" key={income.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDate(income.receivedAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {income.category.name}
                      <Badge className="mt-1" tone="blue">
                        {formatIncomeType(income.category.incomeType)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {income.description || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-950">
                      {formatMoney(income.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        className="mr-3 font-medium text-brand-700 hover:text-brand-600"
                        href={`/dashboard/incomes/${income.id}/edit`}
                      >
                        Редактировать
                      </Link>
                      <button
                        className="font-medium text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(income)}
                        type="button"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}

                {incomes.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                      <EmptyState
                        description="Добавьте первый доход или измените фильтры, чтобы увидеть записи."
                        title="Пока нет доходов"
                      />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
