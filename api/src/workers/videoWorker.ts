import prisma from "../lib/prisma";

export const processVideoJob = async (jobId: string): Promise<void> => {
  const job = await prisma.videoJob.findUnique({ where: { id: jobId } });

  if (!job) {
    throw new Error(`Video job not found: ${jobId}`);
  }

  // TODO: add worker logic for processing video jobs
  console.log(`Processing job ${jobId} with status ${job.status}`);
};
