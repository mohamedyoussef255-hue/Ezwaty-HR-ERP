/**
 * Enterprise Architecture: SAP Data Harmonization Matrix
 * Component Name: SapMappingReference
 * 
 * Bilingual (Arabic & English) documentation of Best-of-Breed integration patterns.
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Network, 
  ArrowRightLeft 
} from 'lucide-react';

export const SapMappingReference: React.FC = () => {
  const { t, isRtl } = useLanguage();

  const mappingRules = isRtl
    ? [
        {
          sourceField: 'الرقم الوظيفي (تلقائي / مخصص)',
          pgTarget: 'hr_employees.sap_employee_id',
          sapTarget: 'PERNR (Personnel Number)',
          sapTable: 'PA0000 / PA0001 (Infotype 0000/0001)',
          harmonization: 'توحيد التنسيق في سلسلة رقمية مكونة من 8 خانات بأصفار بادئة (مثل: 00049281). وفرض قيد عدم التكرار لكل مستأجر.',
        },
        {
          sourceField: 'مركز التكلفة (cost_center_id)',
          pgTarget: 'hr_employees.sap_cost_center',
          sapTarget: 'KOSTL (Cost Center)',
          sapTable: 'CSKS / COBL',
          harmonization: 'اشتقاق هرمي: تخصيص الموظف -> سجل مركز التكلفة -> مرجع القسم. كود أبجدي رقمي حتى 10 خانات.',
        },
        {
          sourceField: 'الكيان القانوني / إعدادات المستأجر',
          pgTarget: 'hr_employees.sap_company_code',
          sapTarget: 'BUKRS (Company Code)',
          sapTable: 'T001',
          harmonization: 'كود إلزامي من 4 خانات يحدد الشركة المالية المسؤولة عن الترحيل في الأستاذ العام (مثل: 1010).',
        },
        {
          sourceField: 'الراتب الأساسي (basic_salary)',
          pgTarget: 'hr_employees.basic_salary',
          sapTarget: 'HKONT 0000600100 (Salaries Expense)',
          sapTable: 'BSEG / ACDOCA (Universal Journal)',
          harmonization: 'ترحيل إلى حساب أستاذ الرواتب والأجور 0000600100 بمفتاح ترحيل 40 (مدين) مع ربطه المباشر بمركز التكلفة KOSTL.',
        },
        {
          sourceField: 'بدلات JSONB (سكن، انتقال، عن بعد)',
          pgTarget: 'hr_employees.custom_attributes->allowances',
          sapTarget: 'HKONT 0000600200 (Allowances Expense) / IT0014',
          sapTable: 'BSEG / PA0014 (Recurring Payments)',
          harmonization: 'استخراج ديناميكي من حقل JSONB، وتجميع المبالغ حسب مركز التكلفة، ثم ترحيلها كمدين (مفتاح 40).',
        },
        {
          sourceField: 'الاستقطاعات الضريبية والتأمينات',
          pgTarget: 'Calculated in Payroll Aggregator',
          sapTarget: 'HKONT 0000210300 & 0000210400',
          sapTable: 'BSEG (Liabilities)',
          harmonization: 'ترحيل الاستقطاعات القانونية لحسابات الالتزامات المستحقة بمفتاح ترحيل 50 (دائن).',
        },
        {
          sourceField: 'صافي مستحقات الرواتب بالبنك',
          pgTarget: 'hr_payroll_runs.total_net',
          sapTarget: 'HKONT 0000110100 (Payroll Clearing)',
          sapTable: 'BSEG (Cash / Bank Clearing)',
          harmonization: 'توازن محاسبي صفري (Zero-Variance) يوازن إجمالي المدين مع إجمالي الاستقطاعات وصافي التحويلات.',
        },
      ]
    : [
        {
          sourceField: 'Employee ID (Auto / Custom)',
          pgTarget: 'hr_employees.sap_employee_id',
          sapTarget: 'PERNR (Personnel Number)',
          sapTable: 'PA0000 / PA0001 (Infotype 0000/0001)',
          harmonization: 'Normalized into standard 8-digit zero-padded numeric string (e.g. 00049281). Enforced as unique per tenant.',
        },
        {
          sourceField: 'Cost Center FK (cost_center_id)',
          pgTarget: 'hr_employees.sap_cost_center',
          sapTarget: 'KOSTL (Cost Center)',
          sapTable: 'CSKS / COBL',
          harmonization: 'Resolved via hierarchy: Employee Override -> Cost Center Record -> Department Reference. Max 10 alphanumeric characters.',
        },
        {
          sourceField: 'Legal Entity / Tenant Setup',
          pgTarget: 'hr_employees.sap_company_code',
          sapTarget: 'BUKRS (Company Code)',
          sapTable: 'T001',
          harmonization: 'Strict 4-character identifier representing the legal financial posting entity (e.g. 1010).',
        },
        {
          sourceField: 'Basic Salary (basic_salary)',
          pgTarget: 'hr_employees.basic_salary',
          sapTarget: 'HKONT 0000600100 (Salaries Expense)',
          sapTable: 'BSEG / ACDOCA (Universal Journal)',
          harmonization: 'Mapped to G/L Account 0000600100 with Posting Key 40 (Debit) and assigned directly to KOSTL.',
        },
        {
          sourceField: 'JSONB Housing/Transport Allowances',
          pgTarget: 'hr_employees.custom_attributes->allowances',
          sapTarget: 'HKONT 0000600200 (Allowances Expense) / IT0014',
          sapTable: 'BSEG / PA0014 (Recurring Payments)',
          harmonization: 'Extracted dynamically from JSONB, aggregated by Cost Center, and posted as Debits (Key 40).',
        },
        {
          sourceField: 'Tax Withholding & Social Security',
          pgTarget: 'Calculated in Payroll Aggregator',
          sapTarget: 'HKONT 0000210300 & 0000210400',
          sapTable: 'BSEG (Liabilities)',
          harmonization: 'Statutory deductions mapped to General Ledger liability accounts with Posting Key 50 (Credit).',
        },
        {
          sourceField: 'Net Payroll Payables',
          pgTarget: 'hr_payroll_runs.total_net',
          sapTarget: 'HKONT 0000110100 (Payroll Clearing)',
          sapTable: 'BSEG (Cash / Bank Clearing)',
          harmonization: 'Zero-variance balance offsetting total debits against statutory withholdings and net disbursements.',
        },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span>{t.matrix.title}</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {t.matrix.badgeBestOfBreed}
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {t.matrix.subtitle}
        </p>
      </div>

      {/* Integration Architectural Overview */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Network className="w-4 h-4 text-emerald-400" />
          <span>{t.matrix.topoTitle}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded space-y-1">
            <span className="font-semibold text-sky-300 font-mono text-[11px] block">{t.matrix.topoOdataTitle}</span>
            <p className="text-[11px] text-slate-400">
              {t.matrix.topoOdataDesc}
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded space-y-1">
            <span className="font-semibold text-amber-300 font-mono text-[11px] block">{t.matrix.topoBapiTitle}</span>
            <p className="text-[11px] text-slate-400">
              {t.matrix.topoBapiDesc}
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded space-y-1">
            <span className="font-semibold text-violet-300 font-mono text-[11px] block">{t.matrix.topoIdocTitle}</span>
            <p className="text-[11px] text-slate-400">
              {t.matrix.topoIdocDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Mapping Matrix Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-sky-400" />
            <span>{t.matrix.dictTitle}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">{t.matrix.dictBadge}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-medium text-[11px]">
              <tr>
                <th className="px-3.5 py-2.5">{t.matrix.colSourceConcept}</th>
                <th className="px-3.5 py-2.5 font-mono">{t.matrix.colPgColumn}</th>
                <th className="px-3.5 py-2.5 font-mono">{t.matrix.colSapField}</th>
                <th className="px-3.5 py-2.5 font-mono">{t.matrix.colSapTable}</th>
                <th className="px-3.5 py-2.5">{t.matrix.colHarmonizationLogic}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-[11px]">
              {mappingRules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-3.5 py-2.5 font-medium text-slate-200">
                    {rule.sourceField}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-emerald-400 dir-ltr text-left">
                    {rule.pgTarget}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-sky-400 font-semibold dir-ltr text-left">
                    {rule.sapTarget}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-slate-400 dir-ltr text-left">
                    {rule.sapTable}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-300">
                    {rule.harmonization}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
