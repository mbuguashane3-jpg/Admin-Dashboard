import { supabaseAdmin } from './supabase.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ExecutiveData {
  kpis: Record<string, any>;
  products?: Array<any>;
}

interface SalesData {
  ticker: Array<any>;
  kpis: Record<string, any>;
  salesTrend: { labels: string[], data: number[] };
  regions: Array<any>;
}

interface SupportData {
  tickets: Array<any>;
  kpis: Record<string, any>;
  sentimentAnalysis: { labels: string[], data: number[] };
  heatmap: string[];
  criticalTickets: Array<any>;
  retentionSignals: Array<any>;
}

interface FinanceData {
  kpis: Record<string, any>;
  burnRate: { labels: string[], burn: number[], cash: number[], runway: number[] };
  revenueCostsChart: { labels: string[], revenue: number[], costs: number[] };
  optimizations: Array<any>;
  risks: Array<any>;
}

interface MarketingData {
  acquisitions: Array<any>;
  kpis: Record<string, any>;
  funnel: { labels: string[], data: number[] };
  content: Array<any>;
}

interface OperationsData {
  kpis: Record<string, any>;
  nodeHealth: Array<any>;
  logs: Array<any>;
  workflows: Array<any>;
}

interface PayrollData {
  employees: Array<{
    id: string;
    name: string;
    department: string;
    amount: number;
    status: string;
    hash: string;
  }>;
  stats: {
    totalDisbursed: number;
    pendingSettlement: number;
    health: number;
  };
}

async function migrateExecutiveData() {
  console.log('🔄 Migrating Executive data...');
  
  const executiveData: ExecutiveData = JSON.parse(
    readFileSync(join(__dirname, '../executive.json'), 'utf8')
  );

  // Insert KPIs
  for (const [key, kpi] of Object.entries(executiveData.kpis)) {
    await supabaseAdmin!.from('executive_kpis').upsert({
      metric_name: key,
      value: kpi.value,
      unit: kpi.unit || null,
      label: kpi.label,
      trend: kpi.trend || null
    }, { onConflict: 'metric_name' });
  }

  // Insert Products if they exist
  if (executiveData.products) {
    for (const product of executiveData.products) {
      await supabaseAdmin!.from('executive_products').upsert({
        name: product.name,
        status: product.status,
        health_score: product.health
      }, { onConflict: 'name' });
    }
  }

  console.log('✅ Executive data migrated');
}

async function migrateSalesData() {
  console.log('🔄 Migrating Sales data...');
  
  const salesData: SalesData = JSON.parse(
    readFileSync(join(__dirname, '../sales.json'), 'utf8')
  );

  // Insert KPIs
  for (const [key, kpi] of Object.entries(salesData.kpis)) {
    await supabaseAdmin!.from('sales_kpis').upsert({
      metric_name: key,
      value: kpi.value,
      prefix: kpi.prefix || null,
      suffix: kpi.suffix || null,
      label: kpi.label,
      trend: kpi.trend || null
    }, { onConflict: 'metric_name' });
  }

  // Insert ticker items
  for (const item of salesData.ticker) {
    await supabaseAdmin!.from('sales_ticker').insert({
      text: item.text,
      amount: item.amount,
      type: item.type
    });
  }

  // Insert regions
  for (const region of salesData.regions) {
    await supabaseAdmin!.from('sales_regions').upsert({
      name: region.name,
      amount: region.amount,
      percentage: region.percentage,
      rank: region.rank
    }, { onConflict: 'name' });
  }

  // Insert sales trends
  for (let i = 0; i < salesData.salesTrend.labels.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i)); // Last 7 days
    
    await supabaseAdmin!.from('sales_trends').upsert({
      date: date.toISOString().split('T')[0],
      revenue: salesData.salesTrend.data[i]
    }, { onConflict: 'date' });
  }

  console.log('✅ Sales data migrated');
}

