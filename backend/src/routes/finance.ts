import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../supabase';

const router = express.Router();

async function readData() {
  const { data, error } = await supabase
    .from('dashboards')
    .select('data')
    .eq('name', 'finance')
    .single();

  if (error) {
    console.error('Error reading finance data from Supabase:', error.message);
    return null;
  }
  return data?.data;
}

async function writeData(data: any) {
  const { error } = await supabase
    .from('dashboards')
    .upsert({ name: 'finance', data }, { onConflict: 'name' });

  if (error) {
    console.error('Error writing finance data to Supabase:', error.message);
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

router.post('/add-risk', async (req: Request, res: Response) => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  data.risks.unshift(req.body);
  
  if (await writeData(data)) {
    res.json({ success: true, message: 'Risk added to Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

router.post('/update-costs', async (req: Request, res: Response) => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  if (req.body.value) data.kpis.operatingCosts.value = req.body.value;
  
  if (await writeData(data)) {
    res.json({ success: true, message: 'Costs updated in Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

export default router;
