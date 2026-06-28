import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.creator.deleteMany();
  console.log(`Deleted ${result.count} creator(s) from database.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
