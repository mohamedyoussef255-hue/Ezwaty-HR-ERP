/**
 * Full-Stack Express Server with SAP HR API Endpoints and Vite Dev Middleware
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { POSTGRESQL_DDL_SCRIPT } from './src/shared/ddl';
import { generateSapPayrollJournalEntry } from './src/server/payrollService';
import { deploymentManager, DeploymentMode } from './src/server/deploymentConfig';
import { createDeploymentMiddleware } from './src/server/deploymentMiddleware';
import { verifyLicenseKey, generateLicenseKey } from './src/server/licenseService';
import { buildGetEmployeesQuery } from './src/server/queryHelper';
import {
  INITIAL_COST_CENTERS,
  INITIAL_CUSTOM_FIELD_DEFINITIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_PAYROLL_RUNS,
} from './src/server/store';
import { CustomFieldDefinition, Employee, SapSyncResponse } from './src/types/hr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parsing
app.use(express.json());

// In-Memory Database store (Simulating PostgreSQL tables)
let departments = [...INITIAL_DEPARTMENTS];
let costCenters = [...INITIAL_COST_CENTERS];
let customFieldDefinitions = [...INITIAL_CUSTOM_FIELD_DEFINITIONS];
let employees = [...INITIAL_EMPLOYEES];
let payrollRuns = [...INITIAL_PAYROLL_RUNS];

// Mount Hybrid Deployment Middleware (Enforces JWT in Cloud, Validates License in On-Premise)
app.use(createDeploymentMiddleware(() => employees.length));

// ============================================================================
// SYSTEM & HYBRID DEPLOYMENT ENDPOINTS
// ============================================================================

/**
 * Get current deployment mode, license status, and system invariants
 */
app.get('/api/system/mode', (req: Request, res: Response) => {
  const state = deploymentManager.getSystemState(employees.length);
  res.json(state);
});

/**
 * Dynamically switch deployment mode (for live architecture demonstration)
 */
app.post('/api/system/mode', (req: Request, res: Response) => {
  const { mode } = req.body;
  if (mode !== 'CLOUD' && mode !== 'ON_PREMISE') {
    return res.status(400).json({ error: 'Mode must be either CLOUD or ON_PREMISE' });
  }

  deploymentManager.setMode(mode as DeploymentMode);
  const state = deploymentManager.getSystemState(employees.length);
  res.json({
    success: true,
    message: `Switched deployment mode to ${mode}`,
    state,
  });
});

/**
 * Verify or test a custom On-Premise license key
 */
app.post('/api/system/license/verify', (req: Request, res: Response) => {
  const { licenseKey, updateActiveKey = false } = req.body;
  const result = verifyLicenseKey(licenseKey, employees.length);

  if (updateActiveKey && result.valid) {
    deploymentManager.setLicenseKey(licenseKey);
  }

  res.json({
    result,
    activeKeyUpdated: updateActiveKey && result.valid,
  });
});

/**
 * Generate a demo license key (Active, Expired, or Limited Seats) for testing
 */
app.post('/api/system/license/generate-demo', (req: Request, res: Response) => {
  const { type = 'valid', customSeats = 500, customerName = 'Acme Local Client' } = req.body;

  let expiryDate = '2028-12-31';
  let seats = customSeats;

  if (type === 'expired') {
    expiryDate = '2024-01-01'; // Past date
  } else if (type === 'seats_exceeded') {
    seats = 2; // Less than existing 3 employees
  }

  const generatedKey = generateLicenseKey({
    customerId: `CLIENT-${Date.now().toString().slice(-4)}`,
    companyName: customerName,
    expiryDate,
    maxEmployees: seats,
    modules: ['HR_CORE', 'SAP_FICO', 'JSONB_DYNAMIC', 'LEAVE_MANAGEMENT'],
    issuedAt: new Date().toISOString(),
  });

  res.json({
    type,
    generatedKey,
    verification: verifyLicenseKey(generatedKey, employees.length),
  });
});

/**
 * Get SQL query preview showing adaptive WHERE clause for current mode
 */
app.get('/api/system/query-preview', (req: Request, res: Response) => {
  const mode = (req.query.mode as DeploymentMode) || deploymentManager.getMode();
  const tenantId = req.tenantId || 'tenant-acme-corp';
  const query = buildGetEmployeesQuery(mode, tenantId);
  res.json(query);
});

// ============================================================================
// PHASE 2: NODE.JS / EXPRESS BACKEND API CONTROLLERS
// ============================================================================

/**
 * Health check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Ezwaty Cloud HR & SAP ERP Sync',
  });
});

/**
 * Get PostgreSQL DDL script (Phase 1 Database Architecture)
 */
app.get('/api/hr/ddl', (req: Request, res: Response) => {
  res.json({
    ddl: POSTGRESQL_DDL_SCRIPT,
    architecture: 'PostgreSQL 14+ Multi-Tenant Schema with Dynamic JSONB & SAP Harmonization',
  });
});

