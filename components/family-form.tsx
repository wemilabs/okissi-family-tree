"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addPerson,
  getNextBirthRank,
  getOccupiedBirthRanks,
} from "@/lib/family-actions";
import type { Person } from "@/types/family";

interface FamilyFormProps {
  parents: Person[];
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
}

export function FamilyForm({ parents }: FamilyFormProps) {
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [nextBirthRank, setNextBirthRank] = useState<number>(1);
  const [occupiedRanks, setOccupiedRanks] = useState<number[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const handleParentChange = async (parentId: string) => {
    setSelectedParent(parentId);
    if (parentId) {
      const [rank, occupied] = await Promise.all([
        getNextBirthRank(parentId),
        getOccupiedBirthRanks(parentId),
      ]);
      setNextBirthRank(rank);
      setOccupiedRanks(occupied);
    } else {
      setNextBirthRank(1);
      setOccupiedRanks([]);
    }
  };

  const [_state, formAction, isPending] = useActionState(
    async (
      _prevState: { success?: boolean; error?: string } | null,
      formData: FormData
    ) => {
      try {
        const name = formData.get("name") as string;
        const parentId = formData.get("parentId") as string;
        const birthRank = parseInt(formData.get("birthRank") as string, 10);

        if (!name || !parentId || !birthRank) {
          return { error: "Please fill in all fields" };
        }

        await addPerson({ name, parentId, birthRank });
        toast.success("Person added successfully!", {
          description: (
            <Link href="/tree" className="underline hover:no-underline">
              View Family Tree
            </Link>
          ),
          duration: 5000,
        });
        formRef.current?.reset();
        setSelectedParent("");
        setNextBirthRank(1);
        setOccupiedRanks([]);
        return { success: true };
      } catch (error) {
        toast.error("Failed to add person", {
          description:
            error instanceof Error ? error.message : "Please try again",
          duration: 5000,
        });
        return { error: "Failed to add person" };
      }
    },
    null
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Ajouter un petit-enfant</CardTitle>
        <CardDescription>
          Ajouter un nouveau petit-enfant à l'arbre généalogique
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du petit-enfant</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Entrez le nom du petit-enfant"
              required
              className="placeholder:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Fils/Fille de</Label>
            <Select
              name="parentId"
              value={selectedParent}
              onValueChange={handleParentChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le parent" />
              </SelectTrigger>
              <SelectContent>
                {parents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthRank">Ordre de naissance</Label>
            <Select
              name="birthRank"
              defaultValue={nextBirthRank.toString()}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'ordre de naissance" />
              </SelectTrigger>
              <SelectContent>
                {[
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
                  34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
                  49, 50,
                ].map((rank) => {
                  const isOccupied = occupiedRanks.includes(rank);
                  return (
                    <SelectItem
                      key={rank}
                      value={rank.toString()}
                      disabled={isOccupied}
                      className={
                        isOccupied ? "opacity-50 cursor-not-allowed" : ""
                      }
                    >
                      {rank}
                      {getOrdinalSuffix(rank)} né
                      {isOccupied && " (Déjà pris)"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedParent && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Suggested: {nextBirthRank}
                  {getOrdinalSuffix(nextBirthRank)} né
                </p>
                {occupiedRanks.length > 0 && (
                  <p className="text-xs text-orange-600">
                    Occupied ranks:{" "}
                    {occupiedRanks
                      .sort()
                      .map((r) => `${r}${getOrdinalSuffix(r)}`)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Ajout en cours..." : "Ajouter à l'arbre généalogique"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
