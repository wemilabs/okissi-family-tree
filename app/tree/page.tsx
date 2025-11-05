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
              <>
                {/* Desktop Skeleton */}
                <div className="hidden lg:block">
                  {/* View Selector Skeleton */}
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-20 mb-6 gap-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 bg-gray-200 w-[200px] rounded-md" />
                    </div>
                  </div>
                  {/* Tree Skeleton */}
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
                </div>

                {/* Mobile Skeleton */}
                <div className="lg:hidden">
                  {/* View Selector Skeleton */}
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-20 mb-6 gap-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 bg-gray-200 w-[200px] rounded-md" />
                    </div>
                  </div>
                  {/* Tree Card Skeleton */}
                  <div className="w-full max-w-md mx-auto">
                    <Skeleton className="min-h-[calc(100vh-17rem)] bg-gray-200 rounded-lg mb-4" />
                  </div>
                </div>
              </>
            }
          >
            <FamilyTreeData />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
