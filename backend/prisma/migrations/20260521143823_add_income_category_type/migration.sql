-- AlterTable
ALTER TABLE "IncomeCategory" ADD COLUMN     "incomeType" "IncomeType" NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "IncomeCategory_incomeType_idx" ON "IncomeCategory"("incomeType");
