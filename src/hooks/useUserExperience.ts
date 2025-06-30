import { useUserState } from '@/contexts/UserStateContext';

type ExperienceType = 'new' | 'minimal' | 'returning';

/**
 * Hook to determine which user experience to show based on user state
 */
export function useUserExperience() {
  const { userState } = useUserState();
  
  // Determine experience type based on data threshold
  const experienceType: ExperienceType = 
    !userState.isAuthenticated || userState.dataThreshold === 'none' ? 'new' :
    userState.dataThreshold === 'minimal' ? 'minimal' : 'returning';
  
  // Check if this is the user's first visit today
  const isFirstVisitToday = (): boolean => {
    if (!userState.lastVisited) return true;
    
    const lastVisit = new Date(userState.lastVisited);
    const today = new Date();
    
    return lastVisit.toDateString() !== today.toDateString();
  };
  
  // Check if user is returning after an absence (more than 3 days)
  const isReturningAfterAbsence = (): boolean => {
    if (!userState.lastVisited) return false;
    
    const lastVisit = new Date(userState.lastVisited);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 3;
  };
  
  // Get welcome message based on user state
  const getWelcomeMessage = (): string => {
    if (!userState.isAuthenticated) {
      return 'Welcome to Hopium Prayer App';
    }
    
    if (isReturningAfterAbsence()) {
      return 'Welcome back! We missed you';
    }
    
    if (isFirstVisitToday()) {
      return `Welcome back, ${userState.user?.user_metadata?.name || 'friend'}`;
    }
    
    return `Hello again, ${userState.user?.user_metadata?.name || 'friend'}`;
  };
  
  return {
    experienceType,
    isFirstVisitToday: isFirstVisitToday(),
    isReturningAfterAbsence: isReturningAfterAbsence(),
    welcomeMessage: getWelcomeMessage(),
    showOnboarding: !userState.isOnboardingCompleted && userState.isAuthenticated,
    showEmptyState: userState.dataThreshold === 'none' && userState.isOnboardingCompleted,
    showSampleData: userState.dataThreshold === 'none' || userState.dataThreshold === 'minimal',
  };
}
