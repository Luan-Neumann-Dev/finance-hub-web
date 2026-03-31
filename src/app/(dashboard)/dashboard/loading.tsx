import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    <div className="space-y-8">

        <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-7 w-3/4" />
                            <Skeleton className="h-3 w-1/3" />
                        </div>
                        <Skeleton className="w-11 h-11 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
                <div key={n} className="bg-card rounded-2xl border border-border p-6">
                    <Skeleton className="h-4 w-1/3 mb-4" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
            <Skeleton className="h-4 w-1/4 mb-4" />
            <Skeleton className="h-64 w-full" />
        </div>
    </div>
}