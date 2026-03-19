import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../supabase.js';

const router = express.Router();

async function readData() {
  const { data, error } = await supabase
    .from('dashboards')
    .select('data')
    .eq('name', 'operations')
    .single();

  if (error) {
    console.error('Error reading operations data from Supabase:', error.message);
    return null;
  }
  return data?.data;
}

async function writeData(data: any) {
  const { error } = await supabase
    .from('dashboards')
    .upsert({ name: 'operations', data }, { onConflict: 'name' });

  if (error) {
    console.error('Error writing operations data to Supabase:', error.message);
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

router.post('/add-log', async (req: Request, res: Response): Promise<void | Response> => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  data.logs.unshift(req.body);
  
  if (await writeData(data)) {
    res.json({ success: true, message: 'Log added to Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

router.post('/add-workflow', async (req: Request, res: Response): Promise<void | Response> => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  data.workflows.push(req.body);
  
  if (await writeData(data)) {
    res.json({ success: true, message: 'Workflow added to Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

export default router;
