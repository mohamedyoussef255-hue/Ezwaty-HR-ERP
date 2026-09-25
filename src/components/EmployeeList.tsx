/**
 * Employee Master Data Table
 * Component Name: EmployeeList
 * 
 * Bilingual (Arabic & English) support for displaying multi-tenant employee records.
 */

import React from 'react';
import { Employee } from '../types/hr';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  loading?: boolean;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  loading = false,
}) => {
  const { t, isRtl } = useLanguage();

  const getLocalizedRole = (role: string) => {
    if (!isRtl) return role;
    const arabicRoleMap: Record<string, string> = {
      'Principal Cloud Architect': 'مهندس معماري سحابي أول',
      'Principal Enterprise Architect': 'مهندس معماري أول للأنظمة المؤسسية',
      'Head of Commercial Accounts': 'مدير أول الحسابات التجارية الدولية',
      'VP of Global Supply Chain': 'نائب رئيس سلسلة الإمداد والخدمات اللوجستية',
      'Senior ERP Systems Engineer': 'مهندس أول أنظمة ERP المؤسسية',
      'Software Engineer': 'مهندس برمجيات',
      'Senior Software Engineer': 'مهندس برمجيات أول',
      'Financial Analyst': 'محلل مالي ومحاسبي',
      'Operations Manager': 'مدير العمليات التشغيلية',
    };
    return arabicRoleMap[role] || role;
  };

  const getLocalizedAttrKey = (key: string) => {
    if (!isRtl) return key;
    const arabicKeyMap: Record<string, string> = {
      'housing_allowance': 'بدل السكن',
      'transport_allowance': 'بدل الانتقال',
      'medical_clearance_verified': 'الفحص الطبي',
      'remote_work_tier': 'نمط العمل',
      'sap_personnel_subarea': 'المنطقة الفرعية',
      'security_clearance': 'التصريح الأمني',
      'remote_eligible': 'العمل عن بُعد',
      'remote_work_stipend': 'بدل العمل عن بُعد',
    };
    return arabicKeyMap[key] || key;
  };

  const getLocalizedAttrVal = (key: string, val: any) => {
    if (typeof val === 'boolean') {
      return val ? (isRtl ? 'مُعتمد (نعم)' : 'Yes') : (isRtl ? 'غير معتمد (لا)' : 'No');
    }
    if (typeof val === 'string') {
      if (!isRtl) return val;
      const valMap: Record<string, string> = {
        'On-Site 100%': 'حضوري 100% بالمقر',
        'Hybrid 3/2': 'هجين (3/2)',
        'Hybrid 2/3': 'هجين (2/3)',
        'Full Remote': 'عمل عن بُعد 100%',
        'Tier 1': 'المستوى 1',
        'Tier 2': 'المستوى 2',
        'Tier 3': 'المستوى 3',
      };
      return valMap[val] || val;
    }
    if (typeof val === 'number') {
      if (key.includes('allowance') || key.includes('salary') || key.includes('stipend')) {
        return `$${val.toLocaleString('en-US')}`;
      }
      return String(val);
    }
    return String(val);
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-400">
        {isRtl ? 'جاري تحميل سجلات الموظفين...' : 'Loading employee records...'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            {t.employeeList.title}
          </h3>
          <span className="text-xs text-slate-500 font-mono">({employees.length} {t.employeeList.recordsCount})</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-medium">
            <tr>
              <th className="px-3.5 py-2.5">{t.employeeList.colNameRole}</th>
              <th className="px-3.5 py-2.5 font-mono">{t.employeeList.colSapPernr}</th>
              <th className="px-3.5 py-2.5 font-mono">{t.employeeList.colSapKostl}</th>
              <th className="px-3.5 py-2.5 text-right">{t.employeeList.colBasicSalary}</th>
              <th className="px-3.5 py-2.5">{t.employeeList.colDynamicAttrs}</th>
              <th className="px-3.5 py-2.5 text-center">{t.employeeList.colSapSync}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-[11px]">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {t.employeeList.emptyText}
                </td>
              </tr>
            ) : (
              employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-3.5 py-2.5">
                    <span className="font-semibold text-slate-200 block text-xs">
                      {emp.firstName} {emp.lastName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {getLocalizedRole(emp.role)} · <span className="font-mono text-slate-500 dir-ltr inline-block">{emp.email}</span>
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-sky-400 font-semibold dir-ltr text-left">
                    {emp.sapEmployeeId || (isRtl ? 'قيد التعيين' : 'PENDING')}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-amber-400 dir-ltr text-left">
                    {emp.sapCostCenter || '10101101'}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-emerald-400 font-semibold tabular-nums dir-ltr">
                    ${Number(emp.basicSalary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3.5 py-2.5">
                    {emp.customAttributes && Object.keys(emp.customAttributes).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(emp.customAttributes).map(([key, val]) => (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            <span className="text-slate-400">{getLocalizedAttrKey(key)}:</span>
                            <span className="text-emerald-300 font-semibold dir-ltr">
                              {getLocalizedAttrVal(key, val)}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-600 font-mono text-[10px]">{isRtl ? 'لا يوجد' : 'None'}</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-center">
                    {emp.sapSyncStatus === 'SYNCED' ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/60">
                        <CheckCircle2 className="w-3 h-3" />
                        {t.employeeList.statusSynced}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-900/60">
                        <Clock className="w-3 h-3" />
                        {t.employeeList.statusPending}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
