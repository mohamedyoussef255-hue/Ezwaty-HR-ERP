/**
 * Phase 3: React.js Modular Frontend Component
 * Component Name: EmployeeProfileBuilder
 * 
 * Bilingual (Arabic & English) support with unified data entry for relational
 * PostgreSQL columns and tenant-specific JSONB custom attributes.
 */

import React, { useState, useEffect } from 'react';
import { 
  Department, 
  CostCenter, 
  CustomFieldDefinition, 
  Employee 
} from '../types/hr';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../services/apiClient';
import { 
  Building2, 
  Layers, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  FileCode2, 
  Sparkles, 
  Send, 
  Info,
  RefreshCw,
  Plus,
  Eye
} from 'lucide-react';

interface EmployeeProfileBuilderProps {
  tenantId?: string;
  isPreviewMode?: boolean;
  onEmployeeCreated?: (employee: Employee) => void;
  onOpenSchemaConfig?: () => void;
}

export const EmployeeProfileBuilder: React.FC<EmployeeProfileBuilderProps> = ({
  tenantId = 'tenant-acme-corp',
  isPreviewMode = false,
  onEmployeeCreated,
  onOpenSchemaConfig,
}) => {
  const { t, isRtl } = useLanguage();

  // Localized Department and Cost Center label helpers
  const getDepartmentLabel = (d: Department) => {
    if (!isRtl) return `${d.name} (${d.code})`;
    const arabicDeptMap: Record<string, string> = {
      'ENG': 'الهندسة والتقنية',
      'SALES': 'المبيعات والتسويق الدولي',
      'OPS': 'العمليات واللوجستيات',
      'FIN': 'المالية والمراقبة المالية',
    };
    return `${arabicDeptMap[d.code] || d.name} (${d.code})`;
  };

  const getCostCenterLabel = (cc: CostCenter) => {
    if (!isRtl) return `${cc.name} [KOSTL: ${cc.sapCostCenter}]`;
    const arabicCcMap: Record<string, string> = {
      '10101101': 'مركز هندسة البرمجيات الرئيسي',
      '10101201': 'عمليات المبيعات لمنطقة أوروبا والشرق الأوسط',
      '10101301': 'سلسلة الإمداد والخدمات اللوجستية',
      '10101401': 'المراقبة المالية المؤسسية',
    };
    return `${arabicCcMap[cc.sapCostCenter] || cc.name} [مركز التكلفة: ${cc.sapCostCenter}]`;
  };

  const getFieldLabel = (def: CustomFieldDefinition) => {
    if (!isRtl) return def.fieldLabel;
    const arabicFieldMap: Record<string, string> = {
      'housing_allowance': 'بدل السكن الشهري',
      'transport_allowance': 'بدل الانتقال والمواصلات',
      'medical_clearance_verified': 'الفحص والاعتماد الطبي المهني',
      'remote_work_tier': 'نمط وترتيب بيئة العمل',
      'sap_personnel_subarea': 'المنطقة الفرعية للموظفين في ساب (BTRTL)',
      'security_clearance': 'مستوى التصريح الأمني',
      'remote_eligible': 'مؤهل للعمل عن بُعد',
      'remote_work_stipend': 'بدل العمل عن بُعد الإضافي',
    };
    return arabicFieldMap[def.fieldKey] || def.fieldLabel;
  };

  const getFieldDescription = (def: CustomFieldDefinition) => {
    if (!isRtl) return def.description;
    const arabicDescMap: Record<string, string> = {
      'housing_allowance': 'بدل سكن شهري مخصص للمستأجر مرتبط برمز الأجر WT1020 في ساب',
      'transport_allowance': 'بدل انتقال ومواصلات يُدرج شهرياً في مسير الرواتب WT1030',
      'medical_clearance_verified': 'اعتماد الفحص الطبي المهني الإلزامي للامتثال لمتطلبات التأمين الطبي IT0028',
      'remote_work_tier': 'تحديد نمط العمل (حضوري أو هجين أو عن بعد) وتأثيره على الضرائب ومحل الإقامة IT0001',
      'sap_personnel_subarea': 'رمز المنطقة الفرعية المكون من 4 خانات لحساب الضرائب واللوائح الإقليمية',
      'security_clearance': 'مستوى الترخيص الأمني للوصول إلى بيانات المؤسسة الحساسة',
      'remote_eligible': 'إمكانية مباشرة مهام العمل عن بُعد',
      'remote_work_stipend': 'مخصص إضافي لتغطية نفقات وتجهيزات العمل من المنزل',
    };
    return arabicDescMap[def.fieldKey] || def.description;
  };

  const getOptionLabel = (fieldKey: string, opt: string) => {
    if (!isRtl) return opt;
    const arabicOptionMap: Record<string, string> = {
      'On-Site 100%': 'حضوري بالكامل 100% في مقر العمل',
      'Hybrid 3/2': 'هجين (3 أيام بالمقر / يومان عن بُعد)',
      'Hybrid 2/3': 'هجين (يومان بالمقر / 3 أيام عن بُعد)',
      'Full Remote': 'عمل عن بُعد بالكامل 100%',
      'Tier 1': 'المستوى الأول (Tier 1)',
      'Tier 2': 'المستوى الثاني (Tier 2)',
      'Tier 3': 'المستوى الثالث (Tier 3)',
      'Option 1': 'الخيار الأول',
      'Option 2': 'الخيار الثاني',
      'Option 3': 'الخيار الثالث',
      'Active': 'نشط ومفعل',
      'Inactive': 'غير نشط',
      'Level 1': 'المستوى 1',
      'Level 2': 'المستوى 2',
      'Level 3': 'المستوى 3',
    };
    return arabicOptionMap[opt] || opt;
  };

  const getInfotypeLabel = (infotype?: string) => {
    if (!infotype) return '';
    if (!isRtl) return infotype;
    const arabicInfotypeMap: Record<string, string> = {
      'IT0014': 'IT0014 - بدلات دورية',
      'IT0015': 'IT0015 - دفعات إضافية',
      'IT0028': 'IT0028 - فحص طبي',
      'IT0001': 'IT0001 - هيكل تنظيمي',
      'CUSTOM': 'خاص بالمستأجر',
    };
    return arabicInfotypeMap[infotype] || infotype;
  };

  // Master data & dynamic schema states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [dynamicFieldDefs, setDynamicFieldDefs] = useState<CustomFieldDefinition[]>([]);
  const [loadingSchema, setLoadingSchema] = useState<boolean>(true);

  // Static Relational Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    departmentId: '',
    costCenterId: '',
    basicSalary: '8500',
    currency: 'USD',
    hireDate: new Date().toISOString().split('T')[0],
    
    // SAP Integration & Harmonization Fields
    sapEmployeeId: '',
    sapCostCenter: '',
    sapCompanyCode: '1010',
    sapPersonnelArea: '1000',
  });

  // Dynamic Schema Form State (Mapped to PostgreSQL JSONB column: custom_attributes)
  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, any>>({});

  // UI state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false);
  const [lastHarmonizationReceipt, setLastHarmonizationReceipt] = useState<any>(null);

  // Load master data and tenant's dynamic JSONB schema
  const fetchMetadata = async () => {
    setLoadingSchema(true);
    setErrors([]);
    try {
      const [deptData, ccData, schemaData] = await Promise.all([
        apiClient.getDepartments(tenantId),
        apiClient.getCostCenters(tenantId),
        apiClient.getSchemaConfig(tenantId),
      ]);

      setDepartments(deptData);
      setCostCenters(ccData);
      setDynamicFieldDefs(schemaData);

      if (deptData.length > 0 && !formData.departmentId) {
        setFormData(prev => ({
          ...prev,
          departmentId: deptData[0].id,
          sapCostCenter: deptData[0].sapCostCenterRef || prev.sapCostCenter,
        }));
      }

      if (ccData.length > 0 && !formData.costCenterId) {
        setFormData(prev => ({
          ...prev,
          costCenterId: ccData[0].id,
          sapCostCenter: ccData[0].sapCostCenter,
        }));
      }

      const initialDynamic: Record<string, any> = {};
      schemaData.forEach((field: CustomFieldDefinition) => {
        if (field.defaultValue !== undefined) {
          initialDynamic[field.fieldKey] = field.defaultValue;
        } else if (field.fieldType === 'boolean') {
          initialDynamic[field.fieldKey] = false;
        } else if (field.fieldType === 'currency' || field.fieldType === 'number') {
          initialDynamic[field.fieldKey] = 0;
        } else {
          initialDynamic[field.fieldKey] = '';
        }
      });
      setDynamicAttributes(initialDynamic);
    } catch (err) {
      console.error('Failed to load schema configuration:', err);
      setErrors([isRtl ? 'تعذر الاتصال بخدمة الموارد البشرية الخلفية.' : 'Failed to communicate with HR backend service.']);
    } finally {
      setLoadingSchema(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, [tenantId]);

  const handleStaticChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // [SAP DATA HARMONIZATION]: KOSTL auto-derived from cost center
      if (field === 'costCenterId') {
        const foundCc = costCenters.find(c => c.id === value);
        if (foundCc) {
          updated.sapCostCenter = foundCc.sapCostCenter;
          updated.sapCompanyCode = foundCc.sapCompanyCode;
        }
      }
      return updated;
    });
  };

  const handleDynamicChange = (fieldKey: string, value: any, fieldType: string) => {
    let sanitizedValue = value;
    if (fieldType === 'number' || fieldType === 'currency') {
      sanitizedValue = value === '' ? 0 : Number(value);
    } else if (fieldType === 'boolean') {
      sanitizedValue = Boolean(value);
    }

    setDynamicAttributes(prev => ({
      ...prev,
      [fieldKey]: sanitizedValue,
    }));
  };

  const handleSuggestSapPernr = () => {
    const randomSeq = Math.floor(49280 + Math.random() * 500);
    const padded = randomSeq.toString().padStart(8, '0');
    setFormData(prev => ({ ...prev, sapEmployeeId: padded }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreviewMode) {
      return;
    }
    setErrors([]);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const payload = {
        tenantId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        departmentId: formData.departmentId,
        costCenterId: formData.costCenterId,
        basicSalary: Number(formData.basicSalary),
        currency: formData.currency,
        hireDate: formData.hireDate,

        sapEmployeeId: formData.sapEmployeeId || undefined,
        sapCostCenter: formData.sapCostCenter,
        sapCompanyCode: formData.sapCompanyCode,
        sapPersonnelArea: formData.sapPersonnelArea,

        customAttributes: dynamicAttributes,
      };

      const result = await apiClient.createEmployee(payload);

      if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }

      setSuccessMessage(`${t.profileBuilder.successMessage} ${result.data.sapEmployeeId}`);
      setLastHarmonizationReceipt(result.sapHarmonizationReceipt);

      if (onEmployeeCreated) {
        onEmployeeCreated(result.data);
      }

      setFormData(prev => ({
        ...prev,
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        sapEmployeeId: '',
      }));
    } catch (err: any) {
      setErrors([err.message || (isRtl ? 'حدث خطأ في الاتصال بالشبكة.' : 'Network error occurred.')]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSchema) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-lg">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
        <p className="text-sm text-slate-400">
          {isRtl ? 'جاري تحميل البيانات الأساسية ومخطط ساب...' : 'Loading master data...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>{t.profileBuilder.title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {t.profileBuilder.badgeSapReady}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.profileBuilder.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPreviewMode ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Eye className="w-3.5 h-3.5" />
              {t.previewMode.badgeReadOnly}
            </span>
          ) : (
            <>
              {onOpenSchemaConfig && (
                <button
                  type="button"
                  onClick={onOpenSchemaConfig}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  {t.profileBuilder.btnConfigureFields}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowJsonInspector(!showJsonInspector)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                  showJsonInspector
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                {showJsonInspector ? t.profileBuilder.btnHidePayload : t.profileBuilder.btnInspectPayload}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alert Notices */}
      {errors.length > 0 && (
        <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded text-rose-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            {t.profileBuilder.validationFailed}
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-5 text-rose-300/90">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          {lastHarmonizationReceipt && (
            <span className="font-mono text-emerald-300 text-[11px] bg-emerald-900/60 px-2 py-0.5 rounded dir-ltr">
              {isRtl 
                ? `PERNR: ${lastHarmonizationReceipt.pernr} · KOSTL: ${lastHarmonizationReceipt.kostl} · BUKRS: ${lastHarmonizationReceipt.bukrs}`
                : `PERNR: ${lastHarmonizationReceipt.pernr} · KOSTL: ${lastHarmonizationReceipt.kostl} · BUKRS: ${lastHarmonizationReceipt.bukrs}`}
            </span>
          )}
        </div>
      )}

      {/* Side-by-Side Payload Inspector */}
      {showJsonInspector && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-3 font-mono dir-ltr text-left">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t.profileBuilder.realtimeProjection}
            </span>
            <span className="text-[11px] text-slate-500 font-sans">
              {isRtl ? 'سجل علائقي PostgreSQL + كائن JSONB الديناميكي' : 'PostgreSQL JSONB + Relational Record'}
            </span>
          </div>
          
          <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-emerald-300 overflow-x-auto text-[11px] leading-relaxed max-h-56">
{JSON.stringify(
  {
    table: 'hr_employees',
    relational_columns: {
      tenant_id: tenantId,
      first_name: formData.firstName || '<pending>',
      last_name: formData.lastName || '<pending>',
      email: formData.email || '<pending>',
      role: formData.role || '<pending>',
      department_id: formData.departmentId,
      cost_center_id: formData.costCenterId,
      basic_salary: Number(formData.basicSalary),
      currency: formData.currency,
      hire_date: formData.hireDate,
      sap_employee_id: formData.sapEmployeeId || '<auto-generate PERNR>',
      sap_cost_center: formData.sapCostCenter,
      sap_company_code: formData.sapCompanyCode,
      sap_personnel_area: formData.sapPersonnelArea,
    },
    jsonb_column_custom_attributes: dynamicAttributes,
  },
  null,
  2
)}
          </pre>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: Core Relational HR Master Data */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/90 rounded-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">{t.profileBuilder.secRelationalTitle}</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{t.profileBuilder.secRelationalSub}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.firstName} {!isPreviewMode && <span className="text-rose-400">*</span>}
              </label>
              <input
                type="text"
                required
                readOnly={isPreviewMode}
                disabled={isPreviewMode}
                value={formData.firstName}
                onChange={e => handleStaticChange('firstName', e.target.value)}
                placeholder={isRtl ? "مثال: ليلى" : "e.g. Layla"}
                className={`w-full px-3 py-2 text-xs rounded transition-colors ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.lastName} {!isPreviewMode && <span className="text-rose-400">*</span>}
              </label>
              <input
                type="text"
                required
                readOnly={isPreviewMode}
                disabled={isPreviewMode}
                value={formData.lastName}
                onChange={e => handleStaticChange('lastName', e.target.value)}
                placeholder={isRtl ? "مثال: المنصور" : "e.g. Al-Mansoor"}
                className={`w-full px-3 py-2 text-xs rounded transition-colors ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.email} {!isPreviewMode && <span className="text-rose-400">*</span>}
              </label>
              <input
                type="email"
                required
                readOnly={isPreviewMode}
                disabled={isPreviewMode}
                value={formData.email}
                onChange={e => handleStaticChange('email', e.target.value)}
                placeholder="layla.almansoor@acme-corp.com"
                className={`w-full px-3 py-2 text-xs rounded transition-colors dir-ltr text-left ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.role} {!isPreviewMode && <span className="text-rose-400">*</span>}
              </label>
              <input
                type="text"
                required
                readOnly={isPreviewMode}
                disabled={isPreviewMode}
                value={formData.role}
                onChange={e => handleStaticChange('role', e.target.value)}
                placeholder={isRtl ? "مثال: مهندس أول أنظمة ERP" : "e.g. Senior ERP Systems Engineer"}
                className={`w-full px-3 py-2 text-xs rounded transition-colors ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.department} {!isPreviewMode && <span className="text-rose-400">*</span>}
              </label>
              <select
                required
                disabled={isPreviewMode}
                value={formData.departmentId}
                onChange={e => handleStaticChange('departmentId', e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded transition-colors ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed opacity-90'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500'
                }`}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {getDepartmentLabel(d)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.costCenter} {!isPreviewMode && <span className="text-rose-400">*</span>}
              </label>
              <select
                required
                disabled={isPreviewMode}
                value={formData.costCenterId}
                onChange={e => handleStaticChange('costCenterId', e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded transition-colors ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed opacity-90'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500'
                }`}
              >
                {costCenters.map(cc => (
                  <option key={cc.id} value={cc.id}>
                    {getCostCenterLabel(cc)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.basicSalary} {!isPreviewMode && <span className="text-rose-400">*</span>}
              </label>
              <div className="relative">
                <span className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2 text-slate-500 text-xs`}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  readOnly={isPreviewMode}
                  disabled={isPreviewMode}
                  value={formData.basicSalary}
                  onChange={e => handleStaticChange('basicSalary', e.target.value)}
                  className={`w-full ${isRtl ? 'pr-7 pl-3' : 'pl-7 pr-3'} py-2 text-xs rounded font-mono tabular-nums transition-colors dir-ltr text-left ${
                    isPreviewMode
                      ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                      : 'bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.hireDate} {!isPreviewMode && <span className="text-rose-400">*</span>}
              </label>
              <input
                type="date"
                required
                readOnly={isPreviewMode}
                disabled={isPreviewMode}
                value={formData.hireDate}
                onChange={e => handleStaticChange('hireDate', e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded transition-colors dir-ltr ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: SAP S/4HANA External References & Harmonization */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/90 rounded-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-200">{t.profileBuilder.secSapTitle}</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{t.profileBuilder.secSapSub}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  {t.profileBuilder.sapPernr}
                </label>
                {!isPreviewMode && (
                  <button
                    type="button"
                    onClick={handleSuggestSapPernr}
                    className="text-[10px] text-sky-400 hover:text-sky-300 underline"
                  >
                    {t.profileBuilder.generateId}
                  </button>
                )}
              </div>
              <input
                type="text"
                maxLength={8}
                readOnly={isPreviewMode}
                disabled={isPreviewMode}
                value={formData.sapEmployeeId}
                onChange={e => handleStaticChange('sapEmployeeId', e.target.value)}
                placeholder="00049285"
                className={`w-full px-3 py-2 text-xs rounded font-mono transition-colors dir-ltr text-left ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{t.profileBuilder.sapPernrHint}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.sapKostl}
              </label>
              <input
                type="text"
                maxLength={10}
                readOnly={isPreviewMode}
                disabled={isPreviewMode}
                value={formData.sapCostCenter}
                onChange={e => handleStaticChange('sapCostCenter', e.target.value)}
                placeholder="10101101"
                className={`w-full px-3 py-2 text-xs rounded font-mono transition-colors dir-ltr text-left ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{t.profileBuilder.sapKostlHint}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.sapBukrs}
              </label>
              <input
                type="text"
                maxLength={4}
                readOnly={isPreviewMode}
                disabled={isPreviewMode}
                value={formData.sapCompanyCode}
                onChange={e => handleStaticChange('sapCompanyCode', e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded font-mono transition-colors dir-ltr text-left ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{t.profileBuilder.sapBukrsHint}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.profileBuilder.sapWerks}
              </label>
              <input
                type="text"
                maxLength={4}
                readOnly={isPreviewMode}
                disabled={isPreviewMode}
                value={formData.sapPersonnelArea}
                onChange={e => handleStaticChange('sapPersonnelArea', e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded font-mono transition-colors dir-ltr text-left ${
                  isPreviewMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                    : 'bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{t.profileBuilder.sapWerksHint}</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Dynamic Multi-Tenant Attributes (PostgreSQL JSONB) */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/90 rounded-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                {t.profileBuilder.secDynamicTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span>{t.profileBuilder.secDynamicSub}</span>
              <span>·</span>
              <span className="text-amber-400/90">{dynamicFieldDefs.length} {t.profileBuilder.fieldsConfigured}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {dynamicFieldDefs.map(fieldDef => {
              const currentVal = dynamicAttributes[fieldDef.fieldKey];

              return (
                <div key={fieldDef.id} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-200 flex items-center gap-1">
                      <span>{getFieldLabel(fieldDef)}</span>
                      {fieldDef.isRequired && !isPreviewMode && <span className="text-rose-400">*</span>}
                    </label>
                    {fieldDef.sapInfotype && (
                      <span className="text-[10px] font-mono px-1 py-0.2 bg-slate-800 text-slate-400 rounded dir-ltr">
                        {getInfotypeLabel(fieldDef.sapInfotype)}
                      </span>
                    )}
                  </div>

                  {fieldDef.fieldType === 'currency' ? (
                    <div className="relative">
                      <span className={`absolute ${isRtl ? 'right-2.5' : 'left-2.5'} top-1.5 text-slate-500 text-xs`}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        readOnly={isPreviewMode}
                        disabled={isPreviewMode}
                        value={currentVal !== undefined ? currentVal : ''}
                        onChange={e => handleDynamicChange(fieldDef.fieldKey, e.target.value, fieldDef.fieldType)}
                        placeholder="0.00"
                        className={`w-full ${isRtl ? 'pr-6 pl-2.5' : 'pl-6 pr-2.5'} py-1.5 text-xs rounded font-mono tabular-nums transition-colors dir-ltr text-left ${
                          isPreviewMode
                            ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                            : 'bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400'
                        }`}
                      />
                    </div>
                  ) : fieldDef.fieldType === 'number' ? (
                    <input
                      type="number"
                      readOnly={isPreviewMode}
                      disabled={isPreviewMode}
                      value={currentVal !== undefined ? currentVal : ''}
                      onChange={e => handleDynamicChange(fieldDef.fieldKey, e.target.value, fieldDef.fieldType)}
                      className={`w-full px-2.5 py-1.5 text-xs rounded font-mono tabular-nums transition-colors dir-ltr text-left ${
                        isPreviewMode
                          ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                          : 'bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400'
                      }`}
                    />
                  ) : fieldDef.fieldType === 'boolean' ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        disabled={isPreviewMode}
                        id={`cb-${fieldDef.fieldKey}`}
                        checked={Boolean(currentVal)}
                        onChange={e => handleDynamicChange(fieldDef.fieldKey, e.target.checked, fieldDef.fieldType)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400 disabled:opacity-75 disabled:cursor-not-allowed"
                      />
                      <label htmlFor={`cb-${fieldDef.fieldKey}`} className="text-xs text-slate-400 cursor-pointer select-none">
                        {t.profileBuilder.verifiedApproved}
                      </label>
                    </div>
                  ) : fieldDef.fieldType === 'select' && fieldDef.options ? (
                    <select
                      disabled={isPreviewMode}
                      value={currentVal || ''}
                      onChange={e => handleDynamicChange(fieldDef.fieldKey, e.target.value, fieldDef.fieldType)}
                      className={`w-full px-2.5 py-1.5 text-xs rounded transition-colors ${
                        isPreviewMode
                          ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed opacity-90'
                          : 'bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400'
                      }`}
                    >
                      {fieldDef.options.map((opt, i) => (
                        <option key={i} value={opt}>
                          {getOptionLabel(fieldDef.fieldKey, opt)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      readOnly={isPreviewMode}
                      disabled={isPreviewMode}
                      value={currentVal || ''}
                      onChange={e => handleDynamicChange(fieldDef.fieldKey, e.target.value, fieldDef.fieldType)}
                      placeholder={getFieldLabel(fieldDef)}
                      className={`w-full px-2.5 py-1.5 text-xs rounded transition-colors ${
                        isPreviewMode
                          ? 'bg-slate-900 text-slate-300 border border-slate-800 cursor-not-allowed select-all'
                          : 'bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400'
                      }`}
                    />
                  )}

                  {fieldDef.description && (
                    <p className="text-[10px] text-slate-500 leading-tight">{getFieldDescription(fieldDef)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {isPreviewMode ? t.previewMode.bannerSub : t.profileBuilder.syncNote}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isPreviewMode ? (
              <div className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>{t.previewMode.badgeReadOnly}</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded shadow transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {t.profileBuilder.submittingBtn}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    {t.profileBuilder.submitBtn}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
