export function getTimeBasedGreeting(): { greeting: string; icon: string } {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning', icon: 'sun' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon', icon: 'sun' };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Good evening', icon: 'sunset' };
  } else {
    return { greeting: 'Good night', icon: 'moon' };
  }
}

export function getContextualGreeting(nextPrayerName?: string): string {
  const hour = new Date().getHours();
  
  // Islamic greetings based on prayer times
  if (nextPrayerName) {
    switch (nextPrayerName.toLowerCase()) {
      case 'fajr':
        return hour < 6 ? 'Time for Fajr prayer' : 'Good morning';
      case 'dhuhr':
        return hour >= 11 && hour < 14 ? 'Dhuhr time approaching' : 'Good afternoon';
      case 'asr':
        return hour >= 14 && hour < 17 ? 'Asr time approaching' : 'Good afternoon';
      case 'maghrib':
        return hour >= 17 && hour < 20 ? 'Maghrib time approaching' : 'Good evening';
      case 'isha':
        return hour >= 19 ? 'Isha time approaching' : 'Good evening';
      default:
        return getTimeBasedGreeting().greeting;
    }
  }
  
  return getTimeBasedGreeting().greeting;
}

export function getDisplayName(user: any): string {
  if (user?.display_name) {
    return user.display_name;
  }
  
  if (user?.user_metadata?.display_name) {
    return user.user_metadata.display_name;
  }
  
  if (user?.user_metadata?.name) {
    return user.user_metadata.name;
  }
  
  if (user?.email) {
    // Extract name from email (before @)
    const emailName = user.email.split('@')[0];
    // Capitalize first letter
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  
  return 'Friend'; // Fallback
} 