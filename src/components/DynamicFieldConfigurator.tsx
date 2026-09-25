/**
 * Dynamic Custom Field Schema Configurator
 * Component Name: DynamicFieldConfigurator
 * 
 * Bilingual (Arabic & English) support for configuring tenant JSONB custom attributes.
 */

import React, { useState, useEffect } from 'react';
import { CustomFieldDefinition, FieldType } from '../types/hr';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../services/apiClient';
import { 
  Plus, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Sparkles 
} from 'lucide-react';

interface DynamicFieldConfiguratorProps {
  tenantId?: string;
  onSchemaUpdated?: () => void;
}

export const DynamicFieldConfigurator: React.FC<DynamicFieldConfiguratorProps> = ({
  tenantId = 'tenant-acme-corp',
  onSchemaUpdated,
}) => {
  const { t, isRtl } = useLanguage();
  const [fieldDefs, setFieldDefs] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New field state
  const [newKey, setNewKey] = useState<string>('');
  const [newLabel, setNewLabel] = useState<string>('');
  const [newType, setNewType] = useState<FieldType>('currency');
  const [newRequired, setNewRequired] = useState<boolean>(false);
  const [newSapInfotype, setNewSapInfotype] = useState<string>('IT0014');
  const [newOptions, setNewOptions] = useState<string>('Tier 1, Tier 2, Tier 3');
  const [newDescription, setNewDescription] = useState<string>('');

  const fetchFields = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getSchemaConfig(tenantId);
      setFieldDefs(data);
    } catch (err) {
      console.error('Failed to load fields:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [tenantId]);

  const handleLabelChange = (val: string) => {
    setNewLabel(val);
    if (!newKey) {
      setNewKey(val.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        tenantId,
        fieldKey: newKey,
        fieldLabel: newLabel,
        fieldType: newType,
        isRequired: newRequired,
        sapInfotype: newSapInfotype,
        options: newType === 'select' ? newOptions.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        description: newDescription,
      };

      const res = await apiClient.saveCustomField(payload);
      if (!res.success) {
        setError(res.error || (isRtl ? 'فشل حفظ الحقل الديناميكي.' : 'Failed to save dynamic field.'));
        return;
      }

      await fetchFields();
      if (onSchemaUpdated) onSchemaUpdated();

      setShowAddForm(false);
      setNewKey('');
      setNewLabel('');
      setNewDescription('');
    } catch (err: any) {
      setError(err.message || (isRtl ? 'خطأ في الاتصال بالخادم.' : 'Error communicating with server.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>{t.dynamicConfig.title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {t.dynamicConfig.badgeCatalog}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.dynamicConfig.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? t.dynamicConfig.btnCancel : t.dynamicConfig.btnAddField}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/50 border border-rose-800 rounded text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddField} className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {t.dynamicConfig.formTitle}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">{t.dynamicConfig.formStorage}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t.dynamicConfig.labelFieldLabel}</label>
              <input
                type="text"
                required
                value={newLabel}
                onChange={e => handleLabelChange(e.target.value)}
                placeholder={isRtl ? "مثال: بدل العمل عن بعد" : "e.g. Remote Work Stipend"}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t.dynamicConfig.labelJsonbKey}</label>
              <input
                type="text"
                required
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="remote_work_stipend"
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-amber-400 dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t.dynamicConfig.labelDataType}</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as FieldType)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value="currency">{t.dynamicConfig.typeCurrency}</option>
                <option value="number">{t.dynamicConfig.typeNumber}</option>
                <option value="text">{t.dynamicConfig.typeText}</option>
                <option value="boolean">{t.dynamicConfig.typeBoolean}</option>
                <option value="select">{t.dynamicConfig.typeSelect}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t.dynamicConfig.labelSapInfotype}</label>
              <select
                value={newSapInfotype}
                onChange={e => setNewSapInfotype(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="IT0014">{isRtl ? 'IT0014 - البدلات والمدفوعات الدورية في ساب' : 'IT0014 - Recurring Payments & Allowances'}</option>
                <option value="IT0015">{isRtl ? 'IT0015 - المكافآت والمدفوعات الإضافية لمرة واحدة' : 'IT0015 - Additional One-Off Payments'}</option>
                <option value="IT0028">{isRtl ? 'IT0028 - الفحص الطبي والخدمات الداخلية' : 'IT0028 - Internal Medical Services'}</option>
                <option value="IT0001">{isRtl ? 'IT0001 - الهيكل والتسكين التنظيمي' : 'IT0001 - Organizational Assignment'}</option>
                <option value="CUSTOM">{isRtl ? 'داخلي خاص بالمستأجر (بدون ربط ساب)' : 'Non-SAP / Tenant Internal'}</option>
              </select>
            </div>

            {newType === 'select' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.dynamicConfig.labelOptions}</label>
                <input
                  type="text"
                  value={newOptions}
                  onChange={e => setNewOptions(e.target.value)}
                  placeholder={isRtl ? "مثال: خيار 1, خيار 2, خيار 3" : "Option 1, Option 2, Option 3"}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">{t.dynamicConfig.labelDescription}</label>
              <input
                type="text"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder={isRtl ? "شرح سبب استخدام هذا الحقل وكيفية معالجته..." : "Explain the purpose of this field..."}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="req-checkbox"
                checked={newRequired}
                onChange={e => setNewRequired(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500"
              />
              <label htmlFor="req-checkbox" className="text-xs text-slate-300 cursor-pointer">
                {t.dynamicConfig.labelMandatory}
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {t.dynamicConfig.btnPublish}
            </button>
          </div>
        </form>
      )}

      {/* List of Configured Dynamic Attributes */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-medium">
            <tr>
              <th className="px-3 py-2.5">{t.dynamicConfig.colLabel}</th>
              <th className="px-3 py-2.5">{t.dynamicConfig.colKey}</th>
              <th className="px-3 py-2.5">{t.dynamicConfig.colType}</th>
              <th className="px-3 py-2.5">{t.dynamicConfig.colRequired}</th>
              <th className="px-3 py-2.5">{t.dynamicConfig.colSapTarget}</th>
              <th className="px-3 py-2.5">{t.dynamicConfig.colDesc}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {fieldDefs.map(def => {
              const localizedFieldLabel = isRtl
                ? ({
                    'housing_allowance': 'بدل السكن الشهري',
                    'transport_allowance': 'بدل الانتقال والمواصلات',
                    'medical_clearance_verified': 'الفحص والاعتماد الطبي المهني',
                    'remote_work_tier': 'نمط وترتيب بيئة العمل',
                    'sap_personnel_subarea': 'المنطقة الفرعية للموظفين في ساب (BTRTL)',
                    'security_clearance': 'مستوى التصريح الأمني',
                    'remote_eligible': 'مؤهل للعمل عن بُعد',
                    'remote_work_stipend': 'بدل العمل عن بُعد',
                  }[def.fieldKey] || def.fieldLabel)
                : def.fieldLabel;

              const localizedFieldType = isRtl
                ? (({
                    'currency': 'عملة ($)',
                    'number': 'رقم عددي',
                    'text': 'نص عادي',
                    'date': 'تاريخ',
                    'boolean': 'نعم / لا',
                    'select': 'قائمة منسدلة',
                  } as Record<string, string>)[def.fieldType] || def.fieldType)
                : def.fieldType;

              const localizedDescription = isRtl
                ? ({
                    'housing_allowance': 'بدل سكن شهري مخصص للمستأجر مرتبط برمز الأجر WT1020 في ساب',
                    'transport_allowance': 'بدل انتقال ومواصلات يُدرج شهرياً في مسير الرواتب WT1030',
                    'medical_clearance_verified': 'اعتماد الفحص الطبي المهني الإلزامي للامتثال لمتطلبات التأمين الطبي IT0028',
                    'remote_work_tier': 'تحديد نمط العمل (حضوري أو هجين أو عن بعد) وتأثيره على الضرائب ومحل الإقامة IT0001',
                    'sap_personnel_subarea': 'رمز المنطقة الفرعية المكون من 4 خانات لحساب الضرائب واللوائح الإقليمية',
                    'security_clearance': 'مستوى الترخيص الأمني للوصول إلى بيانات المؤسسة الحساسة',
                    'remote_eligible': 'إمكانية مباشرة مهام العمل عن بُعد',
                    'remote_work_stipend': 'مخصص إضافي لتغطية نفقات وتجهيزات العمل من المنزل',
                  }[def.fieldKey] || def.description)
                : def.description;

              const localizedInfotype = isRtl
                ? ({
                    'IT0014': 'IT0014 (بدلات دورية)',
                    'IT0015': 'IT0015 (دفعات إضافية)',
                    'IT0028': 'IT0028 (فحص طبي)',
                    'IT0001': 'IT0001 (هيكل تنظيمي)',
                    'CUSTOM': 'خاص بالمستأجر',
                  }[def.sapInfotype || ''] || def.sapInfotype)
                : def.sapInfotype;

              return (
                <tr key={def.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-slate-200">
                    {localizedFieldLabel}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-amber-400 dir-ltr text-left">
                    {def.fieldKey}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {localizedFieldType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {def.isRequired ? (
                      <span className="text-rose-400 font-medium">{t.profileBuilder.mandatoryField}</span>
                    ) : (
                      <span className="text-slate-500">{t.profileBuilder.optionalField}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-sky-400">
                    {localizedInfotype || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-400 text-[11px]">
                    {localizedDescription || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
