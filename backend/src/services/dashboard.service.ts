import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { decimalToString, zeroDecimal } from "../utils/decimal";

type Actor = {
  id: string;
  role: UserRole;
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
      category: true
    }
  },
  taxRule: true
} as const;

function addMonths(date: Date, count: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
}

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function buildIncomeWhere(actor: Actor): Prisma.IncomeWhereInput {
  return actor.role !== "ADMIN" ? { userId: actor.id } : {};
}

function buildTaxWhere(actor: Actor): Prisma.TaxCalculationWhereInput {
  return actor.role !== "ADMIN" ? { userId: actor.id } : {};
}

function serializeIncome(
  income: Prisma.IncomeGetPayload<{ include: typeof incomeInclude }>
) {
  return {
    ...income,
    amount: decimalToString(income.amount),
    currency: "KZT"
  };
}

function serializeTaxCalculation(
  calculation: Prisma.TaxCalculationGetPayload<{
    include: typeof taxCalculationInclude;
  }>
) {
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

export async function getDashboardSummary(actor: Actor) {
  const now = new Date();
  const currentMonthFrom = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const currentMonthTo = addMonths(currentMonthFrom, 1);
  const monthlyStart = addMonths(currentMonthFrom, -5);

  const [
    incomes,
    taxCalculations,
    currentMonthIncomes,
    currentMonthTaxCalculations,
    latestIncomes,
    latestTaxCalculations
  ] = await Promise.all([
    prisma.income.findMany({
      where: buildIncomeWhere(actor),
      include: { category: true }
    }),
    prisma.taxCalculation.findMany({
      where: buildTaxWhere(actor),
      include: taxCalculationInclude
    }),
    prisma.income.findMany({
      where: {
        ...buildIncomeWhere(actor),
        receivedAt: {
          gte: currentMonthFrom,
          lt: currentMonthTo
        }
      }
    }),
    prisma.taxCalculation.findMany({
      where: {
        ...buildTaxWhere(actor),
        calculatedAt: {
          gte: currentMonthFrom,
          lt: currentMonthTo
        }
      }
    }),
    prisma.income.findMany({
      where: buildIncomeWhere(actor),
      include: incomeInclude,
      orderBy: { receivedAt: "desc" },
      take: 5
    }),
    prisma.taxCalculation.findMany({
      where: buildTaxWhere(actor),
      include: taxCalculationInclude,
      orderBy: { calculatedAt: "desc" },
      take: 5
    })
  ]);

  const totalIncomeAmount = incomes.reduce(
    (sum, income) => sum.plus(income.amount),
    zeroDecimal
  );
  const currentMonthAmount = currentMonthIncomes.reduce(
    (sum, income) => sum.plus(income.amount),
    zeroDecimal
  );
  const totalTaxAmount = taxCalculations.reduce(
    (sum, calculation) => sum.plus(calculation.taxAmount),
    zeroDecimal
  );
  const currentMonthTaxAmount = currentMonthTaxCalculations.reduce(
    (sum, calculation) => sum.plus(calculation.taxAmount),
    zeroDecimal
  );
  const totalNetAmount = taxCalculations.reduce(
    (sum, calculation) => sum.plus(calculation.netAmount),
    zeroDecimal
  );

  const monthly = [];

  for (let index = 0; index < 6; index += 1) {
    const monthFrom = addMonths(monthlyStart, index);
    const monthTo = addMonths(monthlyStart, index + 1);
    const monthlyIncome = incomes
      .filter((income) => income.receivedAt >= monthFrom && income.receivedAt < monthTo)
      .reduce((sum, income) => sum.plus(income.amount), zeroDecimal);
    const monthlyTax = taxCalculations
      .filter(
        (calculation) =>
          calculation.calculatedAt >= monthFrom && calculation.calculatedAt < monthTo
      )
      .reduce((sum, calculation) => sum.plus(calculation.taxAmount), zeroDecimal);
    const monthlyNet = taxCalculations
      .filter(
        (calculation) =>
          calculation.calculatedAt >= monthFrom && calculation.calculatedAt < monthTo
      )
      .reduce((sum, calculation) => sum.plus(calculation.netAmount), zeroDecimal);

    monthly.push({
      month: getMonthKey(monthFrom),
      incomeAmount: decimalToString(monthlyIncome),
      taxAmount: decimalToString(monthlyTax),
      netAmount: decimalToString(monthlyNet)
    });
  }

  const byCategoryMap = new Map<string, Prisma.Decimal>();
  const byIncomeTypeMap = new Map<string, Prisma.Decimal>();

  for (const income of incomes) {
    byCategoryMap.set(
      income.category.name,
      (byCategoryMap.get(income.category.name) ?? new Prisma.Decimal(0)).plus(
        income.amount
      )
    );
    byIncomeTypeMap.set(
      income.category.incomeType,
      (byIncomeTypeMap.get(income.category.incomeType) ?? new Prisma.Decimal(0)).plus(
        income.amount
      )
    );
  }

  return {
    income: {
      totalAmount: decimalToString(totalIncomeAmount),
      currentMonthAmount: decimalToString(currentMonthAmount),
      count: incomes.length
    },
    tax: {
      totalTaxAmount: decimalToString(totalTaxAmount),
      currentMonthTaxAmount: decimalToString(currentMonthTaxAmount),
      totalNetAmount: decimalToString(totalNetAmount),
      count: taxCalculations.length
    },
    charts: {
      monthly,
      byCategory: Array.from(byCategoryMap.entries()).map(
        ([categoryName, incomeAmount]) => ({
          categoryName,
          incomeAmount: decimalToString(incomeAmount)
        })
      ),
      byIncomeType: Array.from(byIncomeTypeMap.entries()).map(
        ([incomeType, incomeAmount]) => ({
          incomeType,
          incomeAmount: decimalToString(incomeAmount)
        })
      )
    },
    latest: {
      incomes: latestIncomes.map(serializeIncome),
      taxCalculations: latestTaxCalculations.map(serializeTaxCalculation)
    }
  };
}
