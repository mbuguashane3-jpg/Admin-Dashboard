import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../supabase.js';
import { sendCriticalAlert } from '../email.js';

const router = express.Router();

async function readData() {
  const { data, error } = await supabase
    .from('dashboards')
    .select('data')
    .eq('name', 'support')
    .single();

  if (error) {
    console.error('Error reading support data from Supabase:', error.message);
    return null;
  }
  return data?.data;
}

async function writeData(data: any) {
  const { error } = await supabase
    .from('dashboards')
    .upsert({ name: 'support', data }, { onConflict: 'name' });

  if (error) {
    console.error('Error writing support data to Supabase:', error.message);
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

router.post('/add-ticket', async (req: Request, res: Response) => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  data.criticalTickets.unshift(req.body);
  
  if (await writeData(data)) {
    // If ticket is critical, send an email!
    if (req.body.priority === 'Critical') {
        console.log('Critical ticket detected, triggering email alert...');
        sendCriticalAlert(req.body);
    }
    res.json({ success: true, message: 'Ticket added to Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

router.post('/add-signal', async (req: Request, res: Response) => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  data.retentionSignals.push(req.body);
  
  if (await writeData(data)) {
    res.json({ success: true, message: 'Signal added to Supabase' });
  } else {
    res.status(500).json({ error: 'Failed to write data to Supabase' });
  }
});

export default router;
