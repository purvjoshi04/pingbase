-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "checkInterval" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "nextCheckAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Website_nextCheckAt_idx" ON "Website"("nextCheckAt");
