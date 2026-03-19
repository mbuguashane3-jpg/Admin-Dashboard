import { supabaseAdmin as supabase } from './supabase.js';

async function checkDB() {
  console.log('--- Database Content Detailed Check ---');
  const { data, error } = await supabase
    .from('dashboards')
    .select('name, data');

  if (error) {
    console.error('Error:', error.message);
  } else {
    data.forEach((d: any) => {
      console.log(`- Dashboard: ${d.name}`);
      console.log(`  Data Keys: ${Object.keys(d.data || {}).join(', ')}`);
      console.log(`  Data Size: ${JSON.stringify(d.data).length} bytes`);
    });
  }
}

checkDB();
