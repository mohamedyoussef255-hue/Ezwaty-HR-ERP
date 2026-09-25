/**
 * Enterprise HR Module & SAP S/4HANA Integration Type Definitions
 */

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  sapCompanyCode: string; // SAP BUKRS (e.g. "1010")
}

export type FieldType = 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'select';

export interface CustomFieldDefinition {
  id: string;
  tenantId: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: FieldType;
  isRequired: boolean;
  defaultValue?: string | number | boolean;
  options?: string[]; // for select type
  sapInfotype?: string; // e.g. "IT0014" (Recurring), "IT0015" (Additional), "IT0028" (Internal Medical)
  description?: string;
}

export interface Department {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  sapCostCenterRef: string;
}

export interface CostCenter {
  id: string;
  tenantId: string;
  costCenterCode: string;
  sapCostCenter: string; // SAP KOSTL (e.g. "10101101")
  sapCompanyCode: string; // SAP BUKRS (e.g. "1010")
  name: string;
  responsiblePerson: string;
  isActive: boolean;
}

export interface Employee {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId: string;
  costCenterId: string;
  basicSalary: number;
  currency: string;
  employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  hireDate: string;
  
  // SAP ERP External Reference Mapping (Data Harmonization)
  sapEmployeeId: string; // SAP Personnel Number (PERNR - 8 digits)
  sapCostCenter: string; // SAP Cost Center (KOSTL - 10 chars)
  sapCompanyCode: string; // SAP Company Code (BUKRS - 4 chars)
  sapPersonnelArea: string; // SAP Personnel Area (WERKS - 4 chars)
  sapSyncStatus: 'SYNCED' | 'PENDING' | 'FAILED' | 'BYPASS';
  sapLastSyncedAt?: string;

  // Dynamic Multi-Tenant Custom Fields (PostgreSQL JSONB)
  customAttributes: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | 'EMERGENCY';
  startDate: string;
  endDate: string;
  daysCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  sapAbsenceType: string; // SAP IT2001 Subtype (AWART)
  sapPosted: boolean;
  createdAt: string;
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  payrollPeriod: string; // "YYYY-MM"
  runDate: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  status: 'DRAFT' | 'PROCESSED' | 'POSTED_TO_SAP';
  sapFiDocumentNumber?: string; // SAP BELNR
  sapFiFiscalYear?: string; // SAP GJAHR
  journalPayload?: SapJournalEntryPayload;
  createdAt: string;
}

/**
 * SAP FI/CO General Ledger Journal Entry (BAPI_ACC_DOCUMENT_POST / S/4HANA OData format)
 */
export interface SapDocHeader {
  objType: string; // e.g. "BKPFF"
  objKey: string;
  busAct: string; // "RFBU" (Posting in FI)
  username: string;
  docDate: string; // BLDAT (YYYYMMDD)
  pstngDate: string; // BUDAT (YYYYMMDD)
  fiscYear: string; // GJAHR (YYYY)
  fisPeriod: string; // MONAT (MM)
  compCode: string; // BUKRS (4 chars)
  docType: string; // BLART e.g. "SA" (G/L Account Doc) or "PR" (Payroll)
  refDocNo: string; // XBLNR
  headerTxt: string; // BKTXT
}

export interface SapAccountGlItem {
  itemnoAcc: number;
  glAccount: string; // HKONT (10 chars, e.g. "0000600100")
  glAccountName: string;
  docType: 'DEBIT' | 'CREDIT';
  pstngKey: string; // "40" for Debit, "50" for Credit
  costCenter?: string; // KOSTL (10 chars)
  profitCenter?: string; // PRCTR
  compCode: string; // BUKRS
  itemText: string; // SGTXT
}

export interface SapCurrencyAmountItem {
  itemnoAcc: number;
  currency: string; // WAERS
  currencyIso: string;
  amtDoccur: number; // Signed numeric or absolute based on posting key
}

export interface SapJournalEntryPayload {
  header: SapDocHeader;
  accountGl: SapAccountGlItem[];
  currencyAmount: SapCurrencyAmountItem[];
  summary: {
    totalDebits: number;
    totalCredits: number;
    currency: string;
    isBalanced: boolean;
    employeeCount: number;
    costCenterBreakdown: Record<string, { costCenter: string; totalSalary: number; totalAllowances: number }>;
  };
  metadata: {
    generatedAt: string;
    targetSapEndpoint: string;
    interfaceProtocol: 'ODATA_V4_JOURNAL_ENTRY' | 'IDOC_ACC_DOCUMENT03' | 'BAPI_ACC_DOCUMENT_POST';
    harmonizationRulesApplied: string[];
  };
}

export interface SapSyncResponse {
  success: boolean;
  sapDocumentNumber: string;
  sapFiscalYear: string;
  sapCompanyCode: string;
  bapiReturn: Array<{
    type: 'S' | 'E' | 'W' | 'I';
    id: string;
    number: string;
    message: string;
    messageV1?: string;
  }>;
  syncedAt: string;
}
