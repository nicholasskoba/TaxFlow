type CsvValue = string | number | boolean | null | undefined | Date;
type CsvRow = CsvValue[];

type PeriodReportCsv = {
  totals: {
    incomeAmount: string;
    taxAmount: string;
    netAmount: string;
    incomeCount: number;
    taxCalculationCount: number;
  };
  byCategory: Array<{
    categoryName: string;
    incomeType: string;
    incomeAmount: string;
    taxAmount: string;
    netAmount: string;
    incomeCount: number;
  }>;
  byIncomeType: Array<{
    incomeType: string;
    incomeAmount: string;
    taxAmount: string;
    netAmount: string;
    incomeCount: number;
  }>;
  latestIncomes: Array<{
    receivedAt: string | Date;
    description?: string | null;
    amount: string;
    category: {
      name: string;
    };
  }>;
  latestTaxCalculations: Array<{
    calculatedAt: string | Date;
    incomeAmount: string;
    taxRate: string;
    taxAmount: string;
    netAmount: string;
    income: {
      description?: string | null;
    };
    taxRule: {
      name: string;
    };
  }>;
};

type YearlyReportCsv = {
  totals: PeriodReportCsv["totals"];
  byMonth: Array<{
    month: number;
    incomeAmount: string;
    taxAmount: string;
    netAmount: string;
    incomeCount: number;
    taxCalculationCount: number;
  }>;
  byCategory: PeriodReportCsv["byCategory"];
  byIncomeType: PeriodReportCsv["byIncomeType"];
};

export function escapeCsvValue(value: CsvValue) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = value instanceof Date ? value.toISOString() : String(value);
  const shouldEscape = /[",\r\n]/.test(text);
  const escaped = text.replace(/"/g, '""');

  return shouldEscape ? `"${escaped}"` : escaped;
}

export function rowsToCsv(rows: CsvRow[]) {
  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
}

export function buildPeriodReportCsv(report: PeriodReportCsv) {
  const rows: CsvRow[] = [
    ["Summary"],
    ["Metric", "Value"],
    ["Income Amount", report.totals.incomeAmount],
    ["Tax Amount", report.totals.taxAmount],
    ["Net Amount", report.totals.netAmount],
    ["Income Count", report.totals.incomeCount],
    ["Tax Calculation Count", report.totals.taxCalculationCount],
    [],
    ["By Category"],
    ["Category", "Income Type", "Income Amount", "Tax Amount", "Net Amount", "Income Count"],
    ...report.byCategory.map((item) => [
      item.categoryName,
      item.incomeType,
      item.incomeAmount,
      item.taxAmount,
      item.netAmount,
      item.incomeCount
    ]),
    [],
    ["By Income Type"],
    ["Income Type", "Income Amount", "Tax Amount", "Net Amount", "Income Count"],
    ...report.byIncomeType.map((item) => [
      item.incomeType,
      item.incomeAmount,
      item.taxAmount,
      item.netAmount,
      item.incomeCount
    ]),
    [],
    ["Latest Incomes"],
    ["Date", "Category", "Description", "Amount KZT"],
    ...report.latestIncomes.map((income) => [
      toDateOnly(income.receivedAt),
      income.category.name,
      income.description ?? "",
      income.amount
    ]),
    [],
    ["Latest Tax Calculations"],
    [
      "Date",
      "Income Description",
      "Tax Rule",
      "Tax Rate",
      "Income Amount KZT",
      "Tax Amount KZT",
      "Net Amount KZT"
    ],
    ...report.latestTaxCalculations.map((calculation) => [
      toDateOnly(calculation.calculatedAt),
      calculation.income.description ?? "",
      calculation.taxRule.name,
      calculation.taxRate,
      calculation.incomeAmount,
      calculation.taxAmount,
      calculation.netAmount
    ])
  ];

  return withBom(rowsToCsv(rows));
}

export function buildYearlyReportCsv(report: YearlyReportCsv) {
  const rows: CsvRow[] = [
    ["Summary"],
    ["Metric", "Value"],
    ["Income Amount", report.totals.incomeAmount],
    ["Tax Amount", report.totals.taxAmount],
    ["Net Amount", report.totals.netAmount],
    ["Income Count", report.totals.incomeCount],
    ["Tax Calculation Count", report.totals.taxCalculationCount],
    [],
    ["By Month"],
    ["Month", "Income Amount", "Tax Amount", "Net Amount", "Income Count", "Tax Calculation Count"],
    ...report.byMonth.map((item) => [
      item.month,
      item.incomeAmount,
      item.taxAmount,
      item.netAmount,
      item.incomeCount,
      item.taxCalculationCount
    ]),
    [],
    ["By Category"],
    ["Category", "Income Type", "Income Amount", "Tax Amount", "Net Amount", "Income Count"],
    ...report.byCategory.map((item) => [
      item.categoryName,
      item.incomeType,
      item.incomeAmount,
      item.taxAmount,
      item.netAmount,
      item.incomeCount
    ]),
    [],
    ["By Income Type"],
    ["Income Type", "Income Amount", "Tax Amount", "Net Amount", "Income Count"],
    ...report.byIncomeType.map((item) => [
      item.incomeType,
      item.incomeAmount,
      item.taxAmount,
      item.netAmount,
      item.incomeCount
    ])
  ];

  return withBom(rowsToCsv(rows));
}

function toDateOnly(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

function withBom(csv: string) {
  return `\uFEFF${csv}`;
}
