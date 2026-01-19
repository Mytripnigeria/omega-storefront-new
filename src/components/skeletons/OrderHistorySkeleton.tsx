import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonStagger, SkeletonItem } from './SkeletonStagger';

export const OrderHistorySkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-28 ml-4" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        <SkeletonStagger className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 space-y-3 lg:space-y-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonItem key={i}>
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-24" />
                </div>

                <div className="space-y-2 mb-3 pb-3 border-b border-border">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 flex-1 rounded-md" />
                </div>
              </div>
            </SkeletonItem>
          ))}
        </SkeletonStagger>
      </div>
    </div>
  );
};
