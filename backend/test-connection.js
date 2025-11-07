import { supabase, supabaseAdmin, testConnection } from './config/supabase.js';

console.log('🔍 Testing Supabase connection...\n');

// Test basic connection
await testConnection();

// Test admin client
console.log('\n🔑 Testing admin client...');
try {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    console.error('❌ Admin client error:', error.message);
  } else {
    console.log('✅ Admin client connected successfully');
    console.log(`   Found ${data.users.length} user(s) in the system`);
  }
} catch (error) {
  console.error('❌ Admin client failed:', error.message);
}

// Test regular client
console.log('\n🔓 Testing regular client...');
try {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('❌ Regular client error:', error.message);
  } else {
    console.log('✅ Regular client connected successfully');
    console.log(`   Current session: ${session ? 'Active' : 'No active session'}`);
  }
} catch (error) {
  console.error('❌ Regular client failed:', error.message);
}

console.log('\n✨ Connection test complete!\n');
process.exit(0);
