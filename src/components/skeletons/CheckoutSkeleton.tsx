import { Skeleton } from '@/components/ui/skeleton';

export const CheckoutSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-20 ml-4" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 bg-card rounded-2xl border border-border">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            <div className="p-4 bg-card rounded-2xl border border-border">
              <Skeleton className="h-5 w-40 mb-4" />
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 flex-1 rounded-xl" />
              </div>
            </div>

            <div className="p-4 bg-card rounded-2xl border border-border">
              <Skeleton className="h-5 w-28 mb-4" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-20 p-6 bg-card rounded-2xl border border-border">
              <Skeleton className="h-5 w-32 mb-6" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
