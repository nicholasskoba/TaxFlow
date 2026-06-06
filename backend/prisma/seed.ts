import bcrypt from "bcrypt";
import {
  IncomeType,
  Prisma,
  PrismaClient,
  TaxRuleType,
  UserRole
} from "@prisma/client";
import { calculateTaxAmount } from "../src/utils/tax-calculator";

const prisma = new PrismaClient();
const PASSWORD_SALT_ROUNDS = 10;

type CategorySeed = {
  name: string;
  description: string;
  incomeType: IncomeType;
  legacyNames?: string[];
};

type TaxRuleSeed = {
  name: string;
  rate: string;
  incomeType: IncomeType;
  ruleType: TaxRuleType;
  threshold?: string | null;
  extraRate?: string | null;
  legacyNames?: string[];
};

async function upsertUser({
  email,
  password,
  fullName,
  role
}: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}) {
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  return prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      fullName,
      role
    },
    create: {
      email,
      passwordHash,
      fullName,
      role
    }
  });
}

async function upsertIncomeCategory(category: CategorySeed) {
  const existingByName = await prisma.incomeCategory.findUnique({
    where: { name: category.name }
  });

  if (existingByName) {
    return prisma.incomeCategory.update({
      where: { id: existingByName.id },
      data: {
        description: category.description,
        incomeType: category.incomeType
      }
    });
  }

  const legacyCategory = category.legacyNames?.length
    ? await prisma.incomeCategory.findFirst({
        where: { name: { in: category.legacyNames } }
      })
    : null;

  if (legacyCategory) {
    return prisma.incomeCategory.update({
      where: { id: legacyCategory.id },
      data: {
        name: category.name,
        description: category.description,
        incomeType: category.incomeType
      }
    });
  }

  return prisma.incomeCategory.create({
    data: {
      name: category.name,
      description: category.description,
      incomeType: category.incomeType
    }
  });
}

async function upsertTaxRule(taxRule: TaxRuleSeed) {
  const ruleData = {
    name: taxRule.name,
    rate: taxRule.rate,
    incomeType: taxRule.incomeType,
    ruleType: taxRule.ruleType,
    threshold: taxRule.ruleType === TaxRuleType.PROGRESSIVE ? taxRule.threshold : null,
    extraRate: taxRule.ruleType === TaxRuleType.PROGRESSIVE ? taxRule.extraRate : null,
    isCustom: false,
    userId: null,
    isActive: true
  };

  const existingByName = await prisma.taxRule.findFirst({
    where: {
      name: taxRule.name,
      incomeType: taxRule.incomeType,
      isCustom: false,
      userId: null
    }
  });

  let savedRule;

  if (existingByName) {
    savedRule = await prisma.taxRule.update({
      where: { id: existingByName.id },
      data: ruleData
    });
  } else {
    const legacyRule = taxRule.legacyNames?.length
      ? await prisma.taxRule.findFirst({
          where: {
            name: { in: taxRule.legacyNames },
            isCustom: false,
            userId: null
          }
        })
      : null;

    if (legacyRule) {
      savedRule = await prisma.taxRule.update({
        where: { id: legacyRule.id },
        data: ruleData
      });
    } else {
      const existingByType = await prisma.taxRule.findFirst({
        where: {
          incomeType: taxRule.incomeType,
          isCustom: false,
          userId: null
        },
        orderBy: { createdAt: "asc" }
      });

      if (existingByType) {
        savedRule = await prisma.taxRule.update({
          where: { id: existingByType.id },
          data: ruleData
        });
      } else {
        savedRule = await prisma.taxRule.create({
          data: ruleData
        });
      }
    }
  }

  await prisma.taxRule.updateMany({
    where: {
      incomeType: taxRule.incomeType,
      isCustom: false,
      userId: null,
      isActive: true,
      id: { not: savedRule.id }
    },
    data: {
      isActive: false
    }
  });

  return savedRule;
}

