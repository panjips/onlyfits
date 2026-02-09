import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export const TableSkeleton = ({
  columns = 5,
  rows = 5,
}: TableSkeletonProps) => {
  return (
    <div className="space-y-4">
      {/* Table Header Skeleton */}
      <div className="flex gap-4 p-4 border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex items-center gap-4 p-4 border-b border-border/50"
        >
          {/* Avatar skeleton for first column */}
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>

          {/* Other columns */}
          {Array.from({ length: columns - 2 }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 flex-1"
            />
          ))}

          {/* Action buttons skeleton */}
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-sm" />
            <Skeleton className="size-8 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
};
