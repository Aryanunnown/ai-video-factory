-- CreateTable
CREATE TABLE "VideoJob" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scriptJson" JSONB,
    "audioUrl" TEXT,
    "finalVideo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "visual" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "VideoJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
