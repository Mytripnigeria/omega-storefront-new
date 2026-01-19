import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonStagger, SkeletonItem } from './SkeletonStagger';

export const BannerSkeleton = () => {
  return (
    <div className="px-4 py-4 max-w-7xl mx-auto lg:px-6">
      <SkeletonStagger className="flex gap-3 overflow-hidden">
        <SkeletonItem>
          <Skeleton className="min-w-[280px] sm:min-w-[320px] h-36 rounded-2xl" />
        </SkeletonItem>
        <SkeletonItem className="hidden sm:block">
          <Skeleton className="min-w-[280px] sm:min-w-[320px] h-36 rounded-2xl" />
        </SkeletonItem>
        <SkeletonItem className="hidden lg:block">
          <Skeleton className="min-w-[280px] sm:min-w-[320px] h-36 rounded-2xl" />
        </SkeletonItem>
      </SkeletonStagger>
    </div>
  );
};
