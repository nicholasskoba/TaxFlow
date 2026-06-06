"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { calculateTaxAuto, getCurrentUser, getIncomes } from "@/lib/api";
import {
  formatDate,
  formatDateTime,
  formatIncomeType,
  formatMoney,
  formatTaxRuleDescription,
  formatTaxRuleType
} from "@/lib/format";
import type { User } from "@/types/auth";
import type { Income } from "@/types/income";
import type { TaxCalculation } from "@/types/tax";

export default function TaxesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [incomeId, setIncomeId] = useState("");
  const [result, setResult] = useState<TaxCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedIncome = useMemo(
    () => incomes.find((income) => income.id === incomeId) ?? null,
    [incomeId, incomes]
  );

  useEffect(() => {
    let isMounted = true;

    Promise.all([getCurrentUser(), getIncomes()])
      .then(([userResponse, incomesResponse]) => {
        if (isMounted) {
          setUser(userResponse.user);
          setIncomes(incomesResponse.incomes);
          setIncomeId(incomesResponse.incomes[0]?.id ?? "");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await calculateTaxAuto({ incomeId });
      setResult(response.taxCalculation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось рассчитать налог");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState text="Готовим расчёт налогов..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardNav userRole={user.role} />

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <PageHeader
          actions={
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 shadow-card transition hover:border-brand-200 hover:bg-brand-50"
                href="/dashboard/my-tax-rules"
              >
                Мои ставки
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 shadow-card transition hover:border-brand-200 hover:bg-brand-50"
                href="/dashboard/taxes/history"
              >
                История расчётов
              </Link>
            </div>
          }
          description="Выберите доход, а TaxFlow сам подберёт личное или стандартное налоговое правило по категории."
          eyebrow="Налоги"
          title="Расчёт налогов"
        />

        <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4 text-sm leading-6 text-brand-900">
          Если для типа дохода есть активная личная ставка, TaxFlow применит её.
          Если личной ставки нет, используется стандартное налоговое правило.
          Прогрессивная формула применяется к сумме выбранного дохода.
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StepCard
            index="1"
            text="Выберите доход с нужной категорией и датой получения."
            title="Выберите доход"
          />
          <StepCard
            index="2"
            text="TaxFlow проверит личные ставки и затем стандартные правила."
            title="Подбор правила"
          />
          <StepCard
            index="3"
            text="Получите налог, чистый доход и детализацию ставки."
            title="Готовый расчёт"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)]">
          <SectionCard
            description="Укажите доход, который нужно обработать. Категория и тип поступления отобразятся перед расчётом."
            title="Доход для расчёта"
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              <ErrorMessage message={error} />

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="incomeId">
                  Доход
                </label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  disabled={incomes.length === 0}
                  id="incomeId"
                  required
                  value={incomeId}
                  onChange={(event) => {
                    setIncomeId(event.target.value);
                    setResult(null);
                  }}
                >
                  {incomes.map((income) => (
                    <option key={income.id} value={income.id}>
                      {formatDate(income.receivedAt)} - {income.category.name} -{" "}
                      {formatMoney(income.amount)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedIncome ? (
                <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <InfoItem label="Категория" value={selectedIncome.category.name} />
                  <InfoItem
                    badge
                    label="Тип дохода"
                    value={formatIncomeType(selectedIncome.category.incomeType)}
                  />
                  <InfoItem label="Сумма" value={formatMoney(selectedIncome.amount)} />
                  <InfoItem
                    label="Дата получения"
                    value={formatDate(selectedIncome.receivedAt)}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Пока нет доходов для расчёта. Добавьте первый доход, чтобы TaxFlow смог определить налоговое правило.
                </div>
              )}

              <Button disabled={isSubmitting || incomes.length === 0} type="submit">
                {isSubmitting ? "Рассчитываем..." : "Рассчитать налог"}
              </Button>
            </form>
          </SectionCard>

          <SectionCard
            description="После расчёта здесь появятся сумма налога, чистый доход и выбранное правило."
            title="Результат"
          >
            {result ? (
              <div className="space-y-5">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-emerald-700">Чистый доход</p>
                    {result.taxRule.isCustom ? (
                      <Badge tone="indigo">Моя ставка</Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    {formatMoney(result.netAmount)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    После удержания налога по выбранному правилу.
                  </p>
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <InfoBlock label="Сумма дохода" value={formatMoney(result.incomeAmount)} />
                  <InfoBlock
                    label="Категория дохода"
                    value={result.income.category?.name ?? "-"}
                  />
                  <InfoBlock
                    badge
                    label="Тип дохода"
                    value={formatIncomeType(result.income.category?.incomeType)}
                  />
                  <InfoBlock
                    label="Правило"
                    value={result.taxRule.name}
                  />
                  <InfoBlock
                    badge
                    label="Тип правила"
                    value={formatTaxRuleType(result.taxRule.ruleType)}
                  />
                  <InfoBlock
                    label="Ставка"
                    value={formatTaxRuleDescription(result.taxRule)}
                  />
                  {result.taxRule.ruleType === "PROGRESSIVE" ? (
                    <>
                      <InfoBlock
                        label="Порог"
                        value={formatMoney(result.taxRule.threshold ?? "0.00")}
                      />
                      <InfoBlock
                        label="Сверх порога"
                        value={`${result.taxRule.extraRate}%`}
                      />
                      <InfoBlock
                        label="Налог до порога"
                        value={formatMoney(result.breakdown?.baseTaxAmount ?? "0.00")}
                      />
                      <InfoBlock
                        label="Налог сверх порога"
                        value={formatMoney(result.breakdown?.extraTaxAmount ?? "0.00")}
                      />
                    </>
                  ) : null}
                  <InfoBlock
                    label="Сумма налога"
                    value={formatMoney(result.taxAmount)}
                    valueClassName="text-red-700"
                  />
                  <InfoBlock
                    label="Дата расчёта"
                    value={formatDateTime(result.calculatedAt)}
                  />
                </dl>

                {result.taxRule.ruleType === "PROGRESSIVE" ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    До порога применяется базовая ставка, сумма выше порога облагается повышенной ставкой.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Результат появится здесь после автоматического расчёта.
              </p>
            )}
          </SectionCard>
        </div>
      </section>
    </main>
  );
}

function StepCard({
  index,
  text,
  title
}: {
  index: string;
  text: string;
  title: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <Badge tone="indigo">Шаг {index}</Badge>
      <h2 className="mt-3 text-base font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

function InfoItem({
  badge = false,
  label,
  value
}: {
  badge?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      {badge ? (
        <Badge className="mt-1" tone="blue">
          {value}
        </Badge>
      ) : (
        <p className="mt-1 font-medium text-slate-950">{value}</p>
      )}
    </div>
  );
}

function InfoBlock({
  badge = false,
  label,
  value,
  valueClassName = "text-slate-950"
}: {
  badge?: boolean;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className={`mt-1 font-semibold ${valueClassName}`}>
        {badge ? <Badge tone="blue">{value}</Badge> : value}
      </dd>
    </div>
  );
}
