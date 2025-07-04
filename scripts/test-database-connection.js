// Test Supabase Database Connection
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔗 Testing basic connection...');
    
    // Test 1: Basic connection
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count', { count: 'exact' });
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
      return false;
    }
    
    console.log('✅ Users table accessible');
    console.log(`   Total users: ${users.length > 0 ? users[0].count : 0}`);
    
    // Test 2: Prayer records table
    const { data: prayers, error: prayersError } = await supabase
      .from('prayer_records')
      .select('count', { count: 'exact' });
    
    if (prayersError) {
      console.error('❌ Prayer records error:', prayersError.message);
      return false;
    }
    
    console.log('✅ Prayer records table accessible');
    console.log(`   Total prayer records: ${prayers.length > 0 ? prayers[0].count : 0}`);
    
    // Test 3: Achievements table
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('count', { count: 'exact' });
    
    if (achievementsError) {
      console.error('❌ Achievements error:', achievementsError.message);
      return false;
    }
    
    console.log('✅ Achievements table accessible');
    console.log(`   Total achievements: ${achievements.length > 0 ? achievements[0].count : 0}`);
    
    // Test 4: Knowledge base
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('lopi_knowledge')
      .select('count', { count: 'exact' });
    
    if (knowledgeError) {
      console.error('❌ Knowledge base error:', knowledgeError.message);
      return false;
    }
    
    console.log('✅ Knowledge base accessible');
    console.log(`   Total knowledge entries: ${knowledge.length > 0 ? knowledge[0].count : 0}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

async function main() {
  const success = await testConnection();
  
  console.log('\n' + '='.repeat(50));
  
  if (success) {
    console.log('🎉 Database connection successful!');
    console.log('\n📋 Ready for Phase 1 implementation:');
    console.log('   1. ✅ Environment configured');
    console.log('   2. ✅ Database accessible');
    console.log('   3. ✅ Tables verified');
    console.log('   4. 🔄 Next: Implement authentication');
    console.log('\n🚀 Run: npm run dev (if not already running)');
  } else {
    console.log('❌ Database connection failed!');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check environment variables');
    console.log('   2. Verify Supabase project is active');
    console.log('   3. Check network connection');
  }
  
  console.log('='.repeat(50));
}

main().catch(console.error); 