-- ==============================================================================
-- B-IT Technology — Product Intelligence & Investment Decision Platform
-- PostgreSQL Relational Schema & Migrations DDL (PostgreSQL 14+ / Neon / Supabase)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(50) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id VARCHAR(50) REFERENCES roles(id),
    department VARCHAR(100),
    avatar_initials VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. OPPORTUNITIES
CREATE TYPE opportunity_status AS ENUM (
    'idea',
    'discovery',
    'evaluation',
    'decision_pending',
    'pilot_approved',
    'pilot_in_progress',
    'approved_for_launch',
    'active',
    'on_hold',
    'rejected',
    'discontinued'
);

CREATE TYPE product_category AS ENUM (
    'saas',
    'ai_agent',
    'custom_software',
    'white_label',
    'partnership',
    'subscription_service',
    'other'
);

CREATE TABLE IF NOT EXISTS opportunities (
    id VARCHAR(50) PRIMARY KEY, -- e.g. BIT-OP-001
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category product_category NOT NULL DEFAULT 'saas',
    business_problem TEXT,
    proposed_solution TEXT,
    target_customer_segment VARCHAR(255),
    primary_geography VARCHAR(100) DEFAULT 'Saudi Arabia',
    industry VARCHAR(100),
    business_model VARCHAR(100) DEFAULT 'Recurring Subscription',
    pricing_model VARCHAR(100) DEFAULT 'Monthly / Annual Per Tenant',
    
    owner_id VARCHAR(50) REFERENCES users(id),
    technical_owner_id VARCHAR(50) REFERENCES users(id),
    sales_owner_id VARCHAR(50) REFERENCES users(id),
    finance_reviewer_id VARCHAR(50) REFERENCES users(id),

    discovery_date DATE DEFAULT CURRENT_DATE,
    target_decision_date DATE,
    proposed_validation_budget_sar NUMERIC(12, 2) DEFAULT 0.00,
    approved_budget_sar NUMERIC(12, 2) DEFAULT 0.00,
    initial_hypothesis TEXT,
    status opportunity_status NOT NULL DEFAULT 'idea',
    
    weighted_score NUMERIC(5, 2) DEFAULT 0.00,
    recommendation VARCHAR(50) DEFAULT 'CONTINUE_RESEARCH',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EVALUATION SECTIONS & ANSWERS
CREATE TABLE IF NOT EXISTS evaluation_sections (
    id VARCHAR(50) PRIMARY KEY,
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    step_number INT NOT NULL, -- 1 to 6
    title VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress', -- not_started, in_progress, completed, flagged
    reviewer_id VARCHAR(50) REFERENCES users(id),
    completion_percentage INT DEFAULT 0,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    tam_sar NUMERIC(15, 2) DEFAULT 0.00,
    sam_sar NUMERIC(15, 2) DEFAULT 0.00,
    som_sar NUMERIC(15, 2) DEFAULT 0.00,
    sizing_methodology VARCHAR(100) DEFAULT 'bottom_up',
    target_business_count INT DEFAULT 0,
    reachable_share_percent NUMERIC(5, 2) DEFAULT 0.00,
    annual_revenue_per_customer_sar NUMERIC(12, 2) DEFAULT 0.00,
    customer_urgency VARCHAR(50) DEFAULT 'moderate', -- low, moderate, high, critical
    sales_cycle_days INT DEFAULT 45,
    interview_count INT DEFAULT 0,
    qualified_leads_count INT DEFAULT 0,
    loi_count INT DEFAULT 0,
    paid_pilot_commitments INT DEFAULT 0,
    adoption_barriers TEXT,
    assumptions_summary TEXT,
    confidence_level VARCHAR(50) DEFAULT 'medium'
);

-- 4. COMPETITORS & BENCHMARKS
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    website VARCHAR(255),
    product_name VARCHAR(150),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    observed_price_sar NUMERIC(12, 2) DEFAULT 0.00,
    pricing_interval VARCHAR(50) DEFAULT 'monthly',
    has_arabic_support BOOLEAN DEFAULT FALSE,
    main_strengths TEXT,
    main_weaknesses TEXT,
    differentiation_opportunity TEXT,
    evidence_source_url VARCHAR(500),
    confidence_level VARCHAR(50) DEFAULT 'verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. RESEARCH SOURCES & EVIDENCE CLASSIFICATION
CREATE TABLE IF NOT EXISTS research_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE SET NULL,
    competitor_id UUID REFERENCES competitors(id) ON DELETE SET NULL,
    url VARCHAR(500),
    publisher VARCHAR(150) NOT NULL,
    page_title VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) DEFAULT 'industry_report',
    relevant_claim TEXT NOT NULL,
    extracted_value VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'unverified', -- verified, corroborated, unverified, management_assumption, ai_hypothesis
    accessed_at DATE DEFAULT CURRENT_DATE,
    researcher_id VARCHAR(50) REFERENCES users(id)
);

