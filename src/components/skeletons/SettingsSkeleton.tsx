import { SkeletonCard, SkeletonHeader } from "@/components/ui/skeleton"

export function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <SkeletonHeader />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        {/* Profile Section */}
        <SkeletonCard className="p-6">
          <div className="space-y-4">
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-muted rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </SkeletonCard>

        {/* Prayer Settings */}
        <SkeletonCard className="p-6">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-10 bg-muted rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </SkeletonCard>

        {/* Notification Settings */}
        <SkeletonCard className="p-6">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <div className="h-4 w-36 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-10 bg-muted rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </SkeletonCard>

        {/* Preferences */}
        <SkeletonCard className="p-6">
          <div className="space-y-4">
            <div className="h-6 w-28 bg-muted rounded animate-pulse" />
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </SkeletonCard>

        {/* Actions */}
        <div className="flex space-x-4">
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
} 