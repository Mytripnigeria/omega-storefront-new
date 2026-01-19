import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonFade } from './SkeletonStagger';

export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-16 ml-4" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Column */}
          <div>
            {/* Profile Card */}
            <SkeletonFade delay={0.1}>
              <div className="flex items-center gap-4 p-4 lg:p-6 bg-card rounded-2xl border border-border mb-6">
                <Skeleton className="w-14 h-14 lg:w-20 lg:h-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-8 w-12 rounded-full" />
              </div>
            </SkeletonFade>

            {/* Stats */}
            <SkeletonFade delay={0.2}>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border text-center">
                  <Skeleton className="h-8 w-20 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
                <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border text-center">
                  <Skeleton className="h-8 w-24 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              </div>
            </SkeletonFade>

            {/* Referral */}
            <SkeletonFade delay={0.3}>
              <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border mb-6">
                <Skeleton className="h-5 w-28 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
              </div>
            </SkeletonFade>
          </div>

          {/* Right Column */}
          <SkeletonFade delay={0.25}>
            <div>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border-b border-border last:border-0">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="w-4 h-4" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-12 w-full rounded-xl mt-6" />
            </div>
          </SkeletonFade>
        </div>
      </div>
    </div>
  );
};
