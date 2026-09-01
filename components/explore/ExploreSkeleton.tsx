export default function ExploreSkeleton({ featured = true }: { featured?: boolean }) {
  return (
    <div role="status" aria-label="Memuat artikel" className="public-ui max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-32 animate-pulse">
      <div aria-hidden="true" className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-12 pb-6 md:pb-16 pt-6 md:pt-32">
        <div className="hidden md:block min-w-0 space-y-4">
          <div className="h-6 w-32 rounded-full bg-surface-container-high" />
          <div className="h-16 w-full md:w-96 max-w-full rounded-2xl bg-surface-container-high" />
          <div className="h-12 w-full md:w-80 max-w-full rounded-2xl bg-surface-container-high" />
        </div>
        <div className="h-12 md:h-16 w-full lg:max-w-md rounded-full bg-surface-container-high" />
      </div>
      <div aria-hidden="true" className="flex gap-2 mb-8 md:mb-16 py-3 md:justify-center">
        {[1, 2].map(i => <div key={i} className="h-11 w-28 rounded-full bg-surface-container-high" />)}
      </div>
      <div aria-hidden="true" className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
        {[1, 2, 3, 4, 5, 6].map(i => {
          const large = featured && i === 1;
          return <div key={i} className={`flex min-w-0 flex-col overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest ${large ? 'md:col-span-12 lg:col-span-8 lg:flex-row lg:min-h-[420px]' : 'md:col-span-6 lg:col-span-4'}`}>
            <div className={`shrink-0 bg-surface-container-low ${large ? 'h-56 sm:h-72 lg:h-auto lg:w-[45%]' : 'aspect-16/10'}`} />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-4 p-5 md:p-8">
              <div className="h-4 w-20 rounded-full bg-surface-container-high" />
              <div className="h-8 w-full rounded-xl bg-surface-container-high" />
              <div className="h-8 w-3/4 rounded-xl bg-surface-container-high" />
              <div className="mt-auto flex w-full items-center justify-between border-t border-outline-variant/20 pt-6">
                <div className="h-4 w-24 rounded-full bg-surface-container-high" />
                <div className="size-8 rounded-full bg-surface-container-high" />
              </div>
            </div>
          </div>;
        })}
      </div>
    </div>
  );
}
