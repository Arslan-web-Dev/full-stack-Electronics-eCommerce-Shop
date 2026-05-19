const { MongoClient } = require('mongodb');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const crypto = require('crypto');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    const db = client.db("Electronics-eCommerce-Shop");
    console.log("Connected successfully to server");

    console.log('Reading CSV...');
    const data = fs.readFileSync('product-template-ready.csv');
    const records = parse(data, {columns: false}); 
    // The CSV has: title,price,manufacturer,inStock,mainImage,description,slug,categoryId

    const merchants = db.collection('Merchant');
    const categories = db.collection('Category');
    const products = db.collection('Product');

    let m = await merchants.findOne({ name: 'My Store' });
    if (!m) {
      const merchantId = crypto.randomUUID();
      await merchants.insertOne({
        _id: merchantId,
        name: 'My Store',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      m = { _id: merchantId };
    }

    // Since product-template-ready.csv might not have headers or has specific order:
    // Let's assume order from previous: title, price, manufacturer, inStock, mainImage, description, slug, categoryId
    for (const record of records) {
      if (record[0] === 'title' || record[0] === '') continue; // skip header or empty
      
      const [title, priceStr, manufacturer, inStockStr, mainImage, description, slug, categoryIdOrName] = record;
      
      let cId = categoryIdOrName;
      // If it's not a UUID, let's treat it as a category name
      if (cId && cId.length < 30) {
        let c = await categories.findOne({ name: cId });
        if (!c) {
          const newId = crypto.randomUUID();
          await categories.insertOne({ _id: newId, name: cId });
          cId = newId;
        } else {
          cId = c._id;
        }
      }

      const existing = await products.findOne({ slug: slug });
      const productDoc = {
        title: title,
        slug: slug,
        price: parseInt(parseFloat(priceStr) * 100) || 0, // save as cents or raw? Actually the schema had price Int.
        manufacturer: manufacturer,
        inStock: parseInt(inStockStr) || 0,
        mainImage: mainImage,
        description: description,
        categoryId: cId,
        merchantId: m._id,
        rating: 0
      };

      if (existing) {
        await products.updateOne({ slug: slug }, { $set: productDoc });
      } else {
        productDoc._id = crypto.randomUUID();
        await products.insertOne(productDoc);
      }
      console.log('Imported:', title);
    }
    console.log('Done importing CSV data!');
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
