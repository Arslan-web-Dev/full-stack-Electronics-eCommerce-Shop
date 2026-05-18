const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedMerchant() {
  try {
    console.log("🔍 Checking for existing merchants...\n");
    const count = await prisma.merchant.count();

    if (count > 0) {
      console.log(`✅ Database already has ${count} merchant(s). No seeding needed.`);
      return;
    }

    console.log("🌱 Seeding a default merchant...");
    const defaultMerchant = await prisma.merchant.create({
      data: {
        name: "Arslan Electronics Karachi Hub",
        description: "Primary logistics and distribution center for Arslan Electronics in Karachi, Pakistan.",
        email: "karachi-hub@arslanelectronics.com",
        phone: "+92 327 5541708",
        address: "Karachi Industrial Zone, Sector 15, Karachi, Pakistan",
        status: "ACTIVE"
      }
    });

    console.log("🎉 Success! Default merchant created:");
    console.log("─".repeat(50));
    console.log(`  ID:          ${defaultMerchant.id}`);
    console.log(`  Name:        ${defaultMerchant.name}`);
    console.log(`  Location:    ${defaultMerchant.address}`);
    console.log("─".repeat(50));
  } catch (error) {
    console.error("❌ Error seeding merchant:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedMerchant();
