import { FamilyTreeSkeleton } from "@/components/family-tree-skeleton";
import { Header } from "@/components/header";

export default function TreeLoading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Header />

        <main className="w-full">
          <FamilyTreeSkeleton />
        </main>
      </div>
    </div>
  );
}
