export const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-emerald-100 ${className ?? ""}`} />
);

export const ActivitySkeletonCard = () => (
  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
    <SkeletonBlock className="w-full h-32 sm:h-36 rounded-xl mb-3" />
    <div className="space-y-2">
      <SkeletonBlock className="h-5 w-full" />
      <SkeletonBlock className="h-3 w-11/12" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-10/12" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-11/12" />
      <SkeletonBlock className="h-3 w-10/12" />
      <SkeletonBlock className="h-3 w-11/12" />
    </div>
  </div>
);

export const OverviewSkeleton = () => {
  const lineSets = [
    ["w-full", "w-11/12", "w-10/12", "w-11/12", "w-full"],
    ["w-full", "w-10/12", "w-11/12", "w-full", "w-10/12"],
    ["w-11/12", "w-full", "w-10/12", "w-11/12", "w-full"],
  ];

  return (
    <div className="space-y-3">
      {lineSets.map((widths, idx) => (
        <div key={`overview-skel-${idx}`} className="space-y-2">
          {widths.map((width, lineIdx) => (
            <SkeletonBlock key={`overview-line-${idx}-${lineIdx}`} className={`h-3 ${width}`} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const LocationSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-start gap-3">
      <SkeletonBlock className="h-12 w-24 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-48 sm:w-64" />
        <SkeletonBlock className="h-5 w-36 sm:w-48" />
      </div>
    </div>
    <SkeletonBlock className="h-[16rem] w-full rounded-xl" />
  </div>
);

export const ActivitiesSkeletonGrid = ({ count }: { count: number }) => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: Math.max(1, count) }).map((_, idx) => (
      <ActivitySkeletonCard key={`activity-skeleton-${idx}`} />
    ))}
  </div>
);

export const FlagLineSkeleton = () => (
  <div className="flex items-center gap-2">
    <SkeletonBlock className="h-5 w-7 rounded-xs" />
    <SkeletonBlock className="h-4 w-25" />
  </div>
);

