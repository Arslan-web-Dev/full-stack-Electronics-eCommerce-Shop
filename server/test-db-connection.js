require("dotenv").config();

async function testDatabaseConnection() {
  console.log("Testing MongoDB connection through Prisma...\n");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found. Add it to .env or server/.env.");
    process.exit(1);
  }

  const url = new URL(process.env.DATABASE_URL);
  console.log("Connection details:");
  console.log("   Provider: MongoDB");
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Database: ${url.pathname.replace("/", "") || "default"}`);
  console.log("");

  const prisma = require("./utills/db");

  try {
    await prisma.$connect();

    const [users, products, categories, orders, wishlist, notifications] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.category.count(),
        prisma.customer_order.count(),
        prisma.wishlist.count(),
        prisma.notification.count(),
      ]);

    console.log("Connection successful.");
    console.log("Current database records:");
    console.log(`   Users: ${users}`);
    console.log(`   Products: ${products}`);
    console.log(`   Categories: ${categories}`);
    console.log(`   Orders: ${orders}`);
    console.log(`   Wishlist items: ${wishlist}`);
    console.log(`   Notifications: ${notifications}`);
  } catch (error) {
    console.error("Connection failed.");
    console.error(error.message);
    console.log("\nCheck these items:");
    console.log("   1. DATABASE_URL is a valid mongodb+srv:// or mongodb:// URL");
    console.log("   2. MongoDB username and password are correct");
    console.log("   3. Your current IP is allowed in MongoDB Atlas Network Access");
    console.log("   4. Prisma client was generated with npx prisma generate");
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
