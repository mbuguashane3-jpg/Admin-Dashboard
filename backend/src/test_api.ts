import { supabaseAdmin as supabase } from './supabase.js';

async function testConnection() {
  console.log('Testing Supabase Connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  
  try {
    const { data, error } = await supabase.from('dashboards').select('name');
    
    if (error) {
      console.error('❌ Connection Error:', error.message);
      if (error.message.includes('relation "public.dashboards" does not exist')) {
        console.error('👉 ACTION REQUIRED: You need to create a table named "dashboards" in your Supabase dashboard.');
      }
    } else {
      console.log('✅ Connection Successful!');
      console.log('Found dashboards:', data.map((d: any) => d.name));
    }
  } catch (err) {
    console.error('❌ Unexpected Error:', err);
  }
}

testConnection();
