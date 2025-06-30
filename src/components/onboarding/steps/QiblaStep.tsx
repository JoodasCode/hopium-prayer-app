/**
 * Qibla Step for the enhanced onboarding flow
 * Sets up prayer orientation preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Compass, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QiblaStepProps {
  onNext: () => void;
  onBack: () => void;
}

const CALCULATION_METHODS = [
  { id: 'mwl', name: 'Muslim World League' },
  { id: 'isna', name: 'Islamic Society of North America' },
  { id: 'egypt', name: 'Egyptian General Authority' },
  { id: 'makkah', name: 'Umm al-Qura University, Makkah' },
  { id: 'karachi', name: 'University of Islamic Sciences, Karachi' },
  { id: 'tehran', name: 'Institute of Geophysics, University of Tehran' },
  { id: 'shia', name: 'Shia Ithna-Ashari' },
];

// Common cities for autocomplete
const COMMON_CITIES = [
  'London, UK',
  'New York, USA',
  'Tokyo, Japan',
  'Paris, France',
  'Dubai, UAE',
  'Istanbul, Turkey',
  'Cairo, Egypt',
  'Mecca, Saudi Arabia',
  'Medina, Saudi Arabia',
  'Kuala Lumpur, Malaysia',
  'Jakarta, Indonesia',
  'Karachi, Pakistan',
  'Delhi, India',
  'Toronto, Canada',
  'Sydney, Australia',
];

export function QiblaStep({ onNext, onBack }: QiblaStepProps) {
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [manualLocationMode, setManualLocationMode] = useState<boolean>(false);
  const [autoUpdates, setAutoUpdates] = useState<boolean>(true);
  const [calculationMethod, setCalculationMethod] = useState<string>('mwl');
  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [compassAngle, setCompassAngle] = useState<number>(0);
  const [manualLocation, setManualLocation] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  
  // Simulate compass animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCompassAngle(prev => {
        // Target angle is 138 (example Qibla direction)
        const target = 138;
        const diff = target - prev;
        
        // If we're close to the target, stop animating
        if (Math.abs(diff) < 2) {
          clearInterval(interval);
          return target;
        }
        
        // Move toward target
        return prev + diff * 0.1;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle location permission request
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission(true);
          // Provide haptic feedback for successful permission
          if (navigator.vibrate) {
            navigator.vibrate([40, 30, 40]);
          }
        },
        () => {
          setLocationPermission(false);
          // Provide haptic feedback for denied permission
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
        }
      );
    }
  };
  
  // Handle manual location input and filter cities
  const handleLocationInput = (input: string) => {
    setManualLocation(input);
    
    if (input.length >= 2) {
      const filtered = COMMON_CITIES.filter(city => 
        city.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };
  
  // Select a city from suggestions
  const selectCity = (city: string) => {
    setManualLocation(city);
    setShowSuggestions(false);
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6 pb-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <span className="text-3xl">📍</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-center">Prayer Orientation</h2>
          
          <p className="text-center text-muted-foreground mb-4">
            Set your prayer preferences for accurate times and direction
          </p>
          
          {/* Compass animation */}
          <div className="flex justify-center my-6">
            <motion.div 
              className="relative w-32 h-32"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-muted flex items-center justify-center">
                <div className="absolute top-2 text-xs font-medium">N</div>
                <div className="absolute right-2 text-xs font-medium">E</div>
                <div className="absolute bottom-2 text-xs font-medium">S</div>
                <div className="absolute left-2 text-xs font-medium">W</div>
                
                <motion.div 
                  className="w-1 h-16 bg-gradient-to-t from-primary to-transparent absolute top-[calc(50%-32px)] origin-bottom"
                  style={{ rotate: `${compassAngle}deg` }}
                />
                
                <div className="w-3 h-3 rounded-full bg-primary absolute" />
              </div>
              
              <motion.div 
                className="absolute -bottom-6 text-sm font-medium text-center w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: compassAngle >= 130 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                Qibla Direction
              </motion.div>
            </motion.div>
          </div>
          
          {/* Location permission */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Location for Qibla</Label>
                <p className="text-sm text-muted-foreground">
                  {locationPermission ? 'Location access granted' : manualLocationMode ? 'Enter your location manually' : 'Recommended for accurate prayer times'}
                </p>
              </div>
              
              {!manualLocationMode && (
                <Button 
                  variant={locationPermission ? "outline" : "default"}
                  size="sm"
                  onClick={requestLocation}
                  className="flex items-center"
                  disabled={locationPermission}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {locationPermission ? 'Granted' : 'Allow Location'}
                </Button>
              )}
            </div>
            
            {!locationPermission && (
              <div className="mt-2">
                {!manualLocationMode ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setManualLocationMode(true)}
                    className="w-full"
                  >
                    Enter location manually instead
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="manual-location">City or Address</Label>
                    <div className="flex gap-2">
                      <div className="relative w-full">
                        <input
                          id="manual-location"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter your city or address"
                          value={manualLocation}
                          onChange={(e) => handleLocationInput(e.target.value)}
                          onFocus={() => manualLocation.length >= 2 && setShowSuggestions(true)}
                          onBlur={() => {
                            // Delay hiding suggestions to allow for clicks
                            setTimeout(() => setShowSuggestions(false), 200);
                          }}
                        />
                        
                        {showSuggestions && (
                          <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredCities.map((city, index) => (
                              <div 
                                key={index}
                                className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                                onMouseDown={() => selectCity(city)}
                              >
                                {city}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setManualLocationMode(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Calculation method */}
            <div className="space-y-2">
              <Label htmlFor="calculation-method">Calculation Method</Label>
              <Select value={calculationMethod} onValueChange={setCalculationMethod}>
                <SelectTrigger id="calculation-method">
                  <SelectValue placeholder="Select calculation method" />
                </SelectTrigger>
                <SelectContent>
                  {CALCULATION_METHODS.map(method => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Hijri calendar offset */}
            <div className="space-y-2">
              <Label>Hijri Calendar Offset</Label>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setHijriOffset(prev => Math.max(-1, prev - 1))}
                  disabled={hijriOffset <= -1}
                >
                  -
                </Button>
                <span className="w-8 text-center">{hijriOffset}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setHijriOffset(prev => Math.min(1, prev + 1))}
                  disabled={hijriOffset >= 1}
                >
                  +
                </Button>
              </div>
            </div>
            
            {/* Auto location updates */}
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="auto-updates" 
                checked={autoUpdates} 
                onCheckedChange={setAutoUpdates} 
              />
              <Label htmlFor="auto-updates">Auto Location Updates</Label>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between pt-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button 
            onClick={onNext}
            disabled={!locationPermission && (!manualLocationMode || (manualLocationMode && manualLocation.trim().length < 3))}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
