import { Suspense } from "react";
import { FamilyTree } from "@/components/family-tree";
import { FamilyTreeSkeleton } from "@/components/family-tree-skeleton";
import { Header } from "@/components/header";
import { buildFamilyTree, getFamilyData } from "@/lib/family-queries";

async function FamilyTreeData() {
  const [familyTree, familyData] = await Promise.all([
    buildFamilyTree(),
    getFamilyData(),
  ]);
  return <FamilyTree tree={familyTree} allPersons={familyData.persons} />;
}

export default function TreePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Header />

        <main className="w-full">
          <Suspense fallback={<FamilyTreeSkeleton />}>
            <FamilyTreeData />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
