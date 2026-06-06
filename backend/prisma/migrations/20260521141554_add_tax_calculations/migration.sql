/*
  Warnings:

  - Changed the type of `incomeType` on the `TaxRule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "IncomeType" AS ENUM ('SALARY', 'FREELANCE', 'INVESTMENT', 'RENT', 'DIVIDENDS', 'OTHER');

-- DropIndex
DROP INDEX "TaxCalculation_incomeId_key";

-- AlterTable
ALTER TABLE "TaxRule" DROP COLUMN "incomeType",
ADD COLUMN     "incomeType" "IncomeType" NOT NULL;

-- CreateIndex
CREATE INDEX "TaxCalculation_userId_calculatedAt_idx" ON "TaxCalculation"("userId", "calculatedAt");

-- CreateIndex
CREATE INDEX "TaxCalculation_incomeId_idx" ON "TaxCalculation"("incomeId");

-- CreateIndex
CREATE INDEX "TaxRule_incomeType_isActive_idx" ON "TaxRule"("incomeType", "isActive");
