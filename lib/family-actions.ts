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
  // Check if birth rank is already occupied (only if parent specified)
  if (formData.parentId) {
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
  }

  // Insert new person - ID will be auto-generated (UUID)
  const result = await db
    .insert(schema.persons)
    .values({
      name: formData.name.trim(),
      generation: formData.generation,
      parentId: formData.parentId || null,
      children: [],
      birthRank: formData.birthRank,
    })
    .returning();

  const insertedPerson = result[0];

  // Update parent's children array if parent exists
  if (formData.parentId) {
    const parent = await db
      .select()
      .from(schema.persons)
      .where(eq(schema.persons.id, formData.parentId))
      .limit(1);

    if (parent[0]) {
      const currentChildren = parent[0].children || [];
      await db
        .update(schema.persons)
        .set({ children: [...currentChildren, insertedPerson.id] })
        .where(eq(schema.persons.id, formData.parentId));
    }
  }

  revalidateTag("family-data", "max");

  return {
    id: insertedPerson.id,
    name: insertedPerson.name,
    generation: insertedPerson.generation,
    parentId: insertedPerson.parentId || undefined,
    children: insertedPerson.children || [],
    birthRank: insertedPerson.birthRank || undefined,
    createdAt: insertedPerson.createdAt.toISOString(),
  };
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
