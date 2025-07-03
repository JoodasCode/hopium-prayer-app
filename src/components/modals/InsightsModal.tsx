'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { LightbulbIcon, X, TrendingUp, Clock, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InsightData {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface InsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insights: InsightData[];
  onViewAllInsights: () => void;
}

export function InsightsModal({
  open,
  onOpenChange,
  insights,
  onViewAllInsights,
}: InsightsModalProps) {
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  const handleNextInsight = () => {
    setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
  };

  const handlePreviousInsight = () => {
    setCurrentInsightIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-yellow-500" />
            Prayer Insights
          </DialogTitle>
          <DialogDescription>
            Personalized insights based on your prayer journey
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="py-4">
          {insights.length > 0 ? (
            <div className="space-y-6">
              {/* Insight Card */}
              <Card className={`border-l-4 ${insights[currentInsightIndex].color}`}>
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full bg-${insights[currentInsightIndex].color.split('-')[0]}-100`}>
                      {insights[currentInsightIndex].icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{insights[currentInsightIndex].title}</h3>
                      <p className="text-sm text-muted-foreground">{insights[currentInsightIndex].description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {insights.length > 1 && (
                <div className="flex justify-between items-center">
                  <Button variant="ghost" size="sm" onClick={handlePreviousInsight}>
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {currentInsightIndex + 1} of {insights.length}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleNextInsight}>
                    Next
                  </Button>
                </div>
              )}

              {/* Sample Insights */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">More insights available</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border border-muted p-3 hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center text-center gap-1">
                      <TrendingUp className="h-5 w-5 text-primary/60 mb-1" />
                      <h5 className="text-xs font-medium">Consistency Trends</h5>
                    </div>
                  </Card>
                  <Card className="border border-muted p-3 hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center text-center gap-1">
                      <Clock className="h-5 w-5 text-primary/60 mb-1" />
                      <h5 className="text-xs font-medium">Time Patterns</h5>
                    </div>
                  </Card>
                  <Card className="border border-muted p-3 hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center text-center gap-1">
                      <Calendar className="h-5 w-5 text-primary/60 mb-1" />
                      <h5 className="text-xs font-medium">Monthly Review</h5>
                    </div>
                  </Card>
                  <Card className="border border-muted p-3 hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center text-center gap-1">
                      <MapPin className="h-5 w-5 text-primary/60 mb-1" />
                      <h5 className="text-xs font-medium">Location Analysis</h5>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <LightbulbIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p>No insights available yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Continue your prayer journey to unlock personalized insights
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onViewAllInsights}
            className="w-full"
          >
            View All Insights
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
