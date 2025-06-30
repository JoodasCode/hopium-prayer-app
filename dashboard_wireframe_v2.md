# Hopium Prayer App - Dashboard Redesign

## Design Principles

- **ADHD-Friendly**: Minimalist design with clear visual hierarchy and reduced cognitive load
- **Soft Gradient Backgrounds**: Subtle color transitions for visual interest without distraction
- **Thumb-Friendly**: All interactive elements within easy reach on mobile
- **Visual Clarity**: High contrast, adequate spacing, and clean typography
- **Micro-interactions**: Subtle animations and feedback for engagement

## Layout Structure (Inspired by Quizzer App)

```
┌─────────────────────────────────────────┐
│ Status Bar                              │
├─────────────────────────────────────────┤
│ ┌─────────────────────┐     ┌─────────┐ │
│ │ Hopium              │     │ Profile │ │
│ └─────────────────────┘     └─────────┘ │
│                                         │
│ Welcome                                 │
│ [User Name]!                            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │         Next Prayer Card            │ │
│ │  (Large card with gradient bg)      │ │
│ │  (Arrow button for action)          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Prayer Categories         View All >    │
│ ┌─────────────────────────────────────┐ │
│ │ [Icon] Today's Prayers              │ │
│ │ Track your daily prayers       >    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [Icon] Prayer Streaks               │ │
│ │ Build your consistency         >    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Popular Tips               View All >   │
│ ┌─────────────────────────────────────┐ │
│ │         Smart Tip Card              │ │
│ │  (With illustration)                │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│           Bottom Navigation             │
└─────────────────────────────────────────┘
```


## Component Details

### 1. Welcome Section

- **Style**: Clean, personalized greeting with large typography
- **Content**:
  - "Welcome" text in medium size
  - User's name in large, bold typography
  - Subtle background gradient
- **Interactions**: None (static display)

```
┌─────────────────────────────────────────┐
│ Welcome                                 │
│ John Doe!                               │
└─────────────────────────────────────────┘
```

### 2. Next Prayer Card

- **Style**: Large card with soft gradient background and rounded corners
- **Content**:
  - "Let's Pray Now!" heading in bold
  - Prayer name and time information
  - Prominent arrow button for quick action
  - Optional illustration of person praying
- **Interactions**: Card press animation, arrow button with haptic feedback

```
┌─────────────────────────────────────────┐
│ Let's Pray Now!                         │
│                                         │
│ ASR Prayer in 02:45:30                 │
│                                         │
│ Mark your progress and build streaks    │
│                              →          │
└─────────────────────────────────────────┘
```

### 3. Prayer Categories

- **Style**: Clean list cards with icons and subtle hover effects
- **Content**:
  - Category icon on the left
  - Category name in medium bold text
  - Brief description below the name
  - Arrow indicator on the right
  - "View All" option at the section header
- **Interactions**: Card press animation, tap to navigate to detailed view

```
┌─────────────────────────────────────────┐
│ Prayer Categories         View All >    │
│ ┌─────────────────────────────────────┐ │
│ │ 📅 Today's Prayers                  │ │
│ │ Track your daily prayers       >    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔥 Prayer Streaks                   │ │
│ │ Build your consistency         >    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4. Smart Tips Section

- **Style**: Card with soft gradient background and illustration
- **Content**:
  - Section header with "Popular Tips" and "View All" option
  - Tip title in medium bold text
  - Brief tip content (1-2 sentences)
  - Relevant illustration or character
  - Arrow button for more details
- **Interactions**: Card press animation, horizontal swipe for more tips

```
┌─────────────────────────────────────────┐
│ Popular Tips               View All >   │
│ ┌─────────────────────────────────────┐ │
│ │ Prayer Consistency                  │ │
│ │                                     │ │
│ │ Set specific times for prayer       │ │
│ │ to build a stronger habit.          │ │
│ │                              →      │ │
│ │                      [Illustration] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 5. Bottom Navigation

- **Style**: Clean tab bar with icons and labels
- **Content**:
  - Home (Dashboard)
  - Calendar (Prayer schedule)
  - Qibla (Direction finder)
  - Community
  - Profile
- **Interactions**: Tab selection with subtle animation and indicator

```
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│    🏠   │    📅   │    🧭   │    👥   │    👤   │
│  Home   │Calendar │  Qibla  │Community│ Profile │
│    •    │         │         │         │         │
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

## Color Scheme

- **Background**: Deep blue-gray (#121826)
- **Card Background**: Slightly lighter blue-gray (#1E293B)
- **Primary**: Vibrant purple (#8B5CF6)
- **Secondary**: Soft blue (#3B82F6)
- **Accent**: Teal (#14B8A6)
- **Success**: Green (#10B981)
- **Text**: White (#FFFFFF) and light gray (#E2E8F0)

## Typography

- **Headings**: Inter, Semi-Bold, 18-24px
- **Body**: Inter, Regular, 14-16px
- **Buttons**: Inter, Medium, 16px
- **Counters/Numbers**: Inter, Bold, 32-48px

## Animations & Micro-interactions

1. **Countdown Timer**: Subtle pulse animation on seconds change
2. **I PRAYED Button**: Press animation with ripple effect and haptic feedback
3. **Prayer Completion**: Smooth transition from upcoming to completed state
4. **Streak Dots**: Subtle pop animation when a new day is completed
5. **Bottom Nav**: Gentle icon movement on selection

## Mobile Considerations

- All interactive elements in thumb-friendly zone
- Minimum tap target size of 44x44px
- Swipe gestures for additional actions
- Haptic feedback for important interactions
- Adaptive layout for different screen sizes

## Implementation Notes

- Use Tailwind CSS for styling with custom HSL theme
- Implement with React/Next.js components
- Use Framer Motion for animations
- Ensure dark mode compatibility
- Optimize for performance with minimal re-renders
