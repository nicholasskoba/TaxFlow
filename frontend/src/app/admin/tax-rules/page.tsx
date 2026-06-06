"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  createTaxRule,
  deleteTaxRule,
  getCurrentUser,
  getTaxRules,
  updateTaxRule
} from "@/lib/api";
import {
  formatIncomeType,
  formatMoney,
  formatTaxRuleDescription,
  formatTaxRuleType
} from "@/lib/format";
import type { User } from "@/types/auth";
import type { IncomeType, TaxRule, TaxRuleType } from "@/types/tax";

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

type TaxRuleForm = {
  name: string;
  rate: string;
  incomeType: IncomeType;
  ruleType: TaxRuleType;
  threshold: string;
  extraRate: string;
  isActive: boolean;
};

const emptyForm: TaxRuleForm = {
  name: "",
  rate: "10.00",
  incomeType: "SALARY",
  ruleType: "FIXED",
  threshold: "",
  extraRate: "",
  isActive: true
};

export default function AdminTaxRulesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [form, setForm] = useState<TaxRuleForm>(emptyForm);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadTaxRules = async () => {
    const response = await getTaxRules();
    setTaxRules(response.taxRules);
  };

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then(async (response) => {
        if (!isMounted) {
          return;
        }

        setUser(response.user);

        if (response.user.role === "ADMIN") {
          await loadTaxRules();
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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingRuleId(null);
  };

  const buildPayload = () => ({
    name: form.name,
    rate: form.rate,
    incomeType: form.incomeType,
    ruleType: form.ruleType,
    threshold: form.ruleType === "PROGRESSIVE" ? form.threshold : null,
    extraRate: form.ruleType === "PROGRESSIVE" ? form.extraRate : null,
    isActive: form.isActive
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (editingRuleId) {
        await updateTaxRule(editingRuleId, buildPayload());
        setMessage("Налоговое правило обновлено");
      } else {
        await createTaxRule(buildPayload());
        setMessage("Налоговое правило создано");
      }

      resetForm();
      await loadTaxRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить правило");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rule: TaxRule) => {
    setEditingRuleId(rule.id);
    setForm({
      name: rule.name,
      rate: rule.rate,
      incomeType: rule.incomeType,
      ruleType: rule.ruleType,
      threshold: rule.threshold ?? "",
      extraRate: rule.extraRate ?? "",
      isActive: rule.isActive
    });
    setMessage("");
    setError("");
  };

  const handleDelete = async (rule: TaxRule) => {
    const confirmed = window.confirm("Удалить или деактивировать налоговое правило?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const result = await deleteTaxRule(rule.id);
      setMessage(
        result.deactivated
          ? "Правило уже использовалось, поэтому оно деактивировано"
          : "Правило удалено"
      );
      await loadTaxRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить правило");
    }
  };

  if (isLoading) {
    return <LoadingState text="Загружаем налоговые правила..." />;
  }

  if (!user) {
    return null;
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
          <ErrorMessage
            message="У вас нет прав для просмотра этого раздела."
            title="Нет доступа"
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <PageHeader
          description="Управление стандартными налоговыми правилами TaxFlow: фиксированные ставки и прогрессивные правила с порогом."
          eyebrow="Управление справочниками"
          title="Налоговые правила"
        />

        <ErrorMessage className="mb-6" message={error} />
        {message ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
          <TaxRuleFormCard
            editing={Boolean(editingRuleId)}
            form={form}
            isSubmitting={isSubmitting}
            onCancel={resetForm}
            onChange={setForm}
            onSubmit={handleSubmit}
          />

          <TaxRuleTable
            onDelete={handleDelete}
            onEdit={handleEdit}
            taxRules={taxRules}
          />
        </div>
      </section>
    </main>
  );
}

function TaxRuleFormCard({
  editing,
  form,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit
}: {
  editing: boolean;
  form: TaxRuleForm;
  isSubmitting: boolean;
  onCancel: () => void;
  onChange: (value: TaxRuleForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
      onSubmit={onSubmit}
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          {editing ? "Редактировать правило" : "Создать правило"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Для прогрессивного правила укажите порог и ставку на сумму сверх порога.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Название
        </label>
        <input
          className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          id="name"
          required
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="incomeType">
            Тип дохода
          </label>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            id="incomeType"
            value={form.incomeType}
            onChange={(event) =>
              onChange({ ...form, incomeType: event.target.value as IncomeType })
            }
          >
            {incomeTypes.map((incomeType) => (
              <option key={incomeType} value={incomeType}>
                {formatIncomeType(incomeType)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="ruleType">
            Тип правила
          </label>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            id="ruleType"
            value={form.ruleType}
            onChange={(event) =>
              onChange({ ...form, ruleType: event.target.value as TaxRuleType })
            }
          >
            <option value="FIXED">Фиксированная</option>
            <option value="PROGRESSIVE">Прогрессивная</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="rate">
            Базовая ставка, %
          </label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            id="rate"
            max="100"
            min="0.01"
            required
            step="0.01"
            type="number"
            value={form.rate}
            onChange={(event) => onChange({ ...form, rate: event.target.value })}
          />
        </div>

        <label className="flex items-end gap-3 pb-2 text-sm font-medium text-slate-700">
          <input
            checked={form.isActive}
            className="h-4 w-4 rounded border-slate-300 text-brand-700"
            type="checkbox"
            onChange={(event) =>
              onChange({ ...form, isActive: event.target.checked })
            }
          />
          Активное правило
        </label>
      </div>

      {form.ruleType === "PROGRESSIVE" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="threshold">
              Порог, ₸
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="threshold"
              min="1"
              required
              step="0.01"
              type="number"
              value={form.threshold}
              onChange={(event) =>
                onChange({ ...form, threshold: event.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="extraRate">
              Ставка сверх порога, %
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              id="extraRate"
              max="100"
              min="0.01"
              required
              step="0.01"
              type="number"
              value={form.extraRate}
              onChange={(event) =>
                onChange({ ...form, extraRate: event.target.value })
              }
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Сохранение..." : "Сохранить"}
        </Button>
        {editing ? (
          <Button onClick={onCancel} type="button" variant="secondary">
            Отмена
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function TaxRuleTable({
  onDelete,
  onEdit,
  taxRules
}: {
  onDelete: (rule: TaxRule) => void;
  onEdit: (rule: TaxRule) => void;
  taxRules: TaxRule[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Название</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Тип дохода</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Тип правила</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Ставка</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Порог</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Сверх порога</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Статус</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {taxRules.map((rule) => (
              <tr className="transition hover:bg-slate-50/80" key={rule.id}>
                <td className="px-4 py-3 font-medium text-slate-950">
                  <div>{rule.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {formatTaxRuleDescription(rule)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="blue">{formatIncomeType(rule.incomeType)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={rule.ruleType === "PROGRESSIVE" ? "indigo" : "slate"}>
                    {formatTaxRuleType(rule.ruleType)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{rule.rate}%</td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {rule.threshold ? formatMoney(rule.threshold) : "-"}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {rule.extraRate ? `${rule.extraRate}%` : "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={rule.isActive ? "emerald" : "slate"}>
                    {rule.isActive ? "Активно" : "Неактивно"}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    className="mr-3 font-medium text-brand-700 hover:text-brand-600"
                    onClick={() => onEdit(rule)}
                    type="button"
                  >
                    Редактировать
                  </button>
                  <button
                    className="font-medium text-red-600 hover:text-red-700"
                    onClick={() => onDelete(rule)}
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
      {taxRules.length === 0 ? (
        <div className="p-5">
          <EmptyState
            description="Создайте первое налоговое правило, чтобы TaxFlow мог автоматически рассчитывать обязательства."
            title="Налоговых правил пока нет"
          />
        </div>
      ) : null}
    </div>
  );
}
