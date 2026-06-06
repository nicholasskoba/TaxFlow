import { LoadingState } from "@/components/ui/LoadingState";

export default function ReportsLoading() {
  return (
    <LoadingState
      title="Формируем пространство отчётов"
      description="Подготавливаем графики, таблицы и параметры периода."
    />
  );
}
