import { Prisma, TaxRuleType } from "@prisma/client";

type DecimalInput = Prisma.Decimal | string | number;

type CalculateTaxAmountParams = {
  incomeAmount: DecimalInput;
  ruleType: TaxRuleType;
  rate: DecimalInput;
  threshold?: DecimalInput | null;
  extraRate?: DecimalInput | null;
};

function toDecimal(value: DecimalInput) {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

export function calculateTaxAmount({
  extraRate,
  incomeAmount,
  rate,
  ruleType,
  threshold
}: CalculateTaxAmountParams) {
  const income = toDecimal(incomeAmount);
  const baseRate = toDecimal(rate);

  if (ruleType === TaxRuleType.PROGRESSIVE) {
    if (threshold === undefined || threshold === null) {
      throw new Error("Progressive tax rule requires threshold");
    }

    if (extraRate === undefined || extraRate === null) {
      throw new Error("Progressive tax rule requires extraRate");
    }

    const thresholdAmount = toDecimal(threshold);
    const progressiveRate = toDecimal(extraRate);

    if (income.lte(thresholdAmount)) {
      const taxAmount = income.mul(baseRate).div(100);

      return {
        taxAmount,
        netAmount: income.minus(taxAmount),
        appliedRateLabel: `${baseRate.toFixed(2)}%`,
        baseTaxAmount: taxAmount,
        extraTaxAmount: new Prisma.Decimal(0),
        threshold: thresholdAmount,
        extraRate: progressiveRate
      };
    }

    const baseTaxAmount = thresholdAmount.mul(baseRate).div(100);
    const extraTaxAmount = income.minus(thresholdAmount).mul(progressiveRate).div(100);
    const taxAmount = baseTaxAmount.plus(extraTaxAmount);

    return {
      taxAmount,
      netAmount: income.minus(taxAmount),
      appliedRateLabel: `${baseRate.toFixed(2)}% / ${progressiveRate.toFixed(2)}%`,
      baseTaxAmount,
      extraTaxAmount,
      threshold: thresholdAmount,
      extraRate: progressiveRate
    };
  }

  const taxAmount = income.mul(baseRate).div(100);

  return {
    taxAmount,
    netAmount: income.minus(taxAmount),
    appliedRateLabel: `${baseRate.toFixed(2)}%`,
    baseTaxAmount: taxAmount,
    extraTaxAmount: new Prisma.Decimal(0),
    threshold: null,
    extraRate: null
  };
}
