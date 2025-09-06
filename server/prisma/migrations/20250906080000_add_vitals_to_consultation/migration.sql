-- FILE: server/prisma/migrations/20250906080000_add_vitals_to_consultation/migration.sql

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN "vitals" JSONB;