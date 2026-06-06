"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatIncomeType } from "@/lib/format";

type IncomeTypeChartProps = {
  data: Array<{
    incomeType: string;
    incomeAmount: string;
  }>;
};

export function IncomeTypeChart({ data }: IncomeTypeChartProps) {
  const chartData = data.map((item) => ({
    incomeType: formatIncomeType(item.incomeType),
    incomeAmount: Number(item.incomeAmount)
  }));

  if (chartData.length === 0) {
    return <EmptyChart />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="incomeType" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Bar dataKey="incomeAmount" fill="#7c3aed" name="Доход" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
      Нет данных для графика
    </div>
  );
}
