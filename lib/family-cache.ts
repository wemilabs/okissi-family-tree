import { cacheTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { initialFamilyData, initialNextId, schema } from "@/db/schema";
import type { FamilyData, Person } from "@/types/family";

export async function seedInitialData() {
  // Check if data already exists
  const existingPersons = await db.select().from(schema.persons).limit(1);
  if (existingPersons.length > 0) return; // Already seeded

  console.log("Seeding initial family data...");

  // Insert persons
  for (const person of initialFamilyData) {
    await db.insert(schema.persons).values({
      id: person.id,
      name: person.name,
      generation: person.generation,
      parentId: person.parentId,
      children: person.children,
      birthRank: person.birthRank,
      createdAt: person.createdAt,
    });
  }

  // Set initial next_id
  await db.insert(schema.metadata).values({
    key: "next_id",
    value: initialNextId,
  });

  console.log("Initial data seeded successfully!");
}

async function readFamilyData(): Promise<FamilyData> {
  "use cache";
  const persons = await db.select().from(schema.persons);
  const nextIdResult = await db
    .select()
    .from(schema.metadata)
    .where(eq(schema.metadata.key, "next_id"))
    .limit(1);

  const nextId = nextIdResult[0]?.value ?? 1;

  // Convert database persons to match the original Person interface
  const convertedPersons: Person[] = persons.map((p) => ({
    id: p.id,
    name: p.name,
    generation: p.generation,
    parentId: p.parentId || undefined,
    children: p.children || [],
    birthRank: p.birthRank || undefined,
    createdAt: p.createdAt.toISOString(),
  }));

  return {
    persons: convertedPersons,
    nextId,
  };
}

export async function getCachedFamilyData(): Promise<FamilyData> {
  cacheTag("family-data");
  return await readFamilyData();
}
