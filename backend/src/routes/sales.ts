import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../supabase.ts';

const router = express.Router();

async function readData() {
  const { data, error } = await supabase
    .from('dashboards')
    .select('data')
    .eq('name', 'sales')
    .single();

  if (error) {
    console.error('Error reading sales data from Supabase:', error.message);
    return null;
  }
  return data?.data;
}

async function writeData(data: any) {
  const { error } = await supabase
    .from('dashboards')
    .upsert({ name: 'sales', data }, { onConflict: 'name' });

  if (error) {
    console.error('Error writing sales data to Supabase:', error.message);
    return false;
  }
  return true;
}

router.get('/', async (req: Request, res: Response) => {
  const data = await readData();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to read data from Supabase' });
  }
});

router.post('/add-transaction', async (req: Request, res: Response) => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  data.transactions.unshift(req.body);
  
  if (await writeData(data)) {
    res.json({ success: true, message: 'Transaction added to Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

export default router;
