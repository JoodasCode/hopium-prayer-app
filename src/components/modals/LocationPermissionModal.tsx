'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Globe } from 'lucide-react';

interface LocationPermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationGranted: () => void;
  onLocationDenied: () => void;
}

export function LocationPermissionModal({ 
  open, 
  onOpenChange, 
  onLocationGranted, 
  onLocationDenied 
}: LocationPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestLocation = async () => {
    setIsRequesting(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000
        });
      });
      
      onLocationGranted();
      onOpenChange(false);
    } catch (error) {
      onLocationDenied();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    onLocationDenied();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Enable Location Services
          </DialogTitle>
          <DialogDescription className="text-left">
            We need your location to provide accurate prayer times for your area. 
            This helps us calculate the correct times based on your geographical position.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Precise Prayer Times</h4>
                <p className="text-xs text-muted-foreground">Get accurate times for your exact location</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Auto-Update</h4>
                <p className="text-xs text-muted-foreground">Times adjust automatically when you travel</p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="w-full sm:w-auto"
          >
            Skip for Now
          </Button>
          <Button 
            onClick={handleRequestLocation}
            disabled={isRequesting}
            className="w-full sm:w-auto"
          >
            {isRequesting ? 'Requesting...' : 'Allow Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 