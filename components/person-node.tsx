"use client";

import { Check, Edit2, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FamilyTreeNode } from "@/types/family";

interface PersonNodeProps {
  person: FamilyTreeNode;
  isRoot?: boolean;
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

export function PersonNode({ person }: PersonNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(person.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(person.name);
  };

  const handleSave = async () => {
    if (editedName.trim() === person.name) {
      setIsEditing(false);
      return;
    }

    if (editedName.trim() === "") {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/family/update-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: person.id,
          name: editedName.trim(),
        }),
      });

      if (response.ok) {
        toast.success("Done", {
          description: "Name updated successfully",
        });
        person.name = editedName.trim();
        setIsEditing(false);
      } else {
        toast.error("Failed to update name", {
          description: "Please try again later",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to update name:", errorMessage);
      toast.error("Failed to update name", { description: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(person.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };
  const getGenerationColor = (generation: number) => {
    switch (generation) {
      case 1:
        return "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200";
      case 2:
        return "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200";
      case 3:
        return "bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200";
    }
  };

  const getGenerationLabel = (generation: number, birthRank?: number) => {
    switch (generation) {
      case 1:
        return birthRank === 1 ? "Patriarche" : "Matriarche";
      case 2:
        return "Parent";
      case 3:
        return "Petit-enfant";
      default:
        return `Génération ${generation}`;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Card
        className={`w-40 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${getGenerationColor(
          person.generation
        )}`}
      >
        <CardContent className="p-3 text-center space-y-4">
          <div className="relative group">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-xs h-7 px-2"
                  autoFocus
                />
                <div className="flex gap-1 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="size-6 p-0 text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Check className="size-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="size-6 p-0 text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-semibold text-xs mb-1">{person.name}</div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEdit}
                  className="absolute -top-1 -right-1 size-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
                >
                  <Edit2 className="size-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-1">
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {getGenerationLabel(person.generation, person.birthRank)}
            </Badge>
            {person.birthRank && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {person.birthRank}
                {getOrdinalSuffix(person.birthRank)}
              </Badge>
            )}
          </div>
          {person.children && person.children.length > 0 && (
            <div className="mt-2 text-xs opacity-75 font-medium">
              {person.children.length} enfant
              {person.children.length === 1 ? "" : "s"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
