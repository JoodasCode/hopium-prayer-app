// Utility functions for consistent time formatting across server and client

/**
 * Format time consistently to avoid hydration mismatches
 * Server-side uses manual formatting, client-side uses locale formatting
 */
export function formatTime(date: Date, options?: { hour12?: boolean }): string {
  const hour12 = options?.hour12 ?? true;
  
  if (typeof window === 'undefined') {
    // Server-side: return a consistent format
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    if (hour12) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  // Client-side: use locale formatting
  return date.toLocaleTimeString('en-US', { 
    hour: hour12 ? 'numeric' : '2-digit', 
    minute: '2-digit', 
    hour12: hour12 
  });
}

/**
 * Format time for chat messages (24-hour format for consistency)
 */
export function formatChatTime(date: Date): string {
  if (typeof window === 'undefined') {
    // Server-side: return a consistent format
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // Client-side: use locale formatting
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Format time for API context (ISO string is more reliable)
 */
export function formatTimeForAPI(date: Date): string {
  return date.toISOString();
} 