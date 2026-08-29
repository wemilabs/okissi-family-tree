import { Skeleton } from "@/components/ui/skeleton";

export function FamilyTreeSkeleton() {
  return (
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
  );
}
