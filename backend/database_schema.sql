-- ========================================
-- PROMETHEUS DASHBOARD DATABASE SCHEMA
-- ========================================

-- Executive Dashboard Tables
CREATE TABLE executive_kpis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name text NOT NULL,
    value numeric NOT NULL,
    unit text,
    label text NOT NULL,
    trend numeric,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE executive_products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'inactive', 'development')),
    health_score numeric CHECK (health_score >= 0 AND health_score <= 100),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Sales Dashboard Tables
CREATE TABLE sales_kpis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name text NOT NULL,
    value numeric NOT NULL,
    prefix text,
    suffix text,
    label text NOT NULL,
    trend numeric,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE sales_ticker (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    text text NOT NULL,
    amount numeric NOT NULL,
    type text NOT NULL CHECK (type IN ('new', 'renewal', 'upgrade')),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE sales_trends (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL,
    revenue numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE sales_regions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    amount numeric NOT NULL,
    percentage numeric NOT NULL,
    rank integer NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Marketing Dashboard Tables
CREATE TABLE marketing_kpis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name text NOT NULL,
    value numeric NOT NULL,
    suffix text,
    label text NOT NULL,
    trend numeric,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE marketing_acquisitions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    source text NOT NULL,
    users numeric NOT NULL,
    conversion_rate numeric NOT NULL,
    cost numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE marketing_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    type text NOT NULL CHECK (type IN ('blog', 'video', 'social', 'email')),
    views numeric NOT NULL,
    engagement_rate numeric NOT NULL,
    hotness_score numeric CHECK (hotness_score >= 0 AND hotness_score <= 100),
    created_at timestamptz DEFAULT now()
);

-- Finance Dashboard Tables
CREATE TABLE finance_kpis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name text NOT NULL,
    value numeric NOT NULL,
    prefix text,
    suffix text,
    label text NOT NULL,
    trend numeric,
    status text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE finance_burn_rate (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    month date NOT NULL,
    burn_rate numeric NOT NULL,
    cash_balance numeric NOT NULL,
    runway_months numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE finance_risks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    probability numeric CHECK (probability >= 0 AND probability <= 100),
    impact numeric CHECK (impact >= 0 AND impact <= 100),
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Operations Dashboard Tables
CREATE TABLE operations_kpis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name text NOT NULL,
    value numeric NOT NULL,
    suffix text,
    label text NOT NULL,
    trend numeric,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE operations_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    node_name text NOT NULL,
    message text NOT NULL,
    severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE operations_workflows (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    status text NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'paused')),
    progress numeric CHECK (progress >= 0 AND progress <= 100),
    last_run timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Support Dashboard Tables
CREATE TABLE support_kpis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name text NOT NULL,
    value numeric NOT NULL,
    suffix text,
    label text NOT NULL,
    trend numeric,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE support_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer text NOT NULL,
    issue text NOT NULL,
    priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status text NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE support_sentiment (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL,
    delighted_count integer DEFAULT 0,
    satisfied_count integer DEFAULT 0,
    neutral_count integer DEFAULT 0,
    frustrated_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE support_retention_signals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer text NOT NULL,
    signal_type text NOT NULL CHECK (signal_type IN ('churn_risk', 'expansion_opportunity', 'upsell_potential')),
    strength numeric CHECK (strength >= 0 AND strength <= 100),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Payroll Dashboard Tables
CREATE TABLE payroll_kpis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name text NOT NULL,
    value numeric NOT NULL,
    suffix text,
    label text NOT NULL,
    trend numeric,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE payroll_employees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    department text NOT NULL,
    position text NOT NULL,
    salary numeric NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'on_leave', 'terminated')),
    hire_date date NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE executive_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_ticker ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_acquisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_burn_rate ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_retention_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_employees ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users to read data
CREATE POLICY "Allow authenticated users to read executive data" ON executive_kpis FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read executive products" ON executive_products FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read sales data" ON sales_kpis FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read sales ticker" ON sales_ticker FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read sales trends" ON sales_trends FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read sales regions" ON sales_regions FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read marketing data" ON marketing_kpis FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read marketing acquisitions" ON marketing_acquisitions FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read marketing content" ON marketing_content FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read finance data" ON finance_kpis FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read finance burn rate" ON finance_burn_rate FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read finance risks" ON finance_risks FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read operations data" ON operations_kpis FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read operations logs" ON operations_logs FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read operations workflows" ON operations_workflows FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read support data" ON support_kpis FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read support tickets" ON support_tickets FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read support sentiment" ON support_sentiment FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read support retention signals" ON support_retention_signals FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read payroll data" ON payroll_kpis FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow authenticated users to read payroll employees" ON payroll_employees FOR SELECT USING (auth.role() IS NOT NULL);

-- Policies for admin users to modify data
CREATE POLICY "Allow admin users to modify executive data" ON executive_kpis FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify executive products" ON executive_products FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify sales data" ON sales_kpis FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify sales ticker" ON sales_ticker FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify sales trends" ON sales_trends FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify sales regions" ON sales_regions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify marketing data" ON marketing_kpis FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify marketing acquisitions" ON marketing_acquisitions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify marketing content" ON marketing_content FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify finance data" ON finance_kpis FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify finance burn rate" ON finance_burn_rate FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify finance risks" ON finance_risks FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify operations data" ON operations_kpis FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify operations logs" ON operations_logs FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify operations workflows" ON operations_workflows FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify support data" ON support_kpis FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify support tickets" ON support_tickets FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify support sentiment" ON support_sentiment FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify support retention signals" ON support_retention_signals FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify payroll data" ON payroll_kpis FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin users to modify payroll employees" ON payroll_employees FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_executive_kpis_metric ON executive_kpis(metric_name);
CREATE INDEX idx_sales_ticker_created ON sales_ticker(created_at);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_operations_logs_severity ON operations_logs(severity);
CREATE INDEX idx_operations_logs_created ON operations_logs(created_at);
CREATE INDEX idx_finance_risks_severity ON finance_risks(severity);

-- ========================================
-- FUNCTIONS FOR UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_executive_kpis_updated_at BEFORE UPDATE ON executive_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_executive_products_updated_at BEFORE UPDATE ON executive_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_kpis_updated_at BEFORE UPDATE ON sales_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_regions_updated_at BEFORE UPDATE ON sales_regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_kpis_updated_at BEFORE UPDATE ON marketing_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_kpis_updated_at BEFORE UPDATE ON finance_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_risks_updated_at BEFORE UPDATE ON finance_risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operations_kpis_updated_at BEFORE UPDATE ON operations_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operations_workflows_updated_at BEFORE UPDATE ON operations_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_kpis_updated_at BEFORE UPDATE ON support_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_kpis_updated_at BEFORE UPDATE ON payroll_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_employees_updated_at BEFORE UPDATE ON payroll_employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
$newTables
