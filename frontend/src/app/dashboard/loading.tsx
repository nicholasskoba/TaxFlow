import { LoadingState } from "@/components/ui/LoadingState";

export default function DashboardLoading() {
  return (
    <LoadingState
      title="Загружаем финансовый обзор"
      description="Собираем доходы, налоги, графики и последние операции."
    />
  );
}
