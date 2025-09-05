/*
  Warnings:

  - A unique constraint covering the columns `[aadharNumber]` on the table `PatientProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PatientProfile" ADD COLUMN     "aadharNumber" TEXT,
ALTER COLUMN "abhaNumber" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_aadharNumber_key" ON "PatientProfile"("aadharNumber");

-- CreateIndex
CREATE INDEX "PatientProfile_aadharNumber_idx" ON "PatientProfile"("aadharNumber");
