"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { registerUser } from "@/lib/api";

const registerFormSchema = z.object({
  fullName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов")
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError("");

    try {
      await registerUser(values);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось создать аккаунт. Попробуйте ещё раз."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_460px] lg:items-center lg:px-8">
        <section className="hidden lg:block">
          <Link className="text-xl font-bold tracking-tight text-slate-950" href="/">
            TaxFlow
          </Link>
          <h1 className="mt-10 max-w-2xl text-5xl font-bold tracking-tight text-slate-950">
            Создать аккаунт
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Начните вести доходы, рассчитывать налоговые обязательства и видеть
            чистый финансовый результат без лишней рутины.
          </p>
          <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-card">
            <p className="text-sm font-semibold text-brand-700">
              Что будет внутри
            </p>
            <div className="mt-5 grid gap-4">
              {[
                "Персональный финансовый обзор",
                "Автоматический расчет налога",
                "Отчёты по месяцам и периодам"
              ].map((item) => (
                <div className="flex items-center gap-3" key={item}>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-sm font-medium text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="mb-8">
            <Link className="text-lg font-bold tracking-tight text-slate-950 lg:hidden" href="/">
              TaxFlow
            </Link>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-brand-700 lg:mt-0">
              Новый кабинет
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Создать аккаунт
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Заполните данные, чтобы перейти к управлению доходами и налогами.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="fullName">
                Полное имя
              </label>
              <input
                autoComplete="name"
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
                id="fullName"
                type="text"
                {...register("fullName")}
              />
              {errors.fullName ? (
                <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                autoComplete="email"
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
                id="email"
                type="email"
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="password">
                Пароль
              </label>
              <input
                autoComplete="new-password"
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              ) : null}
            </div>

            <ErrorMessage message={error} />

            <Button className="h-12 w-full rounded-xl" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Создаём аккаунт..." : "Создать аккаунт"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Уже есть аккаунт?{" "}
            <Link className="font-semibold text-brand-700 hover:text-brand-600" href="/login">
              Войти
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
