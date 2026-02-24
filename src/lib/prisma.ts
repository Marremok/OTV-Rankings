import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
  }).$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

/**
 * Retry wrapper for Prisma queries that may fail due to transient
 * Accelerate connection issues (cold starts, socket drops, P6000/P6008, ETIMEDOUT).
 * Only retries on transient errors, not on validation/auth errors.
 */
const TRANSIENT_PATTERNS = ["fetch failed", "UND_ERR_SOCKET", "other side closed", "ETIMEDOUT"];
// P6000 = Accelerate ServerError (can't reach query engine)
// P6008 = Accelerate ConnectionError (refused / timeout)
const RETRYABLE_P6_CODES = ["P6000", "P6008"];

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message + (error.cause instanceof Error ? " " + error.cause.message : "")
          : String(error);

      const isPrismaAccelerate = RETRYABLE_P6_CODES.includes((error as { code?: string })?.code ?? "");
      const isTransient = isPrismaAccelerate || TRANSIENT_PATTERNS.some((p) => message.includes(p));

      if (!isTransient || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter to avoid thundering herd
      const baseDelay = 200 * Math.pow(2, attempt); // 200, 400, 800
      const jitter = Math.random() * baseDelay * 0.5;
      await new Promise((r) => setTimeout(r, baseDelay + jitter));
    }
  }
  throw new Error("withRetry: unreachable");
}
