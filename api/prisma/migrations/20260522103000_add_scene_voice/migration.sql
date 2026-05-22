-- AlterTable: add audioUrl and voiceStatus to Scene
ALTER TABLE "Scene" ADD COLUMN "audioUrl" TEXT;

ALTER TABLE "Scene" ADD COLUMN "voiceStatus" TEXT NOT NULL DEFAULT 'PENDING';
