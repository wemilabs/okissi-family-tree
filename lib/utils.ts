import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Person } from "@/types/family";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGenerationLabel(generation: number, birthRank?: number) {
  switch (generation) {
    case 1:
      return birthRank === 1 ? "Patriarche" : "Matriarche";
    case 2:
      return "Enfant";
    case 3:
      return "Petit-enfant";
    case 4:
      return "Arrière-petit-enfant";
    default:
      return `Génération ${generation}`;
  }
}

export function getOccupiedBirthRanks(
  persons: Person[],
  parentId: string
): number[] {
  return persons
    .filter((person) => person.parentId === parentId)
    .map((sibling) => sibling.birthRank)
    .filter((rank): rank is number => rank !== undefined);
}

export function getNextBirthRank(persons: Person[], parentId: string): number {
  return persons.filter((person) => person.parentId === parentId).length + 1;
}
