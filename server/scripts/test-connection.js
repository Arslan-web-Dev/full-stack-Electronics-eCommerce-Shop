const prisma = require("../utills/db");

async function testConnection() {
  try {
    console.log("Testing MongoDB connection through Prisma...");

    await prisma.$connect();
    console.log("Database connection successful");

    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      const url = new URL(databaseUrl);
      console.log("Provider: MongoDB");
      console.log(`Host: ${url.hostname}`);
      console.log(`Database: ${url.pathname.replace("/", "") || "default"}`);
    }

    const userCount = await prisma.user.count();
    console.log(`Users in database: ${userCount}`);

    const prisma2 = require("../utills/db");
    console.log(`Shared connection working: ${prisma === prisma2}`);

    await prisma.$disconnect();
    console.log("Test completed successfully");
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exit(1);
  }
}

testConnection();
