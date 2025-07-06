'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, MapPin, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRAYER_METHOD_OPTIONS } from '@/types/onboarding';

interface PrayerSetupStepProps {
  onNext: () => void;
  onPrevious?: () => void;
  onDataUpdate?: (data: any) => void;
  data?: any;
  isLoading?: boolean;
}

export default function PrayerSetupStep({ 
  onNext, 
  onPrevious, 
  onDataUpdate, 
  data, 
  isLoading 
}: PrayerSetupStepProps) {
  const [selectedMethod, setSelectedMethod] = useState(data?.prayerMethod || 'isna');

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    onDataUpdate?.({ prayerMethod: methodId });
  };

  const handleNext = () => {
    onDataUpdate?.({ prayerMethod: selectedMethod });
    onNext();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Prayer time calculation
          </h2>
          <p className="text-muted-foreground">
            Choose the calculation method that works best for your location
          </p>
        </div>

        {/* Method Selection */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {PRAYER_METHOD_OPTIONS.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border bg-background"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{method.name}</p>
                        {method.isDefault && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      <p className="text-xs text-muted-foreground">Region: {method.region}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Location Status */}
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Location access</p>
                <p className="text-xs text-muted-foreground">
                  {data?.locationPermission ? 'Enabled for accurate prayer times' : 'Manual location setup available'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {onPrevious && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You can change this later in settings
        </p>
      </div>
    </div>
  );
} 