async function migrateSupportData() {
  console.log('🔄 Migrating Support data...');
  
  const supportData: SupportData = JSON.parse(
    readFileSync(join(__dirname, '../support.json'), 'utf8')
  );

  // Insert KPIs
  for (const [key, kpi] of Object.entries(supportData.kpis)) {
    await supabaseAdmin!.from('support_kpis').upsert({
      metric_name: key,
      value: kpi.value,
      suffix: kpi.suffix || null,
      label: kpi.label,
      trend: kpi.trend || null
    }, { onConflict: 'metric_name' });
  }

  // Insert critical tickets
  if (supportData.criticalTickets) {
    for (const ticket of supportData.criticalTickets) {
      await supabaseAdmin!.from('support_tickets').insert({
        customer: ticket.customer || 'Unknown',
        issue: ticket.issue || 'No issue description',
        priority: (ticket.priority || 'medium').toLowerCase(),
        status: 'open'
      });
    }
  }

  // Insert retention signals
  if (supportData.retentionSignals) {
    for (const signal of supportData.retentionSignals) {
      await supabaseAdmin!.from('support_retention_signals').insert({
        customer: signal.customer || 'Unknown',
        signal_type: signal.type || 'churn_risk',
        strength: signal.strength || 50,
        notes: signal.notes || ''
      });
    }
  }

  // Insert sentiment data
  for (let i = 0; i < supportData.sentimentAnalysis.labels.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const sentimentData: any = {
      date: date.toISOString().split('T')[0]
    };
    
    const label = supportData.sentimentAnalysis.labels[i]?.toLowerCase();
    const value = supportData.sentimentAnalysis.data[i];
    
    if (label === 'delighted') {
      sentimentData.delighted_count = value;
    } else if (label === 'satisfied') {
      sentimentData.satisfied_count = value;
    } else if (label === 'neutral') {
      sentimentData.neutral_count = value;
    } else if (label === 'frustrated') {
      sentimentData.frustrated_count = value;
    }
    
    await supabaseAdmin!.from('support_sentiment').upsert(sentimentData, { onConflict: 'date' });
  }

  console.log('✅ Support data migrated');
}

async function migrateFinanceData() {
  console.log('🔄 Migrating Finance data...');
  
  const financeData: FinanceData = JSON.parse(
    readFileSync(join(__dirname, '../finance.json'), 'utf8')
  );

  // Insert KPIs
  for (const [key, kpi] of Object.entries(financeData.kpis)) {
    await supabaseAdmin!.from('finance_kpis').upsert({
      metric_name: key,
      value: kpi.value,
      prefix: kpi.prefix || null,
      suffix: kpi.suffix || null,
      label: kpi.label,
      trend: kpi.trend || null,
      status: kpi.status || null
    }, { onConflict: 'metric_name' });
  }

  // Insert burn rate data
  for (let i = 0; i < financeData.burnRate.labels.length; i++) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - (5 - i));
    
    await supabaseAdmin!.from('finance_burn_rate').upsert({
      month: monthDate.toISOString().slice(0, 7), // YYYY-MM format
      burn_rate: financeData.burnRate.burn[i],
      cash_balance: financeData.burnRate.cash[i],
      runway_months: financeData.burnRate.runway[i]
    }, { onConflict: 'month' });
  }

  // Insert risks
  if (financeData.risks) {
    for (const risk of financeData.risks) {
      await supabaseAdmin!.from('finance_risks').insert({
        title: risk.title,
        severity: risk.severity,
        probability: risk.probability,
        impact: risk.impact,
        description: risk.description
      });
    }
  }

  console.log('✅ Finance data migrated');
}

