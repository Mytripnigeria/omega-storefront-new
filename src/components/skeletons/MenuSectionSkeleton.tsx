import { Skeleton } from '@/components/ui/skeleton';
import { MenuItemSkeleton } from './MenuItemSkeleton';
import { SkeletonStagger, SkeletonItem, SkeletonFade } from './SkeletonStagger';

export const MenuSectionSkeleton = () => {
  return (
    <div className="px-4 lg:px-0 mb-6">
      <SkeletonFade>
        <Skeleton className="h-6 w-32 mb-4" />
      </SkeletonFade>
      <SkeletonStagger className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonItem key={i}>
            <MenuItemSkeleton />
          </SkeletonItem>
        ))}
      </SkeletonStagger>
    </div>
  );
};
