const { MongoClient } = require('mongodb');
require('dotenv').config();

const LOCAL_URI = "mongodb://localhost:27017";
const REMOTE_URI = process.env.DATABASE_URL;

async function migrate() {
  if (REMOTE_URI.includes('<your_password>')) {
    console.error("❌ ERROR: Please update your password in the .env file first!");
    return;
  }

  const localClient = new MongoClient(LOCAL_URI);
  const remoteClient = new MongoClient(REMOTE_URI);

  try {
    console.log("⏳ Connecting to Local and Atlas...");
    await localClient.connect();
    await remoteClient.connect();
    console.log("✅ Connected to both!");

    const localDb = localClient.db("Electronics-eCommerce-Shop");
    const remoteDb = remoteClient.db("Electronics-eCommerce-Shop");

    const collections = ["Product", "Category", "Merchant"];

    for (const colName of collections) {
      console.log(`\n📦 Migrating collection: ${colName}...`);
      const data = await localDb.collection(colName).find().toArray();
      
      if (data.length > 0) {
        // Clear remote collection first to avoid duplicates
        await remoteDb.collection(colName).deleteMany({});
        // Insert data
        const result = await remoteDb.collection(colName).insertMany(data);
        console.log(`✅ Successfully moved ${result.insertedCount} items to Atlas!`);
      } else {
        console.log(`⚠️ Collection ${colName} is empty locally.`);
      }
    }

    console.log("\n🚀 ALL DATA MIGRATED SUCCESSFULLY TO CLOUD!");
    console.log("Ab aap Vercel par dekh sakenge (API move karne ke baad).");

  } catch (err) {
    console.error("❌ MIGRATION FAILED:", err.message);
  } finally {
    await localClient.close();
    await remoteClient.close();
  }
}

migrate();
