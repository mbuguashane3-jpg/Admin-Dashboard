import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../supabase';

const router = express.Router();

async function readData() {
  const { data, error } = await supabase
    .from('dashboards')
    .select('data')
    .eq('name', 'executive')
    .single();

  if (error) {
    console.error('Error reading executive data from Supabase:', error.message);
    return null;
  }
  return data?.data;
}

async function writeData(data: any) {
  const { error } = await supabase
    .from('dashboards')
    .upsert({ name: 'executive', data }, { onConflict: 'name' });

  if (error) {
    console.error('Error writing executive data to Supabase:', error.message);
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

router.post('/update', async (req: Request, res: Response) => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  if (req.body.kpis) {
    data.kpis = { ...data.kpis, ...req.body.kpis };
    delete req.body.kpis;
  }
  Object.assign(data, req.body);
  
  if (await writeData(data)) {
    res.json({ success: true, message: 'Executive data updated in Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

router.post('/add-product', async (req: Request, res: Response) => {
  console.log('Received new product:', req.body);
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  data.products.push(req.body);
  
  if (await writeData(data)) {
    res.json({ success: true, message: 'Product added and saved to Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

export default router;
