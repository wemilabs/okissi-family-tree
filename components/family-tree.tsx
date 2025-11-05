"use client";

import { Check, ChevronDown, ChevronRight, Edit2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FamilyTreeNode, Person } from "@/types/family";
import { PersonNode } from "./person-node";

type FamilyView = "all" | "patriarchs" | "parents" | "grandchildren";

interface FamilyTreeProps {
  tree: FamilyTreeNode[];
  allPersons: Person[];
}

interface MobileTreeNodeProps {
  node: FamilyTreeNode;
  level: number;
}

function MobileTreeNode({ node, level }: MobileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(node.name);
  const hasChildren = node.childrenNodes && node.childrenNodes.length > 0;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(node.name);
  };

  const handleSave = async () => {
    if (editedName.trim() === node.name) {
      setIsEditing(false);
      return;
    }

    if (editedName.trim() === "") {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      const response = await fetch("/api/family/update-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: node.id,
          name: editedName.trim(),
        }),
      });

      if (response.ok) {
        toast.success("Done", {
          description: "Name updated successfully",
        });
        node.name = editedName.trim();
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
      toast.error("Failed to update name", {
        description: errorMessage,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(node.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${
          level === 0
            ? "bg-purple-50 dark:bg-purple-900/20"
            : level === 1
            ? "bg-blue-50 dark:bg-blue-900/20"
            : "bg-green-50 dark:bg-green-900/20"
        }`}
      >
        {hasChildren && (
          <div
            className="transition-transform duration-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </div>
        )}
        {!hasChildren && <div className="w-4" />}
        <div className="flex-1 relative group">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-sm h-8 px-2"
                autoFocus
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  className="size-6 p-0 text-green-600 hover:text-green-700"
                >
                  <Check className="size-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="size-6 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="size-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div onClick={() => hasChildren && setIsExpanded(!isExpanded)}>
              <div className="font-medium text-sm">{node.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {node.birthRank &&
                  `${node.birthRank}${getOrdinalSuffix(node.birthRank)} • `}
                {getGenerationLabel(node.generation, node.birthRank)}
                {node.children &&
                  node.children.length > 0 &&
                  ` • ${node.children.length} children`}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="absolute -top-1 -right-1 size-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
              >
                <Edit2 className="size-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-6 mt-1 border-l-2 border-gray-200 dark:border-gray-700">
          {node.childrenNodes.map((child) => (
            <div key={child.id} className="py-2">
              <MobileTreeNode node={child} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

function getGenerationLabel(generation: number, birthRank?: number) {
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
}

function TreeNode({ node, level }: { node: FamilyTreeNode; level: number }) {
  const hasChildren = node.childrenNodes && node.childrenNodes.length > 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <PersonNode person={node} isRoot={level === 0} />

        {hasChildren && (
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0.5 h-12 bg-linear-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500"></div>
        )}
      </div>

      {hasChildren && (
        <div className="relative mt-12">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-12 bg-linear-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 -translate-y-12"></div>

          <div className="overflow-x-auto">
            <div className="flex gap-2 md:gap-3 lg:gap-4 relative min-w-max px-4">
              {node.childrenNodes.length > 1 && (
                <div className="absolute top-0 left-4 right-4 h-0.5 bg-linear-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 -translate-y-12"></div>
              )}

              {node.childrenNodes.map((child) => (
                <div key={child.id} className="relative shrink-0">
                  {node.childrenNodes.length > 1 && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-12 bg-linear-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 -translate-y-12"></div>
                  )}
                  <TreeNode node={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FamilyTree({ tree, allPersons }: FamilyTreeProps) {
  const [view, setView] = useState<FamilyView>("all");

  if (!tree || tree.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">No Family Data</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Commencez par ajouter des membres de la famille sur la page
            d&apos;ajout.
          </p>
        </CardContent>
      </Card>
    );
  }

  const viewLabels = {
    all: "Toute la famille",
    patriarchs: "Les Patriarches",
    parents: "Les Enfants",
    grandchildren: "Les Petits-Enfants",
  } as const;

  // Find the specific grandparents
  const patriarche = tree.find((node) => node.name.includes("Joseph"));
  const matriarche = tree.find((node) => node.name.includes("Anne-Marie"));

  // Filter the tree based on the current view
  const getFilteredTree = () => {
    if (view === "all") return tree;

    if (view === "patriarchs") {
      // Get only the patriarchs without their children trees
      return [patriarche, matriarche]
        .filter(Boolean)
        .map((node) => ({ ...node, childrenNodes: [] } as FamilyTreeNode));
    }

    if (view === "parents") {
      // Get all direct children of the patriarchs
      const parentIds = new Set([
        ...(patriarche?.children || []),
        ...(matriarche?.children || []),
      ]);
      return allPersons
        .filter((node) => parentIds.has(node.id))
        .sort((a, b) => (a.birthRank || 0) - (b.birthRank || 0))
        .map((person) => ({ ...person, childrenNodes: [] } as FamilyTreeNode));
    }

    if (view === "grandchildren") {
      // Get all generation 3 nodes (grandchildren)
      return allPersons
        .filter((node) => node.generation === 3)
        .map((person) => ({ ...person, childrenNodes: [] } as FamilyTreeNode));
    }

    return tree;
  };

  const filteredTree = getFilteredTree();

  return (
    <div className="w-full pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* View Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value: FamilyView) => setView(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sélectionner une vue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{viewLabels.all}</SelectItem>
                <SelectItem value="patriarchs">
                  {viewLabels.patriarchs}
                </SelectItem>
                <SelectItem value="parents">{viewLabels.parents}</SelectItem>
                <SelectItem value="grandchildren">
                  {viewLabels.grandchildren}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop View - Horizontal Tree */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <div className="flex flex-col items-center space-y-20 min-w-max px-8">
              <div className="flex gap-3 md:gap-4 lg:gap-6 justify-center">
                {view === "all" ? (
                  <>
                    {patriarche && <TreeNode node={patriarche} level={0} />}
                    {matriarche && <TreeNode node={matriarche} level={0} />}
                  </>
                ) : (
                  <div className="flex flex-wrap gap-4 justify-center">
                    {filteredTree.map((node) => (
                      <TreeNode key={node.id} node={node} level={0} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View - File Tree */}
        <div className="lg:hidden">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Arbre généalogique</CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Déroulez les branches pour voir les membres de la famille
              </p>
            </CardHeader>
            <CardContent className="px-6 py-2">
              <div className="space-y-2">
                {view === "all" ? (
                  <>
                    {patriarche && (
                      <MobileTreeNode node={patriarche} level={0} />
                    )}
                    {matriarche && (
                      <MobileTreeNode node={matriarche} level={0} />
                    )}
                  </>
                ) : (
                  filteredTree.map((node) => (
                    <MobileTreeNode key={node.id} node={node} level={0} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend - Responsive */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 lg:mt-16 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-4 bg-purple-100 border border-purple-300 rounded-full"></div>
            <span className="font-medium">Patriarches</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 bg-blue-100 border border-blue-300 rounded-full"></div>
            <span className="font-medium">Parents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 bg-green-100 border border-green-300 rounded-full"></div>
            <span className="font-medium">Petits-enfants</span>
          </div>
        </div>
      </div>
    </div>
  );
}
