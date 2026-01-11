import { Skeleton } from '@/components/ui/skeleton';
import { MenuItemSkeleton } from './MenuItemSkeleton';

export const MenuSectionSkeleton = () => {
  return (
    <div className="px-4 lg:px-0">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <MenuItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
