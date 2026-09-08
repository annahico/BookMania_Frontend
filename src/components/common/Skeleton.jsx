const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 dark:bg-slate-700 rounded-lg aspect-[2/3] mb-3" />
    <div className="bg-gray-200 dark:bg-slate-700 rounded h-3 mb-1.5" />
    <div className="bg-gray-200 dark:bg-slate-700 rounded h-3 w-2/3" />
  </div>
);

const SkeletonRow = () => (
  <div className="animate-pulse bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4">
    <div className="bg-gray-200 dark:bg-slate-700 rounded h-4 w-1/3 mb-2" />
    <div className="bg-gray-200 dark:bg-slate-700 rounded h-3 w-1/4 mb-2" />
    <div className="bg-gray-200 dark:bg-slate-700 rounded h-3 w-1/2" />
  </div>
);

export { SkeletonCard, SkeletonRow };
