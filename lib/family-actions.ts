"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import type { addFamilyMemberForm, Person } from "@/types/family";
import { FAMILY_DATA_TAG } from "./family-queries";

// Server-side only: callers must also call router.refresh() so the client
// router cache drops its payload for the other route.
function invalidateFamilyData() {
  updateTag(FAMILY_DATA_TAG);
  revalidatePath("/");
  revalidatePath("/tree");
}

export async function addFamilyMember(
  formData: addFamilyMemberForm
): Promise<Person> {
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

  invalidateFamilyData();

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

export async function updatePersonName(
  id: string,
  name: string
): Promise<{ name: string }> {
  const trimmedName = name.trim();

  if (!id || trimmedName.length === 0) {
    throw new Error("ID and name are required");
  }

  const person = await db
    .select()
    .from(schema.persons)
    .where(eq(schema.persons.id, id))
    .limit(1);

  if (!person[0]) {
    throw new Error("Person not found");
  }

  await db
    .update(schema.persons)
    .set({ name: trimmedName })
    .where(eq(schema.persons.id, id));

  invalidateFamilyData();

  return { name: trimmedName };
}
