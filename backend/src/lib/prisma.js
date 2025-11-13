import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

const globalForPrisma = globalThis;

if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"]
  });
}

export const prisma = globalForPrisma.__prisma;
