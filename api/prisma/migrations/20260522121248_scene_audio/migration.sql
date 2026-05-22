/*
  Warnings:

  - The `voiceStatus` column on the `Scene` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VoiceStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- AlterTable
ALTER TABLE "Scene" DROP COLUMN "voiceStatus",
ADD COLUMN     "voiceStatus" "VoiceStatus" NOT NULL DEFAULT 'PENDING';
