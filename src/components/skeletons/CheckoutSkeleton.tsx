import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonFade, SkeletonStagger, SkeletonItem } from './SkeletonStagger';

export const CheckoutSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-20 ml-4" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Order Summary Card */}
            <SkeletonFade delay={0.1}>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="w-4 h-4" />
                  </div>
                </div>
                <div className="border-t border-border p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="ml-auto w-4 h-4" />
                  </div>
                </div>
              </div>
            </SkeletonFade>

            {/* Tip Section */}
            <SkeletonFade delay={0.2}>
              <div className="bg-card rounded-2xl border border-border p-4">
                <Skeleton className="h-5 w-20 mb-3" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 flex-1 rounded-full" />
                  ))}
                </div>
              </div>
            </SkeletonFade>

            {/* Your Information */}
            <SkeletonFade delay={0.3}>
              <div className="bg-card rounded-2xl border border-border p-4">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-11 w-full rounded-md" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-11 w-full rounded-md" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-11 w-full rounded-md" />
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-3 w-12 mb-1" />
                    <Skeleton className="h-11 w-full rounded-md" />
                  </div>
                </div>
              </div>
            </SkeletonFade>

            {/* Payment Method */}
            <SkeletonFade delay={0.4}>
              <div className="bg-card rounded-2xl border border-border p-4">
                <Skeleton className="h-5 w-32 mb-4" />
                <SkeletonStagger className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonItem key={i}>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </SkeletonItem>
                  ))}
                </SkeletonStagger>
              </div>
            </SkeletonFade>
          </div>

          {/* Right Column - Desktop only */}
          <SkeletonFade delay={0.3} className="hidden lg:block">
            <div className="sticky top-20 p-6 bg-card rounded-2xl border border-border">
              <Skeleton className="h-5 w-28 mb-6" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <Skeleton className="h-14 w-full rounded-full mt-6" />
              <Skeleton className="h-4 w-48 mx-auto mt-3" />
            </div>
          </SkeletonFade>
        </div>
      </div>
    </div>
  );
};
