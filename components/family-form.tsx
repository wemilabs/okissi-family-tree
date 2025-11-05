"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  addFamilyMember,
  getNextBirthRank,
  getOccupiedBirthRanks,
} from "@/lib/family-actions";
import { cn, getGenerationLabel } from "@/lib/utils";
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
  const [selectedParent, setSelectedParent] = useState<string>("none");
  const [selectedGeneration, setSelectedGeneration] = useState<string>("3");
  const [nextBirthRank, setNextBirthRank] = useState<number>(1);
  const [occupiedRanks, setOccupiedRanks] = useState<number[]>([]);
  const [parentOpen, setParentOpen] = useState(false);
  const [generationOpen, setGenerationOpen] = useState(false);
  const [selectedBirthRank, setSelectedBirthRank] = useState<string>(
    nextBirthRank.toString()
  );
  const [birthRankOpen, setBirthRankOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset parent to none if generation is 1
  useEffect(() => {
    if (selectedGeneration === "1") {
      setSelectedParent("none");
    }
  }, [selectedGeneration]);

  // Update selected birth rank when nextBirthRank changes
  useEffect(() => {
    setSelectedBirthRank(nextBirthRank.toString());
  }, [nextBirthRank]);

  // Compute available parents based on selected generation
  const availableParents = parents.filter(
    (p) =>
      selectedGeneration === "1" ||
      p.generation === parseInt(selectedGeneration, 10) - 1
  );

  const parentOptions = [
    { value: "none", label: "Aucun (Racine)" },
    ...availableParents
      .sort((a, b) => (a.birthRank || 0) - (b.birthRank || 0))
      .map((parent) => ({
        value: parent.id,
        label: parent.name,
      })),
  ];

  const selectedParentLabel =
    parentOptions.find((option) => option.value === selectedParent)?.label ||
    "Sélectionner le parent";

  // Max generation for select options
  const maxGen =
    parents.length > 0 ? Math.max(...parents.map((p) => p.generation)) : 3;

  const generationOptions = Array.from(
    { length: Math.max(0, maxGen - 1) },
    (_, i) => i + 3
  ).map((gen) => ({
    value: gen.toString(),
    label: `${gen} - ${
      gen === 1 ? "Patriarche/Matriarche" : getGenerationLabel(gen)
    }`,
  }));

  const selectedGenerationLabel =
    generationOptions.find((option) => option.value === selectedGeneration)
      ?.label || "Sélectionner la génération";

  const birthRankOptions = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  ].map((rank) => {
    const isOccupied = occupiedRanks.includes(rank);
    return {
      value: rank.toString(),
      label: `${rank}${getOrdinalSuffix(rank)} né${
        isOccupied ? " (Déjà pris)" : ""
      }`,
      disabled: isOccupied,
    };
  });

  const selectedBirthRankLabel =
    birthRankOptions.find((option) => option.value === selectedBirthRank)
      ?.label || "Sélectionner l'ordre de naissance";

  const handleParentChange = async (parentId: string) => {
    setSelectedParent(parentId);
    if (parentId && parentId !== "none") {
      const parent = parents.find((p) => p.id === parentId);
      if (parent) {
        setSelectedGeneration((parent.generation + 1).toString());
      }
      const [rank, occupied] = await Promise.all([
        getNextBirthRank(parentId),
        getOccupiedBirthRanks(parentId),
      ]);
      setNextBirthRank(rank);
      setOccupiedRanks(occupied);
    } else {
      setSelectedGeneration("1");
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
        const parentIdRaw = formData.get("parentId") as string;
        const parentId = parentIdRaw === "none" ? undefined : parentIdRaw;
        const birthRank = parseInt(formData.get("birthRank") as string, 10);
        const generation = parseInt(formData.get("generation") as string, 10);

        if (!name || !birthRank || !generation) {
          return { error: "Please fill in all required fields" };
        }

        await addFamilyMember({ name, parentId, birthRank, generation });
        toast.success("Person added successfully!", {
          description: (
            <Link href="/tree" className="underline hover:no-underline">
              View Family Tree
            </Link>
          ),
          duration: 5000,
        });
        formRef.current?.reset();
        setSelectedParent("none");
        setSelectedGeneration("1");
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
        <CardTitle>Ajouter un membre de la famille</CardTitle>
        <CardDescription>
          Ajouter un nouveau membre à l'arbre généalogique
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Entrez le nom complet"
              required
              className="placeholder:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="generation">Génération</Label>
            <input type="hidden" name="generation" value={selectedGeneration} />
            <Popover open={generationOpen} onOpenChange={setGenerationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={generationOpen}
                  className="w-full justify-between"
                >
                  {selectedGenerationLabel}
                  <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher une génération..." />
                  <CommandList>
                    <CommandEmpty>Aucune génération trouvée.</CommandEmpty>
                    <CommandGroup>
                      {generationOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={(currentValue) => {
                            const selectedOption = generationOptions.find(
                              (opt) => opt.label === currentValue
                            );
                            if (selectedOption) {
                              setSelectedGeneration(selectedOption.value);
                              setGenerationOpen(false);
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "size-4",
                              selectedGeneration === option.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Fils/Fille de</Label>
            <input type="hidden" name="parentId" value={selectedParent} />
            <Popover open={parentOpen} onOpenChange={setParentOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={parentOpen}
                  className="w-full justify-between"
                  disabled={selectedGeneration === "1"}
                >
                  {selectedParentLabel}
                  <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher votre ascendant direct..." />
                  <CommandList>
                    <CommandEmpty>Aucun ascendant trouvé.</CommandEmpty>
                    <CommandGroup>
                      {parentOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={(currentValue) => {
                            const selectedOption = parentOptions.find(
                              (opt) => opt.label === currentValue
                            );
                            if (selectedOption) {
                              handleParentChange(selectedOption.value);
                              setParentOpen(false);
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "size-4",
                              selectedParent === option.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthRank">Ordre de naissance</Label>
            <input type="hidden" name="birthRank" value={selectedBirthRank} />
            <Popover open={birthRankOpen} onOpenChange={setBirthRankOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={birthRankOpen}
                  className="w-full justify-between"
                >
                  {selectedBirthRankLabel}
                  <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Votre rang dans la fratrie..." />
                  <CommandList>
                    <CommandEmpty>Aucun rang trouvé.</CommandEmpty>
                    <CommandGroup>
                      {birthRankOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          disabled={option.disabled}
                          onSelect={(currentValue) => {
                            if (!option.disabled) {
                              const selectedOption = birthRankOptions.find(
                                (opt) => opt.label === currentValue
                              );
                              if (selectedOption) {
                                setSelectedBirthRank(selectedOption.value);
                                setBirthRankOpen(false);
                              }
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "size-4",
                              selectedBirthRank === option.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedParent && selectedParent !== "none" && (
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
