require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });

const { PrismaClient } = require("../../node_modules/@prisma/client");

const prisma = new PrismaClient();

const categories = [
  "electronics",
  "laptops",
  "audio",
  "televisions",
  "cameras",
  "smartphones",
  "tablets",
  "accessories",
];

async function main() {
  for (const name of categories) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (existing) {
      console.log(`exists category ${name}`);
    } else {
      await prisma.category.create({ data: { name } });
      console.log(`created category ${name}`);
    }
  }

  const merchant = await prisma.merchant.findFirst({
    where: { name: "Default Merchant" },
  });

  if (merchant) {
    console.log("exists default merchant");
  } else {
    await prisma.merchant.create({
      data: {
        name: "Default Merchant",
        description: "Default merchant used for CSV bulk imports.",
        status: "ACTIVE",
      },
    });
    console.log("created default merchant");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