async function main() {
  await upsertUser({
    email: "admin@banktax.local",
    password: "admin123",
    fullName: "System Administrator",
    role: UserRole.ADMIN
  });

  const demoUser = await upsertUser({
    email: "user@banktax.local",
    password: "user123",
    fullName: "Demo User",
    role: UserRole.USER
  });

  const categories: CategorySeed[] = [
    {
      name: "Заработная плата",
      description: "Регулярный доход по трудовому договору",
      incomeType: IncomeType.SALARY,
      legacyNames: ["Р—Р°СЂР°Р±РѕС‚РЅР°СЏ РїР»Р°С‚Р°"]
    },
    {
      name: "Премия",
      description: "Дополнительная выплата от работодателя",
      incomeType: IncomeType.SALARY
    },
    {
      name: "Бонус от работодателя",
      description: "Разовая мотивационная выплата от работодателя",
      incomeType: IncomeType.SALARY
    },
    {
      name: "Фриланс",
      description: "Доходы от самостоятельной проектной работы",
      incomeType: IncomeType.FREELANCE,
      legacyNames: ["Р¤СЂРёР»Р°РЅСЃ"]
    },
    {
      name: "Разовая услуга",
      description: "Доход за отдельную услугу или поручение",
      incomeType: IncomeType.FREELANCE
    },
    {
      name: "Проектная работа",
      description: "Доход за выполненный проект",
      incomeType: IncomeType.FREELANCE
    },
    {
      name: "Аренда недвижимости",
      description: "Поступления от сдачи жилой недвижимости",
      incomeType: IncomeType.RENT,
      legacyNames: ["РђСЂРµРЅРґР°"]
    },
    {
      name: "Аренда коммерческого помещения",
      description: "Поступления от сдачи коммерческого помещения",
      incomeType: IncomeType.RENT
    },
    {
      name: "Дивиденды",
      description: "Доходы от дивидендных выплат",
      incomeType: IncomeType.DIVIDENDS,
      legacyNames: ["Р”РёРІРёРґРµРЅРґС‹"]
    },
    {
      name: "Инвестиционный доход",
      description: "Доходы от инвестиционной деятельности",
      incomeType: IncomeType.INVESTMENT,
      legacyNames: ["РРЅРІРµСЃС‚РёС†РёРё"]
    },
    {
      name: "Доход от ценных бумаг",
      description: "Доходы по операциям с ценными бумагами",
      incomeType: IncomeType.INVESTMENT
    },
    {
      name: "Частная практика",
      description: "Доходы лиц частной практики",
      incomeType: IncomeType.PRIVATE_PRACTICE
    },
    {
      name: "Консультационные услуги",
      description: "Доходы от профессиональных консультаций",
      incomeType: IncomeType.PRIVATE_PRACTICE
    },
    {
      name: "Роялти",
      description: "Платежи за использование интеллектуальной собственности",
      incomeType: IncomeType.ROYALTY
    },
    {
      name: "Авторское вознаграждение",
      description: "Вознаграждение за авторские и смежные права",
      incomeType: IncomeType.ROYALTY
    },
    {
      name: "Продажа имущества",
      description: "Доход от реализации имущества",
      incomeType: IncomeType.SALE_PROPERTY
    },
    {
      name: "Продажа автомобиля",
      description: "Доход от реализации транспортного средства",
      incomeType: IncomeType.SALE_PROPERTY
    },
    {
      name: "Прочие доходы",
      description: "Доходы, не вошедшие в другие категории",
      incomeType: IncomeType.OTHER,
      legacyNames: ["РџСЂРѕС‡РёРµ РґРѕС…РѕРґС‹"]
    },
    {
      name: "Подарки и разовые поступления",
      description: "Нерегулярные поступления и подарки",
      incomeType: IncomeType.OTHER
    }
  ];

  const createdCategories = new Map<string, { id: string; incomeType: IncomeType }>();

  for (const category of categories) {
    const savedCategory = await upsertIncomeCategory(category);
    createdCategories.set(category.name, savedCategory);
  }

  const demoIncomes = [
    {
      categoryName: "Заработная плата",
      amount: "450000.00",
      currency: "KZT",
      receivedAt: new Date("2026-05-05T00:00:00.000Z"),
      description: "Зарплата за май"
    },
    {
      categoryName: "Фриланс",
      amount: "120000.00",
      currency: "KZT",
      receivedAt: new Date("2026-05-12T00:00:00.000Z"),
      description: "Фриланс проект для клиента"
    },
    {
      categoryName: "Инвестиционный доход",
      amount: "85000.00",
      currency: "KZT",
      receivedAt: new Date("2026-05-18T00:00:00.000Z"),
      description: "Доход от инвестиций"
    },
    {
      categoryName: "Частная практика",
      amount: "200000.00",
      currency: "KZT",
      receivedAt: new Date("2026-05-21T00:00:00.000Z"),
      description: "Консультации по частной практике"
    },
    {
      categoryName: "Дивиденды",
      amount: "75000.00",
      currency: "KZT",
      receivedAt: new Date("2026-05-24T00:00:00.000Z"),
      description: "Дивидендная выплата"
    }
  ];

  const savedIncomes = [];

  for (const income of demoIncomes) {
    const category = createdCategories.get(income.categoryName);

    if (!category) {
      continue;
    }

    const existingIncome = await prisma.income.findFirst({
      where: {
        userId: demoUser.id,
        categoryId: category.id,
        amount: income.amount,
        currency: income.currency,
        receivedAt: income.receivedAt,
        description: income.description
      }
    });

    if (existingIncome) {
      savedIncomes.push(existingIncome);
      continue;
    }

    const createdIncome = await prisma.income.create({
      data: {
        userId: demoUser.id,
        categoryId: category.id,
        amount: income.amount,
        currency: "KZT",
        receivedAt: income.receivedAt,
        description: income.description
      }
    });

    savedIncomes.push(createdIncome);
  }

  const taxRules: TaxRuleSeed[] = [
    {
      name: "ИПН с заработной платы",
      incomeType: IncomeType.SALARY,
      rate: "10.00",
      ruleType: TaxRuleType.PROGRESSIVE,
      threshold: "36762500.00",
      extraRate: "15.00",
      legacyNames: ["РРЅРґРёРІРёРґСѓР°Р»СЊРЅС‹Р№ РїРѕРґРѕС…РѕРґРЅС‹Р№ РЅР°Р»РѕРі"]
    },
    {
      name: "ИПН с фриланс-дохода",
      incomeType: IncomeType.FREELANCE,
      rate: "10.00",
      ruleType: TaxRuleType.PROGRESSIVE,
      threshold: "36762500.00",
      extraRate: "15.00",
      legacyNames: ["РќР°Р»РѕРі РґР»СЏ С„СЂРёР»Р°РЅСЃ-РґРѕС…РѕРґР°"]
    },
    {
      name: "ИПН с дохода от аренды",
      incomeType: IncomeType.RENT,
      rate: "10.00",
      ruleType: TaxRuleType.FIXED,
      legacyNames: ["РќР°Р»РѕРі РЅР° РґРѕС…РѕРґ РѕС‚ Р°СЂРµРЅРґС‹"]
    },
    {
      name: "Налог на дивиденды",
      incomeType: IncomeType.DIVIDENDS,
      rate: "5.00",
      ruleType: TaxRuleType.PROGRESSIVE,
      threshold: "994750000.00",
      extraRate: "15.00",
      legacyNames: ["РќР°Р»РѕРі РЅР° РґРёРІРёРґРµРЅРґС‹"]
    },
    {
      name: "Налог на инвестиционный доход",
      incomeType: IncomeType.INVESTMENT,
      rate: "10.00",
      ruleType: TaxRuleType.FIXED,
      legacyNames: ["РќР°Р»РѕРі РЅР° РёРЅРІРµСЃС‚РёС†РёРѕРЅРЅС‹Р№ РґРѕС…РѕРґ"]
    },
    {
      name: "Доходы частной практики",
      incomeType: IncomeType.PRIVATE_PRACTICE,
      rate: "9.00",
      ruleType: TaxRuleType.FIXED
    },
    {
      name: "Налог с роялти",
      incomeType: IncomeType.ROYALTY,
      rate: "10.00",
      ruleType: TaxRuleType.FIXED
    },
    {
      name: "Доход от продажи имущества",
      incomeType: IncomeType.SALE_PROPERTY,
      rate: "10.00",
      ruleType: TaxRuleType.FIXED
    },
    {
      name: "Прочие доходы",
      incomeType: IncomeType.OTHER,
      rate: "10.00",
      ruleType: TaxRuleType.FIXED,
      legacyNames: ["РџСЂРѕС‡РёРµ РґРѕС…РѕРґС‹"]
    }
  ];

  const createdTaxRules = new Map<
    IncomeType,
    {
      id: string;
      rate: Prisma.Decimal;
      ruleType: TaxRuleType;
      threshold: Prisma.Decimal | null;
      extraRate: Prisma.Decimal | null;
    }
  >();

  for (const taxRule of taxRules) {
    const savedTaxRule = await upsertTaxRule(taxRule);
    createdTaxRules.set(taxRule.incomeType, savedTaxRule);
  }

  for (const income of savedIncomes) {
    const category = await prisma.incomeCategory.findUnique({
      where: { id: income.categoryId }
    });

    if (!category) {
      continue;
    }

    const taxRule = createdTaxRules.get(category.incomeType);

    if (!taxRule) {
      continue;
    }

    const amounts = calculateTaxAmount({
      incomeAmount: income.amount,
      ruleType: taxRule.ruleType,
      rate: taxRule.rate,
      threshold: taxRule.threshold,
      extraRate: taxRule.extraRate
    });

    const existingCalculation = await prisma.taxCalculation.findFirst({
      where: {
        userId: demoUser.id,
        incomeId: income.id,
        taxRuleId: taxRule.id,
        incomeAmount: income.amount,
        taxRate: taxRule.rate
      }
    });

    if (!existingCalculation) {
      await prisma.taxCalculation.create({
        data: {
          userId: demoUser.id,
          incomeId: income.id,
          taxRuleId: taxRule.id,
          incomeAmount: income.amount,
          taxRate: taxRule.rate,
          taxAmount: amounts.taxAmount,
          netAmount: amounts.netAmount
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
