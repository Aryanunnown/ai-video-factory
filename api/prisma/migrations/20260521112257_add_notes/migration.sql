/*
  Warnings:

  - Added the required column `orderNo` to the `Scene` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Scene" ADD COLUMN     "orderNo" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "VideoJob" ADD COLUMN     "notes" TEXT;
