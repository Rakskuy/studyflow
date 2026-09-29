import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const NEON_DEFAULT_URL =
  "postgresql://neondb_owner:npg_VtiXQx6ISL5q@ep-billowing-hat-b3houm00-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const dbUrl =
  (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "" ? process.env.DATABASE_URL : null) ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  NEON_DEFAULT_URL;

process.env.DATABASE_URL = dbUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
