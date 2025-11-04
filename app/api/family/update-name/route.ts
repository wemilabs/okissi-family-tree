import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import type { FamilyData } from "@/types/family";

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

    const data = await readFamilyData();
    const person = data.persons.find((p) => p.id === id);

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    person.name = name.trim();

    await writeFamilyData(data);

    revalidateTag("family-data", "max");

    return NextResponse.json({ success: true, name: person.name });
  } catch (error) {
    console.error("Error updating person name:", error);
    return NextResponse.json(
      { error: "Failed to update person name" },
      { status: 500 }
    );
  }
}
