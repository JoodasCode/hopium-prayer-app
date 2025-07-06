import { SkeletonCard, SkeletonHeader } from "@/components/ui/skeleton"

export function MulviSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <SkeletonHeader />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <div className="space-y-4">
          {/* Welcome Message */}
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <SkeletonCard className="p-4 max-w-md">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                </div>
              </SkeletonCard>
            </div>
          </div>

          {/* User Messages */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 justify-end">
              <div className="flex-1 space-y-2 flex flex-col items-end">
                <SkeletonCard className="p-4 max-w-md bg-primary/10">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </SkeletonCard>
              </div>
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </div>
          ))}

          {/* AI Response */}
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <SkeletonCard className="p-4 max-w-lg">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                </div>
              </SkeletonCard>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <div className="flex items-center space-x-4">
            <div className="flex-1 h-12 bg-muted rounded-lg animate-pulse" />
            <div className="h-12 w-12 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
} 