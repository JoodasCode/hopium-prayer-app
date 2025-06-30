# Hopium Prayer App - Page Plan Update

## Page Structure & Navigation

### Primary Pages

#### 1. Dashboard/Home (`/`)
- **Components**: NextPrayerCard, TodaysPrayers, SmartTip, CommunityPresence, StreakOverview
- **Navigation**: Bottom nav to all main sections
- **Status**: ✅ Complete with community presence indicators

#### 2. Calendar (`/calendar`)
- **Components**: Calendar view, prayer completion visualization, streak tracking
- **Navigation**: Back to Home, Bottom nav
- **Status**: ✅ Complete with prayer history visualization

#### 3. Lopi AI Assistant (`/lopi`)
- **Components**: Chat interface, message history, conversation starters
- **Navigation**: Back to Home, Bottom nav
- **Status**: ✅ Complete with sample responses

#### 4. Insights (`/insights`)
- **Components**: Analytics dashboard, charts, emotional journey tracking
- **Navigation**: Back to Home, Bottom nav
- **Status**: ✅ Complete with mock data visualization

#### 5. Profile (`/profile`)
- **Components**: User stats, achievements, prayer statistics, emotional journey
- **Navigation**: Link to Settings, Bottom nav
- **Status**: ✅ Complete with bidirectional navigation to Settings

### Secondary Pages

#### 6. Settings (`/settings`)
- **Components**: Tabbed interface for Appearance, Notifications, Privacy, Account, About
- **Navigation**: Back to Home, Link to Profile
- **Status**: ✅ Complete with all settings sections

#### 7. Qibla Finder (`/qibla`)
- **Components**: Three modes (Standard compass, AR view, Haptic feedback)
- **Navigation**: Bottom nav
- **Status**: ✅ Complete with mindful entry ritual

### Future Pages (Post-PMF)

#### 8. Learn & Grow (`/learn`)
- **Components**: Educational content, tutorials, spiritual resources
- **Navigation**: TBD
- **Status**: 🔲 Planned for post-PMF

#### 9. Community Hub (`/community`)
- **Components**: Friend activity, challenges, support groups
- **Navigation**: TBD
- **Status**: 🔲 Planned for post-PMF

## Navigation System

### Bottom Navigation
- **Location**: Fixed at bottom of all pages
- **Items**: Home, Calendar, Qibla, Lopi, Insights, Profile
- **Status**: ✅ Complete with active state highlighting

### Header Navigation
- **Back buttons**: Consistent placement in top-left of secondary pages
- **Cross-links**: Profile ↔ Settings bidirectional navigation
- **Status**: ✅ Complete with consistent styling

## UI Components

### Shared Components
- BottomNav - Present on all pages
- Card, Button, Badge - Used consistently throughout the app
- Tabs - Used on Settings, Profile, Insights, and Qibla pages

### Page-Specific Components
- NextPrayerCard - Main focus on Dashboard
- Calendar - Core component of Calendar page
- Chat interface - Core component of Lopi page
- Analytics charts - Core components of Insights page
- Compass - Core component of Qibla page

## Next Steps

1. **Backend Integration**
   - Implement authentication system
   - Create API for prayer times calculation
   - Set up data persistence for user preferences and prayer history

2. **Testing & Refinement**
   - Conduct usability testing
   - Optimize performance
   - Ensure accessibility compliance

3. **Deployment Preparation**
   - Configure production environment
   - Set up analytics
   - Prepare for initial release
