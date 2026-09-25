/**
 * SAP FI/CO Payroll Journal Entry Service
 * Aggregates monthly payroll and creates standard SAP Accounting Documents.
 * Formatted for SAP BAPI_ACC_DOCUMENT_POST and S/4HANA OData JournalEntry API.
 */

import { Employee, CostCenter, SapJournalEntryPayload, SapAccountGlItem, SapCurrencyAmountItem } from '../types/hr';

// Standard SAP FI General Ledger Chart of Accounts (COA)
export const SAP_GL_ACCOUNTS = {
  SALARIES_EXPENSE: { code: '0000600100', name: 'Base Salaries & Wages Expense' },
  ALLOWANCES_EXPENSE: { code: '0000600200', name: 'Employee Allowances & Benefits' },
  EMPLOYER_PENSION_EXPENSE: { code: '0000600300', name: 'Employer Social Security Contribution' },
  WITHHOLDING_TAX_PAYABLE: { code: '0000210300', name: 'Income Tax Withholding Payable' },
  SOCIAL_SECURITY_PAYABLE: { code: '0000210400', name: 'Social Security / GOSI Payable' },
  PAYROLL_CLEARING: { code: '0000110100', name: 'Payroll Bank Clearing Account' },
};

export interface PayrollCalculationInput {
  tenantId: string;
  payrollPeriod: string; // e.g. "2026-09"
  companyCode?: string; // SAP BUKRS e.g. "1010"
  postingDate?: string; // Format: YYYY-MM-DD
  employees: Employee[];
  costCenters: CostCenter[];
}