-- 6. FINANCIAL SCENARIOS & PROJECTIONS
CREATE TABLE IF NOT EXISTS financial_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    scenario_type VARCHAR(50) NOT NULL, -- downside, base, upside
    assumptions_json JSONB NOT NULL,
    monthly_projections_json JSONB NOT NULL,
    monthly_contribution_sar NUMERIC(12, 2) NOT NULL,
    operating_breakeven_customers INT,
    investment_payback_month INT,
    year1_revenue_sar NUMERIC(15, 2) NOT NULL,
    year1_operating_profit_sar NUMERIC(15, 2) NOT NULL,
    initial_cash_required_sar NUMERIC(12, 2) NOT NULL,
    internal_economic_labor_sar NUMERIC(12, 2) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. RISKS & MANDATORY GATES
CREATE TABLE IF NOT EXISTS risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    risk_id VARCHAR(50) NOT NULL, -- e.g. RSK-01
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    likelihood VARCHAR(50) NOT NULL, -- low, medium, high
    impact VARCHAR(50) NOT NULL, -- low, medium, high, critical
    severity VARCHAR(50) NOT NULL, -- low, medium, high, critical
    owner_id VARCHAR(50) REFERENCES users(id),
    mitigation TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, mitigating, resolved, accepted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_gates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    gate_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_assessed', -- pass, conditional_pass, fail, not_assessed, not_applicable
    evidence TEXT,
    is_critical BOOLEAN DEFAULT TRUE,
    reviewed_by VARCHAR(50) REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 8. DECISIONS & APPROVALS
CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    recommendation VARCHAR(50) NOT NULL,
    decision_status VARCHAR(50) DEFAULT 'submitted', -- submitted, approved, rejected, deferred
    overall_score NUMERIC(5, 2),
    approved_budget_sar NUMERIC(12, 2) DEFAULT 0.00,
    rationale TEXT NOT NULL,
    conditions TEXT,
    submitted_by VARCHAR(50) REFERENCES users(id),
    decided_by VARCHAR(50) REFERENCES users(id),
    decided_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PILOT PLANS & LAUNCH MANAGEMENT
CREATE TABLE IF NOT EXISTS pilot_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    objective TEXT NOT NULL,
    target_customers INT DEFAULT 5,
    duration_days INT DEFAULT 60,
    budget_sar NUMERIC(12, 2) DEFAULT 15000.00,
    success_criteria TEXT NOT NULL,
    failure_criteria TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS launch_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    task_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    assignee_id VARCHAR(50) REFERENCES users(id),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 10. POST-LAUNCH ACTUAL PERFORMANCE
CREATE TABLE IF NOT EXISTS monthly_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    reporting_month DATE NOT NULL,
    paying_customers INT NOT NULL,
    new_customers INT NOT NULL,
    churned_customers INT NOT NULL,
    mrr_sar NUMERIC(12, 2) NOT NULL,
    cash_collected_sar NUMERIC(12, 2) NOT NULL,
    direct_costs_sar NUMERIC(12, 2) NOT NULL,
    operating_costs_sar NUMERIC(12, 2) NOT NULL,
    gross_profit_sar NUMERIC(12, 2) NOT NULL,
    net_operating_result_sar NUMERIC(12, 2) NOT NULL,
    forecast_variance_notes TEXT
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id VARCHAR(50) REFERENCES users(id),
    actor_name VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    before_state JSONB,
    after_state JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_perf_opportunity ON monthly_performance(opportunity_id, reporting_month);
