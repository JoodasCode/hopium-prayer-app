// Script to populate Jamaal's account with 14 days of prayer data
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Jamaal's user ID - replace this with the actual ID after account creation
const JAMAAL_USER_ID = 'REPLACE_WITH_JAMAAL_USER_ID';

// Prayer names and typical times
const PRAYERS = [
  { name: 'Fajr', time: '05:30' },
  { name: 'Dhuhr', time: '13:15' },
  { name: 'Asr', time: '17:00' },
  { name: 'Maghrib', time: '20:45' },
  { name: 'Isha', time: '22:30' }
];

// Emotional states for variety
const EMOTIONAL_STATES = [
  'peaceful',
  'grateful',
  'focused',
  'distracted',
  'tired',
  'energized',
  'reflective'
];

// Notes for some prayers
const NOTES = [
  'Felt deeply connected today',
  'Was rushing but made time',
  'Prayed with extra focus',
  'Read additional duas',
  'Prayed in congregation',
  'Made time despite busy schedule',
  'Struggled with focus today'
];

// Function to get a random item from an array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Function to generate a random completion status with 80% chance of being completed
const getCompletionStatus = () => Math.random() < 0.8;

// Function to generate prayer records for a specific day
async function generatePrayerRecordsForDay(userId, date) {
  const records = [];
  
  for (const prayer of PRAYERS) {
    const completed = getCompletionStatus();
    const scheduledTime = `${date}T${prayer.time}:00`;
    
    // Generate a completed time within 15 minutes of scheduled time if completed
    let completedTime = null;
    if (completed) {
      const scheduledDate = new Date(scheduledTime);
      const minutesOffset = Math.floor(Math.random() * 30) - 15; // -15 to +15 minutes
      scheduledDate.setMinutes(scheduledDate.getMinutes() + minutesOffset);
      completedTime = scheduledDate.toISOString();
    }
    
    records.push({
      user_id: userId,
      prayer_name: prayer.name,
      scheduled_time: scheduledTime,
      completed,
      completed_time: completedTime,
      emotional_state_after: completed ? getRandomItem(EMOTIONAL_STATES) : null,
      notes: completed && Math.random() < 0.3 ? getRandomItem(NOTES) : null, // 30% chance of having notes
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return records;
}

// Main function to populate data for the last 14 days
async function populateJamaalData() {
  try {
    console.log('Starting to populate data for Jamaal...');
    
    // Generate dates for the last 14 days
    const dates = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }
    
    // Generate and insert prayer records for each day
    for (const date of dates) {
      const records = await generatePrayerRecordsForDay(JAMAAL_USER_ID, date);
      
      const { data, error } = await supabase
        .from('prayer_records')
        .insert(records);
      
      if (error) {
        console.error(`Error inserting records for ${date}:`, error);
      } else {
        console.log(`Successfully added ${records.length} prayer records for ${date}`);
      }
    }
    
    // Update user stats
    const { count } = await supabase
      .from('prayer_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', JAMAAL_USER_ID)
      .eq('completed', true);
    
    console.log(`Total completed prayers: ${count}`);
    console.log('Data population complete!');
    
  } catch (error) {
    console.error('Error populating data:', error);
  }
}

// Run the script
populateJamaalData();
