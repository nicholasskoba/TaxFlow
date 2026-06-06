import { LoadingState } from "@/components/ui/LoadingState";

export default function IncomesLoading() {
  return (
    <LoadingState
      title="Загружаем доходы"
      description="Готовим фильтры, сводку и таблицу поступлений."
    />
  );
}
