"use server";

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheTag, revalidateTag } from "next/cache";
import type {
  AddPersonForm,
  FamilyData,
  FamilyTreeNode,
  Person,
} from "@/types/family";

const DATA_FILE = join(process.cwd(), "lib", "family-data.json");

async function readFamilyData(): Promise<FamilyData> {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading family data:", error);
    throw new Error("Failed to read family data");
  }
}

async function writeFamilyData(data: FamilyData): Promise<void> {
  try {
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing family data:", error);
    throw new Error("Failed to write family data");
  }
}

export async function getFamilyData(): Promise<FamilyData> {
  "use cache";
  cacheTag("family-data");
  return await readFamilyData();
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
  const data = await readFamilyData();

  // Check if birth rank is already occupied
  const existingSiblings = data.persons.filter(
    (p) => p.parentId === formData.parentId
  );
  const isRankOccupied = existingSiblings.some(
    (sibling) => sibling.birthRank === formData.birthRank
  );

  if (isRankOccupied) {
    throw new Error(
      `Birth rank ${formData.birthRank} is already occupied for this parent`
    );
  }

  const newPerson: Person = {
    id: data.nextId.toString(),
    name: formData.name.trim(),
    generation: 3,
    parentId: formData.parentId,
    birthRank: formData.birthRank,
    children: [],
    createdAt: new Date().toISOString(),
  };

  data.persons.push(newPerson);

  const parent = data.persons.find((p) => p.id === formData.parentId);
  if (parent) {
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(newPerson.id);
  }

  data.nextId++;

  await writeFamilyData(data);

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
