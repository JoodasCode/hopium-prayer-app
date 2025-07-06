'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Sun, Clock, Calendar, Settings, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FirstPrayerCapture } from '@/types/onboarding';

interface FirstPrayerStepProps {
  onNext: () => void;
  onPrevious?: () => void;
  onFirstPrayerLog?: (data: FirstPrayerCapture) => Promise<any>;
  isLoading?: boolean;
}

const prayerTypes = [
  { id: 'fajr', name: 'Fajr', icon: Sun, time: 'Dawn' },
  { id: 'dhuhr', name: 'Dhuhr', icon: Sun, time: 'Midday' },
  { id: 'asr', name: 'Asr', icon: Sun, time: 'Afternoon' },
  { id: 'maghrib', name: 'Maghrib', icon: Sun, time: 'Sunset' },
  { id: 'isha', name: 'Isha', icon: Sun, time: 'Night' }
];

const scenarios = [
  {
    id: 'just_finished',
    title: 'I just finished praying',
    description: 'Perfect! Let\'s log this prayer',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    xp: 25
  },
  {
    id: 'about_to_start',
    title: 'I\'m about to pray now',
    description: 'Great timing! We\'ll pre-log this for you',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    xp: 25
  },
  {
    id: 'earlier_today',
    title: 'I prayed earlier today',
    description: 'Let\'s add that to your log',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    xp: 20
  },
  {
    id: 'schedule_next',
    title: 'I want to plan my next prayer',
    description: 'We\'ll help you get started',
    icon: Settings,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    xp: 15
  }
];

const emotionalStates = [
  { id: 'peaceful', label: 'Peaceful', icon: '😌' },
  { id: 'focused', label: 'Focused', icon: '🎯' },
  { id: 'grateful', label: 'Grateful', icon: '🙏' },
  { id: 'rushed', label: 'Rushed', icon: '⚡' },
  { id: 'distracted', label: 'Distracted', icon: '😅' }
];

const timingOptions = [
  { id: 'early', label: 'A bit early' },
  { id: 'on_time', label: 'Right on time' },
  { id: 'late', label: 'A bit late' }
];

const approximateTimeOptions = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' }
];

export default function FirstPrayerStep({ onNext, onPrevious, onFirstPrayerLog, isLoading }: FirstPrayerStepProps) {
  const [step, setStep] = useState<'scenario' | 'details' | 'logging'>('scenario');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [selectedPrayer, setSelectedPrayer] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('peaceful');
  const [selectedTiming, setSelectedTiming] = useState<string>('on_time');
  const [selectedApproxTime, setSelectedApproxTime] = useState<string>('morning');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentScenario = scenarios.find(s => s.id === selectedScenario);

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setStep('details');
  };

  const handleLogPrayer = async () => {
    if (!selectedPrayer || !selectedScenario) return;

    setIsProcessing(true);
    setStep('logging');

    try {
      const prayerData: FirstPrayerCapture = {
        scenario: selectedScenario as 'just_finished' | 'about_to_start' | 'earlier_today' | 'schedule_next',
        prayerType: selectedPrayer as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
        emotionalState: selectedEmotion as 'focused' | 'peaceful' | 'rushed' | 'grateful' | 'strong',
        timing: selectedTiming as 'early' | 'on_time' | 'late',
        approximateTime: selectedScenario === 'earlier_today' ? selectedApproxTime as 'morning' | 'afternoon' | 'evening' | 'night' : undefined
      };

      const result = await onFirstPrayerLog?.(prayerData);
      
      if (result?.success) {
        // Show success for a moment then continue
        setTimeout(() => {
          onNext();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to log first prayer:', error);
      setIsProcessing(false);
      setStep('details');
    }
  };

  const canContinue = selectedPrayer && selectedScenario;

  if (step === 'logging') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              Logging your prayer...
            </h2>
            <p className="text-muted-foreground">
              Setting up your spiritual dashboard
            </p>
          </div>

          <div className="w-8 h-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {step === 'scenario' ? 'Let\'s log your first prayer' : 'Tell us more'}
          </h2>
          <p className="text-muted-foreground">
            {step === 'scenario' 
              ? 'This ensures you start with a populated dashboard' 
              : 'Help us make this meaningful for you'
            }
          </p>
        </div>

        {step === 'scenario' && (
          <div className="space-y-4">
            {scenarios.map((scenario) => {
              const IconComponent = scenario.icon;
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario.id)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                    "hover:border-primary/50 hover:bg-primary/5",
                    scenario.bgColor
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg bg-white/80", scenario.color)}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{scenario.title}</p>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +{scenario.xp} XP
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 'details' && currentScenario && (
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Prayer Selection */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Which prayer?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {prayerTypes.map((prayer) => {
                    const IconComponent = prayer.icon;
                    const isSelected = selectedPrayer === prayer.id;
                    return (
                      <button
                        key={prayer.id}
                        onClick={() => setSelectedPrayer(prayer.id)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all duration-200",
                          "hover:border-primary/50",
                          isSelected 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-border bg-background"
                        )}
                      >
                        <div className="text-center space-y-1">
                          <IconComponent className="h-4 w-4 mx-auto" />
                          <p className="font-medium text-sm">{prayer.name}</p>
                          <p className="text-xs text-muted-foreground">{prayer.time}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional questions based on scenario */}
              {selectedScenario === 'just_finished' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">How was it?</h3>
                  <div className="flex flex-wrap gap-2">
                    {emotionalStates.map((emotion) => (
                      <button
                        key={emotion.id}
                        onClick={() => setSelectedEmotion(emotion.id)}
                        className={cn(
                          "px-3 py-2 rounded-lg border transition-all duration-200",
                          selectedEmotion === emotion.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span className="mr-2">{emotion.icon}</span>
                        <span className="text-sm">{emotion.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedScenario === 'about_to_start' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Timing</h3>
                  <div className="space-y-2">
                    {timingOptions.map((timing) => (
                      <button
                        key={timing.id}
                        onClick={() => setSelectedTiming(timing.id)}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-all duration-200",
                          selectedTiming === timing.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {timing.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedScenario === 'earlier_today' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Roughly when?</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {approximateTimeOptions.map((timeOption) => (
                      <button
                        key={timeOption.id}
                        onClick={() => setSelectedApproxTime(timeOption.id)}
                        className={cn(
                          "p-3 rounded-lg border text-center transition-all duration-200",
                          selectedApproxTime === timeOption.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <p className="text-sm font-medium">{timeOption.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {(step === 'details' || onPrevious) && (
            <Button
              variant="outline"
              onClick={step === 'details' ? () => setStep('scenario') : onPrevious}
              disabled={isLoading || isProcessing}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          {step === 'details' && (
            <Button
              onClick={handleLogPrayer}
              disabled={!canContinue || isLoading || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Log Prayer (+{currentScenario?.xp} XP)
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Helper text */}
        {step === 'scenario' && (
          <p className="text-center text-xs text-muted-foreground">
            🎯 This creates your first data point so you start with a meaningful dashboard
          </p>
        )}
      </div>
    </div>
  );
} 