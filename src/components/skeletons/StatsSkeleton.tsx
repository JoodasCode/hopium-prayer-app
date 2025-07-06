import { SkeletonCard, SkeletonStat, SkeletonHeader, SkeletonChart } from "@/components/ui/skeleton"

export function StatsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <SkeletonHeader />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>

        {/* Main Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonChart className="h-80" />
          <SkeletonChart className="h-80" />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonCard className="p-6">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </SkeletonCard>

          <SkeletonCard className="p-6">
            <div className="space-y-4">
              <div className="h-6 w-28 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="text-center space-y-2">
                    <div className="h-8 w-8 bg-muted rounded-full mx-auto animate-pulse" />
                    <div className="h-3 w-8 bg-muted rounded mx-auto animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </SkeletonCard>
        </div>

        {/* Achievements */}
        <SkeletonCard className="p-6">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-4 rounded-lg border">
                  <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SkeletonCard>
      </div>
    </div>
  )
} 