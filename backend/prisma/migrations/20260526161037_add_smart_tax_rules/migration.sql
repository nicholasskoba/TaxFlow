-- CreateEnum
CREATE TYPE "TaxRuleType" AS ENUM ('FIXED', 'PROGRESSIVE');

-- AlterTable
ALTER TABLE "TaxRule" ADD COLUMN     "extraRate" DECIMAL(5,2),
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ruleType" "TaxRuleType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "threshold" DECIMAL(14,2),
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "TaxRule_userId_incomeType_isActive_idx" ON "TaxRule"("userId", "incomeType", "isActive");

-- AddForeignKey
ALTER TABLE "TaxRule" ADD CONSTRAINT "TaxRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
