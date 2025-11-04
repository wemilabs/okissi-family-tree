import { cacheTag } from "next/cache";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import type { FamilyData, Person } from "@/types/family";

async function readFamilyData(): Promise<FamilyData> {
  "use cache";
  cacheTag("family-data");

  // Get all persons from database
  const dbPersons = await db.select().from(schema.persons);

  // Convert database persons to match the Person interface
  const persons: Person[] = dbPersons.map((p) => ({
    id: p.id,
    name: p.name,
    generation: p.generation,
    parentId: p.parentId || undefined,
    children: p.children || [],
    birthRank: p.birthRank || undefined,
    createdAt: p.createdAt.toISOString(),
  }));

  return {
    persons,
    nextId: 0, // Not used anymore
  };
}

export async function getCachedFamilyData(): Promise<FamilyData> {
  return await readFamilyData();
}
