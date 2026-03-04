import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin as supabase } from './supabase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboards = [
  'executive',
  'finance',
  'marketing',
  'operations',
  'sales',
  'support',
  'payroll'
];

async function migrate() {
  console.log('Starting migration to Supabase...');

  for (const name of dashboards) {
    try {
      const filePath = path.join(__dirname, `../${name}.json`);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}, skipping...`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const { error } = await supabase
        .from('dashboards')
        .upsert({ name, data }, { onConflict: 'name' });

      if (error) {
        console.error(`Error migrating ${name}:`, error.message);
      } else {
        console.log(`Successfully migrated ${name} dashboard.`);
      }
    } catch (err) {
      console.error(`Unexpected error migrating ${name}:`, err);
    }
  }

  console.log('Migration finished.');
}

migrate();
