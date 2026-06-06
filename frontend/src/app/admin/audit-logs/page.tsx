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

  const loadAuditLogs = async () => {
    setIsLoading(true);
    const response = await getAuditLogs({
      action: action || undefined,
      entity: entity || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit
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
          className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:grid-cols-5"
          onSubmit={handleFilter}
        >
          <input
            className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            onChange={(event) => setAction(event.target.value)}
            placeholder="Действие"
            value={action}
          />
          <input
            className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            onChange={(event) => setEntity(event.target.value)}
            placeholder="Раздел"
            value={entity}
          />
          <input
            className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            onChange={(event) => setDateFrom(event.target.value)}
            type="date"
            value={dateFrom}
          />
          <input
            className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            onChange={(event) => setDateTo(event.target.value)}
            type="date"
            value={dateTo}
          />
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <select
              className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setLimit(Number(event.target.value))}
              value={limit}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <button
              className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
              type="submit"
            >
              Найти
            </button>
          </div>
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
                description="Измените фильтры или вернитесь позже, когда появятся новые операции."
                title="Записи не найдены"
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
