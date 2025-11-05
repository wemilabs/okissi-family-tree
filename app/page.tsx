import { Suspense } from "react";
import { FamilyForm } from "@/components/family-form";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFamilyData } from "@/lib/family-actions";

async function ParentsList() {
  const data = await getFamilyData();
  // Show all persons as potential parents (they can select by generation in form)
  const potentialParents = data.persons;
  return <FamilyForm parents={potentialParents} />;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <main className="max-w-2xl mx-auto mt-20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
              Construisons et visualisons notre héritage familial
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              version 0.1.5 -- it&apos;s just the beginning
            </p>
          </div>

          <Suspense
            fallback={
              <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Ajouter un membre de la famille</CardTitle>
                  <CardDescription>
                    Ajouter un nouveau membre à l'arbre généalogique
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-10 bg-gray-200 rounded" />
                    <Skeleton className="h-10 bg-gray-200 rounded" />
                    <Skeleton className="h-10 bg-gray-200 rounded" />
                    <Skeleton className="h-10 bg-gray-200 rounded" />
                    <Skeleton className="h-10 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            }
          >
            <ParentsList />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