/**
 * Departments Master Data
 */
app.get('/api/hr/departments', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'tenant-acme-corp';
  res.json(departments.filter(d => d.tenantId === tenantId));
});

/**
 * Cost Centers Master Data (SAP KOSTL / BUKRS)
 */
app.get('/api/hr/cost-centers', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'tenant-acme-corp';
  res.json(costCenters.filter(cc => cc.tenantId === tenantId));
});

/**
 * Dynamic JSONB Field Schema Configuration
 */
app.get('/api/hr/schema-config', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'tenant-acme-corp';
  res.json(customFieldDefinitions.filter(cf => cf.tenantId === tenantId));
});

app.post('/api/hr/schema-config', (req: Request, res: Response) => {
  const { tenantId = 'tenant-acme-corp', fieldKey, fieldLabel, fieldType, isRequired, defaultValue, options, sapInfotype, description } = req.body;

  if (!fieldKey || !fieldLabel || !fieldType) {
    return res.status(400).json({ error: 'fieldKey, fieldLabel, and fieldType are required.' });
  }

  // Prevent duplicate keys
  const existing = customFieldDefinitions.find(f => f.tenantId === tenantId && f.fieldKey === fieldKey);
  if (existing) {
    return res.status(409).json({ error: `Field key '${fieldKey}' already exists for this tenant.` });
  }

  const newDef: CustomFieldDefinition = {
    id: `cf-${Date.now()}`,
    tenantId,
    fieldKey: fieldKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    fieldLabel: fieldLabel.trim(),
    fieldType,
    isRequired: Boolean(isRequired),
    defaultValue,
    options: Array.isArray(options) ? options : undefined,
    sapInfotype: sapInfotype || 'IT0014',
    description,
  };

  customFieldDefinitions.push(newDef);
  res.status(201).json(newDef);
});

/**
 * List Employees
 */
app.get('/api/hr/employees', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'tenant-acme-corp';
  const tenantEmployees = employees.filter(e => e.tenantId === tenantId);
  res.json(tenantEmployees);
});

/**
 * PHASE 2 REQUIREMENT:
 * API Controller to create a new employee.
 * Validates core relational fields and accepts dynamic JSON payload for custom_attributes.
 * Handles SAP Data Harmonization.
 */
app.post('/api/hr/employees', (req: Request, res: Response) => {
  const {
    tenantId = 'tenant-acme-corp',
    firstName,
    lastName,
    email,
    role,
    departmentId,
    costCenterId,
    basicSalary,
    currency = 'USD',
    hireDate,
    sapEmployeeId,
    sapCostCenter,
    sapCompanyCode = '1010',
    sapPersonnelArea = '1000',
    customAttributes = {},
  } = req.body;

  // 1. Relational Validation: Core Fields
  const errors: string[] = [];

  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
    errors.push('firstName is required and must be a non-empty string.');
  }
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
    errors.push('lastName is required and must be a non-empty string.');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('email must be a valid email address.');
  }
  if (!role || typeof role !== 'string') {
    errors.push('role is required.');
  }
  if (basicSalary === undefined || basicSalary === null || isNaN(Number(basicSalary)) || Number(basicSalary) < 0) {
    errors.push('basicSalary must be a positive number.');
  }
  if (!departmentId) {
    errors.push('departmentId is required.');
  }
  if (!costCenterId) {
    errors.push('costCenterId is required.');
  }

  // Check unique constraints (tenant_id + email)
  const duplicateEmail = employees.find(e => e.tenantId === tenantId && e.email.toLowerCase() === email?.toLowerCase());
  if (duplicateEmail) {
    errors.push(`An employee with email '${email}' already exists in this tenant.`);
  }

  // 2. Dynamic Schema Validation (PostgreSQL JSONB custom_attributes)
  // Retrieve the configured dynamic fields for this tenant
  const tenantFieldDefs = customFieldDefinitions.filter(cf => cf.tenantId === tenantId);

  tenantFieldDefs.forEach(fieldDef => {
    const value = customAttributes[fieldDef.fieldKey];

    // Check required dynamic fields
    if (fieldDef.isRequired && (value === undefined || value === null || value === '')) {
      errors.push(`Custom dynamic field '${fieldDef.fieldLabel}' (${fieldDef.fieldKey}) is required.`);
    }

    // Type checking for provided dynamic values
    if (value !== undefined && value !== null && value !== '') {
      if (fieldDef.fieldType === 'number' || fieldDef.fieldType === 'currency') {
        if (isNaN(Number(value))) {
          errors.push(`Custom field '${fieldDef.fieldLabel}' must be a numeric value.`);
        }
      } else if (fieldDef.fieldType === 'boolean') {
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          errors.push(`Custom field '${fieldDef.fieldLabel}' must be a boolean.`);
        }
      } else if (fieldDef.fieldType === 'select' && fieldDef.options) {
        if (!fieldDef.options.includes(value)) {
          errors.push(`Custom field '${fieldDef.fieldLabel}' value '${value}' is not a valid option.`);
        }
      }
    }
  });

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Employee validation failed',
      errors,
    });
  }

  // 3. SAP Data Harmonization:
  // - SAP PERNR: Format to standard 8-digit numeric string (e.g. 00049284)
  // - SAP KOSTL: Resolve from Cost Center master if not explicitly provided
  // - SAP BUKRS: Ensure 4-character company code
  const selectedCostCenter = costCenters.find(cc => cc.id === costCenterId);
  const resolvedSapCostCenter = sapCostCenter || selectedCostCenter?.sapCostCenter || '10101101';
  
  let formattedSapEmployeeId = sapEmployeeId;
  if (!formattedSapEmployeeId) {
    // Generate next available SAP Personnel Number
    const nextSeq = 49280 + employees.length + 1;
    formattedSapEmployeeId = nextSeq.toString().padStart(8, '0');
  } else {
    // Standardize to 8 digits with leading zeros
    formattedSapEmployeeId = formattedSapEmployeeId.toString().padStart(8, '0');
  }

  const newEmployee: Employee = {
    id: `emp-${Date.now()}`,
    tenantId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    role: role.trim(),
    departmentId,
    costCenterId,
    basicSalary: Number(basicSalary),
    currency: currency.toUpperCase(),
    employmentStatus: 'ACTIVE',
    hireDate: hireDate || new Date().toISOString().split('T')[0],
    
    // SAP Harmonization Fields
    sapEmployeeId: formattedSapEmployeeId,
    sapCostCenter: resolvedSapCostCenter,
    sapCompanyCode: (sapCompanyCode || '1010').padEnd(4, ' ').substring(0, 4),
    sapPersonnelArea: sapPersonnelArea || '1000',
    sapSyncStatus: 'PENDING',
    
    // Dynamic JSONB attributes sanitized
    customAttributes: { ...customAttributes },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  employees.push(newEmployee);

  res.status(201).json({
    success: true,
    message: 'Employee created successfully with dynamic JSONB schema and SAP mapping.',
    data: newEmployee,
    sapHarmonizationReceipt: {
      pernr: newEmployee.sapEmployeeId,
      kostl: newEmployee.sapCostCenter,
      bukrs: newEmployee.sapCompanyCode,
      werks: newEmployee.sapPersonnelArea,
      status: newEmployee.sapSyncStatus,
      jsonbAttributesIndexed: Object.keys(newEmployee.customAttributes).length,
    },
  });
});

