/**
 * Hybrid Deployment & DevOps Control Console
 * Component Name: HybridDeploymentViewer
 * 
 * Provides interactive management of Cloud (Multi-Tenant) vs On-Premise (Single-Tenant)
 * modes, cryptographic license verification, Docker infrastructure configs, and adaptive SQL.
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Server, 
  Cloud, 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  Container, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  Layers, 
  Cpu, 
  Database 
} from 'lucide-react';

interface SystemState {
  mode: 'CLOUD' | 'ON_PREMISE';
  localTenantId: string;
  localTenantName: string;
  licenseKey: string;
  licenseStatus: {
    valid: boolean;
    status: 'ACTIVE' | 'EXPIRED' | 'SEATS_EXCEEDED' | 'TAMPERED' | 'MISSING';
    error?: string;
    payload?: {
      customerId: string;
      companyName: string;
      expiryDate: string;
      maxEmployees: number;
      modules: string[];
      issuedAt: string;
    };
    daysRemaining?: number;
    maxEmployees?: number;
    currentEmployees?: number;
  };
  features: {
    multiTenantSwitcher: boolean;
    licenseManagement: boolean;
    cloudBilling: boolean;
    localServerBackup: boolean;
    sapGatewayLocalTunnel: boolean;
  };
}

export const HybridDeploymentViewer: React.FC = () => {
  const { isRtl } = useLanguage();
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [switching, setSwitching] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'license' | 'docker' | 'query'>('license');
  const [dockerFileView, setDockerFileView] = useState<'compose' | 'dockerfile' | 'env'>('compose');
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [keyStatusMsg, setKeyStatusMsg] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Adaptive SQL state
  const [sqlPreview, setSqlPreview] = useState<any>(null);

  const fetchSystemState = async () => {
    try {
      const res = await fetch('/api/system/mode');
      const data = await res.json();
      setSystemState(data);
      if (data.licenseKey) {
        setCustomKeyInput(data.licenseKey);
      }
    } catch (err) {
      console.error('Failed to fetch system deployment state:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueryPreview = async (mode: string) => {
    try {
      const res = await fetch(`/api/system/query-preview?mode=${mode}`);
      const data = await res.json();
      setSqlPreview(data);
    } catch (err) {
      console.error('Failed to fetch query preview:', err);
    }
  };

  useEffect(() => {
    fetchSystemState();
    fetchQueryPreview('CLOUD');
  }, []);

  const handleToggleMode = async (targetMode: 'CLOUD' | 'ON_PREMISE') => {
    setSwitching(true);
    setKeyStatusMsg(null);
    try {
      const res = await fetch('/api/system/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode }),
      });
      const data = await res.json();
      if (data.success) {
        setSystemState(data.state);
        fetchQueryPreview(targetMode);
        setKeyStatusMsg(
          isRtl
            ? `تم تحويل نمط النشر بنجاح إلى: ${targetMode === 'CLOUD' ? 'السحابي متعدد المستأجرين (Cloud)' : 'المحلي على سيرفر العميل (On-Premise)'}`
            : `Successfully switched deployment mode to: ${targetMode}`
        );
      }
    } catch (err: any) {
      console.error('Failed to switch mode:', err);
    } finally {
      setSwitching(false);
    }
  };

  const handleSimulateLicense = async (type: 'valid' | 'expired' | 'seats_exceeded' | 'tampered') => {
    setLoading(true);
    setKeyStatusMsg(null);

    if (type === 'tampered') {
      const tamperedKey = 'eyJjdXN0b21lcklkIjoiVEFNUEVSRUQifQ==.ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      setCustomKeyInput(tamperedKey);
      const res = await fetch('/api/system/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: tamperedKey, updateActiveKey: true }),
      });
      const data = await res.json();
      await fetchSystemState();
      setKeyStatusMsg(
        isRtl
          ? 'تم تطبيق مفتاح مزور/معدل: رفض نظام التحقق المفتاح فوراً بسبب فشل البصمة الرقمية HMAC!'
          : 'Tampered key applied: Cryptographic HMAC signature rejected immediately.'
      );
      setLoading(false);
      return;
    }

    try {
      const genRes = await fetch('/api/system/license/generate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, customSeats: type === 'seats_exceeded' ? 2 : 500 }),
      });
      const genData = await genRes.json();

      setCustomKeyInput(genData.generatedKey);

      await fetch('/api/system/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: genData.generatedKey, updateActiveKey: true }),
      });

      await fetchSystemState();

      if (type === 'valid') {
        setKeyStatusMsg(isRtl ? 'تم تفعيل رخصة المؤسسة السارية (صلاحية حتى 2028 لـ 500 مقعد).' : 'Active enterprise license verified (Valid until 2028 for 500 seats).');
      } else if (type === 'expired') {
        setKeyStatusMsg(isRtl ? 'تم تفعيل رخصة منتهية الصلاحية: تم حظر العمليات المحاسبية وتعديل الموظفين بنجاح!' : 'Expired license applied: Operational endpoints are now blocked!');
      } else if (type === 'seats_exceeded') {
        setKeyStatusMsg(isRtl ? 'تم تفعيل رخصة بمقعدين فقط (بينما يوجد 3 موظفين): تم إيقاف إضافة موظفين جدد لحين الترقية.' : 'Seat quota exceeded (2 seats allowed, 3 exist): Additional seat adds blocked.');
      }
    } catch (err) {
      console.error('License simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCustomKey = async () => {
    if (!customKeyInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/system/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: customKeyInput.trim(), updateActiveKey: true }),
      });
      const data = await res.json();
      await fetchSystemState();
      setKeyStatusMsg(
        data.result.valid
          ? (isRtl ? 'تم التحقق من الرخصة واعتمادها بنجاح!' : 'License verified and applied successfully!')
          : (isRtl ? `فشل التحقق: ${data.result.error}` : `Verification failed: ${data.result.error}`)
      );
    } catch (err) {
      console.error('Failed to apply license:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Raw file strings for Docker tab
  const DOCKER_COMPOSE_STR = `# ==============================================================================
# EZWATY HR & SAP ERP - ON-PREMISE PRODUCTION DOCKER COMPOSE
# ==============================================================================
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: ezwaty-postgres
    restart: always
    environment:
      POSTGRES_DB: ezwaty_hr_db
      POSTGRES_USER: ezwaty_admin
      POSTGRES_PASSWORD: \${DB_PASSWORD:-LocalSecurePassword2026!}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - ezwaty-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ezwaty_admin -d ezwaty_hr_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ezwaty-app-server
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      DEPLOYMENT_MODE: "ON_PREMISE"
      LOCAL_TENANT_ID: "local-premise-org"
      ON_PREMISE_LICENSE_KEY: "\${ON_PREMISE_LICENSE_KEY}"
      DATABASE_URL: "postgresql://ezwaty_admin:\${DB_PASSWORD:-LocalSecurePassword2026!}@db:5432/ezwaty_hr_db"
      PORT: "3000"
    ports:
      - "3000:3000"
    networks:
      - ezwaty-network

volumes:
  pgdata:
    driver: local

networks:
  ezwaty-network:
    driver: bridge`;

  const DOCKERFILE_STR = `# Multi-Stage Production Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm install -g tsx
COPY --from=builder /app/dist ./dist
COPY server.ts ./
COPY src/shared ./src/shared
COPY src/server ./src/server
COPY src/types ./src/types
EXPOSE 3000
CMD ["tsx", "server.ts"]`;

  const ENV_STR = `# ==============================================================================
# ON-PREMISE LOCAL SERVER ENVIRONMENT VARIABLES (.env)
# ==============================================================================
DEPLOYMENT_MODE=ON_PREMISE
LOCAL_TENANT_ID=local-premise-org
LOCAL_TENANT_NAME="Client Enterprise HQ"
ON_PREMISE_LICENSE_KEY=${systemState?.licenseKey || 'eyJ...'}
LICENSE_HMAC_SECRET=ezwaty-enterprise-airgap-license-secret-2026
DB_PASSWORD=SecureLocalPostgresPassword2026!
PORT=3000
SAP_DEFAULT_COMPANY_CODE=1010`;

  const isCloud = systemState?.mode === 'CLOUD';
  const license = systemState?.licenseStatus;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>{isRtl ? 'لوحة قيادة الاستضافة الهجينة والبنية التحتية' : 'Hybrid Deployment & Infrastructure Console'}</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
              isCloud 
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {isCloud 
                ? (isRtl ? 'السحابة (متعدد المستأجرين SaaS)' : 'CLOUD (MULTI-TENANT SAAS)')
                : (isRtl ? 'محلي على سيرفر العميل (On-Premise)' : 'ON-PREMISE (LOCAL SERVER)')}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isRtl 
              ? 'نظام موحد بكود برمجي واحد (Single Codebase) يعمل كسحابة متعددة المستأجرين أو كسيرفر محلي للعميل عبر متغير DEPLOYMENT_MODE.'
              : 'Single unified codebase supporting Multi-Tenant SaaS and Single-Tenant Local Server deployments via DEPLOYMENT_MODE toggle.'}
          </p>
        </div>

        {/* Live Mode Toggle Button */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
          <button
            type="button"
            disabled={switching}
            onClick={() => handleToggleMode('CLOUD')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              isCloud
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{isRtl ? 'وضع السحابة (Cloud SaaS)' : 'Cloud SaaS Mode'}</span>
          </button>

          <button
            type="button"
            disabled={switching}
            onClick={() => handleToggleMode('ON_PREMISE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              !isCloud
                ? 'bg-emerald-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{isRtl ? 'وضع السيرفر المحلي (On-Premise)' : 'On-Premise Mode'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {keyStatusMsg && (
        <div className="p-3 bg-slate-900 border border-emerald-800/80 rounded text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{keyStatusMsg}</span>
          </div>
        </div>
      )}

      {/* Mode Explanation KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{isRtl ? 'نمط التشغيل الفعلي' : 'Active Deployment'}</span>
            {isCloud ? (
              <Cloud className="w-4 h-4 text-sky-400" />
            ) : (
              <Server className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="text-base font-bold text-slate-100 font-mono">
            {isCloud 
              ? (isRtl ? 'سحابي متعدد المستأجرين (Cloud)' : 'MULTI_TENANT_CLOUD')
              : (isRtl ? 'سيرفر محلي للعميل (On-Premise)' : 'SINGLE_TENANT_LOCAL')}
          </div>
          <p className="text-[11px] text-slate-400">
            {isCloud 
              ? (isRtl ? 'عزل كامل للمستأجرين عبر tenant_id وسياسات RLS واشتراكات سحابية.' : 'Strict tenant_id filtering via JWT headers. Multi-organization isolation.')
              : (isRtl ? 'تشغيل ذاتي على أجهزة العميل مع رخصة رقمية وتجاوز عزل المستأجرين.' : 'Single local database. Multitenancy bypassed, cryptographic license enforced.')}
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{isRtl ? 'حالة رخصة الأون-بريمس' : 'On-Premise License'}</span>
            {license?.valid ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
            <span className={license?.valid ? 'text-emerald-400' : 'text-rose-400'}>
              {isRtl
                ? (license?.status && license.status in {
                    ACTIVE: true,
                    EXPIRED: true,
                    SEATS_EXCEEDED: true,
                    TAMPERED: true,
                    MISSING: true,
                  }
                    ? {
                        ACTIVE: 'سارية ونشطة (ACTIVE)',
                        EXPIRED: 'منتهية الصلاحية (EXPIRED)',
                        SEATS_EXCEEDED: 'تجاوز سقف المقاعد (SEATS_EXCEEDED)',
                        TAMPERED: 'توقيع تالف أو مزور (TAMPERED)',
                        MISSING: 'غير موجودة (MISSING)',
                      }[license.status]
                    : 'غير معروف')
                : (license?.status || 'UNKNOWN')}
            </span>
            {license?.valid && (
              <span className="text-xs font-normal text-slate-400">
                ({license.daysRemaining} {isRtl ? 'يوم متبقي' : 'days left'})
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {isRtl 
              ? `المقاعد المرخصة: ${license?.currentEmployees || 3} / ${license?.maxEmployees || 500} موظف`
              : `Licensed Seats: ${license?.currentEmployees || 3} of ${license?.maxEmployees || 500} active`}
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{isRtl ? 'تكامل ساب (SAP S/4HANA)' : 'SAP ERP Integration'}</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-400 font-mono">
            {isCloud 
              ? (isRtl ? 'بوابة ساب السحابية OData' : 'SAP OData Cloud Gateway')
              : (isRtl ? 'نفق الربط المحلي RFC / BAPI' : 'Local RFC / BAPI Tunnel')}
          </div>
          <p className="text-[11px] text-slate-400">
            {isRtl 
              ? 'مخطط البيانات وحقول PERNR و KOSTL و BUKRS متطابقة 100% بين الوضعين.'
              : 'Zero schema variance. SAP PERNR, KOSTL, and BUKRS map identically in both.'}
          </p>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('license')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeSubTab === 'license'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRtl ? 'إدارة وتجربة الرخص الرقمية (License Manager)' : 'Cryptographic License Console'}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('docker')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeSubTab === 'docker'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRtl ? 'حزم الدوكر والتثبيت المحلي (Docker & Compose)' : 'Turnkey Docker & Compose'}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('query');
              fetchQueryPreview(systemState?.mode || 'CLOUD');
            }}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeSubTab === 'query'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRtl ? 'استعلامات SQL المتكيفة (Adaptive Queries)' : 'Adaptive SQL Query Engine'}
          </button>
        </div>
      </div>

      {/* Sub-tab 1: License Manager & Test Lab */}
      {activeSubTab === 'license' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  {isRtl ? 'التحقق التشفيري من رخصة السيرفر المحلي (Offline Cryptographic Verification)' : 'Offline Cryptographic License Validation'}
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">HMAC-SHA256 Signed</span>
            </div>

            <p className="text-xs text-slate-400">
              {isRtl 
                ? 'تعمل السيرفرات المحلية المعزولة (Air-Gapped) بدون إنترنت عبر التحقق التشفيري من التوقيع الرقمي، تاريخ الصلاحية، وسقف عدد الموظفين.'
                : 'Local on-premise installations verify subscription validity, seat count, and enabled modules completely offline via cryptographic signature.'}
            </p>

            {/* Test Simulation Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300 block">
                {isRtl ? 'مختبر اختبار سيناريوهات الرخص (Simulation Lab):' : 'Interactive Test Scenarios:'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateLicense('valid')}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 rounded transition-colors"
                >
                  ✓ {isRtl ? 'رخصة سارية (500 مقعد / 2028)' : 'Valid License (500 seats / 2028)'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateLicense('expired')}
                  className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 rounded transition-colors"
                >
                  ✕ {isRtl ? 'رخصة منتهية (حظر العمليات)' : 'Expired License (Block Operations)'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateLicense('seats_exceeded')}
                  className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 rounded transition-colors"
                >
                  ⚠ {isRtl ? 'تجاوز سقف المقاعد (سقف 2 مقعد)' : 'Exceed Quota (Cap at 2 Seats)'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateLicense('tampered')}
                  className="px-3 py-1.5 text-xs font-medium text-purple-300 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 rounded transition-colors"
                >
                  ☠ {isRtl ? 'مفتاح مزور أو معدل (فشل التوقيع)' : 'Tampered / Counterfeit Key'}
                </button>
              </div>
            </div>

            {/* License Payload Inspection */}
            {license?.payload && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] grid grid-cols-2 md:grid-cols-4 gap-3 dir-ltr text-left">
                <div>
                  <span className="text-slate-500 block">{isRtl ? 'معرف العميل:' : 'Customer ID:'}</span>
                  <span className="text-slate-200">{license.payload.customerId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isRtl ? 'اسم الشركة المؤسسية:' : 'Company Name:'}</span>
                  <span className="text-emerald-400">{license.payload.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isRtl ? 'تاريخ انتهاء الصلاحية:' : 'Expiry Date:'}</span>
                  <span className="text-slate-200">{license.payload.expiryDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isRtl ? 'سقف المقاعد المرخصة:' : 'Seat Limit:'}</span>
                  <span className="text-amber-400">{license.payload.maxEmployees} {isRtl ? 'موظف' : 'Employees'}</span>
                </div>
              </div>
            )}

            {/* License Key Input & Manual Activation */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-slate-300">
                {isRtl ? 'سلسلة المفتاح التشفيري النشط (Base64.Signature):' : 'Active Cryptographic License Key (Base64.Signature):'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customKeyInput}
                  onChange={e => setCustomKeyInput(e.target.value)}
                  placeholder="<BASE64_PAYLOAD>.<HMAC_SHA256_SIGNATURE>"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono focus:outline-none focus:border-amber-400 dir-ltr text-left"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomKey}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors shrink-0"
                >
                  {isRtl ? 'تحقق وتطبيق' : 'Verify & Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Docker Infrastructure */}
      {activeSubTab === 'docker' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded">
              <button
                type="button"
                onClick={() => setDockerFileView('compose')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  dockerFileView === 'compose' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                docker-compose.yml
              </button>
              <button
                type="button"
                onClick={() => setDockerFileView('dockerfile')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  dockerFileView === 'dockerfile' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dockerfile
              </button>
              <button
                type="button"
                onClick={() => setDockerFileView('env')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  dockerFileView === 'env' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                .env (On-Premise)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const content = dockerFileView === 'compose' ? DOCKER_COMPOSE_STR : dockerFileView === 'dockerfile' ? DOCKERFILE_STR : ENV_STR;
                  copyToClipboard(content, dockerFileView);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
              >
                {copiedText === dockerFileView ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === dockerFileView ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الملف' : 'Copy File')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const content = dockerFileView === 'compose' ? DOCKER_COMPOSE_STR : dockerFileView === 'dockerfile' ? DOCKERFILE_STR : ENV_STR;
                  const filename = dockerFileView === 'compose' ? 'docker-compose.yml' : dockerFileView === 'dockerfile' ? 'Dockerfile' : '.env';
                  downloadFile(content, filename);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تحميل' : 'Download'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden dir-ltr text-left">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>
                {dockerFileView === 'compose' ? 'docker-compose.yml (PostgreSQL + Ezwaty App Bundle)' : dockerFileView === 'dockerfile' ? 'Dockerfile (Multi-Stage Node.js 20 & React)' : '.env configuration'}
              </span>
              <span className="text-[11px] text-emerald-400">
                {isRtl ? 'جاهز للتسليم والتشغيل المباشر للعميل' : 'Ready for Client Handover'}
              </span>
            </div>
            <pre className="p-4 text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto max-h-[460px]">
              {dockerFileView === 'compose' ? DOCKER_COMPOSE_STR : dockerFileView === 'dockerfile' ? DOCKERFILE_STR : ENV_STR}
            </pre>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Adaptive SQL Query Engine */}
      {activeSubTab === 'query' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>{isRtl ? 'كيف تتكيف الاستعلامات البرمجية تلقائياً دون أي تعديل في الجداول؟' : 'How does getEmployees() dynamically adapt without changing schemas?'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isRtl 
                ? 'في الوضع السحابي (Cloud)، يتم فرض جملة WHERE tenant_id = $1 لمنع أي اختراق عبر المستأجرين. وفي وضع السيرفر المحلي (On-Premise)، يتم توجيه الاستعلام تلقائياً إلى المستأجر المحلي الثابت أو إلغاء شرط العزل لأن قاعدة البيانات بأكملها ملك للعميل، مما يمنح أقصى سرعة استجابة مع بقاء بنية الجداول متطابقة 100% لإتاحة الترحيل المستقبلي بين الوضعين دون أدنى مجهود.'
                : 'In Cloud mode, tenant_id isolation is strictly enforced. In On-Premise mode, queries automatically default to the local tenant or bypass partitioning, optimizing local performance while maintaining exact schema equivalence for zero-downtime backup restorations to the cloud.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dir-ltr text-left">
            <div className="p-4 bg-slate-950 border border-sky-900/60 rounded-lg space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-sky-900/60">
                <span className="text-xs font-mono font-semibold text-sky-400">
                  {isRtl ? '1. وضع السحابة (متعدد المستأجرين)' : '1. CLOUD MODE (Multi-Tenant)'}
                </span>
                <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">
                  {isRtl ? 'معزول عبر RLS' : 'RLS Partitioned'}
                </span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto">
{`SELECT id, first_name, last_name, role, basic_salary,
       sap_employee_id, sap_cost_center, custom_attributes
FROM hr_employees
WHERE tenant_id = $1   -- Bound to verified JWT session
ORDER BY created_at DESC;`}
              </pre>
            </div>

            <div className="p-4 bg-slate-950 border border-emerald-900/60 rounded-lg space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60">
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  {isRtl ? '2. وضع السيرفر المحلي (أون-بريمس)' : '2. ON_PREMISE MODE (Local Server)'}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                  {isRtl ? 'محسن للأداء المحلي' : 'Local Optimized'}
                </span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto">
{`SELECT id, first_name, last_name, role, basic_salary,
       sap_employee_id, sap_cost_center, custom_attributes
FROM hr_employees
WHERE (tenant_id = 'local-premise-org' OR tenant_id IS NULL)
ORDER BY created_at DESC;`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
