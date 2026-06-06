import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function formatNullable(value: unknown) {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

async function main() {
  const [taxRules, categories] = await Promise.all([
    prisma.taxRule.findMany({
      orderBy: [
        { incomeType: "asc" },
        { isCustom: "asc" },
        { isActive: "desc" },
        { updatedAt: "desc" }
      ],
      select: {
        id: true,
        name: true,
        incomeType: true,
        ruleType: true,
        rate: true,
        threshold: true,
        extraRate: true,
        isActive: true,
        isCustom: true,
        userId: true,
        updatedAt: true
      }
    }),
    prisma.incomeCategory.findMany({
      orderBy: [{ incomeType: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        incomeType: true
      }
    })
  ]);

  console.log("Tax rules:");
  console.table(
    taxRules.map((rule) => ({
      name: rule.name,
      incomeType: rule.incomeType,
      ruleType: rule.ruleType,
      rate: rule.rate.toString(),
      threshold: formatNullable(rule.threshold?.toString()),
      extraRate: formatNullable(rule.extraRate?.toString()),
      isActive: rule.isActive,
      isCustom: rule.isCustom,
      userId: formatNullable(rule.userId)
    }))
  );

  const activeGlobalRulesByType = new Map<string, number>();

  for (const rule of taxRules) {
    if (!rule.isActive || rule.isCustom || rule.userId) {
      continue;
    }

    activeGlobalRulesByType.set(
      rule.incomeType,
      (activeGlobalRulesByType.get(rule.incomeType) ?? 0) + 1
    );
  }

  const activeGlobalDuplicates = Array.from(activeGlobalRulesByType.entries())
    .filter(([, count]) => count > 1)
    .map(([incomeType, count]) => `${incomeType}: ${count}`);

  console.log("\nActive global rule duplicates:");
  console.log(activeGlobalDuplicates.length ? activeGlobalDuplicates.join("\n") : "none");

  console.log("\nIncome categories:");
  console.table(
    categories.map((category) => ({
      name: category.name,
      incomeType: category.incomeType
    }))
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
