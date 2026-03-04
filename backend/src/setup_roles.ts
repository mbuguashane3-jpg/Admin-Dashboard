import { supabaseAdmin as supabase } from './supabase.ts';

async function setupRoles() {
  console.log('--- PROMETHEUS ROLE SETUP ---');

  // 1. Check if profiles table exists (by trying to select from it)
  const { error: tableError } = await supabase.from('profiles').select('role').limit(1);

  if (tableError && tableError.message.includes('relation "public.profiles" does not exist')) {
    console.error('❌ ERROR: Table "profiles" does not exist in Supabase.');
    console.log('👉 ACTION REQUIRED: Run this SQL in your Supabase SQL Editor:');
    console.log(`
      CREATE TABLE public.profiles (
        id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
        role text CHECK (role IN ('admin', 'manager', 'analyst')) DEFAULT 'analyst',
        email text
      );
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    `);
    return;
  }

  // 2. Map existing users to admin role (for development)
  console.log('Fetching users...');
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('Error listing users:', usersError.message);
    return;
  }

  console.log(`Found ${users?.length} users. Assigning roles...`);

  for (const user of users) {
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        role: 'admin', // Default to admin for existing users during setup
        email: user.email 
      }, { onConflict: 'id' });

    if (upsertError) {
      console.error(`Failed to setup profile for ${user.email}:`, upsertError.message);
    } else {
      console.log(`✅ Profile synchronized for: ${user.email} (Role: admin)`);
    }
  }

  console.log('--- SETUP COMPLETE ---');
}

setupRoles();
