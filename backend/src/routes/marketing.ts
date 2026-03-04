import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../supabase.ts';

const router = express.Router();

async function readData() {
  const { data, error } = await supabase
    .from('dashboards')
    .select('data')
    .eq('name', 'marketing')
    .single();

  if (error) {
    console.error('Error reading marketing data from Supabase:', error.message);
    return null;
  }
  return data?.data;
}

async function writeData(data: any) {
  const { error } = await supabase
    .from('dashboards')
    .upsert({ name: 'marketing', data }, { onConflict: 'name' });

  if (error) {
    console.error('Error writing marketing data to Supabase:', error.message);
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

router.post('/add-acquisition', async (req: Request, res: Response) => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  data.acquisitions.unshift(req.body);
  
  if (await writeData(data)) {
    res.json({ success: true, message: 'Acquisition added to Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

router.post('/add-content', async (req: Request, res: Response) => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  data.contentPerformance.push(req.body);
  
  if (await writeData(data)) {
    res.json({ success: true, message: 'Content added to Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

export default router;
