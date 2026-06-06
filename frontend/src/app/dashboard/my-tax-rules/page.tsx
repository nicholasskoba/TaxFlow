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
import {
  createMyTaxRule,
  deleteMyTaxRule,
  getCurrentUser,
  getMyTaxRules,
  updateMyTaxRule
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

export default function MyTaxRulesPage() {
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
    const response = await getMyTaxRules();
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
        await loadTaxRules();
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
        await updateMyTaxRule(editingRuleId, buildPayload());
        setMessage("Личная ставка обновлена");
      } else {
        await createMyTaxRule(buildPayload());
        setMessage("Личная ставка создана");
      }

      resetForm();
      await loadTaxRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить ставку");
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
    const confirmed = window.confirm("Удалить или деактивировать личную ставку?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const result = await deleteMyTaxRule(rule.id);
      setMessage(
        result.deactivated
          ? "Ставка уже использовалась, поэтому она деактивирована"
          : "Ставка удалена"
      );
      await loadTaxRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить ставку");
    }
  };

  if (isLoading) {
    return <LoadingState text="Загружаем личные налоговые ставки..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardNav userRole={user.role} />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <PageHeader
          description="Создайте собственное налоговое правило для расчётов. Если для типа дохода есть личное активное правило, TaxFlow применит его вместо стандартного."
          eyebrow="Персональные настройки"
          title="Мои налоговые ставки"
        />

        <ErrorMessage className="mb-6" message={error} />
        {message ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
          <form
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
            onSubmit={handleSubmit}
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {editingRuleId ? "Редактировать ставку" : "Создать ставку"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Личные ставки применяются только к вашим доходам и не меняют стандартные правила.
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
                onChange={(event) => setForm({ ...form, name: event.target.value })}
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
                    setForm({ ...form, incomeType: event.target.value as IncomeType })
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
                    setForm({ ...form, ruleType: event.target.value as TaxRuleType })
                  }
                >
                  <option value="FIXED">Фиксированная</option>
                  <option value="PROGRESSIVE">Прогрессивная</option>
                </select>
              </div>
            </div>

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
                onChange={(event) => setForm({ ...form, rate: event.target.value })}
              />
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
                      setForm({ ...form, threshold: event.target.value })
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
                      setForm({ ...form, extraRate: event.target.value })
                    }
                  />
                </div>
              </div>
            ) : null}

            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                checked={form.isActive}
                className="h-4 w-4 rounded border-slate-300 text-brand-700"
                type="checkbox"
                onChange={(event) =>
                  setForm({ ...form, isActive: event.target.checked })
                }
              />
              Активная ставка
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
              {editingRuleId ? (
                <Button onClick={resetForm} type="button" variant="secondary">
                  Отмена
                </Button>
              ) : null}
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Название</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Тип дохода</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Тип правила</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Ставка</th>
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
                      <td className="px-4 py-3 text-right text-slate-700">
                        {rule.ruleType === "PROGRESSIVE"
                          ? `${rule.rate}% / ${rule.extraRate}%`
                          : `${rule.rate}%`}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={rule.isActive ? "emerald" : "slate"}>
                          {rule.isActive ? "Активна" : "Неактивна"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          className="mr-3 font-medium text-brand-700 hover:text-brand-600"
                          onClick={() => handleEdit(rule)}
                          type="button"
                        >
                          Редактировать
                        </button>
                        <button
                          className="font-medium text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(rule)}
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
                  description="Если для типа дохода нет личной ставки, TaxFlow применит стандартное правило."
                  title="Личных ставок пока нет"
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
