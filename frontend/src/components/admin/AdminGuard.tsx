"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { LoadingState } from "@/components/ui/LoadingState";
import { getCurrentUser } from "@/lib/api";
import type { User } from "@/types/auth";

type AdminGuardProps = {
  children: (user: User) => ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <LoadingState
        title="Загружаем раздел управления"
        description="Проверяем доступ и готовим административные данные."
      />
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-slate-50">
        <DashboardNav userRole={user.role} />
        <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            У вас нет прав для просмотра этого раздела.
          </div>
        </section>
      </main>
    );
  }

  return <>{children(user)}</>;
}
