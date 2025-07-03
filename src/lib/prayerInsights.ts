// Prayer insight generation functions

type PrayerPattern = {
  prayerName: string;
  description: string;
  actionText: string;
  improvement: string;
  priority: 'high' | 'medium' | 'low';
};

type PrayerRisk = {
  prayerName: string;
  streak: number;
  description: string;
  actionText: string;
  isUrgent: boolean;
};

/**
 * Generate insights based on prayer completion patterns
 * @param prayerHistory Array of prayer completion data
 * @returns Insights about prayer patterns
 */
export function generatePrayerInsight(prayerName: string): PrayerPattern {
  // In a real implementation, this would analyze actual prayer data
  // Here we provide sample insights for each prayer
  
  const insights: Record<string, PrayerPattern> = {
    'Fajr': {
      prayerName: 'Fajr',
      description: 'Setting a backup alarm increases your Fajr completion rate by 74%',
      actionText: 'Set Backup Alarm',
      improvement: '74%',
      priority: 'high'
    },
    'Dhuhr': {
      prayerName: 'Dhuhr',
      description: 'Taking a lunch break slightly earlier helps you consistently make Dhuhr on time',
      actionText: 'Adjust Schedule',
      improvement: '45%',
      priority: 'medium'
    },
    'Asr': {
      prayerName: 'Asr',
      description: 'Setting an Asr reminder 15 minutes before improves your completion rate',
      actionText: 'Enable Smart Reminder',
      improvement: '38%',
      priority: 'medium'
    },
    'Maghrib': {
      prayerName: 'Maghrib',
      description: 'You often miss Maghrib when working late. Setting an alarm helps.',
      actionText: 'Set Work Reminder',
      improvement: '67%',
      priority: 'high'
    },
    'Isha': {
      prayerName: 'Isha',
      description: 'Preparing for Isha right after Maghrib increases your completion rate',
      actionText: 'Enable Evening Routine',
      improvement: '52%',
      priority: 'medium'
    }
  };
  
  return insights[prayerName] || {
    prayerName,
    description: 'We need more prayer data to generate insights',
    actionText: 'View Prayer Tips',
    improvement: '0%',
    priority: 'medium'
  };
}

/**
 * Detect if a prayer streak is at risk
 * @param prayerName Prayer name
 * @param streakCount Current streak count
 * @param lastCompletion Last completion timestamp
 * @returns Risk assessment with actions
 */
export function detectStreakRisk(prayerName: string, streakCount: number): PrayerRisk | null {
  // In a real implementation, this would analyze real risk factors
  // Here we provide sample risks
  
  // Only return risks for prayers with streaks > 3 for demo purposes
  if (streakCount < 3) return null;
  
  const risks: Record<string, PrayerRisk> = {
    'Fajr': {
      prayerName: 'Fajr',
      streak: streakCount,
      description: `Your ${streakCount}-day Fajr streak is at risk based on your upcoming schedule. Wake up 10 minutes earlier tomorrow.`,
      actionText: 'Set Early Alarm',
      isUrgent: streakCount > 7
    },
    'Dhuhr': {
      prayerName: 'Dhuhr',
      streak: streakCount,
      description: `Your ${streakCount}-day Dhuhr streak may be at risk due to your calendar events tomorrow.`,
      actionText: 'Plan Prayer Break',
      isUrgent: streakCount > 10
    },
    'Asr': {
      prayerName: 'Asr',
      streak: streakCount,
      description: `Protect your ${streakCount}-day Asr streak by planning ahead for tomorrow's busy schedule.`,
      actionText: 'Schedule Prayer Time',
      isUrgent: false
    },
    'Maghrib': {
      prayerName: 'Maghrib',
      streak: streakCount,
      description: `Your ${streakCount}-day Maghrib streak is strong. Keep it going with a calendar reminder.`,
      actionText: 'Add Calendar Alert',
      isUrgent: false
    },
    'Isha': {
      prayerName: 'Isha',
      streak: streakCount,
      description: `Your ${streakCount}-day Isha streak is impressive! Don't let tomorrow's late meeting affect it.`,
      actionText: 'Set Schedule Alert',
      isUrgent: streakCount > 15
    }
  };
  
  return risks[prayerName] || null;
}

