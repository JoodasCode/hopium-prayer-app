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
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  MapPin, 
  Clock, 
  Globe,
  CheckCircle,
  Info
} from "lucide-react";
import { CALCULATION_METHODS, type CalculationMethodKey } from '@/lib/prayerTimes';
import type { LocationData } from '@/types';

interface PrayerSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMethod: CalculationMethodKey;
  currentLocation: LocationData | null;
  onMethodChange: (method: CalculationMethodKey) => void;
  onLocationRefresh: () => void;
}

const CALCULATION_METHOD_INFO = {
  ISNA: {
    name: 'Islamic Society of North America',
    region: 'North America',
    description: 'Standard method used across North America',
    fajr: '15°',
    isha: '15°'
  },
  MWL: {
    name: 'Muslim World League',
    region: 'Global',
    description: 'Used in Europe, Far East, parts of US',
    fajr: '18°',
    isha: '17°'
  },
  EGYPT: {
    name: 'Egyptian General Authority',
    region: 'Africa, Middle East',
    description: 'Used in Egypt, Africa, Syria',
    fajr: '19.5°',
    isha: '17.5°'
  },
  MAKKAH: {
    name: 'Umm al-Qura University',
    region: 'Saudi Arabia',
    description: 'Used in Saudi Arabia',
    fajr: '18.5°',
    isha: '90 min after Maghrib'
  },
  KARACHI: {
    name: 'University of Islamic Sciences',
    region: 'South Asia',
    description: 'Used in Pakistan, Bangladesh, India',
    fajr: '18°',
    isha: '18°'
  },
  TEHRAN: {
    name: 'Institute of Geophysics',
    region: 'Iran',
    description: 'Used in Iran, some Shia communities',
    fajr: '17.7°',
    isha: '14°'
  },
  JAFARI: {
    name: 'Shia Ithna Ashari',
    region: 'Shia Communities',
    description: 'Used by Shia Muslims',
    fajr: '16°',
    isha: '14°'
  }
} as const;

export default function PrayerSettingsModal({
  open,
  onOpenChange,
  currentMethod,
  currentLocation,
  onMethodChange,
  onLocationRefresh
}: PrayerSettingsModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<CalculationMethodKey>(currentMethod);

  const handleSave = () => {
    onMethodChange(selectedMethod);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Prayer Settings
          </DialogTitle>
          <DialogDescription>
            Customize your prayer time calculations and location settings
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6">
            {/* Location Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Location</h3>
              </div>
              
              {currentLocation ? (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {currentLocation.city || 'Current Location'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentLocation.country} • {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                      </p>
                      {currentLocation.source && (
                        <Badge variant="secondary" className="text-xs">
                          {currentLocation.source === 'gps' ? 'GPS' : 'IP Location'}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onLocationRefresh}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg border border-muted">
                  <p className="text-sm text-muted-foreground">Location not available</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={onLocationRefresh}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Get Location
                  </Button>
                </div>
              )}
            </div>

            {/* Calculation Method Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Calculation Method</h3>
              </div>
              
              <div className="space-y-2">
                {Object.entries(CALCULATION_METHOD_INFO).map(([key, info]) => {
                  const methodKey = key as CalculationMethodKey;
                  const isSelected = selectedMethod === methodKey;
                  
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-primary/30 hover:bg-primary/5'
                      }`}
                      onClick={() => setSelectedMethod(methodKey)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{info.name}</h4>
                            {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {info.region}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Fajr: {info.fajr} • Isha: {info.isha}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Information Section */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    About Calculation Methods
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-200">
                    Different Islamic organizations use varying angles for Fajr and Isha calculations. 
                    Choose the method most commonly used in your region or preferred by your local mosque.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 