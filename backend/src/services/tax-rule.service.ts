import { Prisma, TaxRuleType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { createAuditLog } from "./audit-log.service";
import type {
  CreateTaxRuleInput,
  UpdateTaxRuleInput
} from "../schemas/tax-rule.schema";

type TaxRuleScope = {
  isCustom: boolean;
  userId?: string | null;
};

type TaxRuleDecimalFields = {
  rate: Prisma.Decimal;
  threshold: Prisma.Decimal | null;
  extraRate: Prisma.Decimal | null;
};

function serializeTaxRule<T extends TaxRuleDecimalFields>(rule: T) {
  return {
    ...rule,
    rate: rule.rate.toFixed(2),
    threshold: rule.threshold ? rule.threshold.toFixed(2) : null,
    extraRate: rule.extraRate ? rule.extraRate.toFixed(2) : null
  };
}

async function assertNoDuplicateActiveRule({
  excludeId,
  incomeType,
  isCustom,
  name,
  userId
}: {
  name: string;
  incomeType: CreateTaxRuleInput["incomeType"];
  isCustom: boolean;
  userId?: string | null;
  excludeId?: string;
}) {
  const existingRule = await prisma.taxRule.findFirst({
    where: {
      name,
      incomeType,
      isActive: true,
      isCustom,
      userId: userId ?? null,
      id: excludeId ? { not: excludeId } : undefined
    }
  });

  if (existingRule) {
    throw new ApiError(
      409,
      "Active tax rule with this name and income type already exists"
    );
  }
}

function normalizeTaxRuleData(
  data: CreateTaxRuleInput | UpdateTaxRuleInput,
  currentRule?: {
    ruleType: TaxRuleType;
    threshold: Prisma.Decimal | null;
    extraRate: Prisma.Decimal | null;
  }
) {
  const nextRuleType = data.ruleType ?? currentRule?.ruleType ?? TaxRuleType.FIXED;
  const nextThreshold =
    data.threshold !== undefined
      ? data.threshold
      : currentRule?.threshold
        ? currentRule.threshold.toString()
        : null;
  const nextExtraRate =
    data.extraRate !== undefined
      ? data.extraRate
      : currentRule?.extraRate
        ? currentRule.extraRate.toString()
        : null;

  if (nextRuleType === TaxRuleType.PROGRESSIVE) {
    if (!nextThreshold) {
      throw new ApiError(400, "Threshold is required for progressive tax rules");
    }

    if (!nextExtraRate) {
      throw new ApiError(400, "Extra rate is required for progressive tax rules");
    }

    return {
      ...data,
      ruleType: nextRuleType,
      threshold: nextThreshold,
      extraRate: nextExtraRate
    };
  }

  return {
    ...data,
    ruleType: nextRuleType,
    threshold: null,
    extraRate: null
  };
}

export async function listTaxRules() {
  const rules = await prisma.taxRule.findMany({
    where: {
      isCustom: false,
      userId: null
    },
    orderBy: [
      { isActive: "desc" },
      { incomeType: "asc" },
      { name: "asc" }
    ]
  });

  return rules.map(serializeTaxRule);
}

export async function getTaxRuleById(id: string) {
  const rule = await prisma.taxRule.findFirst({
    where: {
      id,
      isCustom: false,
      userId: null
    }
  });

  if (!rule) {
    throw new ApiError(404, "Tax rule not found");
  }

  return serializeTaxRule(rule);
}

export async function createTaxRule(data: CreateTaxRuleInput, actorUserId: string) {
  const normalizedData = normalizeTaxRuleData(data);

  if (normalizedData.isActive) {
    await assertNoDuplicateActiveRule({
      name: normalizedData.name!,
      incomeType: normalizedData.incomeType!,
      isCustom: false,
      userId: null
    });
  }

  const rule = await prisma.taxRule.create({
    data: {
      name: data.name,
      rate: data.rate,
      incomeType: data.incomeType,
      ruleType: normalizedData.ruleType,
      threshold: normalizedData.threshold,
      extraRate: normalizedData.extraRate,
      isActive: normalizedData.isActive ?? true,
      isCustom: false,
      userId: null
    }
  });

  await createAuditLog({
    userId: actorUserId,
    action:
      rule.ruleType === TaxRuleType.PROGRESSIVE
        ? "CREATE_SMART_TAX_RULE"
        : "CREATE_TAX_RULE",
    entity: "TaxRule",
    entityId: rule.id
  });

  return serializeTaxRule(rule);
}

export async function updateTaxRule(
  id: string,
  data: UpdateTaxRuleInput,
  actorUserId: string
) {
  const currentRule = await prisma.taxRule.findUnique({
    where: { id }
  });

  if (!currentRule || currentRule.isCustom || currentRule.userId) {
    throw new ApiError(404, "Tax rule not found");
  }

  const normalizedData = normalizeTaxRuleData(data, currentRule);
  const nextName = normalizedData.name ?? currentRule.name;
  const nextIncomeType = normalizedData.incomeType ?? currentRule.incomeType;
  const nextIsActive = normalizedData.isActive ?? currentRule.isActive;

  if (nextIsActive) {
    await assertNoDuplicateActiveRule({
      name: nextName,
      incomeType: nextIncomeType,
      isCustom: false,
      userId: null,
      excludeId: id
    });
  }

  const rule = await prisma.taxRule.update({
    where: { id },
    data: normalizedData
  });

  await createAuditLog({
    userId: actorUserId,
    action:
      rule.ruleType === TaxRuleType.PROGRESSIVE
        ? "UPDATE_SMART_TAX_RULE"
        : "UPDATE_TAX_RULE",
    entity: "TaxRule",
    entityId: rule.id
  });

  return serializeTaxRule(rule);
}

export async function deleteTaxRule(id: string, actorUserId: string) {
  const rule = await prisma.taxRule.findUnique({
    where: { id }
  });

  if (!rule || rule.isCustom || rule.userId) {
    throw new ApiError(404, "Tax rule not found");
  }

  const usedCount = await prisma.taxCalculation.count({
    where: { taxRuleId: id }
  });

  if (usedCount > 0) {
    await prisma.taxRule.update({
      where: { id },
      data: { isActive: false }
    });

    await createAuditLog({
      userId: actorUserId,
      action: "DELETE_TAX_RULE",
      entity: "TaxRule",
      entityId: id
    });

    return { success: true, deactivated: true };
  }

  await prisma.taxRule.delete({
    where: { id }
  });

  await createAuditLog({
    userId: actorUserId,
    action: "DELETE_TAX_RULE",
    entity: "TaxRule",
    entityId: id
  });

  return { success: true, deactivated: false };
}

export async function listMyTaxRules(actorUserId: string) {
  const rules = await prisma.taxRule.findMany({
    where: {
      isCustom: true,
      userId: actorUserId
    },
    orderBy: [
      { isActive: "desc" },
      { incomeType: "asc" },
      { updatedAt: "desc" }
    ]
  });

  return rules.map(serializeTaxRule);
}

export async function createMyTaxRule(
  data: CreateTaxRuleInput,
  actorUserId: string
) {
  const normalizedData = normalizeTaxRuleData(data);

  if (normalizedData.isActive) {
    await assertNoDuplicateActiveRule({
      name: normalizedData.name!,
      incomeType: normalizedData.incomeType!,
      isCustom: true,
      userId: actorUserId
    });
  }

  const rule = await prisma.taxRule.create({
    data: {
      name: data.name,
      rate: data.rate,
      incomeType: data.incomeType,
      ruleType: normalizedData.ruleType,
      threshold: normalizedData.threshold,
      extraRate: normalizedData.extraRate,
      isActive: normalizedData.isActive ?? true,
      isCustom: true,
      userId: actorUserId
    }
  });

  await createAuditLog({
    userId: actorUserId,
    action: "CREATE_CUSTOM_TAX_RULE",
    entity: "TaxRule",
    entityId: rule.id
  });

  return serializeTaxRule(rule);
}

export async function updateMyTaxRule(
  id: string,
  data: UpdateTaxRuleInput,
  actorUserId: string
) {
  const currentRule = await prisma.taxRule.findFirst({
    where: {
      id,
      isCustom: true,
      userId: actorUserId
    }
  });

  if (!currentRule) {
    throw new ApiError(404, "Tax rule not found");
  }

  const normalizedData = normalizeTaxRuleData(data, currentRule);
  const nextName = normalizedData.name ?? currentRule.name;
  const nextIncomeType = normalizedData.incomeType ?? currentRule.incomeType;
  const nextIsActive = normalizedData.isActive ?? currentRule.isActive;

  if (nextIsActive) {
    await assertNoDuplicateActiveRule({
      name: nextName,
      incomeType: nextIncomeType,
      isCustom: true,
      userId: actorUserId,
      excludeId: id
    });
  }

  const rule = await prisma.taxRule.update({
    where: { id },
    data: normalizedData
  });

  await createAuditLog({
    userId: actorUserId,
    action: "UPDATE_CUSTOM_TAX_RULE",
    entity: "TaxRule",
    entityId: rule.id
  });

  return serializeTaxRule(rule);
}

export async function deleteMyTaxRule(id: string, actorUserId: string) {
  const rule = await prisma.taxRule.findFirst({
    where: {
      id,
      isCustom: true,
      userId: actorUserId
    }
  });

  if (!rule) {
    throw new ApiError(404, "Tax rule not found");
  }

  const usedCount = await prisma.taxCalculation.count({
    where: { taxRuleId: id }
  });

  if (usedCount > 0) {
    await prisma.taxRule.update({
      where: { id },
      data: { isActive: false }
    });

    await createAuditLog({
      userId: actorUserId,
      action: "DELETE_CUSTOM_TAX_RULE",
      entity: "TaxRule",
      entityId: id
    });

    return { success: true, deactivated: true };
  }

  await prisma.taxRule.delete({
    where: { id }
  });

  await createAuditLog({
    userId: actorUserId,
    action: "DELETE_CUSTOM_TAX_RULE",
    entity: "TaxRule",
    entityId: id
  });

  return { success: true, deactivated: false };
}
