import { Skeleton } from "@/components/ui/skeleton";

export default function IncomesLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-36" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="w-11 h-11 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}