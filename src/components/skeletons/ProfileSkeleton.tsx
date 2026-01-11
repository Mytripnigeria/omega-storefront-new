import { Skeleton } from '@/components/ui/skeleton';

export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
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
            <div className="flex items-center gap-4 p-4 lg:p-6 bg-card rounded-2xl border border-border mb-6">
              <Skeleton className="w-14 h-14 lg:w-20 lg:h-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-12 rounded-full" />
            </div>

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
          </div>

          {/* Right Column */}
          <div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border-b border-border last:border-0">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
