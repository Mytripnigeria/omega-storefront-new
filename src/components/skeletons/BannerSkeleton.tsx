import { Skeleton } from '@/components/ui/skeleton';

export const BannerSkeleton = () => {
  return (
    <div className="px-4 py-4 max-w-7xl mx-auto lg:px-6">
      <div className="flex gap-3 overflow-hidden">
        <Skeleton className="min-w-[280px] sm:min-w-[320px] h-36 rounded-2xl" />
        <Skeleton className="min-w-[280px] sm:min-w-[320px] h-36 rounded-2xl hidden sm:block" />
        <Skeleton className="min-w-[280px] sm:min-w-[320px] h-36 rounded-2xl hidden lg:block" />
      </div>
    </div>
  );
};
