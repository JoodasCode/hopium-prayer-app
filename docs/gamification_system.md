# Lopi Gamification System Documentation
**Unified Source of Truth**

## Table of Contents
1. [Overview](#overview)
2. [Core Systems](#core-systems)
3. [XP (Experience Points) System](#xp-system)
4. [Leveling & Ranking System](#leveling--ranking-system)
5. [Badge System](#badge-system)
6. [Challenge System](#challenge-system)
7. [Milestone System](#milestone-system)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [Implementation Guide](#implementation-guide)
11. [UI/UX Guidelines](#uiux-guidelines)
12. [Future Enhancements](#future-enhancements)

## Overview

The Lopi gamification system is designed to motivate and engage users in their prayer journey through a comprehensive reward and progression system. It combines Islamic spiritual principles with modern gamification techniques to create meaningful engagement.

### Core Philosophy
- **Spiritual Growth**: Every element should encourage genuine spiritual development
- **Positive Reinforcement**: Focus on celebrating achievements rather than penalizing failures
- **Progressive Difficulty**: Challenges and rewards scale appropriately with user progress
- **Islamic Values**: All gamification elements respect Islamic principles and terminology

## Core Systems

### 1. Experience Points (XP)
- Primary currency for measuring progress
- Earned through prayer completion and spiritual activities
- Used for level progression and unlocking features

### 2. Levels & Ranks
- Visual representation of spiritual journey progress
- Unlock new features and benefits
- Islamic-themed rank names reflecting spiritual growth

### 3. Badges & Achievements
- Collectible rewards for specific accomplishments
- Different rarity levels (Common, Rare, Epic, Legendary)
- Encourage diverse prayer patterns and consistency

### 4. Challenges
- Daily, weekly, and monthly goals
- Dynamic difficulty based on user performance
- Bonus XP rewards for completion

### 5. Milestones
- Long-term progression markers
- Significant rewards at key intervals
- Celebration moments for major achievements

## XP (Experience Points) System

### XP Sources & Values

| Action | Base XP | Multiplier | Description |
|--------|---------|------------|-------------|
| Prayer Completed | 25 | 1.0x | Standard prayer completion |
| Prayer Early | 35 | 1.4x | Completed in first half of time window |
| Fajr Completed | 40 | 1.6x | Extra points for difficulty |
| Streak Day | 15 | 1.0x | Maintaining 80%+ daily completion |
| Perfect Day | 100 | 1.0x | All 5 prayers in one day |
| Reflection Added | 10 | 1.0x | Adding notes/emotions to prayer |
| Badge Earned | 50 | 1.0x | Unlocking a new badge |
| Milestone Reached | 200 | 1.0x | Major progression milestone |

### XP Calculation Examples

```typescript
// Basic prayer: 25 XP
calculatePrayerXP('dhuhr', false, false) // = 25

// Early Fajr with reflection: 40 + 10 = 50 XP
calculatePrayerXP('fajr', true, true) // = 50

// Perfect day bonus: 100 XP (additional to prayer XP)
// Total for perfect day: (5 × 25) + 100 = 225 XP minimum
```

### XP Multipliers & Bonuses

- **Streak Multiplier**: No base multiplier (encourages consistency over grinding)
- **Time-based Bonus**: Early completion gives bonus XP
- **Quality Bonus**: Reflection/notes add meaningful engagement
- **Special Prayer Bonus**: Fajr gets extra recognition for difficulty

## Leveling & Ranking System

### Level Progression Formula

```typescript
// Exponential growth: Level N requires sum of XP from levels 1 to N-1
function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  
  const baseXP = 100;
  const exponentialFactor = 1.5;
  
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += Math.floor(baseXP * Math.pow(exponentialFactor, i - 2));
  }
  
  return totalXP;
}
```

### XP Requirements by Level

| Level | XP Required | Cumulative XP | Days to Reach* |
|-------|-------------|---------------|----------------|
| 1 | 0 | 0 | Start |
| 2 | 100 | 100 | 4 days |
| 3 | 150 | 250 | 10 days |
| 4 | 225 | 475 | 19 days |
| 5 | 337 | 812 | 32 days |
| 10 | 1,688 | 4,218 | 6 months |
| 15 | 5,695 | 17,085 | 1.5 years |
| 20 | 19,206 | 64,477 | 4 years |

*Based on average 25 XP/day (1 prayer + streak)

### Rank System

| Level Range | Rank | Color Gradient | Benefits |
|-------------|------|----------------|----------|
| 1-4 | New Believer | Gray | Basic tracking, Getting started guide |
| 5-9 | Growing Muslim | Pink to Red | Progress tracking, Simple stats |
| 10-14 | Devoted Believer | Red to Orange | Prayer analytics, Streak tracking |
| 15-19 | Dedicated Worshipper | Orange to Yellow | Weekly insights, Milestone tracking |
| 20-24 | Consistent Believer | Yellow to Green | Streak protection, Advanced stats |
| 25-29 | Faithful Servant | Green to Blue | Progress analytics, Custom reminders |
| 30-39 | Devoted Scholar | Blue to Indigo | Detailed insights, Achievement tracking |
| 40-49 | Prayer Guardian | Indigo to Purple | Advanced analytics, Custom challenges |
| 50+ | Spiritual Master | Purple to Pink | All features unlocked, Master recognition |

## Badge System

### Badge Categories

#### 1. Foundation Badges (Common)
- **First Steps** 🌟: Complete your first prayer
- **Getting Started** 📚: Complete 5 prayers total
- **Building Habit** 🔄: Complete 3 days in a row

#### 2. Consistency Badges (Rare)
- **Week Warrior** ⚔️: Maintain 7-day streak
- **Prayer Master** 🕌: Complete 100 prayers total
- **Night Warrior** 🌙: Complete Isha prayer 25 times
- **Midday Devotee** ☀️: Complete Dhuhr prayer 30 times

#### 3. Excellence Badges (Epic)
- **Dawn Devotee** 🌅: Complete Fajr prayer 10 times
- **Perfect Week** 💎: Complete all prayers for 7 consecutive days
- **Early Bird** 🐦: Complete Fajr before sunrise 20 times
- **Reflection Master** 📝: Add reflections to 50 prayers

#### 4. Mastery Badges (Legendary)
- **Consistency King** 👑: Maintain 30-day streak
- **Spiritual Warrior** ⚡: Maintain 60-day streak
- **Prayer Legend** 🏆: Complete 500 prayers total
- **Master of Time** ⏰: Complete 100 early prayers

### Badge Requirements

```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirements: {
    type: 'streak' | 'prayers' | 'consistency' | 'special';
    value: number;
    prayer?: string;
  };
}
```

### XP Rewards by Rarity
- **Common**: 25-75 XP
- **Rare**: 100-200 XP
- **Epic**: 250-400 XP
- **Legendary**: 500-1000 XP

## Challenge System

### Daily Challenges

#### Challenge Pool
1. **Perfect Day**: Complete all 5 prayers (150 XP)
2. **Early Bird**: Complete 3 prayers early (100 XP)
3. **Dawn Focus**: Complete Fajr prayer (75 XP)
4. **Reflection Day**: Add reflections to 3 prayers (80 XP)
5. **Consistency**: Maintain current streak (50 XP)

### Weekly Challenges

#### Challenge Pool
1. **Fajr Focus**: Complete Fajr 6/7 days (500 XP)
2. **Consistency Challenge**: Maintain 80%+ completion (400 XP)
3. **Perfect Days**: Have 3 perfect days (600 XP)
4. **Early Week**: Complete 10 early prayers (450 XP)
5. **Reflection Week**: Add reflections to 15 prayers (350 XP)

### Monthly Challenges

#### Challenge Pool
1. **Monthly Master**: 90%+ prayer completion (2000 XP)
2. **Fajr Champion**: Complete Fajr 25/30 days (1500 XP)
3. **Perfect Month**: 10 perfect days (2500 XP)
4. **Reflection Master**: 50 prayer reflections (1200 XP)

### Challenge Generation Logic

```typescript
// Challenges are generated based on:
// 1. User's current performance level
// 2. Areas needing improvement
// 3. Seasonal/special events
// 4. Random selection from appropriate difficulty pool

function generatePersonalizedChallenge(userStats: UserStats): Challenge {
  // Analyze user patterns
  // Select appropriate difficulty
  // Generate challenge with realistic targets
}
```

## Milestone System

### Streak Milestones

| Streak Days | Milestone Name | XP Reward | Special Reward |
|-------------|----------------|-----------|----------------|
| 7 | Week Warrior | 150 | Week Warrior Badge |
| 14 | Two Week Champion | 200 | Special recognition |
| 30 | Monthly Master | 500 | Monthly Master Badge |
| 60 | Consistency Expert | 750 | Streak protection |
| 100 | Century Achiever | 1000 | Century Badge |
| 365 | Year-Long Devotee | 5000 | Master recognition |

### Prayer Count Milestones

| Prayer Count | Milestone Name | XP Reward | Special Reward |
|--------------|----------------|-----------|----------------|
| 50 | Dedicated Beginner | 200 | Progress badge |
| 100 | Prayer Enthusiast | 400 | Prayer Master Badge |
| 250 | Devoted Worshipper | 750 | Advanced features |
| 500 | Prayer Veteran | 1500 | Veteran Badge |
| 1000 | Prayer Master | 3000 | Master Badge |
| 1825 | Year of Prayers | 10000 | Legendary status |

## Database Schema

### Core Tables

#### `user_gamification`
```sql
CREATE TABLE user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  xp_to_next INTEGER DEFAULT 100,
  rank TEXT DEFAULT 'New Believer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `user_badges`
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_earned INTEGER DEFAULT 0
);
```

#### `user_challenges`
```sql
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  xp_reward INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `xp_transactions`
```sql
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'prayer', 'badge', 'challenge', 'milestone'
  source_id TEXT, -- Reference to specific prayer, badge, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_challenges_user_id_type ON user_challenges(user_id, challenge_type);
CREATE INDEX idx_xp_transactions_user_id_created ON xp_transactions(user_id, created_at DESC);
```

## API Endpoints

### Gamification Data
```typescript
// GET /api/gamification/profile
interface GamificationProfile {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  rank: string;
  rankColor: string;
  benefits: string[];
}

// GET /api/gamification/badges
interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earnedAt: string;
  xpEarned: number;
}

// GET /api/gamification/challenges
interface UserChallenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  progress: number;
  target: number;
  xpReward: number;
  expiresAt: string;
  completed: boolean;
}
```

### XP Management
```typescript
// POST /api/gamification/award-xp
interface AwardXPRequest {
  userId: string;
  amount: number;
  source: string;
  sourceId?: string;
  description: string;
}

// GET /api/gamification/xp-history
interface XPTransaction {
  id: string;
  amount: number;
  source: string;
  description: string;
  createdAt: string;
}
```

## Implementation Guide

### 1. Prayer Completion Flow

```typescript
async function completePrayer(prayerData: PrayerCompletion) {
  // 1. Record prayer in database
  const prayer = await recordPrayer(prayerData);
  
  // 2. Calculate XP earned
  const xp = calculatePrayerXP(
    prayerData.prayerType,
    prayerData.isEarly,
    prayerData.hasReflection
  );
  
  // 3. Award XP
  await awardXP(prayerData.userId, xp, 'prayer', prayer.id);
  
  // 4. Check for level up
  const levelUp = await checkLevelUp(prayerData.userId);
  
  // 5. Check for new badges
  const newBadges = await checkBadgeEligibility(prayerData.userId);
  
  // 6. Update challenge progress
  await updateChallengeProgress(prayerData.userId, 'prayer_completed');
  
  // 7. Check for milestones
  const milestones = await checkMilestones(prayerData.userId);
  
  // 8. Return summary for UI
  return {
    xpEarned: xp,
    levelUp,
    newBadges,
    milestones,
    totalXp: await getTotalXP(prayerData.userId)
  };
}
```

### 2. Daily Challenge Reset

```typescript
// Run daily at midnight
async function resetDailyChallenges() {
  // 1. Mark expired challenges as failed
  await markExpiredChallenges();
  
  // 2. Generate new daily challenges for all users
  const users = await getActiveUsers();
  
  for (const user of users) {
    const challenge = generatePersonalizedDailyChallenge(user);
    await createUserChallenge(user.id, challenge);
  }
}
```

### 3. Badge Check System

```typescript
async function checkAllBadges(userId: string): Promise<Badge[]> {
  const userStats = await getUserStats(userId);
  const currentBadges = await getUserBadges(userId);
  const newBadges: Badge[] = [];
  
  for (const badge of AVAILABLE_BADGES) {
    // Skip if already earned
    if (currentBadges.some(b => b.id === badge.id)) continue;
    
    // Check eligibility
    if (checkBadgeEligibility(badge, userStats)) {
      await awardBadge(userId, badge);
      newBadges.push(badge);
    }
  }
  
  return newBadges;
}
```

## UI/UX Guidelines

### Visual Design Principles

#### Color System
- **XP/Progress**: Primary brand color (usually green/blue)
- **Levels**: Gold gradient for level indicators
- **Badges**: 
  - Common: Gray/Silver
  - Rare: Blue
  - Epic: Purple
  - Legendary: Gold
- **Challenges**: Orange/amber for urgency

#### Typography
- **XP Numbers**: Bold, prominent display
- **Level**: Large, celebratory font
- **Rank**: Elegant, script-like font
- **Descriptions**: Clear, readable body text

#### Iconography
- **Islamic Symbols**: Crescent, mosque, prayer beads
- **Achievement Icons**: Trophies, stars, crowns
- **Progress Indicators**: Bars, circles, meters
- **Time Elements**: Clocks, calendars, timers

### Animation Guidelines

#### Micro-interactions
- **XP Gain**: Smooth counter animation with particle effects
- **Level Up**: Celebration animation with confetti
- **Badge Unlock**: Slide-in with glow effect
- **Challenge Progress**: Smooth progress bar fill

#### Feedback Patterns
- **Success**: Green checkmark with bounce
- **Achievement**: Gold star with sparkle
- **Progress**: Smooth transitions, no jarring jumps
- **Celebration**: Confetti, particle effects, sound

### Responsive Design

#### Mobile-First Approach
- **Compact Layouts**: Essential info prominently displayed
- **Touch Targets**: Minimum 44px for interactive elements
- **Thumb Navigation**: Important actions within thumb reach
- **Progressive Disclosure**: Hide secondary info behind taps

#### Information Hierarchy
1. **Current Level & XP** (most prominent)
2. **Active Challenges** (urgent, time-sensitive)
3. **Recent Achievements** (celebration, motivation)
4. **Progress Indicators** (streak, milestones)
5. **Badge Collection** (exploration, completionism)

## Future Enhancements

### Phase 2 Features

#### Social Gamification
- **Leaderboards**: Community rankings
- **Team Challenges**: Group prayer goals
- **Mentorship**: High-level users guide beginners
- **Prayer Partners**: Accountability partnerships

#### Advanced Personalization
- **AI-Driven Challenges**: Machine learning for optimal difficulty
- **Seasonal Events**: Ramadan, Hajj special challenges
- **Personal Goals**: User-defined objectives
- **Habit Insights**: Analytics-driven recommendations

#### Expanded Reward System
- **Virtual Rewards**: Themes, customizations, titles
- **Real Rewards**: Charitable donations, Islamic books
- **Community Recognition**: Featured user spotlights
- **Spiritual Content**: Unlockable duas, Islamic knowledge

### Phase 3 Features

#### Gamified Learning
- **Islamic Knowledge Quizzes**: XP for correct answers
- **Hadith of the Day**: Bonus XP for engagement
- **Quranic Verses**: Memorization challenges
- **Islamic History**: Timeline exploration game

#### Advanced Analytics
- **Performance Insights**: Detailed prayer pattern analysis
- **Predictive Modeling**: Streak risk assessment
- **Optimization Suggestions**: Personalized improvement tips
- **Spiritual Growth Tracking**: Long-term development metrics

#### Integration Ecosystem
- **Wearable Devices**: Prayer time notifications, activity tracking
- **Smart Home**: Automated prayer reminders
- **Calendar Apps**: Seamless schedule integration
- **Health Apps**: Holistic well-being tracking

## Conclusion

The Lopi gamification system is designed to be comprehensive, scalable, and deeply rooted in Islamic values. It provides multiple pathways for engagement while maintaining focus on genuine spiritual growth. The system balances immediate gratification with long-term progression, ensuring sustained user engagement and meaningful spiritual development.

This documentation serves as the single source of truth for all gamification-related development, ensuring consistency across the platform and providing clear guidelines for future enhancements.

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintained By**: Lopi Development Team 