import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { calculateTaxAmount } from "../utils/tax-calculator";
import { createAuditLog } from "./audit-log.service";
import type {
  CalculateTaxAutoInput,
  CalculateTaxInput,
  TaxCalculationFiltersInput
} from "../schemas/tax-calculation.schema";

type Actor = {
  id: string;
  role: UserRole;
};

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

type TaxCalculationWithRelations = Prisma.TaxCalculationGetPayload<{
  include: typeof taxCalculationInclude;
}>;

type TaxRuleForCalculation = TaxCalculationWithRelations["taxRule"];

function serializeTaxRule(rule: TaxRuleForCalculation) {
  return {
    ...rule,
    rate: rule.rate.toFixed(2),
    threshold: rule.threshold ? rule.threshold.toFixed(2) : null,
    extraRate: rule.extraRate ? rule.extraRate.toFixed(2) : null
  };
}

function buildCalculationBreakdown(calculation: TaxCalculationWithRelations) {
  const breakdown = calculateTaxAmount({
    incomeAmount: calculation.incomeAmount,
    ruleType: calculation.taxRule.ruleType,
    rate: calculation.taxRate,
    threshold: calculation.taxRule.threshold,
    extraRate: calculation.taxRule.extraRate
  });

  return {
    appliedRateLabel: breakdown.appliedRateLabel,
    baseTaxAmount: breakdown.baseTaxAmount.toFixed(2),
    extraTaxAmount: breakdown.extraTaxAmount.toFixed(2),
    threshold: breakdown.threshold ? breakdown.threshold.toFixed(2) : null,
    extraRate: breakdown.extraRate ? breakdown.extraRate.toFixed(2) : null
  };
}

function serializeTaxCalculation(calculation: TaxCalculationWithRelations) {
  return {
    ...calculation,
    incomeAmount: calculation.incomeAmount.toFixed(2),
    taxRate: calculation.taxRate.toFixed(2),
    taxAmount: calculation.taxAmount.toFixed(2),
    netAmount: calculation.netAmount.toFixed(2),
    breakdown: buildCalculationBreakdown(calculation),
    income: {
      ...calculation.income,
      amount: calculation.income.amount.toFixed(2),
      currency: "KZT"
    },
    taxRule: serializeTaxRule(calculation.taxRule)
  };
}

function buildTaxCalculationWhere(
  actor: Actor,
  filters?: TaxCalculationFiltersInput
): Prisma.TaxCalculationWhereInput {
  const where: Prisma.TaxCalculationWhereInput = {};

  if (actor.role !== "ADMIN") {
    where.userId = actor.id;
  }

  if (filters?.taxRuleId) {
    where.taxRuleId = filters.taxRuleId;
  }

  if (filters?.incomeId) {
    where.incomeId = filters.incomeId;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : undefined;

    if (dateTo) {
      dateTo.setHours(23, 59, 59, 999);
    }

    where.calculatedAt = {
      gte: filters.dateFrom,
      lte: dateTo
    };
  }

  return where;
}

async function getTaxCalculationForActor(id: string, actor: Actor) {
  const calculation = await prisma.taxCalculation.findUnique({
    where: { id },
    include: taxCalculationInclude
  });

  if (!calculation) {
    throw new ApiError(404, "Tax calculation not found");
  }

  if (actor.role !== "ADMIN" && calculation.userId !== actor.id) {
    throw new ApiError(403, "Access denied");
  }

  return calculation;
}

async function getIncomeForCalculation(incomeId: string, actor: Actor) {
  const income = await prisma.income.findUnique({
    where: { id: incomeId },
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
  });

  if (!income) {
    throw new ApiError(404, "Income not found");
  }

  if (actor.role !== "ADMIN" && income.userId !== actor.id) {
    throw new ApiError(403, "Access denied");
  }

  return income;
}

function assertTaxRuleMatchesIncome(
  taxRule: Awaited<ReturnType<typeof prisma.taxRule.findUnique>>,
  income: Awaited<ReturnType<typeof getIncomeForCalculation>>
) {
  if (!taxRule) {
    throw new ApiError(404, "Tax rule not found");
  }

  if (!taxRule.isActive) {
    throw new ApiError(400, "Tax rule is not active");
  }

  if (taxRule.incomeType !== income.category.incomeType) {
    throw new ApiError(
      400,
      "Tax rule income type does not match income category type"
    );
  }
}

function calculateAmounts(
  incomeAmount: Prisma.Decimal,
  taxRule: NonNullable<Awaited<ReturnType<typeof prisma.taxRule.findUnique>>>
) {
  try {
    return calculateTaxAmount({
      incomeAmount,
      ruleType: taxRule.ruleType,
      rate: taxRule.rate,
      threshold: taxRule.threshold,
      extraRate: taxRule.extraRate
    });
  } catch {
    throw new ApiError(400, "Tax rule configuration is invalid");
  }
}

