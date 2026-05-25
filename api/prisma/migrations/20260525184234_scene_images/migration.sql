-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- AlterTable
ALTER TABLE "Scene" ADD COLUMN     "imageStatus" "ImageStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "imageUrl" TEXT;
