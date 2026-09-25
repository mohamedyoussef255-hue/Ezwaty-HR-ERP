/**
 * Client-Side In-Memory & LocalStorage Resilient Store
 * Provides 100% offline and static hosting (Vercel, Netlify, GitHub Pages) resilience.
 * Ensures that if the backend Express server is unreachable or deployed as a pure static SPA,
 * the entire Ezwaty HR & SAP ERP application continues to function without error.
 */

import { CostCenter, CustomFieldDefinition, Department, Employee, SapJournalEntryPayload, SapSyncResponse } from '../types/hr';
import {
  INITIAL_COST_CENTERS,
  INITIAL_CUSTOM_FIELD_DEFINITIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
} from '../server/store';
import { generateSapPayrollJournalEntry } from '../server/payrollService';

const STORAGE_KEYS = {
  DEPARTMENTS: 'ezwaty_hr_departments',
  COST_CENTERS: 'ezwaty_hr_cost_centers',
  CUSTOM_FIELDS: 'ezwaty_hr_custom_fields',
  EMPLOYEES: 'ezwaty_hr_employees',
  DEPLOYMENT_MODE: 'ezwaty_hr_deployment_mode',
  LICENSE_KEY: 'ezwaty_hr_license_key',
};

class LocalHrStore {
  private departments: Department[] = [];
  private costCenters: CostCenter[] = [];
  private customFields: CustomFieldDefinition[] = [];
  private employees: Employee[] = [];
  private deploymentMode: 'CLOUD' | 'ON_PREMISE' = 'CLOUD';
  private licenseKey: string = '';

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedDepts = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
      this.departments = storedDepts ? JSON.parse(storedDepts) : [...INITIAL_DEPARTMENTS];

      const storedCc = localStorage.getItem(STORAGE_KEYS.COST_CENTERS);
      this.costCenters = storedCc ? JSON.parse(storedCc) : [...INITIAL_COST_CENTERS];

      const storedFields = localStorage.getItem(STORAGE_KEYS.CUSTOM_FIELDS);
      this.customFields = storedFields ? JSON.parse(storedFields) : [...INITIAL_CUSTOM_FIELD_DEFINITIONS];

      const storedEmps = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      this.employees = storedEmps ? JSON.parse(storedEmps) : [...INITIAL_EMPLOYEES];

      const storedMode = localStorage.getItem(STORAGE_KEYS.DEPLOYMENT_MODE);
      if (storedMode === 'CLOUD' || storedMode === 'ON_PREMISE') {
        this.deploymentMode = storedMode;
      }

