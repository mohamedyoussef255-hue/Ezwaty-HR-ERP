/**
 * Phase 1: Database Architecture (PostgreSQL DDL)
 * 
 * Multi-Tenant Cloud HR Module with Dynamic JSONB Schema
 * and SAP S/4HANA / ECC Integration Compatibility
 */

export const POSTGRESQL_DDL_SCRIPT = `-- ============================================================================
-- EZWATY CLOUD ERP: HUMAN RESOURCES (HR) MODULE
-- TARGET DATABASE: PostgreSQL 14+ with JSONB support
-- ARCHITECTURE PATTERN: Best-of-Breed Cloud SaaS with SAP FI/CO Integration
-- MULTI-TENANCY: Shared Database, Isolated Schema / Row-Level-Security (RLS) via tenant_id
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. DEPARTMENTS TABLE (hr_departments)
-- Defines organizational units and maps directly to SAP Controlling Area / Cost Center
-- ============================================================================
CREATE TABLE IF NOT EXISTS hr_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    
    -- [SAP DATA HARMONIZATION]
    -- sap_cost_center_ref maps to SAP Cost Center (KOSTL) responsible for this department
    sap_cost_center_ref VARCHAR(10),
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Multi-tenant uniqueness constraint
    CONSTRAINT uq_hr_departments_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_hr_departments_tenant ON hr_departments(tenant_id);


-- ============================================================================
-- 2. COST CENTERS TABLE (hr_cost_centers)
-- Master data for SAP FI/CO cost assignment
-- ============================================================================
CREATE TABLE IF NOT EXISTS hr_cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    cost_center_code VARCHAR(32) NOT NULL,
    
    -- [SAP DATA HARMONIZATION]
    -- Standard SAP FI/CO master fields:
    -- sap_cost_center: KOSTL (Alpha-numeric, usually 10 chars max in SAP)
    -- sap_company_code: BUKRS (Mandatory 4-char organizational unit in SAP FI)
    sap_cost_center VARCHAR(10) NOT NULL,
    sap_company_code VARCHAR(4) NOT NULL,
    
    name VARCHAR(128) NOT NULL,
    responsible_person VARCHAR(128),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_hr_cost_centers_tenant_code UNIQUE (tenant_id, cost_center_code)
);

CREATE INDEX IF NOT EXISTS idx_hr_cost_centers_tenant_sap ON hr_cost_centers(tenant_id, sap_cost_center);


-- ============================================================================
-- 3. EMPLOYEES MASTER DATA TABLE (hr_employees)
-- Core entity with relational columns, SAP mapping keys, and JSONB dynamic attributes
-- ============================================================================
CREATE TABLE IF NOT EXISTS hr_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    
    -- Relational foreign keys
    department_id UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
    cost_center_id UUID REFERENCES hr_cost_centers(id) ON DELETE SET NULL,
    
    -- Compensation & Employment
    basic_salary NUMERIC(15, 2) NOT NULL CHECK (basic_salary >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    employment_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (employment_status IN ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED')),
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- ========================================================================
    -- [SAP DATA HARMONIZATION & INTEGRATION REFERENCE]
    -- Enables bidirectional synchronization with SAP HCM / S/4HANA SuccessFactors
    -- ========================================================================
    -- sap_employee_id: Maps to SAP Personnel Number (PERNR, 8-digit numeric)
    sap_employee_id VARCHAR(8),
    
    -- sap_cost_center: Direct lookup for payroll debit splitting (KOSTL)
    sap_cost_center VARCHAR(10),
    
    -- sap_company_code: Mandatory legal entity identifier (BUKRS)
    sap_company_code VARCHAR(4) NOT NULL DEFAULT '1010',
    
    -- sap_personnel_area: Sub-entity in SAP enterprise structure (WERKS)
    sap_personnel_area VARCHAR(4) DEFAULT '1000',
    
    -- Integration state tracking
    sap_sync_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (sap_sync_status IN ('PENDING', 'SYNCED', 'FAILED', 'BYPASS')),
    sap_last_synced_at TIMESTAMPTZ,

    -- ========================================================================
    -- [DYNAMIC SCHEMA: MULTI-TENANCY JSONB COLUMN]
    -- Stores tenant-specific custom fields (custom allowances, medical clearances,
    -- flexible benefits, shift tags) without requiring DDL alterations.
    -- ========================================================================
    custom_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Audit trails
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT uq_hr_employees_tenant_email UNIQUE (tenant_id, email),
    CONSTRAINT uq_hr_employees_tenant_sap_id UNIQUE (tenant_id, sap_employee_id)
);

-- Indexes for performance & dynamic query acceleration
CREATE INDEX IF NOT EXISTS idx_hr_employees_tenant ON hr_employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hr_employees_sap_pernr ON hr_employees(tenant_id, sap_employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_employees_dept ON hr_employees(tenant_id, department_id);

-- GIN Index for fast querying inside the JSONB dynamic attributes
-- Allows instantaneous indexing for filters like: WHERE custom_attributes @> '{"medical_clearance": true}'
CREATE INDEX IF NOT EXISTS idx_hr_employees_custom_attrs_gin ON hr_employees USING GIN (custom_attributes);


-- ============================================================================
-- 4. LEAVE REQUESTS TABLE (hr_leave_requests)
-- Tracks employee absences and stages them for SAP Infotype 2001 (Absences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS hr_leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    employee_id UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- e.g. ANNUAL, SICK, UNPAID, EMERGENCY
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count NUMERIC(4, 1) NOT NULL CHECK (days_count > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    
    -- [SAP DATA HARMONIZATION]
    -- sap_absence_type: Maps to SAP Subtype for IT2001 (AWART e.g., '0100' Annual Leave)
    sap_absence_type VARCHAR(4) DEFAULT '0100',
    sap_posted BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_hr_leave_requests_tenant ON hr_leave_requests(tenant_id, employee_id);


-- ============================================================================
-- 5. PAYROLL RUNS TABLE (hr_payroll_runs)
-- Records executed payroll calculations and archives the generated SAP FI/CO Journal
-- ============================================================================
CREATE TABLE IF NOT EXISTS hr_payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    payroll_period VARCHAR(7) NOT NULL, -- Format: YYYY-MM (e.g., '2026-09')
    run_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    total_gross NUMERIC(15, 2) NOT NULL,
    total_deductions NUMERIC(15, 2) NOT NULL,
    total_net NUMERIC(15, 2) NOT NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'PROCESSED', 'POSTED_TO_SAP', 'FAILED')),
    
    -- [SAP DATA HARMONIZATION]
    -- Stored references after successful BAPI / OData posting to SAP FI General Ledger:
    -- sap_fi_document_number: BELNR (Accounting Document Number, 10-char numeric)
    -- sap_fi_fiscal_year: GJAHR (Fiscal Year, 4-char numeric)
    sap_fi_document_number VARCHAR(10),
    sap_fi_fiscal_year VARCHAR(4),
    
    -- Snapshot of the generated standard Accounting Journal Entry
    journal_payload JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_hr_payroll_runs_tenant_period UNIQUE (tenant_id, payroll_period)
);

CREATE INDEX IF NOT EXISTS idx_hr_payroll_runs_tenant ON hr_payroll_runs(tenant_id, payroll_period);


-- ============================================================================
-- 6. TENANT DYNAMIC FIELD DEFINITIONS (hr_custom_field_definitions)
-- Configuration catalog defining what JSONB dynamic fields this tenant accepts
-- ============================================================================
CREATE TABLE IF NOT EXISTS hr_custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    field_key VARCHAR(64) NOT NULL,
    field_label VARCHAR(128) NOT NULL,
    field_type VARCHAR(32) NOT NULL CHECK (field_type IN ('text', 'number', 'currency', 'date', 'boolean', 'select')),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    options JSONB, -- JSON array of strings for 'select' dropdowns
    
    -- [SAP DATA HARMONIZATION]
    -- Optional mapping to specific SAP Infotype (e.g. IT0014 Recurring Allowances)
    sap_infotype VARCHAR(8),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_hr_custom_fields_tenant_key UNIQUE (tenant_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_hr_custom_fields_tenant ON hr_custom_field_definitions(tenant_id);


-- ============================================================================
-- 7. ROW-LEVEL SECURITY (RLS) POLICIES FOR MULTI-TENANCY ISOLATION
-- Ensures complete isolation between ERP tenants sharing the same database
-- ============================================================================
ALTER TABLE hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_custom_field_definitions ENABLE ROW LEVEL SECURITY;

-- Dynamic Tenant Context Policy Example (Active session sets: SET app.current_tenant_id = 'tenant-xyz')
CREATE POLICY tenant_isolation_policy_employees ON hr_employees
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy_payroll ON hr_payroll_runs
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true));
`;
