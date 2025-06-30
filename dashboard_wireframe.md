# Dashboard Wireframe for Hopium Prayer App

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  HOPIUM                                    [≡]  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │  NEXT PRAYER: ASR                         │  │
│  │  ┌────────────────────────────┐           │  │
│  │  │                            │           │  │
│  │  │         01:23:45           │           │  │
│  │  │                            │           │  │
│  │  └────────────────────────────┘           │  │
│  │                                            │  │
│  │  [       I PRAYED       ]  [REMIND ME ⏰]  │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  TODAY'S PRAYERS                                 │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │FAJR │  │DHUHR│  │ ASR │  │MAGH.│  │ISHA │    │
│  │ ✅  │  │ ✅  │  │ ⏱️  │  │     │  │     │    │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘    │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ 🧠 SMART TIP                               │  │
│  │                                            │  │
│  │ You've prayed Dhuhr on time 3 days in a    │  │
│  │ row! Keep the streak going.                │  │
│  │                                            │  │
│  │ [Got it]                [Tell me more]     │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  STREAK OVERVIEW                                 │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │  ● ● ● ● ○ ● ●     Current: 2 days        │  │
│  │  ● ● ○ ● ● ● ●     Best: 7 days           │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │  [🧘 PRAYER MODE]                          │  │
│  │                                            │  │
│  │  Distraction-free focus for prayer         │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Home]    [Calendar]    [Lopi]    [Profile]    │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Component Details

### 1. Next Prayer Card
- **Large countdown timer**: Visually dominant to create urgency
- **Prayer name**: Clearly identifies which prayer is next
- **Action buttons**: 
  - "I PRAYED" - Primary action, one tap to log prayer
  - "REMIND ME" - Secondary action for setting a reminder

### 2. Today's Prayers
- Horizontal pill list showing all five daily prayers
- Status indicators:
  - ✅ Completed
  - ⏱️ Next up
  - Empty (upcoming)
- Tappable to see details or log a missed prayer

### 3. Smart Tip
- Contextual advice based on prayer habits
- Positive reinforcement for streaks
- Actionable suggestions for improvement
- Simple interaction buttons

### 4. Streak Overview
- Visual representation of prayer consistency
- Current streak and best streak metrics
- Simple dots showing completed/missed prayers

### 5. Prayer Mode
- One-tap access to distraction-free prayer experience
- Brief description of the feature
- Visually distinct to encourage use

### 6. Bottom Navigation
- Standard navigation bar for app sections
- Consistent with existing app navigation

## User Flow

1. User opens app and immediately sees countdown to next prayer
2. After prayer, user taps "I PRAYED" button
3. System logs prayer, updates Today's Prayers display
4. Smart Tip updates with relevant insight
5. Streak Overview updates to reflect new prayer

## Interaction Notes

- All primary actions require only a single tap
- Visual hierarchy emphasizes next action needed
- Color coding provides quick status recognition
- Minimal text input required
- Haptic feedback confirms actions
