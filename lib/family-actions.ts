"use server";

import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import type {
  AddPersonForm,
  FamilyData,
  FamilyTreeNode,
  Person,
} from "@/types/family";
import { getCachedFamilyData } from "./family-cache";

export async function getFamilyData(): Promise<FamilyData> {
  return await getCachedFamilyData();
}

export async function getOccupiedBirthRanks(
  parentId: string
): Promise<number[]> {
  const data = await getFamilyData();
  const siblings = data.persons.filter((p) => p.parentId === parentId);
  return siblings
    .map((sibling) => sibling.birthRank)
    .filter((rank) => rank !== undefined) as number[];
}

export async function getNextBirthRank(parentId: string): Promise<number> {
  const data = await getFamilyData();
  const siblings = data.persons.filter((p) => p.parentId === parentId);
  return siblings.length + 1;
}

export async function addPerson(formData: AddPersonForm): Promise<Person> {
  // Check if birth rank is already occupied
  const existingSiblings = await db
    .select()
    .from(schema.persons)
    .where(eq(schema.persons.parentId, formData.parentId));

  const isRankOccupied = existingSiblings.some(
    (sibling) => sibling.birthRank === formData.birthRank
  );

  if (isRankOccupied) {
    throw new Error(
      `Birth rank ${formData.birthRank} is already occupied for this parent`
    );
  }

  // Get next ID
  const nextIdResult = await db
    .select()
    .from(schema.metadata)
    .where(eq(schema.metadata.key, "next_id"))
    .limit(1);

  const nextId = nextIdResult[0]?.value ?? 1;

  const newPerson = {
    id: nextId.toString(),
    name: formData.name.trim(),
    generation: 3,
    parentId: formData.parentId,
    children: [],
    birthRank: formData.birthRank,
    createdAt: new Date().toISOString(),
  };

  // Insert new person
  await db.insert(schema.persons).values({
    id: nextId.toString(),
    name: newPerson.name,
    generation: newPerson.generation,
    parentId: newPerson.parentId,
    children: newPerson.children,
    birthRank: newPerson.birthRank,
  });

  // Update parent's children array
  const parent = await db
    .select()
    .from(schema.persons)
    .where(eq(schema.persons.id, formData.parentId))
    .limit(1);

  if (parent[0]) {
    const currentChildren = parent[0].children || [];
    await db
      .update(schema.persons)
      .set({ children: [...currentChildren, nextId.toString()] })
      .where(eq(schema.persons.id, formData.parentId));
  }

  // Increment next_id
  await db
    .update(schema.metadata)
    .set({ value: nextId + 1 })
    .where(eq(schema.metadata.key, "next_id"));

  revalidateTag("family-data", "max");

  return newPerson;
}

export async function getPersonsByGeneration(
  generation: number
): Promise<Person[]> {
  const data = await getFamilyData();
  return data.persons.filter((person) => person.generation === generation);
}

export async function getPersonById(id: string): Promise<Person | null> {
  const data = await getFamilyData();
  return data.persons.find((person) => person.id === id) || null;
}

export async function getChildrenCount(personId: string): Promise<number> {
  const data = await getFamilyData();
  const person = data.persons.find((p) => p.id === personId);
  return person?.children?.length || 0;
}

export async function buildFamilyTree(): Promise<FamilyTreeNode[]> {
  const data = await getFamilyData();
  const personMap = new Map<string, FamilyTreeNode>();

  data.persons.forEach((person) => {
    personMap.set(person.id, { ...person, childrenNodes: [] });
  });

  // Build the tree structure
  const roots: FamilyTreeNode[] = [];

  personMap.forEach((node) => {
    if (node.parentId) {
      const parent = personMap.get(node.parentId);
      if (parent) {
        parent.childrenNodes.push(node);
        // Sort children by birth rank
        parent.childrenNodes.sort(
          (a, b) => (a.birthRank || 0) - (b.birthRank || 0)
        );
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
