"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import {
  getCurrentUser,
  getIncomeById,
  getIncomeCategories,
  updateIncome
} from "@/lib/api";
import { formatIncomeType } from "@/lib/format";
import type { User } from "@/types/auth";
import type { IncomeCategory } from "@/types/income";

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export default function EditIncomePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    receivedAt: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getCurrentUser(),
      getIncomeCategories(),
      getIncomeById(params.id)
    ])
      .then(([userResponse, categoriesResponse, incomeResponse]) => {
        if (isMounted) {
          const income = incomeResponse.income;

          setUser(userResponse.user);
          setCategories(categoriesResponse.categories);
          setForm({
            categoryId: income.categoryId,
            amount: income.amount,
            receivedAt: toDateInputValue(income.receivedAt),
            description: income.description ?? ""
          });
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.message !== "Unauthorized") {
          setError(err.message);
          return;
        }

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
  }, [params.id, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await updateIncome(params.id, form);
      router.push("/dashboard/incomes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить доход");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        title="Загружаем доход"
        description="Открываем запись и подготавливаем форму редактирования."
      />
    );
  }

  if (error && !form.categoryId) {
    return (
      <main className="min-h-screen bg-slate-50">
        <DashboardNav userRole={user?.role} />

        <section className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
          <PageHeader
            description="Проверьте ссылку или вернитесь к списку доходов."
            eyebrow="Редактирование"
            title="Доход не найден"
          />
          <ErrorMessage
            actionLabel="К доходам"
            message={error}
            onAction={() => router.push("/dashboard/incomes")}
            title="Не удалось открыть доход"
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardNav userRole={user?.role} />

      <section className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        <PageHeader
          description="Обновите сумму, категорию, дату или описание дохода. После сохранения данные сразу попадут в аналитику."
          eyebrow="Редактирование"
          title="Редактировать доход"
        />

        <SectionCard>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <ErrorMessage message={error} />

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="categoryId">
              Категория
            </label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="categoryId"
              required
              value={form.categoryId}
              onChange={(event) =>
                setForm((current) => ({ ...current, categoryId: event.target.value }))
              }
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} · {formatIncomeType(category.incomeType)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="amount">
              Сумма, ₸
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="amount"
              min="0.01"
              placeholder="Введите сумму в тенге"
              required
              step="0.01"
              type="number"
              value={form.amount}
              onChange={(event) =>
                setForm((current) => ({ ...current, amount: event.target.value }))
              }
            />
            <p className="mt-2 text-xs text-slate-500">
              Все расчёты выполняются в KZT.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="receivedAt">
              Дата получения
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="receivedAt"
              required
              type="date"
              value={form.receivedAt}
              onChange={(event) =>
                setForm((current) => ({ ...current, receivedAt: event.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="description">
              Описание
            </label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
            </Button>
            <Button
              onClick={() => router.push("/dashboard/incomes")}
              type="button"
              variant="secondary"
            >
              Отмена
            </Button>
          </div>
          </form>
        </SectionCard>
      </section>
    </main>
  );
}
