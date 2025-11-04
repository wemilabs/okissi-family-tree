export interface Person {
  id: string;
  name: string;
  generation: number;
  parentId?: string;
  children?: string[];
  birthRank?: number;
  createdAt: string;
}

export interface FamilyData {
  persons: Person[];
  nextId: number;
}

export interface AddPersonForm {
  name: string;
  parentId?: string;
  birthRank: number;
  generation: number;
}

export interface FamilyTreeNode extends Person {
  childrenNodes: FamilyTreeNode[];
}

export type Generation = {
  id: number;
  name: string;
  persons: Person[];
};
