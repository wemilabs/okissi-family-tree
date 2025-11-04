import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name must be a non-empty string" },
        { status: 400 }
      );
    }

    const person = await db
      .select()
      .from(schema.persons)
      .where(eq(schema.persons.id, id))
      .limit(1);

    if (!person[0]) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    await db
      .update(schema.persons)
      .set({ name: name.trim() })
      .where(eq(schema.persons.id, id));

    revalidateTag("family-data", "max");

    return NextResponse.json({ success: true, name: name.trim() });
  } catch (error) {
    console.error("Error updating person name:", error);
    return NextResponse.json(
      { error: "Failed to update person name" },
      { status: 500 }
    );
  }
}
