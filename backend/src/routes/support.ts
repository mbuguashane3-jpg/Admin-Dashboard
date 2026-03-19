import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../supabase.js';
import { sendCriticalAlert } from '../email.js';
import { safeDatabaseOperation, createSuccessResponse, createErrorResponse, logDatabaseOperation } from '../utils/database.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';

const router = express.Router();

async function getSupportKPIs() {
  const { data, error } = await supabase
    .from('support_kpis')
    .select('*');

  if (error) throw error;
  
  // Transform to expected format
  const kpis: Record<string, any> = {};
  data?.forEach((kpi: any) => {
    kpis[kpi.metric_name] = {
      value: kpi.value,
      suffix: kpi.suffix,
      label: kpi.label,
      trend: kpi.trend
    };
  });
  
  return kpis;
}

async function getSupportTickets() {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  
  return data?.map((ticket: any) => ({
    text: `New Ticket: ${ticket.issue} (${ticket.customer}) - ${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority`,
    type: 'new',
    customer: ticket.customer,
    issue: ticket.issue,
    priority: ticket.priority
  })) || [];
}

async function addSupportTicket(ticketData: any) {
  logDatabaseOperation('INSERT', 'support_tickets', ticketData);
  
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      customer: ticketData.customer,
      issue: ticketData.issue,
      priority: ticketData.priority,
      status: 'open'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

router.get('/', async (req: Request, res: Response): Promise<void | Response> => {
  const result = await safeDatabaseOperation(
    async () => {
      const kpis = await getSupportKPIs();
      const tickets = await getSupportTickets();
      
      return {
        tickets: tickets,
        kpis: kpis,
        sentimentAnalysis: {
          labels: ["Delighted", "Satisfied", "Neutral", "Frustrated"],
          data: [65, 22, 10, 3]
        },
        heatmap: [
          "low", "low", "med", "high", "high", "med", "low", "low",
          "low", "med", "high", "high", "med", "low", "low", "low",
          "low", "med", "high", "high", "med", "low", "low", "low"
        ],
        criticalTickets: tickets.filter((t: any) => t.priority === 'critical'),
        retentionSignals: []
      };
    },
    'GET_SUPPORT_DATA',
    'support_dashboard'
  );

  if (result.error) {
    return res.status(500).json(createErrorResponse(result.error));
  }

  res.json(createSuccessResponse(result.data, 'Support data retrieved successfully'));
});

router.post('/add-ticket', validateRequest(commonSchemas.ticket), async (req: Request, res: Response): Promise<void | Response> => {
  const result = await safeDatabaseOperation(
    () => addSupportTicket(req.body),
    'INSERT_TICKET',
    'support_tickets'
  );

  if (result.error) {
    return res.status(500).json(createErrorResponse(result.error));
  }

  // If ticket is critical, send an email!
  if (req.body.priority === 'critical') {
    console.log('Critical ticket detected, triggering email alert...');
    sendCriticalAlert(req.body);
  }

  res.json(createSuccessResponse(result.data, 'Ticket added successfully'));
});

router.post('/add-signal', validateRequest(commonSchemas.ticket), async (req: Request, res: Response): Promise<void | Response> => {
  const result = await safeDatabaseOperation(
    async () => {
      const { data, error } = await supabase
        .from('support_retention_signals')
        .insert({
          customer: req.body.customer,
          signal_type: req.body.type || 'churn_risk',
          strength: req.body.strength || 50,
          notes: req.body.notes || ''
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    'INSERT_SIGNAL',
    'support_retention_signals'
  );

  if (result.error) {
    return res.status(500).json(createErrorResponse(result.error));
  }

  res.json(createSuccessResponse(result.data, 'Signal added successfully'));
});

export default router;
