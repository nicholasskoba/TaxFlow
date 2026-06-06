"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAuditLogs } from "@/lib/api";
import { formatAction, formatDateTime, formatEntity, formatRole } from "@/lib/format";
import type { AuditLog } from "@/types/audit-log";

const actionOptions = [
  { label: "Создание дохода", value: "CREATE_INCOME" },
  { label: "Изменение дохода", value: "UPDATE_INCOME" },
  { label: "Удаление дохода", value: "DELETE_INCOME" },
  { label: "Создание категории доходов", value: "CREATE_INCOME_CATEGORY" },
  { label: "Изменение категории доходов", value: "UPDATE_INCOME_CATEGORY" },
  { label: "Удаление категории доходов", value: "DELETE_INCOME_CATEGORY" },
  { label: "Создание налогового правила", value: "CREATE_TAX_RULE" },
  { label: "Изменение налогового правила", value: "UPDATE_TAX_RULE" },
  { label: "Удаление налогового правила", value: "DELETE_TAX_RULE" },
  { label: "Создание прогрессивного правила", value: "CREATE_SMART_TAX_RULE" },
  { label: "Изменение прогрессивного правила", value: "UPDATE_SMART_TAX_RULE" },
  { label: "Создание личной ставки", value: "CREATE_CUSTOM_TAX_RULE" },
  { label: "Изменение личной ставки", value: "UPDATE_CUSTOM_TAX_RULE" },
  { label: "Удаление личной ставки", value: "DELETE_CUSTOM_TAX_RULE" },
  { label: "Ручной расчёт налога", value: "CALCULATE_TAX" },
  { label: "Автоматический расчёт налога", value: "CALCULATE_TAX_AUTO" },
  { label: "Удаление расчёта налога", value: "DELETE_TAX_CALCULATION" },
  { label: "Изменение пользователя", value: "UPDATE_USER" }
];

const entityOptions = [
  { label: "Пользователи", value: "User" },
  { label: "Доходы", value: "Income" },
  { label: "Категории доходов", value: "IncomeCategory" },
  { label: "Налоговые правила", value: "TaxRule" },
  { label: "Расчёты налогов", value: "TaxCalculation" }
];

type AuditLogFilterState = {
  action: string;
  entity: string;
  dateFrom: string;
  dateTo: string;
  limit: number;
};

export default function AdminAuditLogsPage() {
  return (
    <AdminGuard>
      {() => <AdminAuditLogsContent />}
    </AdminGuard>
  );
}

function AdminAuditLogsContent() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [limit, setLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const getFilterState = (): AuditLogFilterState => ({
    action,
    entity,
    dateFrom,
    dateTo,
    limit
  });

  const loadAuditLogs = async (filters = getFilterState()) => {
    setIsLoading(true);
    const response = await getAuditLogs({
      action: filters.action || undefined,
      entity: filters.entity || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      limit: filters.limit
    });
    setAuditLogs(response.auditLogs);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAuditLogs().catch((err) => {
      setError(err instanceof Error ? err.message : "Не удалось загрузить журнал");
      setIsLoading(false);
    });
  }, []);

  const handleFilter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    await loadAuditLogs().catch((err) => {
      setError(err instanceof Error ? err.message : "Не удалось применить фильтры");
      setIsLoading(false);
    });
  };

  const handleResetFilters = async () => {
    const resetFilters = {
      action: "",
      entity: "",
      dateFrom: "",
      dateTo: "",
      limit: 50
    };

    setAction(resetFilters.action);
    setEntity(resetFilters.entity);
    setDateFrom(resetFilters.dateFrom);
    setDateTo(resetFilters.dateTo);
    setLimit(resetFilters.limit);
    setError("");

    await loadAuditLogs(resetFilters).catch((err) => {
      setError(err instanceof Error ? err.message : "Не удалось сбросить фильтры");
      setIsLoading(false);
    });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <PageHeader
          description="Контроль изменений по пользователям, доходам, категориям, налоговым правилам и расчётам."
          eyebrow="Контроль изменений"
          title="Журнал действий"
        />

        <form
          className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:grid-cols-2 xl:grid-cols-9"
          onSubmit={handleFilter}
        >
          <label className="grid gap-1 text-sm font-medium text-slate-700 xl:col-span-2">
            Действие
            <select
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setAction(event.target.value)}
              value={action}
            >
              <option value="">Все действия</option>
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700 xl:col-span-2">
            Раздел
            <select
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setEntity(event.target.value)}
              value={entity}
            >
              <option value="">Все разделы</option>
              {entityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Дата от
            <input
              className="h-11 rounded-xl border border-slate-300 px-3 text-sm font-normal outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setDateFrom(event.target.value)}
              type="date"
              value={dateFrom}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Дата по
            <input
              className="h-11 rounded-xl border border-slate-300 px-3 text-sm font-normal outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setDateTo(event.target.value)}
              type="date"
              value={dateTo}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Показать
            <select
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setLimit(Number(event.target.value))}
              value={limit}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3 self-end xl:col-span-2">
            <button
              className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
              type="submit"
            >
              Найти
            </button>
            <button
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
              onClick={handleResetFilters}
              type="button"
            >
              Сбросить фильтры
            </button>
          </div>
          <p className="text-sm text-slate-500 md:col-span-2 xl:col-span-9">
            Оставьте фильтры пустыми, чтобы увидеть все записи.
          </p>
        </form>

        <ErrorMessage
          className="mb-6"
          message={error}
          title="Не удалось загрузить журнал действий"
        />

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Дата</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Пользователь</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Действие</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Раздел</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Объект</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr className="transition hover:bg-slate-50/80" key={log.id}>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {log.user ? (
                        <>
                          <span className="font-medium text-slate-950">
                            {log.user.fullName}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {log.user.email} · {formatRole(log.user.role)}
                          </span>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-700">
                      <Badge tone="indigo">{formatAction(log.action)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <Badge tone="slate">{formatEntity(log.entity)}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {log.entityId || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isLoading ? (
            <div className="p-5">
              <LoadingState
                description="Собираем последние изменения и действия пользователей."
                title="Загружаем журнал действий"
                variant="table"
              />
            </div>
          ) : null}
          {!isLoading && auditLogs.length === 0 ? (
            <div className="p-5">
              <EmptyState
                description="Записи не найдены. Попробуйте сбросить фильтры или расширить диапазон дат."
                title="Записи не найдены"
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
