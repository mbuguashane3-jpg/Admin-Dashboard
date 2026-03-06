import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ ERROR: Missing credentials in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupRoles() {
  console.log('--- 🛡️ PROMETHEUS ROLE REPAIR ---');

  // 1. Correctly fetch users from the admin API
  const { data, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('❌ CONNECTION FAILED:', usersError.message);
    return;
  }

  const userList = data?.users || [];
  console.log(`✅ Connected! Found ${userList.length} users.`);

  if (userList.length === 0) {
    console.log('⚠️ No users found in your Supabase project.');
    return;
  }

  // 2. Sync profiles
  for (const user of userList) {
    console.log(`Syncing profile for: ${user.email}...`);
    
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        role: 'admin',
        email: user.email 
      }, { onConflict: 'id' });

    if (upsertError) {
      console.error(`❌ FAILED for ${user.email}:`, upsertError.message);
    } else {
      console.log(`✅ SUCCESS: ${user.email} is now an admin.`);
    }
  }

  console.log('--- SETUP COMPLETE ---');
}

setupRoles();
