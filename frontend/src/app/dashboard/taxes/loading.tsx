import { LoadingState } from "@/components/ui/LoadingState";

export default function TaxesLoading() {
  return (
    <LoadingState
      title="Готовим налоговый раздел"
      description="Загружаем доходы, правила и историю расчётов."
    />
  );
}