/**
 * PHASE 2 REQUIREMENT:
 * Aggregation endpoint (/api/hr/payroll/export-sap)
 * Simulates generating a JSON payload of a monthly payroll run,
 * structured as a standard Accounting Journal Entry (Debits and Credits mapped to cost centers)
 * ready to be pushed to SAP FI/CO via OData or BAPI/IDoc.
 */
app.all('/api/hr/payroll/export-sap', (req: Request, res: Response) => {
  const tenantId = (req.body.tenantId || req.query.tenantId as string) || 'tenant-acme-corp';
  const payrollPeriod = (req.body.payrollPeriod || req.query.payrollPeriod as string) || '2026-09';
  const companyCode = (req.body.companyCode || req.query.companyCode as string) || '1010';

  const journalPayload = generateSapPayrollJournalEntry({
    tenantId,
    payrollPeriod,
    companyCode,
    employees,
    costCenters,
  });

  res.json({
    success: true,
    payrollPeriod,
    sapJournalEntry: journalPayload,
  });
});

/**
 * Simulates real-time push to SAP S/4HANA (BAPI_ACC_DOCUMENT_POST / OData V4)
 */
app.post('/api/sap/sync-simulate', (req: Request, res: Response) => {
  const { payrollPeriod = '2026-09', companyCode = '1010' } = req.body;
  const docNumber = (1000000000 + Math.floor(Math.random() * 900000)).toString();
  const fiscalYear = '2026';

  const response: SapSyncResponse = {
    success: true,
    sapDocumentNumber: docNumber,
    sapFiscalYear: fiscalYear,
    sapCompanyCode: companyCode,
    bapiReturn: [
      {
        type: 'S',
        id: 'RW',
        number: '605',
        message: `Document ${docNumber} posted successfully in company code ${companyCode} for fiscal year ${fiscalYear}.`,
        messageV1: docNumber,
      },
      {
        type: 'I',
        id: 'CO',
        number: '101',
        message: 'Controlling documents updated for primary cost centers.',
      }
    ],
    syncedAt: new Date().toISOString(),
  };

  // Mark pending employees as SYNCED
  employees = employees.map(emp => ({
    ...emp,
    sapSyncStatus: 'SYNCED',
    sapLastSyncedAt: new Date().toISOString(),
  }));

  res.json(response);
});

// ============================================================================
// DEV MIDDLEWARE & STATIC ASSET SERVING
// ============================================================================

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ezwaty HR & SAP Cloud ERP] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
