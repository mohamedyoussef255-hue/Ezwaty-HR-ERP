/**
 * Phase 2 Frontend Verification & Accounting Document Engine
 * Component Name: SapJournalEntryViewer
 * 
 * Bilingual (Arabic & English) support for monthly payroll aggregation into
 * SAP FI/CO General Ledger Journal Entry (BAPI_ACC_DOCUMENT_POST / S/4HANA OData format).
 */

import React, { useState, useEffect } from 'react';
import { SapJournalEntryPayload, SapSyncResponse } from '../types/hr';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../services/apiClient';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldCheck, 
  Play, 
  Terminal
} from 'lucide-react';

interface SapJournalEntryViewerProps {
  tenantId?: string;
  refreshTrigger?: number;
}

export const SapJournalEntryViewer: React.FC<SapJournalEntryViewerProps> = ({
  tenantId = 'tenant-acme-corp',
  refreshTrigger = 0,
}) => {
  const { t, isRtl } = useLanguage();
  const [payrollPeriod, setPayrollPeriod] = useState<string>('2026-09');
  const [companyCode, setCompanyCode] = useState<string>('1010');
  const [loading, setLoading] = useState<boolean>(true);
  const [journalData, setJournalData] = useState<SapJournalEntryPayload | null>(null);
  
  const [syncingWithSap, setSyncingWithSap] = useState<boolean>(false);
  const [sapSyncReceipt, setSapSyncReceipt] = useState<SapSyncResponse | null>(null);
  const [activeView, setActiveView] = useState<'table' | 'raw_odata' | 'cost_centers'>('table');
  const [copied, setCopied] = useState<boolean>(false);

  const fetchJournalEntry = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getSapPayrollJournal(tenantId, payrollPeriod, companyCode);
      setJournalData(data);
    } catch (err) {
      console.error('Failed to load SAP journal entry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalEntry();
  }, [tenantId, payrollPeriod, companyCode, refreshTrigger]);

  const handleSimulateSapPosting = async () => {
    setSyncingWithSap(true);
    setSapSyncReceipt(null);
    try {
      const data = await apiClient.simulateSapPosting(payrollPeriod, companyCode);
      setSapSyncReceipt(data);
    } catch (err) {
      console.error('Error posting to SAP:', err);
    } finally {
      setSyncingWithSap(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLocalizedGlName = (name: string) => {
    if (!isRtl) return name;
    const arabicMap: Record<string, string> = {
      'Base Salaries & Wages Expense': 'مصروف الرواتب والأجور الأساسية',
      'Employee Allowances & Benefits': 'مصروف البدلات والمزايا الوظيفية (سكن وانتقال)',
      'Income Tax Withholding Payable': 'مستحقات ضريبة كسب العمل / الاستقطاعات',
      'Social Security / GOSI Payable': 'مستحقات التأمينات الاجتماعية (GOSI)',
      'Payroll Bank Clearing Account': 'حساب وسيط بنكي لصافي الرواتب (Clearing)',
    };
    return arabicMap[name] || name;
  };

  const getLocalizedItemText = (text: string) => {
    if (!isRtl) return text;
    if (text.includes('Salaries')) return text.replace('Salaries', 'رواتب أساسية');
    if (text.includes('Dynamic Allowances')) return text.replace('Dynamic Allowances', 'بدلات إضافية');
    if (text.includes('Withholding Tax Payable')) return text.replace('Withholding Tax Payable', 'مستحقات الضريبة المستقطعة');
    if (text.includes('Social Security Liability')) return text.replace('Social Security Liability', 'التزامات التأمينات الاجتماعية');
    if (text.includes('Net Salaries Clearing Account')) return text.replace('Net Salaries Clearing Account', 'الحساب الوسيط لصافي الرواتب');
    return text;
  };

  const getLocalizedRule = (rule: string) => {
    if (!isRtl) return rule;
    if (rule.includes('40')) return 'ترحيل بنود المصروفات (الرواتب والبدلات) إلى حسابات الأستاذ 0000600100 و 0000600200 بمفتاح ترحيل 40 (مدين) مع ربط مركز التكلفة KOSTL.';
    if (rule.includes('50')) return 'ترحيل الاستقطاعات القانونية والوسيط البنكي إلى حسابات الالتزامات بمفتاح ترحيل 50 (دائن).';
    if (rule.includes('zero-variance')) return 'تحقيق التوازن المحاسبي التام بين المدين والدائن بانحراف صفري ($0.00) للتوافق مع ACDOCA.';
    return rule;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Execution Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>{t.journalViewer.title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {t.journalViewer.badgeApiFirst}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.journalViewer.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
            <span className="text-xs text-slate-400">{t.journalViewer.periodLabel}</span>
            <input
              type="month"
              value={payrollPeriod}
              onChange={e => setPayrollPeriod(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none dir-ltr"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
            <span className="text-xs text-slate-400">{t.journalViewer.companyLabel}</span>
            <input
              type="text"
              maxLength={4}
              value={companyCode}
              onChange={e => setCompanyCode(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-mono w-12 text-center focus:outline-none dir-ltr"
            />
          </div>

          <button
            type="button"
            onClick={fetchJournalEntry}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded border border-slate-700 transition-colors"
            title={t.journalViewer.recalculateTooltip}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleSimulateSapPosting}
            disabled={syncingWithSap || !journalData}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded shadow transition-colors disabled:opacity-50"
          >
            {syncingWithSap ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {t.journalViewer.btnPostingToSap}
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                {t.journalViewer.btnSimulateSync}
              </>
            )}
          </button>
        </div>
      </div>

      {/* SAP Sync Feedback Receipt Banner */}
      {sapSyncReceipt && (
        <div className="p-4 bg-sky-950/40 border border-sky-800/80 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-200 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{t.journalViewer.receiptTitle}</span>
            </div>
            <span className="text-xs font-mono text-sky-300 dir-ltr">
              {isRtl ? 'رقم المستند (BELNR): ' : 'BELNR: '}
              <strong className="text-emerald-400">{sapSyncReceipt.sapDocumentNumber}</strong>
              {isRtl ? ' / السنة المالية (GJAHR): ' : ' / GJAHR: '}
              {sapSyncReceipt.sapFiscalYear}
            </span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded border border-sky-900/60 font-mono text-[11px] text-slate-300 space-y-1 dir-ltr text-left">
            {sapSyncReceipt.bapiReturn.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className={`px-1 py-0.2 rounded text-[10px] ${item.type === 'S' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-sky-950 text-sky-400 border border-sky-800'}`}>
                  [{item.type === 'S' ? (isRtl ? 'نجاح S' : 'S') : (isRtl ? 'معلومات I' : 'I')}]
                </span>
                <span>{item.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      {journalData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded">
            <span className="text-[11px] text-slate-400 block mb-1">{t.journalViewer.kpiDebits}</span>
            <div className="text-base font-semibold text-emerald-400 font-mono tabular-nums flex items-center gap-1.5 dir-ltr">
              <ArrowUpRight className="w-4 h-4" />
              <span>${journalData.summary.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded">
            <span className="text-[11px] text-slate-400 block mb-1">{t.journalViewer.kpiCredits}</span>
            <div className="text-base font-semibold text-sky-400 font-mono tabular-nums flex items-center gap-1.5 dir-ltr">
              <ArrowDownLeft className="w-4 h-4" />
              <span>${journalData.summary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded">
            <span className="text-[11px] text-slate-400 block mb-1">{t.journalViewer.kpiBalance}</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.journalViewer.statusBalanced}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded">
            <span className="text-[11px] text-slate-400 block mb-1">{t.journalViewer.kpiEmployees}</span>
            <div className="text-base font-semibold text-slate-200 font-mono mt-0.5">
              {journalData.summary.employeeCount} {isRtl ? 'موظفين' : 'Employees'}
            </div>
          </div>
        </div>
      )}

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveView('table')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeView === 'table'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.journalViewer.tabGlMatrix}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('cost_centers')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeView === 'cost_centers'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.journalViewer.tabCostCenters}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('raw_odata')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeView === 'raw_odata'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.journalViewer.tabRawOdata}
          </button>
        </div>

        {journalData && (
          <button
            type="button"
            onClick={() => copyToClipboard(JSON.stringify(journalData, null, 2))}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t.journalViewer.btnCopied : t.journalViewer.btnCopyPayload}
          </button>
        )}
      </div>

      {/* Main Tab Views */}
      {loading ? (
        <div className="p-12 text-center bg-slate-900/40 rounded border border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto mb-2" />
          <span className="text-xs text-slate-400">{isRtl ? 'جاري تجميع وتجهيز قيود ساب المحاسبية...' : 'Loading...'}</span>
        </div>
      ) : journalData ? (
        <>
          {activeView === 'table' && (
            <div className="space-y-4">
              {/* SAP Document Header Data Bar */}
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded font-mono text-[11px] grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 dir-ltr text-left">
                <div>
                  <span className="text-slate-500 block">{isRtl ? 'تاريخ المستند (BLDAT):' : 'Doc Date (BLDAT):'}</span>
                  <span className="text-slate-200">{journalData.header.docDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isRtl ? 'تاريخ الترحيل (BUDAT):' : 'Posting Date (BUDAT):'}</span>
                  <span className="text-slate-200">{journalData.header.pstngDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isRtl ? 'الشركة (BUKRS):' : 'Company (BUKRS):'}</span>
                  <span className="text-emerald-400">{journalData.header.compCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isRtl ? 'نوع المستند (BLART):' : 'Doc Type (BLART):'}</span>
                  <span className="text-slate-200">{journalData.header.docType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isRtl ? 'المرجع (XBLNR):' : 'Reference (XBLNR):'}</span>
                  <span className="text-slate-200">{journalData.header.refDocNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isRtl ? 'العملية التجارية:' : 'Business Act:'}</span>
                  <span className="text-slate-200">{journalData.header.busAct}</span>
                </div>
              </div>

              {/* Table of Accounting Line Items */}
              <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                    <tr>
                      <th className="px-3 py-2.5 w-12 text-center">{t.journalViewer.colItem}</th>
                      <th className="px-3 py-2.5">{t.journalViewer.colGlAccount}</th>
                      <th className="px-3 py-2.5">{t.journalViewer.colLineDesc}</th>
                      <th className="px-3 py-2.5 text-center">{t.journalViewer.colPostingKey}</th>
                      <th className="px-3 py-2.5">{t.journalViewer.colCostCenter}</th>
                      <th className="px-3 py-2.5 text-right">{t.journalViewer.colDebit}</th>
                      <th className="px-3 py-2.5 text-right">{t.journalViewer.colCredit}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                    {journalData.accountGl.map((glItem, index) => {
                      const amountItem = journalData.currencyAmount.find(c => c.itemnoAcc === glItem.itemnoAcc);
                      const isDebit = glItem.docType === 'DEBIT';
                      const rawAmt = amountItem?.amtDoccur || 0;
                      const formattedAmt = Math.abs(rawAmt).toLocaleString('en-US', { minimumFractionDigits: 2 });

                      return (
                        <tr key={index} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-3 py-2.5 text-center text-slate-500">
                            {glItem.itemnoAcc}
                          </td>
                          <td className="px-3 py-2.5 text-slate-200">
                            <span className="font-semibold text-emerald-400 dir-ltr inline-block">{glItem.glAccount}</span>
                            <span className="block text-[10px] text-slate-400 font-sans">{getLocalizedGlName(glItem.glAccountName)}</span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-300 font-sans">
                            {getLocalizedItemText(glItem.itemText)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${isDebit ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-sky-950 text-sky-400 border border-sky-800'}`}>
                              {glItem.pstngKey} ({isDebit ? t.journalViewer.debitLabel : t.journalViewer.creditLabel})
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-300 dir-ltr text-left">
                            {glItem.costCenter ? (
                              <span className="text-amber-400 bg-amber-950/40 px-1 py-0.5 rounded border border-amber-900/40">
                                {glItem.costCenter}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right text-emerald-400 tabular-nums dir-ltr">
                            {isDebit ? `$${formattedAmt}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-right text-sky-400 tabular-nums dir-ltr">
                            {!isDebit ? `$${formattedAmt}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-900/90 font-mono text-xs border-t-2 border-slate-700">
                    <tr>
                      <td colSpan={5} className="px-3 py-2.5 text-right font-semibold text-slate-300">
                        {t.journalViewer.totalSum}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-emerald-400 tabular-nums dir-ltr">
                        ${journalData.summary.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-sky-400 tabular-nums dir-ltr">
                        ${journalData.summary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Data Harmonization Applied Rules Box */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded text-xs space-y-1">
                <span className="font-semibold text-slate-300 block mb-1">
                  {t.journalViewer.harmonizationRulesTitle}
                </span>
                <ul className="space-y-0.5 text-slate-400 text-[11px] list-disc list-inside">
                  {journalData.metadata.harmonizationRulesApplied.map((rule, idx) => (
                    <li key={idx}>{getLocalizedRule(rule)}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeView === 'cost_centers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(journalData.summary.costCenterBreakdown).map((cc, i) => (
                  <div key={i} className="p-4 bg-slate-900/80 border border-slate-800 rounded space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-mono text-xs font-semibold text-amber-400 dir-ltr">
                        {isRtl ? `مركز التكلفة (KOSTL): ${cc.costCenter}` : `KOSTL: ${cc.costCenter}`}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono dir-ltr">
                        {isRtl ? 'الشركة (BUKRS): 1010' : 'BUKRS: 1010'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>{t.journalViewer.baseSalaryExpense}</span>
                        <span className="font-mono text-slate-200 dir-ltr">
                          ${cc.totalSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{t.journalViewer.allowancesExpense}</span>
                        <span className="font-mono text-slate-200 dir-ltr">
                          ${cc.totalAllowances.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800 font-semibold text-slate-100">
                        <span>{t.journalViewer.ccAbsorption}</span>
                        <span className="font-mono text-emerald-400 dir-ltr">
                          ${(cc.totalSalary + cc.totalAllowances).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'raw_odata' && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 dir-ltr text-left">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Terminal className="w-3.5 h-3.5" />
                  {isRtl ? 'المسار الهدف: ' : 'Target: '}{journalData.metadata.targetSapEndpoint}
                </span>
                <span>{isRtl ? 'البروتوكول: ' : 'Protocol: '}{journalData.metadata.interfaceProtocol}</span>
              </div>
              <pre className="p-3 bg-slate-900 rounded border border-slate-800 text-sky-300 font-mono text-[11px] overflow-x-auto max-h-96">
                {JSON.stringify(journalData, null, 2)}
              </pre>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
