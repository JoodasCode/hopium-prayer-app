// Design System Constants for Lopi App
// Ensures consistent spacing, typography, and sizing across all components

export const SPACING = {
  // Card padding
  card: {
    compact: "p-4",      // For small cards, tight spaces
    default: "p-5",      // Standard card padding
    comfortable: "p-6",  // For important cards with more content
  },
  
  // Gaps between elements
  gap: {
    xs: "gap-1",         // 4px - Very tight
    sm: "gap-2",         // 8px - Tight
    default: "gap-3",    // 12px - Standard
    lg: "gap-4",         // 16px - Comfortable
    xl: "gap-6",         // 24px - Spacious
  },
  
  // Margins
  margin: {
    xs: "mb-1",          // 4px
    sm: "mb-2",          // 8px
    default: "mb-3",     // 12px
    lg: "mb-4",          // 16px
    xl: "mb-6",          // 24px
  }
} as const;

export const TYPOGRAPHY = {
  // Headers
  header: {
    page: "text-xl font-bold",           // Main page titles
    section: "text-base font-semibold",  // Section headers
    card: "text-sm font-medium",         // Card titles
  },
  
  // Body text
  body: {
    default: "text-sm",                  // Standard body text
    small: "text-xs",                    // Small body text
    large: "text-base",                  // Larger body text
  },
  
  // Numbers and stats
  stats: {
    large: "text-2xl font-bold",         // Main stats (streak count, etc.)
    medium: "text-lg font-bold",         // Secondary stats
    small: "text-sm font-semibold",      // Small stats
  },
  
  // Muted text
  muted: {
    default: "text-muted-foreground",
    small: "text-xs text-muted-foreground",
    caption: "text-xs text-muted-foreground leading-relaxed",
  }
} as const;

export const SIZING = {
  // Icons
  icon: {
    xs: "h-3 w-3",       // Very small icons
    sm: "h-4 w-4",       // Small icons (most common)
    default: "h-5 w-5",  // Standard icons
    lg: "h-6 w-6",       // Large icons
    xl: "h-8 w-8",       // Extra large icons
  },
  
  // Avatars and circular elements
  avatar: {
    sm: "w-6 h-6",       // Small avatar/circle
    default: "w-8 h-8",  // Standard avatar/circle
    lg: "w-10 h-10",     // Large avatar/circle
    xl: "w-12 h-12",     // Extra large avatar/circle
  },
  
  // Buttons
  button: {
    sm: "h-8",           // Small buttons
    default: "h-10",     // Standard buttons
    lg: "h-12",          // Large buttons (CTAs)
  },
  
  // Progress bars
  progress: {
    thin: "h-1",         // Very thin progress
    default: "h-2",      // Standard progress
    thick: "h-3",        // Thick progress
  }
} as const;

export const COLORS = {
  // Card backgrounds using our Mocha Mousse theme
  card: {
    default: "border-primary/20",                    // Standard cards
    primary: "border-primary/20 bg-primary/5",       // Primary accent cards
    secondary: "border-chart-2/30 bg-chart-2/5",     // Secondary accent cards
    tertiary: "border-chart-3/30 bg-chart-3/10",     // Tertiary accent cards
    muted: "border-muted bg-muted/20",               // Muted cards
  },
  
  // Icon containers
  iconContainer: {
    primary: "bg-primary/10",
    secondary: "bg-chart-2/20", 
    tertiary: "bg-chart-3/20",
    muted: "bg-muted",
  },
  
  // Text colors
  text: {
    primary: "text-primary",
    foreground: "text-foreground",
    muted: "text-muted-foreground",
  }
} as const;

// Utility function to combine design system classes
export const ds = {
  // Card styles
  card: (variant: keyof typeof COLORS.card = 'default', padding: keyof typeof SPACING.card = 'default') => 
    `${COLORS.card[variant]}`,
  
  // Icon container styles  
  iconContainer: (size: keyof typeof SIZING.avatar = 'default', variant: keyof typeof COLORS.iconContainer = 'primary') =>
    `${SIZING.avatar[size]} rounded-full ${COLORS.iconContainer[variant]} flex items-center justify-center`,
    
  // Typography combinations
  heading: (level: keyof typeof TYPOGRAPHY.header = 'card') => TYPOGRAPHY.header[level],
  body: (size: keyof typeof TYPOGRAPHY.body = 'default') => TYPOGRAPHY.body[size],
  stat: (size: keyof typeof TYPOGRAPHY.stats = 'medium') => TYPOGRAPHY.stats[size],
  muted: (size: keyof typeof TYPOGRAPHY.muted = 'default') => TYPOGRAPHY.muted[size],
  
  // Layout utilities
  spacing: (type: 'gap' | 'margin', size: keyof typeof SPACING.gap = 'default') => 
    type === 'gap' ? SPACING.gap[size] : SPACING.margin[size],
}; 