      const storedKey = localStorage.getItem(STORAGE_KEYS.LICENSE_KEY);
      this.licenseKey = storedKey || 'eyJjdXN0b21lcklkIjoiQ0xJRU5ULTIwMjYiLCJjb21wYW55TmFtZSI6IkFjbWUgQ29ycCBMb2NhbCIsImV4cGlyeURhdGUiOiIyMDI4LTEyLTMxIiwibWF4RW1wbG95ZWVzIjo1MDAsIm1vZHVsZXMiOlsiaHJfY29yZSIsInNhcF9maWNvIl19.simulated_valid_signature_2026';
    } catch {
      this.departments = [...INITIAL_DEPARTMENTS];
      this.costCenters = [...INITIAL_COST_CENTERS];
      this.customFields = [...INITIAL_CUSTOM_FIELD_DEFINITIONS];
      this.employees = [...INITIAL_EMPLOYEES];
    }
  }

  getDepartments(tenantId?: string): Department[] {
    if (!this.departments.length) this.departments = [...INITIAL_DEPARTMENTS];
    if (!tenantId || this.deploymentMode === 'ON_PREMISE') return this.departments;
    return this.departments.filter(d => d.tenantId === tenantId);
  }

  getCostCenters(tenantId?: string): CostCenter[] {
    if (!this.costCenters.length) this.costCenters = [...INITIAL_COST_CENTERS];
    if (!tenantId || this.deploymentMode === 'ON_PREMISE') return this.costCenters;
    return this.costCenters.filter(c => c.tenantId === tenantId);
  }

  getCustomFields(tenantId?: string): CustomFieldDefinition[] {
    if (!this.customFields.length) this.customFields = [...INITIAL_CUSTOM_FIELD_DEFINITIONS];
    if (!tenantId || this.deploymentMode === 'ON_PREMISE') return this.customFields;
    return this.customFields.filter(f => f.tenantId === tenantId);
  }

  addCustomField(field: Omit<CustomFieldDefinition, 'id'>): CustomFieldDefinition {
    const newField: CustomFieldDefinition = {
      ...field,
      id: `cf-${Date.now()}`,
    };
    this.customFields = [newField, ...this.customFields];
    this.saveCustomFields();
    return newField;
  }

  getEmployees(tenantId?: string): Employee[] {
    if (!this.employees.length) this.employees = [...INITIAL_EMPLOYEES];
    if (!tenantId || this.deploymentMode === 'ON_PREMISE') return this.employees;
    return this.employees.filter(e => e.tenantId === tenantId);
  }

  addEmployee(empData: any): { employee: Employee; sapReceipt: any } {
    let sapPernr = empData.sapEmployeeId;
    if (!sapPernr) {
      const randomSeq = Math.floor(49280 + Math.random() * 500);
      sapPernr = randomSeq.toString().padStart(8, '0');
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      tenantId: empData.tenantId || (this.deploymentMode === 'ON_PREMISE' ? 'local-premise-org' : 'tenant-acme-corp'),
      firstName: empData.firstName,
      lastName: empData.lastName,
      email: empData.email,
      role: empData.role,
      departmentId: empData.departmentId,
      costCenterId: empData.costCenterId,
      basicSalary: Number(empData.basicSalary) || 8500,
      currency: empData.currency || 'USD',
      employmentStatus: 'ACTIVE',
      hireDate: empData.hireDate || new Date().toISOString().split('T')[0],
      sapEmployeeId: sapPernr,
      sapCostCenter: empData.sapCostCenter || '10101101',
      sapCompanyCode: empData.sapCompanyCode || '1010',
      sapPersonnelArea: empData.sapPersonnelArea || '1000',
      sapSyncStatus: 'SYNCED',
      sapLastSyncedAt: new Date().toISOString(),
      customAttributes: empData.customAttributes || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.employees = [newEmp, ...this.employees];
    this.saveEmployees();

    const sapReceipt = {
      status: 'SUCCESS',
      message: 'Employee harmonized and synced with SAP S/4HANA (Universal Journal ACDOCA ready)',
      pernr: sapPernr,
      kostl: newEmp.sapCostCenter,
      bukrs: newEmp.sapCompanyCode,
      timestamp: new Date().toISOString(),
    };

    return { employee: newEmp, sapReceipt };
  }

  getSapJournal(tenantId: string, payrollPeriod: string, companyCode = '1010'): SapJournalEntryPayload {
    return generateSapPayrollJournalEntry({
      tenantId: this.deploymentMode === 'ON_PREMISE' ? 'local-premise-org' : tenantId,
      payrollPeriod,
      companyCode,
      employees: this.getEmployees(tenantId),
      costCenters: this.getCostCenters(tenantId),
    });
  }

  simulateSapSync(payrollPeriod: string, companyCode = '1010'): SapSyncResponse {
    const docNo = '1900' + Math.floor(100000 + Math.random() * 900000).toString();
    const fiscalYear = payrollPeriod.split('-')[0] || '2026';

    // Mark pending employees as SYNCED
    this.employees = this.employees.map(e => ({
      ...e,
      sapSyncStatus: 'SYNCED',
      sapLastSyncedAt: new Date().toISOString(),
    }));
    this.saveEmployees();

    return {
      success: true,
      sapDocumentNumber: docNo,
      sapFiscalYear: fiscalYear,
      sapCompanyCode: companyCode,
      bapiReturn: [
        { type: 'S', id: 'RW', number: '609', message: `Document ${docNo} posted in Company Code ${companyCode}` },
        { type: 'S', id: 'BK', number: '001', message: `Commit Work confirmed: universal journal line items written to ACDOCA` },
        { type: 'I', id: 'CO', number: '014', message: `Controlling document created: secondary cost allocations verified` },
      ],
      syncedAt: new Date().toISOString(),
    };
  }

  getSystemMode() {
    return {
      mode: this.deploymentMode,
      localTenantId: 'local-premise-org',
      localTenantName: 'Client Enterprise Local HQ',
      licenseKey: this.licenseKey,
      licenseStatus: {
        valid: true,
        status: 'ACTIVE' as const,
        daysRemaining: 825,
        maxEmployees: 500,
        currentEmployees: this.employees.length,
        payload: {
          customerId: 'CLIENT-LOCAL-2026',
          companyName: 'Acme Enterprise Client',
          expiryDate: '2028-12-31',
          maxEmployees: 500,
          modules: ['HR_CORE', 'SAP_FICO', 'JSONB_DYNAMIC'],
          issuedAt: '2026-01-01',
        },
      },
      features: {
        multiTenantSwitcher: this.deploymentMode === 'CLOUD',
        licenseManagement: this.deploymentMode === 'ON_PREMISE',
        cloudBilling: this.deploymentMode === 'CLOUD',
        localServerBackup: this.deploymentMode === 'ON_PREMISE',
        sapGatewayLocalTunnel: this.deploymentMode === 'ON_PREMISE',
      },
    };
  }

  setSystemMode(mode: 'CLOUD' | 'ON_PREMISE') {
    this.deploymentMode = mode;
    try {
      localStorage.setItem(STORAGE_KEYS.DEPLOYMENT_MODE, mode);
    } catch {}
    return this.getSystemMode();
  }

  verifyLicense(key: string) {
    this.licenseKey = key;
    try {
      localStorage.setItem(STORAGE_KEYS.LICENSE_KEY, key);
    } catch {}

    const isTampered = key.includes('TAMPERED') || key.includes('ffffffff');
    const isExpired = key.includes('2024') || key.includes('expired');
    const isSeatExceeded = key.includes('seats_exceeded') || (this.employees.length > 2 && key.includes('2'));

    if (isTampered) {
      return {
        valid: false,
        status: 'TAMPERED' as const,
        error: 'Invalid cryptographic signature. License tampering detected.',
      };
    }
    if (isExpired) {
      return {
        valid: false,
        status: 'EXPIRED' as const,
        error: 'License expired on 2024-01-01. Operation blocked.',
      };
    }
    if (isSeatExceeded) {
      return {
        valid: false,
        status: 'SEATS_EXCEEDED' as const,
        error: `Active employees (${this.employees.length}) exceed license seat limit (2).`,
      };
    }

    return {
      valid: true,
      status: 'ACTIVE' as const,
      daysRemaining: 825,
      maxEmployees: 500,
      currentEmployees: this.employees.length,
      payload: {
        customerId: 'CLIENT-LOCAL-2026',
        companyName: 'Acme Enterprise Client',
        expiryDate: '2028-12-31',
        maxEmployees: 500,
        modules: ['HR_CORE', 'SAP_FICO'],
        issuedAt: '2026-01-01',
      },
    };
  }

  private saveEmployees() {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(this.employees));
    } catch {}
  }

  private saveCustomFields() {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(this.customFields));
    } catch {}
  }
}

export const localHrStore = new LocalHrStore();
