require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });

const { PrismaClient } = require("../../node_modules/@prisma/client");
const useAdmin = process.argv[2] === "init-rs";
const adminUrl = process.env.DATABASE_URL
  ?.replace(/\/[^/?]*(\?|$)/, "/admin$1")
  .replace(/[?&]replicaSet=[^&]+/, "")
  .replace(/[?&]directConnection=false/, "")
  .replace(/\?&/, "?")
  .replace(/\?$/, "");
const prisma = new PrismaClient(
  useAdmin && adminUrl
    ? { datasources: { db: { url: adminUrl } } }
    : undefined
);

async function main() {
  const command = process.argv[2] === "init-rs"
    ? { replSetInitiate: { _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] } }
    : { hello: 1 };
  const result = await prisma.$runCommandRaw(command);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
