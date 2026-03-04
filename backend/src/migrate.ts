import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin as supabase } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In dev (src/migrate.ts), backend root is ../
// In prod (dist/migrate.js), backend root is ../
const backendRoot = path.join(__dirname, '../');

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
  console.log('Looking for files in:', backendRoot);

  for (const name of dashboards) {
    try {
      const filePath = path.join(backendRoot, `${name}.json`);
      console.log(`Checking: ${filePath}`);
      
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
