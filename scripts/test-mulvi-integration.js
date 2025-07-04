const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testMulviIntegration() {
  try {
    console.log('🤖 Testing Mulvi AI Integration...\n');

    // Get the test user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'iconicswooshsol@gmail.com')
      .single();

    if (userError || !user) {
      console.error('❌ Test user not found. Creating user...');
      
      // Create test user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: 'iconicswooshsol@gmail.com',
          name: 'Test User',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create test user:', createError);
        return;
      }

      console.log('✅ Test user created:', newUser.email);
      user = newUser;
    }

    console.log('👤 Test user found:', user.email);
    console.log('🆔 User ID:', user.id);

    // Add a prayer record for today
    const today = new Date();
    const fajrTime = new Date(today);
    fajrTime.setHours(5, 30, 0, 0); // 5:30 AM

    const { data: prayerRecord, error: prayerError } = await supabase
      .from('prayer_records')
      .insert({
        user_id: user.id,
        prayer_type: 'fajr',
        scheduled_time: fajrTime.toISOString(),
        completed: true,
        completed_time: fajrTime.toISOString(),
        emotional_state_after: 'peaceful',
        mindfulness_score: 4,
        location: { type: 'home' },
        notes: 'Started the day with gratitude',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (prayerError) {
      console.log('ℹ️  Prayer record might already exist:', prayerError.message);
    } else {
      console.log('✅ Prayer record added:', prayerRecord.prayer_type);
    }

    // Create or update user stats
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .upsert({
        user_id: user.id,
        total_prayers: 1,
        current_streak: 1,
        best_streak: 1,
        completion_rate: 20, // 1 out of 5 prayers today
        last_prayer_date: today.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (statsError) {
      console.log('ℹ️  User stats update issue:', statsError.message);
    } else {
      console.log('✅ User stats updated:', {
        streak: userStats.current_streak,
        completion_rate: userStats.completion_rate + '%'
      });
    }

    // Test conversation creation
    const { data: conversation, error: convError } = await supabase
      .from('lopi_conversations')
      .insert({
        user_id: user.id,
        title: 'Test Conversation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (convError) {
      console.log('ℹ️  Conversation creation issue:', convError.message);
    } else {
      console.log('✅ Test conversation created:', conversation.id);
    }

    console.log('\n🎉 Mulvi integration test completed!');
    console.log('\n📱 Now you can:');
    console.log('1. Sign in as iconicswooshsol@gmail.com');
    console.log('2. Go to the Mulvi page');
    console.log('3. See contextual insights based on the prayer data');
    console.log('4. Chat with Mulvi and get personalized responses');
    console.log('\n💬 Try asking Mulvi:');
    console.log('- "How is my streak going?"');
    console.log('- "Help me with consistency"');
    console.log('- "How did I do today?"');
    console.log('- "Help me with Fajr"');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMulviIntegration(); 