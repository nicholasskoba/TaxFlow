import { Prisma } from "@prisma/client";

export const zeroDecimal = new Prisma.Decimal(0);

export function toDecimal(value: Prisma.Decimal.Value = 0) {
  return new Prisma.Decimal(value);
}

export function decimalToString(value: Prisma.Decimal.Value) {
  return new Prisma.Decimal(value).toFixed(2);
}

export function addDecimalValues(values: Prisma.Decimal.Value[]) {
  return values.reduce<Prisma.Decimal>(
    (sum, value) => sum.plus(value),
    new Prisma.Decimal(0)
  );
}
