import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const clientOptions = {
  adapter: new PrismaPg(process.env.DATABASE_URL ?? ""),
};

const prisma = globalThis.prisma ?? new PrismaClient(clientOptions);

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
