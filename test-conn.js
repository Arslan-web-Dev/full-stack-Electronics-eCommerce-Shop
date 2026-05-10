const { PrismaClient } = require('@prisma/client');
async function test() {
  const prisma = new PrismaClient({datasources:{db:{url:'mongodb://localhost:27017/Electronics-eCommerce-Shop?directConnection=true'}}});
  try {
    await prisma.$connect();
    console.log('Connected to 27017!');
  } catch (e) {
    console.log('27017 failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
