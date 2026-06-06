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

type CategoryChartProps = {
  data: Array<{
    categoryName: string;
    incomeAmount: string;
  }>;
};

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((item) => ({
    categoryName: item.categoryName,
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
          <XAxis dataKey="categoryName" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Bar dataKey="incomeAmount" fill="#0f766e" name="Доход" />
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
