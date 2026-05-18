//frontend/src/components/SkeletonCards.jsx
export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 h-10 w-10 rounded-2xl bg-slate-100" />
      <div className="mb-3 h-4 w-24 rounded-full bg-slate-100" />
      <div className="h-7 w-16 rounded-full bg-slate-200" />
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-32 rounded-full bg-slate-200" />
        <div className="h-6 w-20 rounded-full bg-slate-100" />
      </div>

      <div className="mb-3 h-3 w-44 rounded-full bg-slate-100" />
      <div className="mb-3 h-3 w-36 rounded-full bg-slate-100" />
      <div className="h-3 w-24 rounded-full bg-slate-100" />
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-3 h-7 w-40 rounded-full bg-slate-200" />
      <div className="h-4 w-64 rounded-full bg-slate-100" />
    </div>
  )
}