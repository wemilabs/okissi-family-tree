import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import type { FamilyData, FamilyTreeNode, Person } from "@/types/family";

export const FAMILY_DATA_TAG = "family-data";

export async function getFamilyData(): Promise<FamilyData> {
  "use cache";
  cacheTag(FAMILY_DATA_TAG);
  cacheLife("max");

  const dbPersons = await db.select().from(schema.persons);

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
    nextId: 0,
  };
}

export async function buildFamilyTree(): Promise<FamilyTreeNode[]> {
  "use cache";
  cacheTag(FAMILY_DATA_TAG);
  cacheLife("max");

  const { persons } = await getFamilyData();
  const personMap = new Map<string, FamilyTreeNode>();

  persons.forEach((person) => {
    personMap.set(person.id, { ...person, childrenNodes: [] });
  });

  const roots: FamilyTreeNode[] = [];

  personMap.forEach((node) => {
    if (node.parentId) {
      const parent = personMap.get(node.parentId);
      if (parent) {
        parent.childrenNodes.push(node);
        // Sort children by birth rank
        parent.childrenNodes.sort(
          (a, b) => (a.birthRank || 0) - (b.birthRank || 0),
        );
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
