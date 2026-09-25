/**
 * Comprehensive English & Arabic Translations for Minhaj Cloud HR & SAP ERP
 */

export type Language = 'en' | 'ar';

export interface Translations {
  appName: string;
  appSubtitle: string;
  tenantLabel: string;
  companyCodeLabel: string;
  newEmployeeBtn: string;
  languageToggle: string;
  currentLang: string;
  
  previewMode: {
    bannerTitle: string;
    bannerSub: string;
    btnExit: string;
    badgeReadOnly: string;
    secretHint: string;
    clicksPrompt: string;
  };

  // Navigation tabs
  tabs: {
    builder: string;
    payroll: string;
    ddl: string;
    dynamicSchema: string;
    matrix: string;
    deployment: string;
  };

  // Profile Builder
  profileBuilder: {
    title: string;
    subtitle: string;
    badgeSapReady: string;
    btnConfigureFields: string;
    btnInspectPayload: string;
    btnHidePayload: string;
    secRelationalTitle: string;
    secRelationalSub: string;
    secSapTitle: string;
    secSapSub: string;
    secDynamicTitle: string;
    secDynamicSub: string;
    fieldsConfigured: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    costCenter: string;
    basicSalary: string;
    hireDate: string;
    sapPernr: string;
    sapPernrHint: string;
    sapKostl: string;
    sapKostlHint: string;
    sapBukrs: string;
    sapBukrsHint: string;
    sapWerks: string;
    sapWerksHint: string;
    generateId: string;
    verifiedApproved: string;
    mandatoryField: string;
    optionalField: string;
    submitBtn: string;
    submittingBtn: string;
    syncNote: string;
    validationFailed: string;
    successMessage: string;
    realtimeProjection: string;
  };

  // Employee Master List
  employeeList: {
    title: string;
    recordsCount: string;
    colNameRole: string;
    colSapPernr: string;
    colSapKostl: string;
    colBasicSalary: string;
    colDynamicAttrs: string;
    colSapSync: string;
    emptyText: string;
    statusSynced: string;
    statusPending: string;
  };

  // SAP Journal Entry Viewer
  journalViewer: {
    title: string;
    subtitle: string;
    badgeApiFirst: string;
    periodLabel: string;
    companyLabel: string;
    recalculateTooltip: string;
    btnSimulateSync: string;
    btnPostingToSap: string;
    kpiDebits: string;
    kpiCredits: string;
    kpiBalance: string;
    kpiEmployees: string;
    statusBalanced: string;
    tabGlMatrix: string;
    tabCostCenters: string;
    tabRawOdata: string;
    btnCopyPayload: string;
    btnCopied: string;
    docDate: string;
    postingDate: string;
    companyCode: string;
    docType: string;
    refDoc: string;
    businessAct: string;
    colItem: string;
    colGlAccount: string;
    colLineDesc: string;
    colPostingKey: string;
    colCostCenter: string;
    colDebit: string;
    colCredit: string;
    totalSum: string;
    debitLabel: string;
    creditLabel: string;
    harmonizationRulesTitle: string;
    receiptTitle: string;
    ccAbsorption: string;
    baseSalaryExpense: string;
    allowancesExpense: string;
  };

  // DDL Viewer
  ddlViewer: {
    title: string;
    subtitle: string;
    badgeDeliverable: string;
    btnCopyDdl: string;
    btnCopiedSql: string;
    btnDownloadSql: string;
    cardRelationalTitle: string;
    cardRelationalDesc: string;
    cardJsonbTitle: string;
    cardJsonbDesc: string;
    cardSapTitle: string;
    cardSapDesc: string;
    cardRlsTitle: string;
    cardRlsDesc: string;
    editorHeader: string;
    editorStats: string;
  };

  // Dynamic Schema Configurator
  dynamicConfig: {
    title: string;
    subtitle: string;
    badgeCatalog: string;
    btnAddField: string;
    btnCancel: string;
    formTitle: string;
    formStorage: string;
    labelFieldLabel: string;
    labelJsonbKey: string;
    labelDataType: string;
    labelSapInfotype: string;
    labelOptions: string;
    labelDescription: string;
    labelMandatory: string;
    btnPublish: string;
    colLabel: string;
    colKey: string;
    colType: string;
    colRequired: string;
    colSapTarget: string;
    colDesc: string;
    typeCurrency: string;
    typeNumber: string;
    typeText: string;
    typeBoolean: string;
    typeSelect: string;
  };

