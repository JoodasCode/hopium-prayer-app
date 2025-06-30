'use client';

import { useState, useEffect } from 'react';
import { ArrowBigUp, Compass, Smartphone, Volume2, Vibrate, Moon, Sun, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/shared/BottomNav';

export default function QiblaFinderPage() {
  // State for qibla direction (in degrees from north)
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [currentDirection, setCurrentDirection] = useState<number>(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showMindfulPrompt, setShowMindfulPrompt] = useState(true);
  const [activeMode, setActiveMode] = useState<'standard' | 'ar' | 'haptic'>('standard');
  const [hapticIntensity, setHapticIntensity] = useState(50);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const { theme } = useTheme();
  
  // Mock location data (would be replaced with real geolocation)
  const userLocation = {
    latitude: 51.5074,
    longitude: -0.1278,
    city: 'London',
    country: 'United Kingdom'
  };
  
  // Calculate mock distance to Mecca
  const distanceToMecca = '4,187 km';
  
  // Simulate compass functionality
  useEffect(() => {
    // In a real implementation, we would use the device orientation API
    // and calculate the actual Qibla direction based on user's location
    
    // Mock Qibla direction (northeast for London)
    setQiblaDirection(119);
    
    // Simulate compass movement
    const interval = setInterval(() => {
      setCurrentDirection(prev => (prev + 1) % 360);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate how close the user is to the correct direction
  const directionDifference = qiblaDirection !== null 
    ? Math.abs((currentDirection - qiblaDirection + 180) % 360 - 180)
    : 180;
  
  const isAligned = directionDifference < 5;
  
  // Simulate haptic feedback when aligned
  useEffect(() => {
    if (isAligned && vibrationEnabled && activeMode === 'haptic') {
      // In a real implementation, we would use the vibration API
      console.log('Vibrating to indicate alignment');
      // navigator.vibrate(200);
    }
  }, [isAligned, vibrationEnabled, activeMode]);
  
  // Handle calibration
  const calibrateCompass = () => {
    setIsCalibrating(true);
    // Simulate calibration process
    setTimeout(() => {
      setIsCalibrating(false);
    }, 3000);
  };
  
  // Handle mindful prompt dismissal
  const dismissMindfulPrompt = () => {
    setShowMindfulPrompt(false);
  };
  
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container max-w-md mx-auto px-3 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Qibla Finder</h1>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Info className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        {/* Mindful Prompt - shown only initially */}
        <AnimatePresence>
          {showMindfulPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Card className="border border-primary/20 bg-primary/5">
                <CardContent className="pt-6 pb-4 text-center">
                  <h2 className="text-lg font-semibold mb-2">Center your heart</h2>
                  <p className="text-muted-foreground mb-4">
                    You are about to face the House of God. Take a moment to set your intention.
                  </p>
                  <Button onClick={dismissMindfulPrompt} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Location Info */}
        <Card className="mb-4 border border-primary/20">
          <CardContent className="py-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Your Location</p>
                <p className="font-medium">{userLocation.city}, {userLocation.country}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Distance to Mecca</p>
                <p className="font-medium">{distanceToMecca}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Mode Selection Tabs */}
        <Tabs defaultValue="standard" className="mb-4" onValueChange={(value) => setActiveMode(value as any)}>
          <TabsList className="grid grid-cols-3 mb-4 w-full">
            <TabsTrigger value="standard">
              <div className="flex items-center gap-1">
                <Compass className="h-4 w-4" />
                <span>Standard</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="ar">
              <div className="flex items-center gap-1">
                <Smartphone className="h-4 w-4" />
                <span>AR View</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="haptic">
              <div className="flex items-center gap-1">
                <Vibrate className="h-4 w-4" />
                <span>Haptic</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          {/* Standard Compass View */}
          <TabsContent value="standard" className="space-y-4">
            <div className="relative flex justify-center items-center py-8">
              {/* Compass Rose */}
              <div className="relative w-64 h-64">
                {/* Compass dial */}
                <div 
                  className="absolute inset-0 rounded-full border-4 border-primary/20 flex items-center justify-center"
                  style={{ transform: `rotate(${-currentDirection}deg)` }}
                >
                  {/* Cardinal directions */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-lg">N</div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-lg">E</div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-lg">S</div>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-lg">W</div>
                  
                  {/* Degree markers */}
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute h-full w-0.5 bg-muted-foreground/20"
                      style={{ transform: `rotate(${i * 30}deg)` }}
                    />
                  ))}
                </div>
                
                {/* Qibla direction indicator */}
                {qiblaDirection !== null && (
                  <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-full flex flex-col items-center"
                    style={{ transform: `rotate(${qiblaDirection}deg)` }}
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-background rounded-full" />
                    </div>
                    <div className="flex-1 w-1 bg-primary" />
                  </div>
                )}
                
                {/* Center point */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary/80" />
                </div>
              </div>
              
              {/* Direction indicator */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2">
                <ArrowBigUp className="h-10 w-10 text-destructive" />
              </div>
            </div>
            
            <div className="text-center">
              {isAligned ? (
                <Badge variant="outline" className="bg-primary/10 text-primary px-4 py-2">
                  Aligned with Qibla
                </Badge>
              ) : (
                <p className="text-muted-foreground">
                  Rotate your device to find the Qibla direction
                </p>
              )}
            </div>
            
            <Button onClick={calibrateCompass} variant="outline" className="w-full">
              {isCalibrating ? 'Calibrating...' : 'Calibrate Compass'}
            </Button>
          </TabsContent>
          
          {/* AR View */}
          <TabsContent value="ar" className="space-y-4">
            <div className="bg-muted aspect-[9/16] rounded-lg flex items-center justify-center">
              <div className="text-center p-6">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">AR View</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Point your camera to see the Qibla direction overlaid on your surroundings.
                </p>
                <Button className="w-full">
                  Enable Camera
                </Button>
              </div>
            </div>
            
            <Card className="border border-primary/20">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  AR mode requires camera permission and works best in good lighting conditions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Haptic Mode */}
          <TabsContent value="haptic" className="space-y-4">
            <Card className="border border-primary/20">
              <CardContent className="py-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Vibrate className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Vibration</p>
                        <p className="text-xs text-muted-foreground">Feel when aligned</p>
                      </div>
                    </div>
                    <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Audio Cues</p>
                        <p className="text-xs text-muted-foreground">Hear when aligned</p>
                      </div>
                    </div>
                    <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="font-medium">Haptic Intensity</p>
                      <p className="text-sm text-muted-foreground">{hapticIntensity}%</p>
                    </div>
                    <Slider 
                      value={[hapticIntensity]} 
                      onValueChange={(values) => setHapticIntensity(values[0])} 
                      max={100} 
                      step={10}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="relative flex justify-center items-center py-8">
              {/* Simplified direction indicator */}
              <div className="w-32 h-32 rounded-full border-4 border-muted flex items-center justify-center relative">
                <div 
                  className="absolute h-full w-1 bg-primary origin-center"
                  style={{ 
                    transform: `rotate(${qiblaDirection !== null ? qiblaDirection : 0}deg)`,
                    opacity: qiblaDirection !== null ? 1 : 0
                  }}
                />
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                Rotate slowly until you feel vibration
              </p>
              {isAligned && (
                <Badge variant="outline" className="bg-primary/10 text-primary px-4 py-2">
                  Qibla Found
                </Badge>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Time-based indicator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-1">
            <Sun className="h-4 w-4 text-amber-500" />
            <span className="text-sm">Day Mode</span>
          </div>
          <div className="flex items-center gap-1">
            <Moon className="h-4 w-4 text-blue-400" />
            <span className="text-sm">Night Mode</span>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
