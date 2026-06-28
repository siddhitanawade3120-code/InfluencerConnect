import { PrismaClient } from "@prisma/client";
import { dbToCreator } from "../src/lib/creator-mapper";
import { filterCreators, DEFAULT_FILTERS } from "../src/lib/types";

const prisma = new PrismaClient();

async function main() {
  const creators = (await prisma.creator.findMany()).map(dbToCreator);
  console.log("In DB:", creators.length);

  const scenarios: Record<string, typeof DEFAULT_FILTERS> = {
    default: DEFAULT_FILTERS,
    "budget max 2000": { ...DEFAULT_FILTERS, budgetMax: 2000 },
    "nano unchecked": { ...DEFAULT_FILTERS, followerTiers: ["micro"] },
    "niche Desserts only": { ...DEFAULT_FILTERS, niches: ["Desserts"] },
    "area Virar only": { ...DEFAULT_FILTERS, area: "Virar" },
  };

  for (const [name, filters] of Object.entries(scenarios)) {
    const n = filterCreators(creators, filters).length;
    console.log(`${name}: ${n} match`);
  }
}

main().finally(() => prisma.$disconnect());
