import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { decimalToString, zeroDecimal } from "../utils/decimal";

type Actor = {
  id: string;
  role: UserRole;
};

type PeriodType = "monthly" | "yearly" | "custom";

type ReportPeriod = {
  type: PeriodType;
  year?: number;
  month?: number;
  dateFrom: Date;
  dateTo: Date;
};

const incomeInclude = {
  category: true,
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true
    }
  }
} as const;

const taxCalculationInclude = {
  income: {
    include: {
      category: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true
        }
      }
    }
  },
  taxRule: true,
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true
    }
  }
} as const;

type IncomeWithRelations = Prisma.IncomeGetPayload<{
  include: typeof incomeInclude;
}>;

type TaxCalculationWithRelations = Prisma.TaxCalculationGetPayload<{
  include: typeof taxCalculationInclude;
}>;

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toStartOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function buildActorIncomeWhere(
  actor: Actor,
  dateFrom: Date,
  dateTo: Date
): Prisma.IncomeWhereInput {
  return {
    ...(actor.role !== "ADMIN" ? { userId: actor.id } : {}),
    receivedAt: {
      gte: dateFrom,
      lt: dateTo
    }
  };
}

function buildActorTaxCalculationWhere(
  actor: Actor,
  dateFrom: Date,
  dateTo: Date
): Prisma.TaxCalculationWhereInput {
  return {
    ...(actor.role !== "ADMIN" ? { userId: actor.id } : {}),
    calculatedAt: {
      gte: dateFrom,
      lt: dateTo
    }
  };
}

function serializeIncome(income: IncomeWithRelations) {
  return {
    ...income,
    amount: decimalToString(income.amount),
    currency: "KZT"
  };
}

function serializeTaxCalculation(calculation: TaxCalculationWithRelations) {
  return {
    ...calculation,
    incomeAmount: decimalToString(calculation.incomeAmount),
    taxRate: decimalToString(calculation.taxRate),
    taxAmount: decimalToString(calculation.taxAmount),
    netAmount: decimalToString(calculation.netAmount),
    income: {
      ...calculation.income,
      amount: decimalToString(calculation.income.amount),
      currency: "KZT"
    },
    taxRule: {
      ...calculation.taxRule,
      rate: decimalToString(calculation.taxRule.rate),
      threshold: calculation.taxRule.threshold
        ? decimalToString(calculation.taxRule.threshold)
        : null,
      extraRate: calculation.taxRule.extraRate
        ? decimalToString(calculation.taxRule.extraRate)
        : null
    }
  };
}

function serializePeriod(period: ReportPeriod) {
  return {
    type: period.type,
    ...(period.year ? { year: period.year } : {}),
    ...(period.month ? { month: period.month } : {}),
    dateFrom: period.dateFrom.toISOString(),
    dateTo: period.dateTo.toISOString()
  };
}

async function getReportData(actor: Actor, dateFrom: Date, dateTo: Date) {
  const [incomes, taxCalculations] = await Promise.all([
    prisma.income.findMany({
      where: buildActorIncomeWhere(actor, dateFrom, dateTo),
      include: incomeInclude,
      orderBy: { receivedAt: "desc" }
    }),
    prisma.taxCalculation.findMany({
      where: buildActorTaxCalculationWhere(actor, dateFrom, dateTo),
      include: taxCalculationInclude,
      orderBy: { calculatedAt: "desc" }
    })
  ]);

  return { incomes, taxCalculations };
}

