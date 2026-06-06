"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { loginUser } from "@/lib/api";

const loginFormSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов")
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError("");

    try {
      await loginUser(values);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Не удалось войти. Проверьте email и пароль.");
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
            Вход в личный кабинет
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Вернитесь к финансовому обзору, доходам, налоговым расчетам и
            отчетам за нужный период.
          </p>
          <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
            {["Доходы", "Налоги", "Отчёты"].map((item) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
                key={item}
              >
                <p className="text-sm font-semibold text-slate-900">{item}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Под контролем в одном кабинете
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="mb-8">
            <Link className="text-lg font-bold tracking-tight text-slate-950 lg:hidden" href="/">
              TaxFlow
            </Link>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-brand-700 lg:mt-0">
              Добро пожаловать
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Вход в личный кабинет
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Используйте email и пароль, чтобы продолжить работу с финансами.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
                autoComplete="current-password"
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
              {isSubmitting ? "Входим..." : "Войти"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Нет аккаунта?{" "}
            <Link className="font-semibold text-brand-700 hover:text-brand-600" href="/register">
              Создать аккаунт
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
