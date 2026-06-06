"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  createIncomeCategory,
  deleteIncomeCategory,
  getIncomeCategories,
  updateIncomeCategory
} from "@/lib/api";
import { formatDate, formatIncomeType } from "@/lib/format";
import type { IncomeCategory, IncomeType } from "@/types/income";

const incomeTypes: IncomeType[] = [
  "SALARY",
  "FREELANCE",
  "INVESTMENT",
  "RENT",
  "DIVIDENDS",
  "PRIVATE_PRACTICE",
  "ROYALTY",
  "SALE_PROPERTY",
  "OTHER"
];

const emptyForm = {
  name: "",
  description: "",
  incomeType: "OTHER" as IncomeType
};

export default function AdminIncomeCategoriesPage() {
  return (
    <AdminGuard>
      {() => <AdminIncomeCategoriesContent />}
    </AdminGuard>
  );
}

function AdminIncomeCategoriesContent() {
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCategories = async () => {
    const response = await getIncomeCategories();
    setCategories(response.categories);
  };

  useEffect(() => {
    loadCategories()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Не удалось загрузить категории")
      )
      .finally(() => setIsLoading(false));
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCategoryId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (editingCategoryId) {
        await updateIncomeCategory(editingCategoryId, form);
        setMessage("Категория обновлена");
      } else {
        await createIncomeCategory(form);
        setMessage("Категория создана");
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить категорию");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: IncomeCategory) => {
    setEditingCategoryId(category.id);
    setForm({
      name: category.name,
      description: category.description ?? "",
      incomeType: category.incomeType
    });
    setError("");
    setMessage("");
  };

  const handleDelete = async (category: IncomeCategory) => {
    const confirmed = window.confirm(`Удалить категорию "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteIncomeCategory(category.id);
      setMessage("Категория удалена");
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось удалить категорию. Возможно, она используется в доходах."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <PageHeader
          description="Категории связывают доходы с типами поступлений, чтобы TaxFlow корректно выбирал налоговое правило."
          eyebrow="Управление справочниками"
          title="Категории доходов"
        />

        <ErrorMessage
          className="mb-6"
          message={error}
          title="Не удалось обработать категорию"
        />
        {message ? <Alert tone="success" text={message} /> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
          <form
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
            onSubmit={handleSubmit}
          >
            <h2 className="text-lg font-semibold text-slate-950">
              {editingCategoryId ? "Редактировать категорию" : "Создать категорию"}
            </h2>

            <label className="block text-sm font-medium text-slate-700">
              Название
              <input
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                required
                value={form.name}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Описание
              <textarea
                className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value
                  }))
                }
                value={form.description}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Тип дохода
              <select
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    incomeType: event.target.value as IncomeType
                  }))
                }
                value={form.incomeType}
              >
                {incomeTypes.map((incomeType) => (
                  <option key={incomeType} value={incomeType}>
                    {formatIncomeType(incomeType)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </button>
              {editingCategoryId ? (
                <button
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={resetForm}
                  type="button"
                >
                  Отмена
                </button>
              ) : null}
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Название</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Описание</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Тип</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Создана</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => (
                    <tr className="transition hover:bg-slate-50/80" key={category.id}>
                      <td className="px-4 py-3 font-medium text-slate-950">
                        {category.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {category.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <Badge tone="blue">
                          {formatIncomeType(category.incomeType)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(category.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          className="mr-3 font-medium text-brand-700"
                          onClick={() => handleEdit(category)}
                          type="button"
                        >
                          Редактировать
                        </button>
                        <button
                          className="font-medium text-red-600"
                          onClick={() => handleDelete(category)}
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
            {isLoading ? (
              <div className="p-5">
                <LoadingState
                  description="Подготавливаем справочник категорий доходов."
                  title="Загружаем категории"
                  variant="table"
                />
              </div>
            ) : null}
            {!isLoading && categories.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  description="Создайте первую категорию, чтобы распределять доходы по типам поступлений."
                  title="Категорий пока нет"
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function Alert({ text, tone }: { text: string; tone: "error" | "success" }) {
  return (
    <div
      className={`mb-6 rounded-md border px-4 py-3 text-sm ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {text}
    </div>
  );
}