function buildAggregates(
  incomes: IncomeWithRelations[],
  taxCalculations: TaxCalculationWithRelations[]
) {
  const incomeAmount = incomes.reduce(
    (sum, income) => sum.plus(income.amount),
    zeroDecimal
  );
  const taxAmount = taxCalculations.reduce(
    (sum, calculation) => sum.plus(calculation.taxAmount),
    zeroDecimal
  );
  const netAmount = taxCalculations.reduce(
    (sum, calculation) => sum.plus(calculation.netAmount),
    zeroDecimal
  );

  const byCategoryMap = new Map<
    string,
    {
      categoryId: string;
      categoryName: string;
      incomeType: string;
      incomeAmount: Prisma.Decimal;
      taxAmount: Prisma.Decimal;
      netAmount: Prisma.Decimal;
      incomeCount: number;
    }
  >();

  for (const income of incomes) {
    const current = byCategoryMap.get(income.categoryId) ?? {
      categoryId: income.categoryId,
      categoryName: income.category.name,
      incomeType: income.category.incomeType,
      incomeAmount: new Prisma.Decimal(0),
      taxAmount: new Prisma.Decimal(0),
      netAmount: new Prisma.Decimal(0),
      incomeCount: 0
    };

    current.incomeAmount = current.incomeAmount.plus(income.amount);
    current.incomeCount += 1;
    byCategoryMap.set(income.categoryId, current);
  }

  for (const calculation of taxCalculations) {
    const category = calculation.income.category;
    const current = byCategoryMap.get(category.id) ?? {
      categoryId: category.id,
      categoryName: category.name,
      incomeType: category.incomeType,
      incomeAmount: new Prisma.Decimal(0),
      taxAmount: new Prisma.Decimal(0),
      netAmount: new Prisma.Decimal(0),
      incomeCount: 0
    };

    current.taxAmount = current.taxAmount.plus(calculation.taxAmount);
    current.netAmount = current.netAmount.plus(calculation.netAmount);
    byCategoryMap.set(category.id, current);
  }

  const byIncomeTypeMap = new Map<
    string,
    {
      incomeType: string;
      incomeAmount: Prisma.Decimal;
      taxAmount: Prisma.Decimal;
      netAmount: Prisma.Decimal;
      incomeCount: number;
    }
  >();

  for (const item of byCategoryMap.values()) {
    const current = byIncomeTypeMap.get(item.incomeType) ?? {
      incomeType: item.incomeType,
      incomeAmount: new Prisma.Decimal(0),
      taxAmount: new Prisma.Decimal(0),
      netAmount: new Prisma.Decimal(0),
      incomeCount: 0
    };

    current.incomeAmount = current.incomeAmount.plus(item.incomeAmount);
    current.taxAmount = current.taxAmount.plus(item.taxAmount);
    current.netAmount = current.netAmount.plus(item.netAmount);
    current.incomeCount += item.incomeCount;
    byIncomeTypeMap.set(item.incomeType, current);
  }

  return {
    totals: {
      incomeAmount: decimalToString(incomeAmount),
      taxAmount: decimalToString(taxAmount),
      netAmount: decimalToString(netAmount),
      incomeCount: incomes.length,
      taxCalculationCount: taxCalculations.length
    },
    byCategory: Array.from(byCategoryMap.values()).map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      incomeType: item.incomeType,
      incomeAmount: decimalToString(item.incomeAmount),
      taxAmount: decimalToString(item.taxAmount),
      netAmount: decimalToString(item.netAmount),
      incomeCount: item.incomeCount
    })),
    byIncomeType: Array.from(byIncomeTypeMap.values()).map((item) => ({
      incomeType: item.incomeType,
      incomeAmount: decimalToString(item.incomeAmount),
      taxAmount: decimalToString(item.taxAmount),
      netAmount: decimalToString(item.netAmount),
      incomeCount: item.incomeCount
    }))
  };
}

export async function getPeriodReport(actor: Actor, period: ReportPeriod) {
  const { incomes, taxCalculations } = await getReportData(
    actor,
    period.dateFrom,
    period.dateTo
  );
  const aggregates = buildAggregates(incomes, taxCalculations);

  return {
    period: serializePeriod(period),
    ...aggregates,
    latestIncomes: incomes.slice(0, 5).map(serializeIncome),
    latestTaxCalculations: taxCalculations
      .slice(0, 5)
      .map(serializeTaxCalculation)
  };
}

export async function getMonthlyReport(actor: Actor, year: number, month: number) {
  const dateFrom = new Date(Date.UTC(year, month - 1, 1));
  const dateTo = new Date(Date.UTC(year, month, 1));

  return getPeriodReport(actor, {
    type: "monthly",
    year,
    month,
    dateFrom,
    dateTo
  });
}

export async function getYearlyReport(actor: Actor, year: number) {
  const dateFrom = new Date(Date.UTC(year, 0, 1));
  const dateTo = new Date(Date.UTC(year + 1, 0, 1));
  const report = await getPeriodReport(actor, {
    type: "yearly",
    year,
    dateFrom,
    dateTo
  });

  const byMonth = [];

  for (let month = 1; month <= 12; month += 1) {
    const monthFrom = new Date(Date.UTC(year, month - 1, 1));
    const monthTo = new Date(Date.UTC(year, month, 1));
    const { incomes, taxCalculations } = await getReportData(
      actor,
      monthFrom,
      monthTo
    );
    const monthTotals = buildAggregates(incomes, taxCalculations).totals;

    byMonth.push({
      month,
      ...monthTotals
    });
  }

  return {
    period: report.period,
    totals: report.totals,
    byMonth,
    byCategory: report.byCategory,
    byIncomeType: report.byIncomeType
  };
}

export async function getCustomPeriodReport(
  actor: Actor,
  dateFrom: Date,
  dateTo: Date
) {
  return getPeriodReport(actor, {
    type: "custom",
    dateFrom: toStartOfDay(dateFrom),
    dateTo: addDays(toStartOfDay(dateTo), 1)
  });
}
