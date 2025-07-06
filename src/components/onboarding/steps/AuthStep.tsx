'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Mail, Shield, Chrome } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthStepProps {
  onNext: () => void;
  onPrevious?: () => void;
  onDataUpdate?: (data: any) => void;
  isLoading?: boolean;
}

export default function AuthStep({ onNext, onPrevious, onDataUpdate, isLoading }: AuthStepProps) {
  const [authMethod, setAuthMethod] = useState<'social' | 'email'>('social');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { signUp, signIn } = useAuth();

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    try {
      // TODO: Implement Google OAuth later
      console.log('Google auth coming soon');
    } catch (error) {
      console.error('Google auth failed:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    
    setIsAuthenticating(true);
    try {
      const result = isSignUp 
        ? await signUp(email, password, 'User')
        : await signIn(email, password);
        
      if (result) {
        onDataUpdate?.({ authMethod: 'email', email });
        onNext();
      }
    } catch (error) {
      console.error('Email auth failed:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const canContinueWithEmail = email && password && email.includes('@');

  return (
    <div className="w-full space-y-6 p-4">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Create your account
          </h2>
          <p className="text-muted-foreground">
            Your data is yours, always. We'll keep your spiritual journey private and secure.
          </p>
        </div>

        {/* Auth Methods */}
        <div className="space-y-4">
          {/* Social Auth (Priority) */}
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-3">
                <h3 className="font-semibold text-foreground">Quick Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Get started in seconds with your existing account
                </p>
              </div>
              
              <Button
                onClick={handleGoogleAuth}
                disabled={isAuthenticating || isLoading}
                variant="outline"
                size="lg"
                className="w-full h-12"
              >
                {isAuthenticating ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Chrome className="mr-3 h-5 w-5" />
                    Continue with Google
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Email Auth */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-foreground">Email & Password</h3>
                <p className="text-sm text-muted-foreground">
                  Create an account with your email address
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:text-primary/80"
                  >
                    {isSignUp ? 'Already have an account?' : 'Need to create an account?'}
                  </button>
                </div>

                <Button
                  onClick={handleEmailAuth}
                  disabled={!canContinueWithEmail || isAuthenticating || isLoading}
                  size="lg"
                  className="w-full h-12"
                >
                  {isAuthenticating ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="mr-3 h-5 w-5" />
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {onPrevious && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isAuthenticating || isLoading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        {/* Privacy Note */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our terms of service and privacy policy
          </p>
          <p className="text-xs text-muted-foreground">
            🔒 Your spiritual data stays private and secure
          </p>
        </div>
    </div>
  );
} 