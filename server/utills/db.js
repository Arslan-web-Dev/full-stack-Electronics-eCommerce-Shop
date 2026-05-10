// Prefer the root-level Prisma Client (generated from ../prisma/schema.prisma),
// which includes bulk upload models. Fallback to local if not available.
let PrismaClient;
try {
  // When running server/* scripts, this resolves to project root node_modules.
  ({ PrismaClient } = require("../../node_modules/@prisma/client"));
} catch (e) {
  ({ PrismaClient } = require("@prisma/client"));
}

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const databaseUrl = process.env.DATABASE_URL;
  let url;
  try {
    url = new URL(databaseUrl);
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Database connection: ${url.protocol}//${url.hostname}/${url.pathname.replace("/", "") || "default"}`
      );
      console.log("Database provider: MongoDB via Prisma");
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.log("Database connection: Custom format (multi-host)");
    }
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error", "warn"],
  });
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

module.exports = prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
