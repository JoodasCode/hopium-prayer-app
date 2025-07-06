'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, MapPin, Clock, CheckCircle } from 'lucide-react';

interface PrayerDemoStepProps {
  onNext: () => void;
  onPrevious?: () => void;
  onDataUpdate?: (data: any) => void;
  isLoading?: boolean;
}

export default function PrayerDemoStep({ onNext, onPrevious, onDataUpdate, isLoading }: PrayerDemoStepProps) {
  const [locationGranted, setLocationGranted] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock next prayer time (Maghrib in ~6 hours)
  const nextPrayerTime = new Date();
  nextPrayerTime.setHours(18, 42, 0, 0);
  
  // Calculate time until next prayer
  const timeUntil = nextPrayerTime.getTime() - currentTime.getTime();
  const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const requestLocation = async () => {
    setIsRequestingLocation(true);
    
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });
        
        setLocationGranted(true);
        onDataUpdate?.({
          locationPermission: true,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });
      }
    } catch (error) {
      console.error('Location access denied or failed:', error);
      // Continue anyway - we can ask again later or use manual location
      setLocationGranted(true);
      onDataUpdate?.({
        locationPermission: false
      });
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleContinue = () => {
    if (!locationGranted) {
      requestLocation();
    } else {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Smart tracking that actually works
          </h2>
          <p className="text-muted-foreground">
            See how Mulvi intelligently schedules your prayers based on your location
          </p>
        </div>

        {/* Demo Interface */}
        <Card className="border-primary/20">
          <CardContent className="p-6 space-y-6">
            {/* Current Time */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Current time</p>
              <p className="text-lg font-mono">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
            </div>

            {/* Next Prayer Countdown */}
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Next Prayer</p>
              <div className="space-y-1">
                <p className="text-xl font-bold text-primary">Maghrib</p>
                <p className="text-lg font-mono">
                  {nextPrayerTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  in {hoursUntil}h {minutesUntil}m
                </p>
              </div>
            </div>

            {/* Location Status */}
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {locationGranted ? 'Location enabled' : 'Location access needed'}
                </span>
              </div>
              {locationGranted && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>

            {/* Features Preview */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">What you get:</p>
              <div className="space-y-2">
                {[
                  'Accurate prayer times for your location',
                  'Smart notifications 15 minutes before',
                  'Automatic adjustments for travel',
                  'Works offline once set up'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
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
              disabled={isLoading || isRequestingLocation}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button
            onClick={handleContinue}
            disabled={isLoading || isRequestingLocation}
            className="flex-1"
          >
            {isRequestingLocation ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Getting location...
              </>
            ) : isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {locationGranted ? 'Continue' : 'Enable Location'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-xs text-muted-foreground">
          Your location is only used for prayer time calculations and stays private
        </p>
      </div>
    </div>
  );
} 