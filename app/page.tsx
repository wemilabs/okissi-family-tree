import Link from "next/link";
import { Suspense } from "react";
import { FamilyForm } from "@/components/family-form";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPersonsByGeneration } from "@/lib/family-actions";

async function ParentsList() {
  const parents = await getPersonsByGeneration(2);
  return <FamilyForm parents={parents} />;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between">
          <Logo />
          <Link href="/tree">
            <Button size="lg">Voir l'arbre</Button>
          </Link>
        </header>

        <main className="max-w-2xl mx-auto mt-20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
              Ajouter un petit-enfant
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Entrez le nom du petit-enfant et sélectionnez son parent de la
              deuxième génération
            </p>
          </div>

          <Suspense
            fallback={
              <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Ajouter un petit-enfant</CardTitle>
                  <CardDescription>
                    Ajouter un nouveau petit-enfant à l'arbre généalogique
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
