export default function ExploreSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-32 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pt-8">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-surface-container-high rounded-full" />
          <div className="h-12 w-64 bg-surface-container-high rounded-2xl" />
          <div className="h-16 w-96 bg-surface-container-high rounded-2xl" />
        </div>
        <div className="h-14 w-full md:max-w-md bg-surface-container-high rounded-2xl shadow-lg" />
      </div>

      {/* Categories Skeleton */}
      <div className="flex flex-wrap gap-2.5 mb-16 overflow-x-auto pb-4 no-scrollbar">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-10 w-28 bg-surface-container-low border border-outline-variant/10 rounded-full" />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex flex-col h-full bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 overflow-hidden">
            <div className="aspect-16/10 bg-surface-container-low" />
            <div className="p-8 md:p-10 flex-1 flex flex-col items-start gap-4">
              <div className="h-4 w-20 bg-surface-container-high rounded-full" />
              <div className="h-8 w-full bg-surface-container-high rounded-xl" />
              <div className="h-8 w-3/4 bg-surface-container-high rounded-xl" />
              <div className="mt-auto pt-6 flex items-center justify-between w-full border-t border-outline-variant/10">
                <div className="h-4 w-24 bg-surface-container-high rounded-full" />
                <div className="w-8 h-8 rounded-full bg-surface-container-high" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
