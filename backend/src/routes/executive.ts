import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../supabase.js';
import { safeDatabaseOperation, createSuccessResponse, createErrorResponse } from '../utils/database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

async function getExecutiveData() {
  try {
    const { data: kpiData, error: kpiError } = await supabase.from('executive_kpis').select('*');
    if (kpiError) throw kpiError;

    const { data: productData, error: productError } = await supabase.from('executive_products').select('*');
    if (productError) throw productError;

    if (!kpiData || kpiData.length === 0) {
      throw new Error('Supabase empty, using local fallback');
    }

    const kpis: Record<string, any> = {};
    kpiData.forEach((kpi: any) => {
      kpis[kpi.metric_name] = {
        value: kpi.value,
        unit: kpi.unit,
        label: kpi.label,
        trend: kpi.trend
      };
    });

    return {
      kpis,
      products: productData.map((p: any) => ({
        name: p.name,
        status: p.status,
        health: p.health_score
      }))
    };
  } catch (err) {
    console.log("Supabase fetch failed or empty, using executive.json fallback");
    const jsonPath = path.resolve(__dirname, '../../executive.json');
    const raw = await fs.readFile(jsonPath, 'utf-8');
    const localData = JSON.parse(raw);
    
    // Transform local format to match frontend expectations
    return {
      kpis: localData.metrics,
      products: localData.products,
      signals: localData.signals,
      revenueChart: localData.revenueChart
    };
  }
}

router.get('/', async (req: Request, res: Response): Promise<void | Response> => {
  const result = await safeDatabaseOperation(
    async () => await getExecutiveData(),
    'GET_EXECUTIVE_DATA',
    'executive_dashboard'
  );

  if (result.error) return res.status(500).json(createErrorResponse(result.error));
  res.json(createSuccessResponse(result.data, 'Executive data synchronized successfully'));
});



// Validation schemas for executive endpoints

const executiveSchemas = {

  kpiUpdate: {

    marketValue: { type: 'number', min: 0 },

    arr: { type: 'number', min: 0 },

    momGrowth: { type: 'number', min: -100, max: 100 },

    dau: { type: 'number', min: 0 }

  },

  product: {

    name: { type: 'string', min: 1, max: 100 },

    status: { type: 'string', enum: ['active', 'inactive', 'development'] },

    health: { type: 'number', min: 0, max: 100 }

  }

};



router.post('/update', async (req: Request, res: Response): Promise<void | Response> => {

  const result = await safeDatabaseOperation(

    async () => {

      const updates: any = {};

      

      // Update KPIs

      if (req.body.kpis) {

        for (const [key, value] of Object.entries(req.body.kpis)) {

          if (typeof value === 'object' && value.value !== undefined) {

            await supabase

              .from('executive_kpis')

              .upsert({

                metric_name: key,

                value: value.value,

                unit: value.unit || null,

                label: value.label || key.toUpperCase(),

                trend: value.trend || null

              }, { onConflict: 'metric_name' });

          }

        }

      }

      

      return { updated: true };

    },

    'UPDATE_EXECUTIVE_KPI',

    'executive_kpis'

  );



  if (result.error) {

    return res.status(500).json(createErrorResponse(result.error));

  }



  res.json(createSuccessResponse(result.data, 'Executive KPIs updated successfully'));

});



router.post('/add-product', async (req: Request, res: Response): Promise<void | Response> => {

  const result = await safeDatabaseOperation(

    async () => {

      const { data, error } = await supabase

        .from('executive_products')

        .insert({

          name: req.body.name,

          status: req.body.status || 'development',

          health_score: req.body.health || 50

        })

        .select()

        .single();



      if (error) throw error;

      return data;

    },

    'INSERT_PRODUCT',

    'executive_products'

  );



  if (result.error) {

    return res.status(500).json(createErrorResponse(result.error));

  }



  res.json(createSuccessResponse(result.data, 'Product added successfully'));

});



export default router;