/**
 * Generate behavioral recommendations based on prayer patterns
 * @param prayerName Prayer name to get recommendations for
 * @returns Object with recommendation details
 */
export function getPrayerRecommendations(prayerName: string): string[] {
  const recommendations: Record<string, string[]> = {
    'Fajr': [
      'Place your prayer mat next to your bed the night before',
      'Keep a water bottle by your bedside for wudu',
      'Use a gentle, gradually increasing alarm sound',
      'Sleep earlier to make Fajr easier',
      'Read Surah Al-Kahf before sleeping on Thursday night'
    ],
    'Dhuhr': [
      'Set a calendar block for Dhuhr prayer time',
      'Identify quiet places near your workplace for prayer',
      'Keep a travel prayer mat in your bag or desk',
      'Use lunch breaks efficiently for prayer',
      'Form a prayer group with colleagues'
    ],
    'Asr': [
      'Set a distinct reminder sound for Asr',
      'Take a short break from work for rejuvenation through prayer',
      'Plan your afternoon meetings around Asr time',
      'Remember Asr is considered the "middle prayer" in the Quran',
      'Keep track of seasonal changes affecting Asr time'
    ],
    'Maghrib': [
      'Wrap up work activities before Maghrib',
      'Use sunset as a visual reminder',
      'Prepare for Maghrib right after Asr',
      'Consider Maghrib as your transition to evening',
      'Make special dua at Maghrib time when fasting'
    ],
    'Isha': [
      'Establish a consistent evening routine ending with Isha',
      'Avoid heavy meals right before Isha',
      'Reduce screen time before Isha for better focus',
      'Consider praying Isha earlier rather than delaying',
      'Read Quran or make dhikr after Isha'
    ]
  };
  
  return recommendations[prayerName] || [];
}

/**
 * Generate prayer motivation message
 * @param prayerName Name of the prayer
 * @param context Time context (morning, afternoon, evening, night)
 * @returns Motivational message
 */
export function getPrayerMotivation(prayerName: string, context: string): string {
  const motivations: Record<string, string[]> = {
    'Fajr': [
      'Start your day with the blessing of Fajr prayer',
      'The two rakahs of Fajr are better than the world and all that is in it',
      'Angels gather at Fajr prayer - join this blessed gathering',
      'Rise for Fajr and watch your day become more blessed'
    ],
    'Dhuhr': [
      'Take a meaningful break from your day with Dhuhr prayer',
      'Refresh your spirit and focus with the midday prayer',
      'The Prophet (PBUH) would pray Dhuhr when the sun had passed its zenith',
      'The gates of heaven are opened at the time of Dhuhr'
    ],
    'Asr': [
      'The Prophet (PBUH) said whoever prays Fajr and Asr enters Paradise',
      'Asr prayer marks the transition of your day - make it meaningful',
      'The middle prayer (Asr) is especially emphasized in the Quran',
      'Do not let worldly affairs distract you from the excellence of Asr'
    ],
    'Maghrib': [
      'As the day closes, renew your connection with Allah through Maghrib',
      'The time between Asr and Maghrib is excellent for dua',
      'Maghrib marks the beautiful transition from day to night',
      'The Prophet (PBUH) would hasten to pray Maghrib at its earliest time'
    ],
    'Isha': [
      'Close your day in the remembrance of Allah with Isha prayer',
      'The Prophet (PBUH) preferred to delay Isha somewhat if possible',
      'The one who prays Isha in congregation is as if they stood half the night',
      'Let Isha prayer be your shield for the night ahead'
    ]
  };
  
  const prayerMotivations = motivations[prayerName] || [
    'Prayer is the pillar of religion',
    'Prayer is the key to Paradise',
    'Regular prayer increases barakah in your time and life',
    'The first thing you will be asked about on the Day of Judgment is your prayer'
  ];
  
  // Get random motivation
  return prayerMotivations[Math.floor(Math.random() * prayerMotivations.length)];
}
