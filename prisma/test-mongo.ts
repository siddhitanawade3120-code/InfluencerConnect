import { withMongo } from "../src/lib/mongodb";

async function main() {
  const count = await withMongo((db) => db.collection("Creator").countDocuments());
  console.log("Connected! Creators in DB:", count);
}

main().catch((e) => {
  console.error("Connection failed:", e.message);
  process.exit(1);
});
