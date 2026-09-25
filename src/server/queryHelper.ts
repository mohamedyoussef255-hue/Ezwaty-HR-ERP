/**
 * Phase 3: Adaptive Database Query Abstraction Layer
 * 
 * Demonstrates how getEmployees() dynamically adjusts its SQL WHERE clause
 * based on DEPLOYMENT_MODE (CLOUD vs. ON_PREMISE) while keeping the underlying
 * schema, SAP mapping (PERNR, KOSTL, BUKRS), and JSONB dynamic fields 100% unified.
 */

import { DeploymentMode } from './deploymentConfig';
import { Employee } from '../types/hr';

export interface EmployeeFilterOptions {
  departmentId?: string;
  sapCostCenter?: string;
  status?: string;
  customAttributeQuery?: Record<string, any>;
}

export interface GeneratedSqlQuery {
  mode: DeploymentMode;
  sql: string;
  parameters: any[];
  explanation: string;
}

/**
 * Generates the adaptive PostgreSQL query depending on deployment mode
 */
export function buildGetEmployeesQuery(
  mode: DeploymentMode,
  tenantId: string,
  filter: EmployeeFilterOptions = {}
): GeneratedSqlQuery {
  const conditions: string[] = [];
  const parameters: any[] = [];
  let paramIndex = 1;

  // 1. Adaptive Multi-Tenant vs Single-Tenant WHERE Clause
  if (mode === 'CLOUD') {
    // CLOUD MODE: Strict row-level isolation via tenant_id
    conditions.push(`tenant_id = $${paramIndex++}`);
    parameters.push(tenantId);
  } else {
    // ON_PREMISE MODE:
    // Option A: Explicit default local tenant filter
    // Option B: Tenant column is ignored or defaults to constant 'local-premise-org'
    // This allows seamless zero-downtime database migration from on-premise backups to cloud!
    conditions.push(`(tenant_id = $${paramIndex++} OR tenant_id IS NULL OR tenant_id = 'default')`);
    parameters.push('local-premise-org');
  }

  // 2. Standard Relational Filters (Identical in both modes)
  if (filter.departmentId) {
    conditions.push(`department_id = $${paramIndex++}`);
    parameters.push(filter.departmentId);
  }

  if (filter.sapCostCenter) {
    conditions.push(`sap_cost_center = $${paramIndex++}`);
    parameters.push(filter.sapCostCenter);
  }

  if (filter.status) {
    conditions.push(`employment_status = $${paramIndex++}`);
    parameters.push(filter.status);
  }

  // 3. Dynamic JSONB Querying (Identical in both modes, accelerated by GIN index)
  if (filter.customAttributeQuery && Object.keys(filter.customAttributeQuery).length > 0) {
    conditions.push(`custom_attributes @> $${paramIndex++}::jsonb`);
    parameters.push(JSON.stringify(filter.customAttributeQuery));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
SELECT 
    id,
    tenant_id,
    first_name,
    last_name,
    email,
    role,
    basic_salary,
    -- SAP S/4HANA Harmonization Fields (Consistent across Cloud & On-Premise)
    sap_employee_id,
    sap_cost_center,
    sap_company_code,
    sap_sync_status,
    -- Dynamic Custom Fields stored in native JSONB
    custom_attributes,
    created_at
FROM hr_employees
${whereClause}
ORDER BY created_at DESC;
  `.trim();

  const explanation = mode === 'CLOUD'
    ? 'Strict multi-tenant security: SQL queries are partitioned by tenant_id. Cross-tenant reads are prevented at the SQL level.'
    : 'On-premise single-tenant execution: Query defaults to the single local tenant. Multi-tenant checks are bypassed, optimizing query latency on local hardware while retaining 100% schema compatibility with the cloud database.';

  return {
    mode,
    sql,
    parameters,
    explanation,
  };
}
