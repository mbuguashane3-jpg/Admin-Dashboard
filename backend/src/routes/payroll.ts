import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../supabase';

const router = express.Router();

async function readData() {
  const { data, error } = await supabase
    .from('dashboards')
    .select('data')
    .eq('name', 'payroll')
    .single();

  if (error) {
    console.error('Error reading payroll data from Supabase:', error.message);
    return null;
  }
  return data?.data;
}

async function writeData(data: any) {
  const { error } = await supabase
    .from('dashboards')
    .upsert({ name: 'payroll', data }, { onConflict: 'name' });

  if (error) {
    console.error('Error writing payroll data to Supabase:', error.message);
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

router.post('/update-status', async (req: Request, res: Response) => {
  const data = await readData();
  if (!data) return res.status(500).json({ error: 'Failed to read data' });

  const { employeeId, status } = req.body;
  const employee = data.employees.find((emp: any) => emp.id === employeeId);
  
  if (employee) {
    employee.status = status;
    if (status === 'SETTLED' && employee.hash === '---') {
        employee.hash = '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6);
    }
    
    // Recalculate stats
    data.stats.pendingSettlement = data.employees.filter((emp: any) => emp.status !== 'SETTLED').length;
    data.stats.totalDisbursed = data.employees
        .filter((emp: any) => emp.status !== 'PENDING')
        .reduce((sum: number, emp: any) => sum + emp.amount, 0);

    if (await writeData(data)) {
      res.json({ success: true, message: 'Payroll status updated' });
    } else {
      res.status(500).json({ error: 'Failed to write data to Supabase' });
    }
  } else {
    res.status(404).json({ error: 'Employee not found' });
  }
});

export default router;