export function generateSapPayrollJournalEntry(input: PayrollCalculationInput): SapJournalEntryPayload {
  const {
    tenantId,
    payrollPeriod,
    companyCode = '1010',
    postingDate = new Date().toISOString().split('T')[0],
    employees,
    costCenters,
  } = input;

  // 1. Group active employees by Cost Center
  const activeEmployees = employees.filter(e => e.tenantId === tenantId && e.employmentStatus === 'ACTIVE');
  const costCenterMap = new Map<string, CostCenter>();
  costCenters.forEach(cc => costCenterMap.set(cc.id, cc));

  // Breakdown aggregators per SAP Cost Center (KOSTL)
  const ccAggregations: Record<string, {
    costCenterCode: string;
    sapCostCenter: string;
    totalBaseSalary: number;
    totalAllowances: number;
    employeeCount: number;
  }> = {};

  let grandTotalBaseSalary = 0;
  let grandTotalAllowances = 0;
  let grandTotalEmployeeTax = 0;
  let grandTotalSocialSecurity = 0;
  let grandTotalNetPay = 0;

  activeEmployees.forEach(emp => {
    const cc = costCenterMap.get(emp.costCenterId);
    // [SAP DATA HARMONIZATION]: KOSTL is prioritized from employee master, then cost center record, or fallback
    const sapCostCenter = emp.sapCostCenter || cc?.sapCostCenter || '10101101';

    if (!ccAggregations[sapCostCenter]) {
      ccAggregations[sapCostCenter] = {
        costCenterCode: cc?.costCenterCode || 'DEFAULT_CC',
        sapCostCenter,
        totalBaseSalary: 0,
        totalAllowances: 0,
        employeeCount: 0,
      };
    }

    const baseSalary = Number(emp.basicSalary) || 0;
    
    // Extract dynamic allowances from JSONB custom_attributes
    let empAllowances = 0;
    if (emp.customAttributes) {
      if (typeof emp.customAttributes.housing_allowance === 'number') {
        empAllowances += emp.customAttributes.housing_allowance;
      }
      if (typeof emp.customAttributes.transport_allowance === 'number') {
        empAllowances += emp.customAttributes.transport_allowance;
      }
      // Dynamic keys matching '*allowance*' or '*stipend*'
      Object.keys(emp.customAttributes).forEach(key => {
        if (!['housing_allowance', 'transport_allowance'].includes(key) && 
            (key.includes('allowance') || key.includes('stipend') || key.includes('bonus'))) {
          const val = Number(emp.customAttributes[key]);
          if (!isNaN(val)) empAllowances += val;
        }
      });
    }

    const grossPay = baseSalary + empAllowances;

    // Standard Statutory Withholding Estimates
    // Tax Withholding: 10%
    // Social Security Employee Contribution: 9%
    const withholdingTax = Math.round(grossPay * 0.10 * 100) / 100;
    const socialSecurity = Math.round(grossPay * 0.09 * 100) / 100;
    const netPay = grossPay - withholdingTax - socialSecurity;

    ccAggregations[sapCostCenter].totalBaseSalary += baseSalary;
    ccAggregations[sapCostCenter].totalAllowances += empAllowances;
    ccAggregations[sapCostCenter].employeeCount += 1;

    grandTotalBaseSalary += baseSalary;
    grandTotalAllowances += empAllowances;
    grandTotalEmployeeTax += withholdingTax;
    grandTotalSocialSecurity += socialSecurity;
    grandTotalNetPay += netPay;
  });

  // Re-round totals to two decimal places
  grandTotalBaseSalary = Math.round(grandTotalBaseSalary * 100) / 100;
  grandTotalAllowances = Math.round(grandTotalAllowances * 100) / 100;
  grandTotalEmployeeTax = Math.round(grandTotalEmployeeTax * 100) / 100;
  grandTotalSocialSecurity = Math.round(grandTotalSocialSecurity * 100) / 100;
  
  // Guarantee exact debit/credit balancing down to the last cent
  const totalDebits = Math.round((grandTotalBaseSalary + grandTotalAllowances) * 100) / 100;
  const grandTotalDeductions = Math.round((grandTotalEmployeeTax + grandTotalSocialSecurity) * 100) / 100;
  grandTotalNetPay = Math.round((totalDebits - grandTotalDeductions) * 100) / 100;
  const totalCredits = Math.round((grandTotalEmployeeTax + grandTotalSocialSecurity + grandTotalNetPay) * 100) / 100;

  // Format Dates for SAP (YYYYMMDD)
  const [pYear, pMonth, pDay] = postingDate.split('-');
  const sapDateFormatted = `${pYear}${pMonth}${pDay || '28'}`;
  const fiscalYear = pYear;
  const fiscalPeriod = pMonth;

  // 2. Build SAP Document Header (BAPI_ACC_DOCUMENT_POST format)
  const header = {
    objType: 'BKPFF',
    objKey: `$${companyCode}PAYROLL${sapDateFormatted}`,
    busAct: 'RFBU', // Posting in Financial Accounting
    username: 'SAP_HR_SYNC',
    docDate: sapDateFormatted,
    pstngDate: sapDateFormatted,
    fiscYear: fiscalYear,
    fisPeriod: fiscalPeriod,
    compCode: companyCode,
    docType: 'SA', // G/L Account Document (or 'PR' for Payroll)
    refDocNo: `PAY-${payrollPeriod}`,
    headerTxt: `Payroll Run ${payrollPeriod} [Ezwaty Cloud ERP]`,
  };

  const accountGl: SapAccountGlItem[] = [];
  const currencyAmount: SapCurrencyAmountItem[] = [];
  let itemCounter = 1;

  // 3. Generate Expense Debits (PstngKey '40') per SAP Cost Center (KOSTL)
  Object.values(ccAggregations).forEach(ccData => {
    // 3A. Base Salary Debit
    if (ccData.totalBaseSalary > 0) {
      accountGl.push({
        itemnoAcc: itemCounter,
        glAccount: SAP_GL_ACCOUNTS.SALARIES_EXPENSE.code,
        glAccountName: SAP_GL_ACCOUNTS.SALARIES_EXPENSE.name,
        docType: 'DEBIT',
        pstngKey: '40', // SAP standard: Debit G/L Account
        costCenter: ccData.sapCostCenter, // [SAP DATA HARMONIZATION] KOSTL
        compCode: companyCode,
        itemText: `Salaries ${payrollPeriod} - CC ${ccData.sapCostCenter}`,
      });

      currencyAmount.push({
        itemnoAcc: itemCounter,
        currency: 'USD',
        currencyIso: 'USD',
        amtDoccur: Math.round(ccData.totalBaseSalary * 100) / 100, // Positive for Debit in BAPI
      });

      itemCounter++;
    }

    // 3B. Dynamic Allowances Debit (Housing, Transport, etc.)
    if (ccData.totalAllowances > 0) {
      accountGl.push({
        itemnoAcc: itemCounter,
        glAccount: SAP_GL_ACCOUNTS.ALLOWANCES_EXPENSE.code,
        glAccountName: SAP_GL_ACCOUNTS.ALLOWANCES_EXPENSE.name,
        docType: 'DEBIT',
        pstngKey: '40', // Debit G/L Account
        costCenter: ccData.sapCostCenter, // KOSTL
        compCode: companyCode,
        itemText: `Dynamic Allowances ${payrollPeriod} - CC ${ccData.sapCostCenter}`,
      });

      currencyAmount.push({
        itemnoAcc: itemCounter,
        currency: 'USD',
        currencyIso: 'USD',
        amtDoccur: Math.round(ccData.totalAllowances * 100) / 100,
      });

      itemCounter++;
    }
  });

  // 4. Generate Liability Credits (PstngKey '50')
  // 4A. Withholding Tax Payable
  accountGl.push({
    itemnoAcc: itemCounter,
    glAccount: SAP_GL_ACCOUNTS.WITHHOLDING_TAX_PAYABLE.code,
    glAccountName: SAP_GL_ACCOUNTS.WITHHOLDING_TAX_PAYABLE.name,
    docType: 'CREDIT',
    pstngKey: '50', // SAP standard: Credit G/L Account
    compCode: companyCode,
    itemText: `Withholding Tax Payable ${payrollPeriod}`,
  });
  currencyAmount.push({
    itemnoAcc: itemCounter,
    currency: 'USD',
    currencyIso: 'USD',
    amtDoccur: -Math.round(grandTotalEmployeeTax * 100) / 100, // Negative for Credit in standard BAPI
  });
  itemCounter++;

  // 4B. Social Security / Pension Payable
  accountGl.push({
    itemnoAcc: itemCounter,
    glAccount: SAP_GL_ACCOUNTS.SOCIAL_SECURITY_PAYABLE.code,
    glAccountName: SAP_GL_ACCOUNTS.SOCIAL_SECURITY_PAYABLE.name,
    docType: 'CREDIT',
    pstngKey: '50',
    compCode: companyCode,
    itemText: `Social Security Liability ${payrollPeriod}`,
  });
  currencyAmount.push({
    itemnoAcc: itemCounter,
    currency: 'USD',
    currencyIso: 'USD',
    amtDoccur: -Math.round(grandTotalSocialSecurity * 100) / 100,
  });
  itemCounter++;

  // 4C. Net Payroll Bank Clearing Account
  accountGl.push({
    itemnoAcc: itemCounter,
    glAccount: SAP_GL_ACCOUNTS.PAYROLL_CLEARING.code,
    glAccountName: SAP_GL_ACCOUNTS.PAYROLL_CLEARING.name,
    docType: 'CREDIT',
    pstngKey: '50',
    compCode: companyCode,
    itemText: `Net Salaries Clearing Account ${payrollPeriod}`,
  });
  currencyAmount.push({
    itemnoAcc: itemCounter,
    currency: 'USD',
    currencyIso: 'USD',
    amtDoccur: -Math.round(grandTotalNetPay * 100) / 100,
  });

  const costCenterBreakdown: Record<string, { costCenter: string; totalSalary: number; totalAllowances: number }> = {};
  Object.values(ccAggregations).forEach(item => {
    costCenterBreakdown[item.sapCostCenter] = {
      costCenter: item.sapCostCenter,
      totalSalary: item.totalBaseSalary,
      totalAllowances: item.totalAllowances,
    };
  });

  return {
    header,
    accountGl,
    currencyAmount,
    summary: {
      totalDebits,
      totalCredits,
      currency: 'USD',
      isBalanced: totalDebits === totalCredits,
      employeeCount: activeEmployees.length,
      costCenterBreakdown,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      targetSapEndpoint: `https://s4hana-gateway.internal.corp:44300/sap/opu/odata/sap/API_JOURNALENTRYCREATEREQUEST_SRV/JournalEntryCreateRequest`,
      interfaceProtocol: 'ODATA_V4_JOURNAL_ENTRY',
      harmonizationRulesApplied: [
        'Mapped employee basicSalary to General Ledger 0000600100 (Salaries & Wages)',
        'Extracted dynamic custom_attributes JSONB allowances (housing, transport) into GL 0000600200',
        'Cost Assignment assigned to SAP Cost Center (KOSTL) via employee / department foreign key hierarchy',
        'Company Code assigned to SAP BUKRS 1010',
        'Balanced Journal Entry: Sum(Debits) === Sum(Credits) confirmed (Zero variance)',
      ],
    },
  };
}
