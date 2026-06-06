"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { IncomeTypeChart } from "@/components/charts/IncomeTypeChart";
import { MonthlyFinanceChart } from "@/components/charts/MonthlyFinanceChart";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  downloadMonthlyReportCsv,
  downloadPeriodReportCsv,
  downloadYearlyReportCsv,
  getCurrentUser,
  getMonthlyReport,
  getPeriodReport,
  getYearlyReport
} from "@/lib/api";
import { formatDate, formatIncomeType, formatMoney } from "@/lib/format";
import type { User } from "@/types/auth";
import type { PeriodReport, YearlyReport } from "@/types/report";

type ReportMode = "monthly" | "yearly" | "period";

const months = [
  { value: 1, label: "Январь" },
  { value: 2, label: "Февраль" },
  { value: 3, label: "Март" },
  { value: 4, label: "Апрель" },
  { value: 5, label: "Май" },
  { value: 6, label: "Июнь" },
  { value: 7, label: "Июль" },
  { value: 8, label: "Август" },
  { value: 9, label: "Сентябрь" },
  { value: 10, label: "Октябрь" },
  { value: 11, label: "Ноябрь" },
  { value: 12, label: "Декабрь" }
];

export default function ReportsPage() {
  const router = useRouter();
  const now = new Date();
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<ReportMode>("monthly");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [dateFrom, setDateFrom] = useState(`${now.getFullYear()}-01-01`);
  const [dateTo, setDateTo] = useState(now.toISOString().slice(0, 10));
  const [report, setReport] = useState<PeriodReport | YearlyReport | null>(null);
  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((response) => {
        if (isMounted) {
          setUser(response.user);
        }
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoadingReport(true);

    try {
      if (mode === "monthly") {
        const response = await getMonthlyReport({ year, month });
        setReport(response.report);
      }

      if (mode === "yearly") {
        const response = await getYearlyReport({ year });
        setReport(response.report);
      }

      if (mode === "period") {
        const response = await getPeriodReport({ dateFrom, dateTo });
        setReport(response.report);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось сформировать отчёт"
      );
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleExport = async () => {
    setExportError("");
    setIsExporting(true);

    try {
      if (mode === "monthly") {
        await downloadMonthlyReportCsv({ year, month });
      }

      if (mode === "yearly") {
        await downloadYearlyReportCsv({ year });
      }

      if (mode === "period") {
        await downloadPeriodReportCsv({ dateFrom, dateTo });
      }
    } catch {
      setExportError("Не удалось скачать отчёт. Попробуйте ещё раз.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <LoadingState
        title="Готовим финансовые отчёты"
        description="Подготавливаем графики, таблицы и параметры периода."
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardNav userRole={user.role} />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <PageHeader
          description="Аналитика за выбранный период помогает оценить динамику доходов, налоговых обязательств и чистого результата."
          eyebrow="Аналитика"
          title="Финансовые отчёты"
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex flex-wrap gap-2">
            <ModeButton active={mode === "monthly"} onClick={() => setMode("monthly")}>
              Месячный отчёт
            </ModeButton>
            <ModeButton active={mode === "yearly"} onClick={() => setMode("yearly")}>
              Годовой отчёт
            </ModeButton>
            <ModeButton active={mode === "period"} onClick={() => setMode("period")}>
              Произвольный период
            </ModeButton>
          </div>

          <form
            className="mt-6 grid gap-4 md:grid-cols-4"
            onSubmit={handleSubmit}
          >
            {mode === "monthly" || mode === "yearly" ? (
              <label className="text-sm font-medium text-slate-700">
                Год
                <input
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  max={2100}
                  min={2000}
                  onChange={(event) => setYear(Number(event.target.value))}
                  type="number"
                  value={year}
                />
              </label>
            ) : null}

            {mode === "monthly" ? (
              <label className="text-sm font-medium text-slate-700">
                Месяц
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  onChange={(event) => setMonth(Number(event.target.value))}
                  value={month}
                >
                  {months.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {mode === "period" ? (
              <>
                <label className="text-sm font-medium text-slate-700">
                  Дата от
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                    onChange={(event) => setDateFrom(event.target.value)}
                    type="date"
                    value={dateFrom}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Дата до
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                    onChange={(event) => setDateTo(event.target.value)}
                    type="date"
                    value={dateTo}
                  />
                </label>
              </>
            ) : null}

            <div className="flex flex-col justify-end gap-2 sm:flex-row md:col-span-4 xl:col-span-1">
              <button
                className="h-11 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoadingReport}
                type="submit"
              >
                {isLoadingReport ? "Формируем..." : "Сформировать отчёт"}
              </button>
              <button
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isExporting}
                onClick={handleExport}
                type="button"
              >
                {isExporting ? "Подготовка файла..." : "Скачать CSV"}
              </button>
            </div>
          </form>

          <p className="mt-4 text-sm text-slate-500">
            Файл можно открыть в Excel или Google Sheets.
          </p>

          <ErrorMessage
            className="mt-4"
            message={error}
            title="Не удалось сформировать отчёт"
          />
          <ErrorMessage
            className="mt-4"
            message={exportError}
            title="Не удалось скачать отчёт"
          />
        </section>

        {report ? <ReportResult report={report} /> : <EmptyReport />}
      </section>
    </main>
  );
}

function ReportResult({ report }: { report: PeriodReport | YearlyReport }) {
  const isYearly = "byMonth" in report;

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Доход" value={formatMoney(report.totals.incomeAmount)} />
        <StatCard label="Налог" value={formatMoney(report.totals.taxAmount)} />
        <StatCard label="Чистый доход" value={formatMoney(report.totals.netAmount)} />
        <StatCard label="Записей доходов" value={report.totals.incomeCount} />
        <StatCard label="Расчётов" value={report.totals.taxCalculationCount} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-slate-950">
          Период отчёта
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {formatDate(report.period.dateFrom)} — {formatDate(report.period.dateTo)}
        </p>
      </section>

      {isYearly ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-slate-950">
            Динамика по месяцам
          </h2>
          <div className="mt-4">
            <MonthlyFinanceChart data={report.byMonth} />
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Месяц</th>
                  <th className="py-2 pr-4">Доход</th>
                  <th className="py-2 pr-4">Налог</th>
                  <th className="py-2 pr-4">Чистый доход</th>
                  <th className="py-2 pr-4">Записей</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.byMonth.map((item) => (
                  <tr className="transition hover:bg-slate-50/80" key={item.month}>
                    <td className="py-3 pr-4">{item.month}</td>
                    <td className="py-3 pr-4">{formatMoney(item.incomeAmount)}</td>
                    <td className="py-3 pr-4">{formatMoney(item.taxAmount)}</td>
                    <td className="py-3 pr-4">{formatMoney(item.netAmount)}</td>
                    <td className="py-3 pr-4">{item.incomeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-slate-950">
            Доходы по категориям
          </h2>
          <div className="mt-4">
            <CategoryChart data={report.byCategory} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-slate-950">
            Доходы по типам
          </h2>
          <div className="mt-4">
            <IncomeTypeChart data={report.byIncomeType} />
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportCategoryTable rows={report.byCategory} />
        <ReportIncomeTypeTable rows={report.byIncomeType} />
      </div>
    </div>
  );
}

function ReportCategoryTable({
  rows
}: {
  rows: PeriodReport["byCategory"];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold text-slate-950">Таблица категорий</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2 pr-4">Категория</th>
              <th className="py-2 pr-4">Тип</th>
              <th className="py-2 pr-4">Доход</th>
              <th className="py-2 pr-4">Налог</th>
              <th className="py-2 pr-4">Чистый доход</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr className="transition hover:bg-slate-50/80" key={row.categoryId}>
                <td className="py-3 pr-4">{row.categoryName}</td>
                <td className="py-3 pr-4">
                  <Badge tone="blue">{formatIncomeType(row.incomeType)}</Badge>
                </td>
                <td className="py-3 pr-4">{formatMoney(row.incomeAmount)}</td>
                <td className="py-3 pr-4">{formatMoney(row.taxAmount)}</td>
                <td className="py-3 pr-4">{formatMoney(row.netAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <EmptyTable /> : null}
      </div>
    </section>
  );
}

function ReportIncomeTypeTable({
  rows
}: {
  rows: PeriodReport["byIncomeType"];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold text-slate-950">Таблица типов дохода</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2 pr-4">Тип</th>
              <th className="py-2 pr-4">Доход</th>
              <th className="py-2 pr-4">Налог</th>
              <th className="py-2 pr-4">Чистый доход</th>
              <th className="py-2 pr-4">Записей</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr className="transition hover:bg-slate-50/80" key={row.incomeType}>
                <td className="py-3 pr-4">
                  <Badge tone="blue">{formatIncomeType(row.incomeType)}</Badge>
                </td>
                <td className="py-3 pr-4">{formatMoney(row.incomeAmount)}</td>
                <td className="py-3 pr-4">{formatMoney(row.taxAmount)}</td>
                <td className="py-3 pr-4">{formatMoney(row.netAmount)}</td>
                <td className="py-3 pr-4">{row.incomeCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <EmptyTable /> : null}
      </div>
    </section>
  );
}

function ModeButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-brand-700 text-white shadow-card"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">{value}</h2>
    </article>
  );
}

function EmptyReport() {
  return (
    <div className="mt-8">
      <EmptyState
        description="Выберите параметры и сформируйте отчёт, чтобы увидеть аналитику по доходам, налогам и чистому результату."
        title="Отчёт ещё не сформирован"
      />
    </div>
  );
}

function EmptyTable() {
  return (
    <EmptyState
      description="Попробуйте выбрать другой период или добавьте новые операции."
      title="Данных за выбранный период нет"
    />
  );
}
