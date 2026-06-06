"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type MonthlyFinanceChartProps = {
  data: Array<{
    month: string | number;
    incomeAmount: string;
    taxAmount: string;
    netAmount: string;
  }>;
};

export function MonthlyFinanceChart({ data }: MonthlyFinanceChartProps) {
  const chartData = data.map((item) => ({
    month: String(item.month),
    incomeAmount: Number(item.incomeAmount),
    taxAmount: Number(item.taxAmount),
    netAmount: Number(item.netAmount)
  }));

  if (chartData.length === 0) {
    return <EmptyChart />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Legend />
          <Bar dataKey="incomeAmount" fill="#2563eb" name="Доход" />
          <Bar dataKey="taxAmount" fill="#dc2626" name="Налог" />
          <Bar dataKey="netAmount" fill="#16a34a" name="Чистый доход" />
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