async function migrateMarketingData() {
  console.log('🔄 Migrating Marketing data...');
  
  const marketingData: MarketingData = JSON.parse(
    readFileSync(join(__dirname, '../marketing.json'), 'utf8')
  );

  // Insert KPIs
  for (const [key, kpi] of Object.entries(marketingData.kpis)) {
    await supabaseAdmin!.from('marketing_kpis').upsert({
      metric_name: key,
      value: kpi.value,
      suffix: kpi.suffix || null,
      label: kpi.label,
      trend: kpi.trend || null
    }, { onConflict: 'metric_name' });
  }

  // Insert acquisitions
  if (marketingData.acquisitions) {
    for (const acquisition of marketingData.acquisitions) {
      await supabaseAdmin!.from('marketing_acquisitions').insert({
        source: acquisition.source,
        users: acquisition.users,
        conversion_rate: acquisition.conversionRate,
        cost: acquisition.cost
      });
    }
  }

  // Insert content
  if (marketingData.content) {
    for (const content of marketingData.content) {
      await supabaseAdmin!.from('marketing_content').insert({
        title: content.title,
        type: content.type,
        views: content.views,
        engagement_rate: content.engagement,
        hotness_score: content.hotness
      });
    }
  }

  console.log('✅ Marketing data migrated');
}

async function migrateOperationsData() {
  console.log('🔄 Migrating Operations data...');
  
  const operationsData: OperationsData = JSON.parse(
    readFileSync(join(__dirname, '../operations.json'), 'utf8')
  );

  // Insert KPIs
  for (const [key, kpi] of Object.entries(operationsData.kpis)) {
    await supabaseAdmin!.from('operations_kpis').upsert({
      metric_name: key,
      value: kpi.value,
      suffix: kpi.suffix || null,
      label: kpi.label,
      trend: kpi.trend || null
    }, { onConflict: 'metric_name' });
  }

  // Insert logs
  if (operationsData.logs) {
    for (const log of operationsData.logs) {
      await supabaseAdmin!.from('operations_logs').insert({
        node_name: log.node,
        message: log.message,
        severity: log.severity
      });
    }
  }

  // Insert workflows
  if (operationsData.workflows) {
    for (const workflow of operationsData.workflows) {
      await supabaseAdmin!.from('operations_workflows').upsert({
        name: workflow.name,
        status: workflow.status,
        progress: workflow.progress,
        last_run: new Date()
      }, { onConflict: 'name' });
    }
  }

  console.log('✅ Operations data migrated');
}

async function migratePayrollData() {
  console.log('🔄 Migrating Payroll data...');
  
  const payrollData: PayrollData = JSON.parse(
    readFileSync(join(__dirname, '../payroll.json'), 'utf8')
  );

  // Insert KPIs from stats
  await supabaseAdmin!.from('payroll_kpis').upsert({
    metric_name: 'totalDisbursed',
    value: payrollData.stats.totalDisbursed,
    suffix: null,
    label: 'TOTAL DISBURSED',
    trend: null
  }, { onConflict: 'metric_name' });

  await supabaseAdmin!.from('payroll_kpis').upsert({
    metric_name: 'pendingSettlement',
    value: payrollData.stats.pendingSettlement,
    suffix: null,
    label: 'PENDING SETTLEMENT',
    trend: null
  }, { onConflict: 'metric_name' });

  await supabaseAdmin!.from('payroll_kpis').upsert({
    metric_name: 'health',
    value: payrollData.stats.health,
    suffix: '%',
    label: 'PAYROLL HEALTH',
    trend: null
  }, { onConflict: 'metric_name' });

  // Insert employees
  for (const employee of payrollData.employees) {
    await supabaseAdmin!.from('payroll_employees').upsert({
      name: employee.name,
      department: employee.department,
      position: employee.department, // Using department as position since position field doesn't exist
      salary: employee.amount,
      status: employee.status.toLowerCase(),
      hire_date: new Date().toISOString().split('T')[0] // Using current date since hireDate doesn't exist
    }, { onConflict: 'name' });
  }

  console.log('✅ Payroll data migrated');
}

async function main() {
  try {
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not initialized. Check your credentials.');
      process.exit(1);
    }

    console.log('🚀 Starting database migration...');
    
    await migrateExecutiveData();
    await migrateSalesData();
    await migrateSupportData();
    await migrateFinanceData();
    await migrateMarketingData();
    await migrateOperationsData();
    // await migratePayrollData(); // Skip for now due to JSON parsing issue
    
    console.log('🎉 Most data migrated successfully!');
    console.log('📊 Your dashboard now uses real database tables instead of JSON files.');
    console.log('⚠️  Payroll data was skipped due to JSON format issues - can be migrated later.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
