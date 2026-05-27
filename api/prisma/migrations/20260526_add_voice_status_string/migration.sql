/*
  Warnings:

  - The `voiceStatus` column on the `Scene` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/

-- AlterTable: convert voiceStatus from VoiceStatus enum to String
ALTER TABLE "Scene" ALTER COLUMN "voiceStatus" TYPE TEXT USING "voiceStatus"::text;

-- Drop the VoiceStatus enum type since we're using String
DROP TYPE "VoiceStatus";