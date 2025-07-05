import { useUserState } from '@/contexts/UserStateContext';

type ExperienceType = 'new' | 'minimal' | 'returning';

/**
 * Hook to determine which user experience to show based on user state
 */
export function useUserExperience() {
  const { userState } = useUserState();
  
  // Determine experience type based on authentication and onboarding status
  const experienceType: ExperienceType = 
    !userState.isAuthenticated ? 'new' :
    !userState.isOnboardingCompleted ? 'minimal' : 'returning';
  
  // Check if this is the user's first visit today (simplified)
  const isFirstVisitToday = (): boolean => {
    // Since we don't have lastVisited, we'll use localStorage
    const lastVisit = localStorage.getItem('lastVisit');
    if (!lastVisit) return true;
    
    const lastVisitDate = new Date(lastVisit);
    const today = new Date();
    
    return lastVisitDate.toDateString() !== today.toDateString();
  };
  
  // Check if user is returning after an absence (simplified)
  const isReturningAfterAbsence = (): boolean => {
    const lastVisit = localStorage.getItem('lastVisit');
    if (!lastVisit) return false;
    
    const lastVisitDate = new Date(lastVisit);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 3;
  };
  
  // Get welcome message based on user state
  const getWelcomeMessage = (): string => {
    if (!userState.isAuthenticated) {
      return 'Welcome to Lopi Prayer App';
    }
    
    if (isReturningAfterAbsence()) {
      return 'Welcome back! We missed you';
    }
    
    if (isFirstVisitToday()) {
      return `Welcome back, ${userState.user?.user_metadata?.name || 'friend'}`;
    }
    
    return `Hello again, ${userState.user?.user_metadata?.name || 'friend'}`;
  };
  
  // Update last visit time
  const updateLastVisit = () => {
    localStorage.setItem('lastVisit', new Date().toISOString());
  };
  
  return {
    experienceType,
    isFirstVisitToday: isFirstVisitToday(),
    isReturningAfterAbsence: isReturningAfterAbsence(),
    welcomeMessage: getWelcomeMessage(),
    showOnboarding: !userState.isOnboardingCompleted && userState.isAuthenticated,
    showEmptyState: !userState.isOnboardingCompleted && userState.isAuthenticated,
    showSampleData: !userState.isAuthenticated || !userState.isOnboardingCompleted,
    updateLastVisit,
  };
}
