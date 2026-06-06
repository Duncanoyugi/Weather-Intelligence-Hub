interface LoadingSkeletonProps {
  className?: string;
}

export default function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`skeleton-loader ${className}`} />
  );
}

interface CardSkeletonProps {
  lines?: number;
}

export function CardSkeleton({ lines = 4 }: CardSkeletonProps) {
  return (
    <div className="glass-card p-6">
      <LoadingSkeleton className="h-6 w-3/4 mb-4" />
      <LoadingSkeleton className="h-4 w-1/2 mb-3" />
      <LoadingSkeleton className="h-4 w-full mb-2" />
      <LoadingSkeleton className="h-4 w-5/6 mb-2" />
      {lines > 3 && <LoadingSkeleton className="h-4 w-4/6" />}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="glass-card p-5 text-center">
      <LoadingSkeleton className="h-4 w-16 mx-auto mb-2" />
      <LoadingSkeleton className="h-10 w-20 mx-auto mb-2" />
      <LoadingSkeleton className="h-3 w-12 mx-auto" />
    </div>
  );
}