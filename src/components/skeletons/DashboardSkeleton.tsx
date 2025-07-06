import { SkeletonCard, SkeletonStat, SkeletonHeader, SkeletonPrayerCard, SkeletonChart } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <SkeletonHeader />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-4">
            <SkeletonCard className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full animate-pulse" />
              </div>
            </SkeletonCard>

            {/* Prayer Times Skeleton */}
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <SkeletonPrayerCard key={i} />
              ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <SkeletonChart />
              <SkeletonChart />
            </div>

            {/* Action Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <SkeletonCard className="p-6">
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                  <div className="flex space-x-2">
                    <div className="h-9 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-9 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </SkeletonCard>

              <SkeletonCard className="p-6">
                <div className="space-y-4">
                  <div className="h-6 w-28 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </SkeletonCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 