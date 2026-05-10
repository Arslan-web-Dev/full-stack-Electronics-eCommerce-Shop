const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();

async function run() {
  console.log('Reading CSV...');
  const data = fs.readFileSync('product-template-ready.csv');
  const records = parse(data, {columns: true});

  let m = await prisma.merchant.findFirst();
  if(!m) m = await prisma.merchant.create({data:{name:'My Store'}});

  for(const r of records) {
    let c = await prisma.category.findUnique({where:{name:r.categoryId}});
    if(!c) c = await prisma.category.create({data:{name:r.categoryId}});

    await prisma.product.upsert({
      where: {slug: r.slug},
      update: {
        title: r.title,
        price: parseInt(parseFloat(r.price)),
        manufacturer: r.manufacturer,
        inStock: parseInt(r.inStock)||0,
        mainImage: r.mainImage,
        description: r.description,
        categoryId: c.id,
        merchantId: m.id
      },
      create: {
        title: r.title,
        slug: r.slug,
        price: parseInt(parseFloat(r.price)),
        manufacturer: r.manufacturer,
        inStock: parseInt(r.inStock)||0,
        mainImage: r.mainImage,
        description: r.description,
        categoryId: c.id,
        merchantId: m.id
      }
    });
    console.log('Imported:', r.title);
  }
  console.log('Done!');
}
run().finally(() => prisma.$disconnect());
