import { LoadingState } from "@/components/ui/LoadingState";

export default function AdminLoading() {
  return (
    <LoadingState
      title="Загружаем управление системой"
      description="Готовим пользователей, справочники и журнал действий."
    />
  );
}