  // SAP Harmonization Matrix
  matrix: {
    title: string;
    subtitle: string;
    badgeBestOfBreed: string;
    topoTitle: string;
    topoOdataTitle: string;
    topoOdataDesc: string;
    topoBapiTitle: string;
    topoBapiDesc: string;
    topoIdocTitle: string;
    topoIdocDesc: string;
    dictTitle: string;
    dictBadge: string;
    colSourceConcept: string;
    colPgColumn: string;
    colSapField: string;
    colSapTable: string;
    colHarmonizationLogic: string;
  };

  // Footer
  footer: {
    erpArch: string;
    sapSuite: string;
    pgJsonb: string;
    activeGateway: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'Ezwaty HR & SAP Cloud ERP',
    appSubtitle: 'Enterprise Multi-Tenant HR Module with Dynamic JSONB Schema and SAP S/4HANA FI/CO Integration',
    tenantLabel: 'Tenant',
    companyCodeLabel: 'BUKRS',
    newEmployeeBtn: 'New Employee',
    languageToggle: 'العربية',
    currentLang: 'English',
    previewMode: {
      bannerTitle: 'Preview Mode Active — Read Only',
      bannerSub: 'Administrative controls, JSONB schema builders, and submission buttons are disabled.',
      btnExit: 'Exit Preview Mode',
      badgeReadOnly: 'Client View (Read Only)',
      secretHint: 'Secret Easter Egg: Click logo 5 times to toggle Client Preview Mode',
      clicksPrompt: 'clicks to toggle preview',
    },
    tabs: {
      builder: 'Employee Profile Builder',
      payroll: 'SAP FI/CO Payroll Exporter',
      ddl: 'PostgreSQL DDL Architecture',
      dynamicSchema: 'Dynamic Schema (JSONB)',
      matrix: 'Harmonization Matrix',
      deployment: 'Hybrid Deployment & Docker',
    },
    profileBuilder: {
      title: 'Employee Profile Builder',
      subtitle: 'Unified data entry engine unifying relational PostgreSQL columns with tenant-specific JSONB custom attributes.',
      badgeSapReady: 'SAP S/4HANA Ready',
      btnConfigureFields: 'Configure Custom Fields',
      btnInspectPayload: 'Inspect JSON & SAP Spec',
      btnHidePayload: 'Hide Payload Spec',
      secRelationalTitle: '1. Core Master Data (Relational Columns)',
      secRelationalSub: 'Table: hr_employees',
      secSapTitle: '2. SAP S/4HANA Harmonization & Master Mapping',
      secSapSub: 'ECC & S/4HANA External IDs',
      secDynamicTitle: '3. Dynamic Tenant Attributes (PostgreSQL JSONB Column)',
      secDynamicSub: 'custom_attributes',
      fieldsConfigured: 'Fields Configured',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Corporate Email',
      role: 'Organizational Role',
      department: 'Department',
      costCenter: 'Cost Center Assignment',
      basicSalary: 'Basic Monthly Salary (Gross)',
      hireDate: 'Hire Date',
      sapPernr: 'SAP Personnel Number (PERNR)',
      sapPernrHint: '8-digit SAP HR Identifier',
      sapKostl: 'SAP Cost Center (KOSTL)',
      sapKostlHint: 'Maps to SAP Controlling (CO)',
      sapBukrs: 'SAP Company Code (BUKRS)',
      sapBukrsHint: 'FI General Ledger Company',
      sapWerks: 'SAP Personnel Area (WERKS)',
      sapWerksHint: 'Enterprise Structure Unit',
      generateId: 'Generate ID',
      verifiedApproved: 'Verified & Approved',
      mandatoryField: 'Required',
      optionalField: 'Optional',
      submitBtn: 'Save & Harmonize Employee Profile',
      submittingBtn: 'Harmonizing with SAP...',
      syncNote: 'Harmonized data is queued for SAP FI/CO payroll aggregation.',
      validationFailed: 'Validation Invariants Failed:',
      successMessage: 'Employee created successfully! Harmonized with SAP PERNR:',
      realtimeProjection: 'Real-time In-Flight Payload & PostgreSQL Projection',
    },
    employeeList: {
      title: 'Active Employee Master Data',
      recordsCount: 'records',
      colNameRole: 'Employee Name & Role',
      colSapPernr: 'SAP PERNR',
      colSapKostl: 'SAP KOSTL',
      colBasicSalary: 'Basic Salary',
      colDynamicAttrs: 'Dynamic Attributes (JSONB)',
      colSapSync: 'SAP Sync',
      emptyText: 'No employee records found. Create your first profile above.',
      statusSynced: 'SYNCED',
      statusPending: 'PENDING',
    },
    journalViewer: {
      title: 'SAP FI/CO Accounting Journal Exporter',
      subtitle: 'Aggregates monthly salaries & dynamic JSONB allowances into balanced General Ledger postings (Debits & Credits mapped to SAP Cost Centers).',
      badgeApiFirst: 'API-First Aggregation',
      periodLabel: 'Period:',
      companyLabel: 'Company (BUKRS):',
      recalculateTooltip: 'Recalculate Journal',
      btnSimulateSync: 'Simulate SAP S/4HANA Sync',
      btnPostingToSap: 'Posting to SAP S/4HANA...',
      kpiDebits: 'Total Debits (Gross Expenses)',
      kpiCredits: 'Total Credits (Liabilities & Net)',
      kpiBalance: 'Financial Balance Status',
      kpiEmployees: 'Active Payroll Population',
      statusBalanced: 'Balanced (Variance: $0.00)',
      tabGlMatrix: 'General Ledger Matrix',
      tabCostCenters: 'SAP Cost Center Allocation',
      tabRawOdata: 'Raw SAP OData / BAPI Payload',
      btnCopyPayload: 'Copy Payload',
      btnCopied: 'Copied',
      docDate: 'Doc Date (BLDAT)',
      postingDate: 'Posting Date (BUDAT)',
      companyCode: 'Company (BUKRS)',
      docType: 'Doc Type (BLART)',
      refDoc: 'Reference (XBLNR)',
      businessAct: 'Business Act',
      colItem: 'Item',
      colGlAccount: 'G/L Account (HKONT)',
      colLineDesc: 'Line Description',
      colPostingKey: 'Key (PstngKey)',
      colCostCenter: 'Cost Center (KOSTL)',
      colDebit: 'Debit (USD)',
      colCredit: 'Credit (USD)',
      totalSum: 'Total Sum:',
      debitLabel: 'Debit',
      creditLabel: 'Credit',
      harmonizationRulesTitle: 'Data Harmonization Rules Applied During Payroll Aggregation:',
      receiptTitle: 'SAP Accounting Document Created (BAPI_ACC_DOCUMENT_POST)',
      ccAbsorption: 'Total Cost Center Absorption:',
      baseSalaryExpense: 'Base Salaries Expense:',
      allowancesExpense: 'Dynamic Allowances (Housing + Commute):',
    },
    ddlViewer: {
      title: 'PostgreSQL Database Architecture',
      subtitle: 'Production-grade PostgreSQL schema featuring standard relational tables, JSONB dynamic attributes, GIN indexing, and SAP ERP mapping keys.',
      badgeDeliverable: 'Phase 1 Deliverable',
      btnCopyDdl: 'Copy DDL',
      btnCopiedSql: 'Copied SQL',
      btnDownloadSql: 'Download .sql',
      cardRelationalTitle: 'Relational Entities',
      cardRelationalDesc: 'Strict relational tables for hr_employees, hr_departments, hr_cost_centers, and hr_payroll_runs.',
      cardJsonbTitle: 'Dynamic JSONB + GIN',
      cardJsonbDesc: 'Tenant custom fields stored in custom_attributes JSONB with GIN indexing for high-performance elasticity.',
      cardSapTitle: 'SAP Harmonization',
      cardSapDesc: 'Standard SAP fields: sap_employee_id (PERNR), sap_cost_center (KOSTL), and sap_company_code (BUKRS).',
      cardRlsTitle: 'Multi-Tenant RLS',
      cardRlsDesc: 'Row-Level Security (RLS) policies isolating tenant data across shared tables via tenant_id.',
      editorHeader: 'ezwaty_hr_schema.sql (PostgreSQL 14+)',
      editorStats: '6 Tables · 8 Indexes · 2 RLS Policies',
    },
    dynamicConfig: {
      title: 'Dynamic Schema Manager',
      subtitle: 'Configure tenant-specific custom attributes. Changes immediately take effect in the EmployeeProfileBuilder without modifying PostgreSQL DDL.',
      badgeCatalog: 'Tenant JSONB Catalog',
      btnAddField: 'Add Custom Field',
      btnCancel: 'Cancel Field Setup',
      formTitle: 'Define New Dynamic JSONB Attribute',
      formStorage: 'Stored in hr_employees.custom_attributes',
      labelFieldLabel: 'Field Display Label',
      labelJsonbKey: 'JSONB Key (Snake Case)',
      labelDataType: 'Data Type',
      labelSapInfotype: 'SAP Infotype Target',
      labelOptions: 'Select Options (Comma-separated)',
      labelDescription: 'Business Description',
      labelMandatory: 'Mandatory Field (Required)',
      btnPublish: 'Publish Dynamic Attribute',
      colLabel: 'Field Label',
      colKey: 'JSONB Key',
      colType: 'Type',
      colRequired: 'Required',
      colSapTarget: 'SAP Target',
      colDesc: 'Description',
      typeCurrency: 'Currency ($ - for Allowances)',
      typeNumber: 'Number',
      typeText: 'Text String',
      typeBoolean: 'Boolean (Checkbox)',
      typeSelect: 'Dropdown Select',
    },
    matrix: {
      title: 'SAP S/4HANA Data Harmonization Matrix',
      subtitle: 'Bidirectional data mapping and transformation dictionary connecting Cloud HR PostgreSQL with SAP FI/CO & SuccessFactors.',
      badgeBestOfBreed: 'Best-of-Breed Architecture',
      topoTitle: 'Synchronous & Asynchronous Integration Topologies',
      topoOdataTitle: '1. S/4HANA Cloud OData V4',
      topoOdataDesc: 'Synchronous REST/OData service calling JournalEntryCreateRequest for instant General Ledger posting.',
      topoBapiTitle: '2. On-Premise SAP BAPI / RFC',
      topoBapiDesc: 'Direct connection via SAP Cloud Connector invoking BAPI_ACC_DOCUMENT_POST with atomic commit rollback.',
      topoIdocTitle: '3. Asynchronous IDoc Queue',
      topoIdocDesc: 'High-volume batch payroll synchronization using ACC_DOCUMENT03 message types for reliable offline buffering.',
      dictTitle: 'Harmonization Dictionary: Cloud HR & PostgreSQL ↔ SAP ERP',
      dictBadge: 'Universal Journal (ACDOCA) Compliant',
      colSourceConcept: 'Source HR Concept',
      colPgColumn: 'PostgreSQL Column',
      colSapField: 'SAP S/4HANA Field',
      colSapTable: 'SAP Entity / Table',
      colHarmonizationLogic: 'Data Harmonization Logic',
    },
    footer: {
      erpArch: 'Ezwaty Cloud ERP Architecture',
      sapSuite: 'SAP S/4HANA & ECC Integration Suite',
      pgJsonb: 'PostgreSQL JSONB Multi-Tenancy',
      activeGateway: 'Active Node.js Express Gateway',
    },
  },
  ar: {
    appName: 'نظام عزوتي للموارد البشرية والربط مع ساب (SAP)',
    appSubtitle: 'وحدة الموارد البشرية السحابية متعددة المستأجرين مع مخطط JSONB ديناميكي والتكامل مع SAP S/4HANA FI/CO',
    tenantLabel: 'المستأجر',
    companyCodeLabel: 'كود الشركة (BUKRS)',
    newEmployeeBtn: 'موظف جديد',
    languageToggle: 'English',
    currentLang: 'العربية',
    previewMode: {
      bannerTitle: 'وضع معاينة العميل نشط — للقراءة فقط',
      bannerSub: 'تم إخفاء أدوات الإدارة، ومحرر حقول JSONB، وأزرار الحفظ لحماية البيانات من أي تعديل أثناء المعاينة.',
      btnExit: 'الخروج من وضع المعاينة',
      badgeReadOnly: 'معاينة العميل (للقراءة فقط)',
      secretHint: 'ميزة خفية: انقر على الشعار 5 مرات متتالية لتبديل وضع معاينة العميل',
      clicksPrompt: 'نقرات متبقية لتفعيل المعاينة',
    },
    tabs: {
      builder: 'منشئ ملف الموظف',
      payroll: 'مُصدّر قيود الرواتب (SAP FI/CO)',
      ddl: 'معمارية قاعدة البيانات (DDL)',
      dynamicSchema: 'المخطط الديناميكي (JSONB)',
      matrix: 'مصفوفة المواءمة مع ساب',
      deployment: 'الاستضافة الهجينة وحاويات دوكر (Docker)',
    },
    profileBuilder: {
      title: 'منشئ ملف الموظف الموحد',
      subtitle: 'محرك إدخال موحد يجمع بين الحقول العلائقية الثابتة في PostgreSQL وحقول JSONB المخصصة والديناميكية لكل مستأجر مع مواءمة ساب الفورية.',
      badgeSapReady: 'جاهز للربط مع SAP S/4HANA',
      btnConfigureFields: 'تهيئة الحقول الديناميكية',
      btnInspectPayload: 'معاينة هيكل JSON و SAP',
      btnHidePayload: 'إخفاء المعاينة',
      secRelationalTitle: '1. البيانات الأساسية (الأعمدة العلائقية Relational Columns)',
      secRelationalSub: 'جدول: hr_employees',
      secSapTitle: '2. مواءمة بيانات ساب والربط الخارجي (SAP Harmonization)',
      secSapSub: 'معرفات ECC و S/4HANA الخارجية',
      secDynamicTitle: '3. السمات الديناميكية للمستأجر (عمود PostgreSQL JSONB)',
      secDynamicSub: 'custom_attributes',
      fieldsConfigured: 'حقول مهيأة',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      email: 'البريد الإلكتروني المؤسسي',
      role: 'المسمى الوظيفي',
      department: 'القسم / الإدارة',
      costCenter: 'مركز التكلفة المخصص',
      basicSalary: 'الراتب الأساسي الشهري (إجمالي)',
      hireDate: 'تاريخ التعيين',
      sapPernr: 'الرقم الوظيفي في ساب (PERNR)',
      sapPernrHint: 'معرف HR المكون من 8 خانات رقمية في ساب',
      sapKostl: 'مركز التكلفة في ساب (KOSTL)',
      sapKostlHint: 'يرتبط مباشرة بمحاسبة التكاليف Controlling (CO)',
      sapBukrs: 'كود الشركة في ساب (BUKRS)',
      sapBukrsHint: 'كود الكيان المالي والمحاسبي في FI',
      sapWerks: 'منطقة الموظفين في ساب (WERKS)',
      sapWerksHint: 'وحدة الهيكل المؤسسي Enterprise Structure',
      generateId: 'توليد تلقائي',
      verifiedApproved: 'تم التحقق والاعتماد',
      mandatoryField: 'إلزامي',
      optionalField: 'اختياري',
      submitBtn: 'حفظ ومواءمة ملف الموظف مع ساب',
      submittingBtn: 'جاري الحفظ والمواءمة مع ساب...',
      syncNote: 'البيانات المواءمة جاهزة للإدراج في دورة الرواتب وتصدير قيود ساب.',
      validationFailed: 'فشل التحقق من قيود الإدخال:',
      successMessage: 'تم إنشاء ملف الموظف بنجاح! تم تعيين الرقم الوظيفي في ساب (PERNR):',
      realtimeProjection: 'المعاينة الفورية لكائن JSON وحقل PostgreSQL المُسجّل',
    },
    employeeList: {
      title: 'سجل الموظفين النشطين',
      recordsCount: 'سجلات',
      colNameRole: 'اسم الموظف والدور',
      colSapPernr: 'رقم ساب (PERNR)',
      colSapKostl: 'مركز التكلفة (KOSTL)',
      colBasicSalary: 'الراتب الأساسي',
      colDynamicAttrs: 'السمات الديناميكية (JSONB)',
      colSapSync: 'حالة الربط مع ساب',
      emptyText: 'لا توجد سجلات للموظفين حالياً. أضف موظفك الأول أعلاه.',
      statusSynced: 'مُتزامن (SYNCED)',
      statusPending: 'في الانتظار (PENDING)',
    },
    journalViewer: {
      title: 'مُصدّر قيود الرواتب المحاسبية إلى ساب (SAP FI/CO Journal Exporter)',
      subtitle: 'تجميع رواتب الشهر والبدلات الديناميكية في قيود محاسبية متوازنة (مدين ودائن موزعة على مراكز التكلفة في ساب).',
      badgeApiFirst: 'تجميع فوري API-First',
      periodLabel: 'فترة الرواتب:',
      companyLabel: 'كود الشركة (BUKRS):',
      recalculateTooltip: 'إعادة احتساب القيد المحاسبي',
      btnSimulateSync: 'محاكاة الترحيل إلى SAP S/4HANA',
      btnPostingToSap: 'جاري الترحيل إلى ساب...',
      kpiDebits: 'إجمالي الجانب المدين (المصروفات)',
      kpiCredits: 'إجمالي الجانب الدائن (الالتزامات وصافي الرواتب)',
      kpiBalance: 'حالة التوازن المحاسبي',
      kpiEmployees: 'عدد الموظفين المشمولين',
      statusBalanced: 'متوازن تماماً (الفرق: $0.00)',
      tabGlMatrix: 'مصفوفة دفتر الأستاذ العام (General Ledger)',
      tabCostCenters: 'توزيع مراكز التكلفة في ساب',
      tabRawOdata: 'حمولة SAP OData / BAPI الأصلية',
      btnCopyPayload: 'نسخ الحمولة (Payload)',
      btnCopied: 'تم النسخ',
      docDate: 'تاريخ المستند (BLDAT)',
      postingDate: 'تاريخ الترحيل (BUDAT)',
      companyCode: 'الشركة (BUKRS)',
      docType: 'نوع المستند (BLART)',
      refDoc: 'الرقم المرجعي (XBLNR)',
      businessAct: 'العملية المحاسبية',
      colItem: 'البند',
      colGlAccount: 'حساب الأستاذ (HKONT)',
      colLineDesc: 'بيان البند المحاسبي',
      colPostingKey: 'مفتاح الترحيل (PstngKey)',
      colCostCenter: 'مركز التكلفة (KOSTL)',
      colDebit: 'مدين ($)',
      colCredit: 'دائن ($)',
      totalSum: 'الإجمالي العام:',
      debitLabel: 'مدين',
      creditLabel: 'دائن',
      harmonizationRulesTitle: 'قواعد مواءمة البيانات المطبقة أثناء تجميع الرواتب:',
      receiptTitle: 'تم إنشاء المستند المحاسبي في ساب بنجاح (BAPI_ACC_DOCUMENT_POST)',
      ccAbsorption: 'إجمالي تحميل مركز التكلفة:',
      baseSalaryExpense: 'مصروف الرواتب الأساسية:',
      allowancesExpense: 'البدلات الديناميكية (سكن + انتقال):',
    },
    ddlViewer: {
      title: 'معمارية قاعدة البيانات (PostgreSQL DDL)',
      subtitle: 'مخطط DDL شامل وعالي الأداء يدعم الجداول العلائقية، أعمدة JSONB الديناميكية، فهارس GIN، ومفاتيح مواءمة ساب.',
      badgeDeliverable: 'مخرجات المرحلة الأولى',
      btnCopyDdl: 'نسخ كود DDL',
      btnCopiedSql: 'تم نسخ SQL',
      btnDownloadSql: 'تحميل ملف .sql',
      cardRelationalTitle: 'الكيانات العلائقية',
      cardRelationalDesc: 'جداول صارمة ومترابطة لـ hr_employees و hr_departments و hr_cost_centers و hr_payroll_runs.',
      cardJsonbTitle: 'JSONB ديناميكي + فهرس GIN',
      cardJsonbDesc: 'حفظ الحقول المخصصة لكل مستأجر في custom_attributes JSONB مع فهرسة GIN فائقة السرعة.',
      cardSapTitle: 'مواءمة بيانات ساب',
      cardSapDesc: 'حقول ساب القياسية: sap_employee_id (PERNR) و sap_cost_center (KOSTL) و sap_company_code (BUKRS).',
      cardRlsTitle: 'عزل المستأجرين (RLS)',
      cardRlsDesc: 'سياسات أمان على مستوى الصفوف (Row-Level Security) لعزل بيانات المستأجرين عبر tenant_id.',
      editorHeader: 'ezwaty_hr_schema.sql (PostgreSQL 14+)',
      editorStats: '6 جداول · 8 فهارس · 2 سياسة أمان RLS',
    },
    dynamicConfig: {
      title: 'إدارة المخطط الديناميكي للمستأجر',
      subtitle: 'تخصيص الحقول الإضافية لكل مستأجر. تنعكس التغييرات فوراً في استمارة الموظف دون الحاجة لأي تعديل في بنية جداول قاعدة البيانات.',
      badgeCatalog: 'دليل حقول JSONB للمستأجر',
      btnAddField: 'إضافة حقل مخصص جديد',
      btnCancel: 'إلغاء الإضافة',
      formTitle: 'تعريف سمة ديناميكية جديدة في JSONB',
      formStorage: 'تُحفظ داخل hr_employees.custom_attributes',
      labelFieldLabel: 'اسم الحقل المعروض',
      labelJsonbKey: 'مفتاح الحقل في JSONB (snake_case)',
      labelDataType: 'نوع البيانات',
      labelSapInfotype: 'نوع معلومات ساب المستهدف (Infotype)',
      labelOptions: 'خيارات القائمة (مفصولة بفواصل)',
      labelDescription: 'وصف الحقل وطبيعة استخدامه',
      labelMandatory: 'حقل إلزامي (مطلوب تعبئته)',
      btnPublish: 'نشر وتفعيل الحقل الديناميكي',
      colLabel: 'اسم الحقل',
      colKey: 'مفتاح JSONB',
      colType: 'النوع',
      colRequired: 'إلزامي؟',
      colSapTarget: 'هدف ساب (Infotype)',
      colDesc: 'الوصف',
      typeCurrency: 'عملة ($ - للبدلات والمكافآت)',
      typeNumber: 'رقم عددي',
      typeText: 'نص عادي',
      typeBoolean: 'خانة اختيار منطقية (نعم/لا)',
      typeSelect: 'قائمة اختيار منسدلة',
    },
    matrix: {
      title: 'مصفوفة مواءمة البيانات مع SAP S/4HANA',
      subtitle: 'قاموس تحويل ومطابقة البيانات ثنائي الاتجاه الذي يربط بين حقول الموارد البشرية السحابية ودفاتر ساب المالية والتشغيلية.',
      badgeBestOfBreed: 'معمارية الأفضل في فئتها (Best-of-Breed)',
      topoTitle: 'طرق وأنماط التكامل المتزامن وغير المتزامن',
      topoOdataTitle: '1. خدمات ساب السحابية OData V4',
      topoOdataDesc: 'خدمة REST/OData متزامنة تستدعي JournalEntryCreateRequest للترحيل المباشر في دفتر الأستاذ.',
      topoBapiTitle: '2. واجهة BAPI / RFC للأنظمة المحلية',
      topoBapiDesc: 'اتصال مباشر عبر SAP Cloud Connector يستدعي BAPI_ACC_DOCUMENT_POST مع خاصية التراجع الآمن عند الخطأ.',
      topoIdocTitle: '3. قوائم انتظار مستندات IDoc',
      topoIdocDesc: 'مزامنة مجمعة عالية السعة باستخدام رسائل ACC_DOCUMENT03 للعمليات الدفعية والتخزين المؤقت الموثوق.',
      dictTitle: 'قاموس المواءمة: الموارد البشرية السحابية ↔ نظام ساب (SAP ERP)',
      dictBadge: 'متوافق مع الدفتر المالي الموحد (ACDOCA)',
      colSourceConcept: 'مفهوم الموارد البشرية المصدر',
      colPgColumn: 'عمود PostgreSQL',
      colSapField: 'حقل ساب المقابل',
      colSapTable: 'كيان / جدول ساب',
      colHarmonizationLogic: 'منطق المواءمة والتحويل المحاسبي',
    },
    footer: {
      erpArch: 'معمارية نظام عزوتي السحابي (Ezwaty Cloud ERP)',
      sapSuite: 'حزمة التكامل مع SAP S/4HANA و ECC',
      pgJsonb: 'تعدد المستأجرين عبر PostgreSQL JSONB',
      activeGateway: 'بوابة Node.js Express نشطة',
    },
  },
};
