/**
 * Theme Step for the enhanced onboarding flow
 * Allows users to select their preferred visual theme
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeStepProps {
  onNext: (theme: 'serene' | 'degen' | 'beginner' | 'custom') => void;
  onBack: () => void;
  selectedTheme?: 'serene' | 'degen' | 'beginner' | 'custom';
}

type ThemeOption = {
  id: 'serene' | 'degen' | 'beginner' | 'custom';
  name: string;
  description: string;
  icon: string;
  previewClass: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  { 
    id: 'serene', 
    name: 'Serene', 
    description: 'Minimal, soothing blue/green palette',
    icon: '🌙',
    previewClass: 'bg-gradient-to-br from-blue-50 to-teal-50 border-teal-200'
  },
  { 
    id: 'degen', 
    name: 'Degen', 
    description: 'Dark mode, motivational aesthetic',
    icon: '🔥',
    previewClass: 'bg-gradient-to-br from-gray-900 to-slate-800 border-indigo-900 text-white'
  },
  { 
    id: 'beginner', 
    name: 'Beginner', 
    description: 'Friendly & educational interface',
    icon: '🐣',
    previewClass: 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200'
  },
  { 
    id: 'custom', 
    name: 'Custom', 
    description: 'Coming soon - create your own theme',
    icon: '🎨',
    previewClass: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 opacity-50'
  },
];

export function ThemeStep({ 
  onNext, 
  onBack,
  selectedTheme = 'serene'
}: ThemeStepProps) {
  const [selected, setSelected] = useState<'serene' | 'degen' | 'beginner' | 'custom'>(selectedTheme);
  const [previewTheme, setPreviewTheme] = useState<'serene' | 'degen' | 'beginner' | 'custom'>(selectedTheme);
  
  const handleSelect = (themeId: 'serene' | 'degen' | 'beginner' | 'custom') => {
    // Don't allow selecting custom theme yet
    if (themeId === 'custom') {
      return;
    }
    
    setSelected(themeId);
    
    // Provide haptic feedback on selection
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };
  
  const handlePreview = (themeId: 'serene' | 'degen' | 'beginner' | 'custom') => {
    setPreviewTheme(themeId);
    
    // Subtle haptic feedback on hover
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };
  
  // Get the currently selected theme option
  const currentTheme = THEME_OPTIONS.find(theme => theme.id === previewTheme) || THEME_OPTIONS[0];
  
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
              <span className="text-3xl">🎨</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-center">Choose Your Vibe</h2>
          
          <p className="text-center text-muted-foreground mb-4">
            Pick a theme that resonates with your prayer journey
          </p>
          
          {/* Theme preview */}
          <motion.div 
            className={`w-full h-32 rounded-lg border-2 flex items-center justify-center mb-4 ${currentTheme.previewClass}`}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <span className="text-4xl">{currentTheme.icon}</span>
              <p className={`mt-2 font-medium ${currentTheme.id === 'degen' ? 'text-white' : ''}`}>{currentTheme.name}</p>
            </div>
          </motion.div>
          
          {/* Theme options */}
          <div className="grid grid-cols-2 gap-3">
            {THEME_OPTIONS.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: theme.id === 'custom' ? 0.7 : 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="relative"
              >
                <Button
                  variant={selected === theme.id ? "default" : "outline"}
                  className={`w-full h-auto py-3 px-4 flex flex-col items-center justify-center ${selected === theme.id ? 'ring-2 ring-primary' : ''} ${theme.id === 'custom' ? 'cursor-not-allowed' : ''}`}
                  onClick={() => handleSelect(theme.id)}
                  onMouseEnter={() => handlePreview(theme.id)}
                  onFocus={() => handlePreview(theme.id)}
                  disabled={theme.id === 'custom'}
                >
                  <span className="text-2xl mb-1">{theme.icon}</span>
                  <span className="font-medium">{theme.name}</span>
                  {theme.id === 'custom' && (
                    <span className="text-xs mt-1 px-2 py-1 bg-muted rounded-full">Coming Soon</span>
                  )}
                </Button>
                {selected === theme.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
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
            onClick={() => onNext(selected)}
            disabled={!selected || selected === 'custom'}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
