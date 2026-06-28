import { getDb } from "../src/lib/mongodb";

async function main() {
  const db = await getDb();
  const count = await db.collection("Creator").countDocuments();
  console.log("Connected! Creators in DB:", count);
}

main().catch((e) => {
  console.error("Connection failed:", e.message);
  process.exit(1);
});