async function createCalculation({
  action,
  actor,
  income,
  taxRule
}: {
  action: string;
  actor: Actor;
  income: Awaited<ReturnType<typeof getIncomeForCalculation>>;
  taxRule: NonNullable<Awaited<ReturnType<typeof prisma.taxRule.findUnique>>>;
}) {
  const amounts = calculateAmounts(income.amount, taxRule);

  const calculation = await prisma.taxCalculation.create({
    data: {
      userId: income.userId,
      incomeId: income.id,
      taxRuleId: taxRule.id,
      incomeAmount: income.amount,
      taxRate: taxRule.rate,
      taxAmount: amounts.taxAmount,
      netAmount: amounts.netAmount
    },
    include: taxCalculationInclude
  });

  await createAuditLog({
    userId: actor.id,
    action,
    entity: "TaxCalculation",
    entityId: calculation.id
  });

  return serializeTaxCalculation(calculation);
}

export async function calculateTax(data: CalculateTaxInput, actor: Actor) {
  const income = await getIncomeForCalculation(data.incomeId, actor);

  const taxRule = await prisma.taxRule.findUnique({
    where: { id: data.taxRuleId }
  });

  assertTaxRuleMatchesIncome(taxRule, income);

  if (
    taxRule!.isCustom &&
    actor.role !== "ADMIN" &&
    taxRule!.userId !== actor.id
  ) {
    throw new ApiError(403, "Access denied");
  }

  return createCalculation({
    action: "CALCULATE_TAX",
    actor,
    income,
    taxRule: taxRule!
  });
}

export async function calculateTaxAuto(data: CalculateTaxAutoInput, actor: Actor) {
  const income = await getIncomeForCalculation(data.incomeId, actor);

  const customTaxRule = await prisma.taxRule.findFirst({
    where: {
      incomeType: income.category.incomeType,
      isActive: true,
      isCustom: true,
      userId: income.userId
    },
    orderBy: [
      { updatedAt: "desc" },
      { createdAt: "desc" }
    ]
  });

  const globalTaxRule =
    customTaxRule ??
    (await prisma.taxRule.findFirst({
      where: {
        incomeType: income.category.incomeType,
        isActive: true,
        isCustom: false,
        userId: null
      },
      orderBy: [
        { updatedAt: "desc" },
        { createdAt: "desc" }
      ]
    }));

  if (!globalTaxRule) {
    throw new ApiError(
      400,
      "No active tax rule found for income category type"
    );
  }

  return createCalculation({
    action: "CALCULATE_TAX_AUTO",
    actor,
    income,
    taxRule: globalTaxRule
  });
}

export async function listTaxCalculations(
  actor: Actor,
  filters: TaxCalculationFiltersInput
) {
  const calculations = await prisma.taxCalculation.findMany({
    where: buildTaxCalculationWhere(actor, filters),
    include: taxCalculationInclude,
    orderBy: { calculatedAt: "desc" }
  });

  return calculations.map(serializeTaxCalculation);
}

export async function getTaxCalculationById(id: string, actor: Actor) {
  const calculation = await getTaxCalculationForActor(id, actor);
  return serializeTaxCalculation(calculation);
}

export async function deleteTaxCalculation(id: string, actor: Actor) {
  await getTaxCalculationForActor(id, actor);

  await prisma.taxCalculation.delete({
    where: { id }
  });

  await createAuditLog({
    userId: actor.id,
    action: "DELETE_TAX_CALCULATION",
    entity: "TaxCalculation",
    entityId: id
  });

  return { success: true };
}

export async function getTaxCalculationSummary(actor: Actor) {
  const calculations = await prisma.taxCalculation.findMany({
    where: buildTaxCalculationWhere(actor),
    select: {
      incomeAmount: true,
      taxRate: true,
      taxAmount: true,
      netAmount: true,
      taxRuleId: true,
      taxRule: {
        select: {
          name: true
        }
      },
      income: {
        select: {
          id: true
        }
      }
    }
  });

  const totalIncomeAmount = calculations.reduce(
    (sum, calculation) => sum.plus(calculation.incomeAmount),
    new Prisma.Decimal(0)
  );
  const totalTaxAmount = calculations.reduce(
    (sum, calculation) => sum.plus(calculation.taxAmount),
    new Prisma.Decimal(0)
  );
  const totalNetAmount = calculations.reduce(
    (sum, calculation) => sum.plus(calculation.netAmount),
    new Prisma.Decimal(0)
  );

  const byRuleMap = new Map<
    string,
    {
      taxRuleId: string;
      taxRuleName: string;
      taxRate: Prisma.Decimal;
      totalTaxAmount: Prisma.Decimal;
      count: number;
    }
  >();

  for (const calculation of calculations) {
    const current = byRuleMap.get(calculation.taxRuleId) ?? {
      taxRuleId: calculation.taxRuleId,
      taxRuleName: calculation.taxRule.name,
      taxRate: calculation.taxRate,
      totalTaxAmount: new Prisma.Decimal(0),
      count: 0
    };

    current.totalTaxAmount = current.totalTaxAmount.plus(calculation.taxAmount);
    current.count += 1;
    byRuleMap.set(calculation.taxRuleId, current);
  }

  return {
    totalIncomeAmount: totalIncomeAmount.toFixed(2),
    totalTaxAmount: totalTaxAmount.toFixed(2),
    totalNetAmount: totalNetAmount.toFixed(2),
    count: calculations.length,
    currency: "KZT",
    byRule: Array.from(byRuleMap.values()).map((item) => ({
      taxRuleId: item.taxRuleId,
      taxRuleName: item.taxRuleName,
      taxRate: item.taxRate.toFixed(2),
      totalTaxAmount: item.totalTaxAmount.toFixed(2),
      count: item.count
    }))
  };
}
