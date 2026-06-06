"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getUsers, updateUser } from "@/lib/api";
import { formatDate, formatRole } from "@/lib/format";
import type { UserRole } from "@/types/auth";
import type { AdminUser } from "@/types/user";

type EditState = {
  id: string;
  fullName: string;
  role: UserRole;
};

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      {() => <AdminUsersContent />}
    </AdminGuard>
  );
}

function AdminUsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [editing, setEditing] = useState<EditState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    setIsLoading(true);
    const response = await getUsers({ search: search || undefined, role });
    setUsers(response.users);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers().catch((err) => {
      setError(err instanceof Error ? err.message : "Не удалось загрузить пользователей");
      setIsLoading(false);
    });
  }, []);

  const handleFilter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    await loadUsers().catch((err) => {
      setError(err instanceof Error ? err.message : "Не удалось применить фильтры");
      setIsLoading(false);
    });
  };

  const handleSave = async () => {
    if (!editing) {
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await updateUser(editing.id, {
        fullName: editing.fullName,
        role: editing.role
      });
      setMessage("Пользователь обновлён");
      setEditing(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить пользователя");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <PageHeader
          description="Просмотр профилей, фильтрация и управление уровнем доступа пользователей."
          eyebrow="Администрирование"
          title="Пользователи"
        />

        <form
          className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:grid-cols-[1fr_180px_160px]"
          onSubmit={handleFilter}
        >
          <input
            className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по email или имени"
            value={search}
          />
          <select
            className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            onChange={(event) => setRole(event.target.value as UserRole | "")}
            value={role}
          >
            <option value="">Все роли</option>
            <option value="USER">Пользователь</option>
            <option value="ADMIN">Администратор</option>
          </select>
          <button
            className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
            type="submit"
          >
            Применить
          </button>
        </form>

        <ErrorMessage
          className="mb-6"
          message={error}
          title="Не удалось загрузить пользователей"
        />
        {message ? <Alert tone="success" text={message} /> : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Имя</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Роль</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Создан</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr className="transition hover:bg-slate-50/80" key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-950">{user.email}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {editing?.id === user.id ? (
                        <input
                          className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                          onChange={(event) =>
                            setEditing((current) =>
                              current
                                ? { ...current, fullName: event.target.value }
                                : current
                            )
                          }
                          value={editing.fullName}
                        />
                      ) : (
                        user.fullName
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {editing?.id === user.id ? (
                        <select
                          className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                          onChange={(event) =>
                            setEditing((current) =>
                              current
                                ? { ...current, role: event.target.value as UserRole }
                                : current
                            )
                          }
                          value={editing.role}
                        >
                          <option value="USER">Пользователь</option>
                          <option value="ADMIN">Администратор</option>
                        </select>
                      ) : (
                        <Badge tone={user.role === "ADMIN" ? "indigo" : "blue"}>
                          {formatRole(user.role)}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {editing?.id === user.id ? (
                        <>
                          <button
                            className="mr-3 font-medium text-brand-700"
                            disabled={isSubmitting}
                            onClick={handleSave}
                            type="button"
                          >
                            Сохранить
                          </button>
                          <button
                            className="font-medium text-slate-600"
                            onClick={() => setEditing(null)}
                            type="button"
                          >
                            Отмена
                          </button>
                        </>
                      ) : (
                        <button
                          className="font-medium text-brand-700"
                          onClick={() =>
                            setEditing({
                              id: user.id,
                              fullName: user.fullName,
                              role: user.role
                            })
                          }
                          type="button"
                        >
                          Редактировать
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isLoading ? (
            <div className="p-5">
              <LoadingState
                description="Проверяем список пользователей и настройки доступа."
                title="Загружаем пользователей"
                variant="table"
              />
            </div>
          ) : null}
          {!isLoading && users.length === 0 ? (
            <div className="p-5">
              <EmptyState
                description="Измените фильтры или проверьте список пользователей позже."
                title="Пользователи не найдены"
              />
            </div>
          ) : null}
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
