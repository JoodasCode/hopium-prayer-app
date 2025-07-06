const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAuthIssues() {
  console.log('🔧 Fixing auth issues for development...');
  
  try {
    // 1. Get all unconfirmed users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`Found ${users.users.length} users`);
    
    // 2. Confirm all unconfirmed emails
    for (const user of users.users) {
      if (!user.email_confirmed_at) {
        console.log(`Confirming email for: ${user.email}`);
        
        const { error: confirmError } = await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true
        });
        
        if (confirmError) {
          console.error(`Error confirming ${user.email}:`, confirmError);
        } else {
          console.log(`✅ Confirmed: ${user.email}`);
        }
      } else {
        console.log(`Already confirmed: ${user.email}`);
      }
    }
    
    // 3. Check and create missing user profiles
    console.log('\n🔍 Checking user profiles...');
    
    for (const user of users.users) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log(`Creating profile for: ${user.email}`);
        
        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.name || user.email.split('@')[0],
          created_at: user.created_at,
          updated_at: new Date().toISOString(),
          onboarding_completed: false,
          theme_preference: 'system',
          prayer_method: 'ISNA',
          notification_settings: { prayer_reminders: true, community_updates: false },
          location: { latitude: null, longitude: null, city: null, country: null },
          avatar_url: null,
          last_active: new Date().toISOString(),
        });
        
        if (insertError) {
          console.error(`Error creating profile for ${user.email}:`, insertError);
        } else {
          console.log(`✅ Profile created for: ${user.email}`);
        }
      } else if (profileError) {
        console.error(`Error checking profile for ${user.email}:`, profileError);
      } else {
        console.log(`Profile exists for: ${user.email}`);
      }
    }
    
    console.log('\n✅ Auth fix complete!');
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

fixAuthIssues(); 