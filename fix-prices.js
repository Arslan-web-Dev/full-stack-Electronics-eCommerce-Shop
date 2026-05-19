const { MongoClient } = require('mongodb');
const c = new MongoClient('mongodb://localhost:27017');

async function fixPrices() {
  await c.connect();
  const db = c.db('Electronics-eCommerce-Shop');
  const prods = await db.collection('Product').find().toArray();
  let count = 0;
  for (const p of prods) {
    // Price was stored as cents (e.g. 39999 instead of 399), divide by 100 to get dollars
    const newPrice = Math.round(p.price / 100);
    await db.collection('Product').updateOne(
      { _id: p._id },
      { $set: { price: newPrice } }
    );
    count++;
    console.log(`Fixed: ${p.title} - ${p.price} -> ${newPrice}`);
  }
  console.log(`\nFixed prices for ${count} products`);
  await c.close();
}

fixPrices();
