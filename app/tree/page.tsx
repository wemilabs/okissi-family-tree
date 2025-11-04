import { Suspense } from "react";
import { FamilyTree } from "@/components/family-tree";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { buildFamilyTree, getFamilyData } from "@/lib/family-actions";

async function FamilyTreeData() {
  const familyTree = await buildFamilyTree();
  const familyData = await getFamilyData();
  return <FamilyTree tree={familyTree} allPersons={familyData.persons} />;
}

export default function TreePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Header />

        <main className="w-full">
          <Suspense
            fallback={
              <div className="flex justify-center">
                <div className="animate-pulse space-y-4">
                  <Skeleton className="h-8 bg-gray-200 w-64 mx-auto" />
                  <div className="flex justify-center gap-8">
                    <Skeleton className="h-32 bg-gray-200 w-48" />
                    <Skeleton className="h-32 bg-gray-200 w-48" />
                    <Skeleton className="h-32 bg-gray-200 w-48" />
                  </div>
                  <div className="flex justify-center gap-4">
                    <Skeleton className="h-24 bg-gray-200 w-36" />
                    <Skeleton className="h-24 bg-gray-200 w-36" />
                    <Skeleton className="h-24 bg-gray-200 w-36" />
                    <Skeleton className="h-24 bg-gray-200 w-36" />
                  </div>
                </div>
              </div>
            }
          >
            <FamilyTreeData />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
