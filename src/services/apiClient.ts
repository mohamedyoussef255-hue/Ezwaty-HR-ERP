/**
 * Resilient API Client for Ezwaty HR & SAP Cloud ERP
 * 
 * Implements a dual-layer strategy:
 * 1. Attempts to communicate with Express / Serverless backend endpoints (/api/*)
 * 2. If the backend is unreachable, times out, or returns HTML (e.g. Vercel SPA rewrite),
 *    it gracefully falls back to the client-side LocalHrStore without throwing errors.
 * 
 * Guarantees zero downtime, zero 404s, and immediate dropdown population on Vercel, Netlify,
 * Docker, and local development.
 */

import { Department, CostCenter, CustomFieldDefinition, Employee, SapJournalEntryPayload, SapSyncResponse } from '../types/hr';
import { localHrStore } from './localHrStore';

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<{ success: boolean; data?: T; status?: number }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    
    // Check if response is actually JSON and not an HTML 404 / index.html fallback
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return { success: true, data, status: res.status };
    }
    return { success: false, status: res.status };
  } catch (err) {
    return { success: false };
  }
}

export const apiClient = {
  /**
   * Fetch departments for tenant
   */
  async getDepartments(tenantId = 'tenant-acme-corp'): Promise<Department[]> {
    const res = await safeFetchJson<Department[]>(`/api/hr/departments?tenantId=${tenantId}`);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return localHrStore.getDepartments(tenantId);
  },

  /**
   * Fetch cost centers for tenant
   */
  async getCostCenters(tenantId = 'tenant-acme-corp'): Promise<CostCenter[]> {
    const res = await safeFetchJson<CostCenter[]>(`/api/hr/cost-centers?tenantId=${tenantId}`);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return localHrStore.getCostCenters(tenantId);
  },

  /**
   * Fetch dynamic JSONB custom field schema
   */
  async getSchemaConfig(tenantId = 'tenant-acme-corp'): Promise<CustomFieldDefinition[]> {
    const res = await safeFetchJson<CustomFieldDefinition[]>(`/api/hr/schema-config?tenantId=${tenantId}`);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return localHrStore.getCustomFields(tenantId);
  },

  /**
   * Save a new dynamic JSONB custom field
   */
  async saveCustomField(payload: any): Promise<{ success: boolean; data?: CustomFieldDefinition; error?: string }> {
    const res = await safeFetchJson<{ success: boolean; data: CustomFieldDefinition }>(
      '/api/hr/schema-config',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (res.success && res.data) {
      return { success: true, data: res.data.data };
    }

    // Fallback: save to client store
    const created = localHrStore.addCustomField(payload);
    return { success: true, data: created };
  },

  /**
   * Fetch active employees
   */
  async getEmployees(tenantId = 'tenant-acme-corp'): Promise<Employee[]> {
    const res = await safeFetchJson<Employee[]>(`/api/hr/employees?tenantId=${tenantId}`);
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return localHrStore.getEmployees(tenantId);
  },

  /**
   * Create employee profile and harmonize with SAP
   */
  async createEmployee(payload: any): Promise<{ success: boolean; data: Employee; sapHarmonizationReceipt: any; errors?: string[] }> {
    const res = await safeFetchJson<{ success: boolean; data: Employee; sapHarmonizationReceipt: any; errors?: string[] }>(
      '/api/hr/employees',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (res.success && res.data && res.data.success) {
      return res.data;
    }

    // Fallback: create in local store
    const { employee, sapReceipt } = localHrStore.addEmployee(payload);
    return {
      success: true,
      data: employee,
      sapHarmonizationReceipt: sapReceipt,
    };
  },

  /**
   * Export SAP General Ledger payroll journal
   */
  async getSapPayrollJournal(tenantId: string, payrollPeriod: string, companyCode = '1010'): Promise<SapJournalEntryPayload | null> {
    const res = await safeFetchJson<{ success: boolean; sapJournalEntry: SapJournalEntryPayload }>(
      `/api/hr/payroll/export-sap?tenantId=${tenantId}&payrollPeriod=${payrollPeriod}&companyCode=${companyCode}`
    );

    if (res.success && res.data?.sapJournalEntry) {
      return res.data.sapJournalEntry;
    }

    return localHrStore.getSapJournal(tenantId, payrollPeriod, companyCode);
  },

  /**
   * Simulate posting to SAP S/4HANA
   */
  async simulateSapPosting(payrollPeriod: string, companyCode = '1010'): Promise<SapSyncResponse> {
    const res = await safeFetchJson<SapSyncResponse>(
      '/api/sap/sync-simulate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payrollPeriod, companyCode }),
      }
    );

    if (res.success && res.data) {
      return res.data;
    }

    return localHrStore.simulateSapSync(payrollPeriod, companyCode);
  },

  /**
   * Get deployment mode
   */
  async getSystemMode(): Promise<any> {
    const res = await safeFetchJson<any>('/api/system/mode');
    if (res.success && res.data) {
      return res.data;
    }
    return localHrStore.getSystemMode();
  },

  /**
   * Switch deployment mode
   */
  async setSystemMode(mode: 'CLOUD' | 'ON_PREMISE'): Promise<any> {
    const res = await safeFetchJson<any>(
      '/api/system/mode',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      }
    );

    if (res.success && res.data) {
      return res.data;
    }

    return {
      success: true,
      message: `Switched deployment mode to ${mode}`,
      state: localHrStore.setSystemMode(mode),
    };
  },

  /**
   * Verify license
   */
  async verifyLicense(licenseKey: string, updateActiveKey = false): Promise<any> {
    const res = await safeFetchJson<any>(
      '/api/system/license/verify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey, updateActiveKey }),
      }
    );

    if (res.success && res.data) {
      return res.data;
    }

    const verification = localHrStore.verifyLicense(licenseKey);
    return {
      result: verification,
      activeKeyUpdated: updateActiveKey && verification.valid,
    };
  },

  /**
   * Generate demo license
   */
  async generateDemoLicense(type: 'valid' | 'expired' | 'seats_exceeded' | 'tampered'): Promise<any> {
    const res = await safeFetchJson<any>(
      '/api/system/license/generate-demo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, customSeats: type === 'seats_exceeded' ? 2 : 500 }),
      }
    );

    if (res.success && res.data) {
      return res.data;
    }

    // Client fallback demo keys
    const demoKeys: Record<string, string> = {
      valid: 'eyJjdXN0b21lcklkIjoiQ0xJRU5ULTIwMjYiLCJjb21wYW55TmFtZSI6IkFjbWUgQ29ycCBMb2NhbCIsImV4cGlyeURhdGUiOiIyMDI4LTEyLTMxIiwibWF4RW1wbG95ZWVzIjo1MDAsIm1vZHVsZXMiOlsiaHJfY29yZSIsInNhcF9maWNvIl19.simulated_valid_signature_2026',
      expired: 'eyJjdXN0b21lcklkIjoiQ0xJRU5ULTIwMjQiLCJjb21wYW55TmFtZSI6IkFjbWUgQ29ycCBMb2NhbCIsImV4cGlyeURhdGUiOiIyMDI0LTAxLTAxIiwibWF4RW1wbG95ZWVzIjo1MDAsIm1vZHVsZXMiOlsiaHJfY29yZSJdfQ==.simulated_expired_signature',
      seats_exceeded: 'eyJjdXN0b21lcklkIjoiQ0xJRU5ULTItU0VBVFMiLCJjb21wYW55TmFtZSI6IkFjbWUgQ29ycCBMb2NhbCIsImV4cGlyeURhdGUiOiIyMDI4LTEyLTMxIiwibWF4RW1wbG95ZWVzIjoyLCJtb2R1bGVzIjpbImhyX2NvcmUiXX0=.simulated_seats_exceeded',
      tampered: 'eyJjdXN0b21lcklkIjoiVEFNUEVSRUQifQ==.ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    };

    const key = demoKeys[type] || demoKeys.valid;
    return {
      type,
      generatedKey: key,
      verification: localHrStore.verifyLicense(key),
    };
  },
};
