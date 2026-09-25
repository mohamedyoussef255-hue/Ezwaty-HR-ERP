/**
 * Main Enterprise Shell: Minhaj HR & SAP Cloud ERP
 * Bilingual (Arabic & English) with RTL/LTR support, Top Bar Contract,
 * and unified Enterprise modules.
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { EmployeeProfileBuilder } from './components/EmployeeProfileBuilder';
import { SapJournalEntryViewer } from './components/SapJournalEntryViewer';
import { DdlViewer } from './components/DdlViewer';
import { DynamicFieldConfigurator } from './components/DynamicFieldConfigurator';
import { SapMappingReference } from './components/SapMappingReference';
import { HybridDeploymentViewer } from './components/HybridDeploymentViewer';
import { EmployeeList } from './components/EmployeeList';
import { Employee } from './types/hr';
import { useSecretClick } from './hooks/useSecretClick';
import { 
  Plus, 
  Languages,
  Server,
  Cloud,
  Eye,
  EyeOff
} from 'lucide-react';

function AppContent() {
  const { t, language, toggleLanguage, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'builder' | 'payroll' | 'ddl' | 'dynamic_schema' | 'matrix' | 'deployment'>('builder');
  const [tenantId, setTenantId] = useState<string>('tenant-acme-corp');
  const [deploymentMode, setDeploymentMode] = useState<'CLOUD' | 'ON_PREMISE'>('CLOUD');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(true);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  // Hidden Easter Egg Click-Tracking Hook (5 clicks within 2s)
  const { isPreviewMode, handleSecretClick, exitPreviewMode, clickCount, requiredClicks } = useSecretClick({
    requiredClicks: 5,
    timeWindowMs: 2000,
    onToggle: (active) => {
      if (active && (activeTab === 'ddl' || activeTab === 'dynamic_schema' || activeTab === 'deployment')) {
        setActiveTab('builder');
      }
    },
  });

  const fetchSystemMode = async () => {
    try {
      const res = await fetch('/api/system/mode');
      const data = await res.json();
      if (data.mode) {
        setDeploymentMode(data.mode);
        if (data.mode === 'ON_PREMISE') {
          setTenantId(data.localTenantId || 'local-premise-org');
        }
      }
    } catch (err) {
      console.error('Error fetching deployment mode:', err);
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetch(`/api/hr/employees?tenantId=${tenantId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchSystemMode();
  }, [activeTab, refreshCounter]);

  useEffect(() => {
    fetchEmployees();
  }, [tenantId, refreshCounter]);

  const handleEmployeeCreated = (newEmp: Employee) => {
    setEmployees(prev => [newEmp, ...prev]);
    setRefreshCounter(c => c + 1);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${isRtl ? 'font-[\'Cairo\',sans-serif]' : 'font-[\'Plus_Jakarta_Sans\',sans-serif]'}`}>
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Single text element wordmark
        Zone 2: Clean text navigation links
        Zone 3: 1-2 primary actions & Language Toggle
      */}
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Zone 1: Wordmark & Secret Easter Egg Click Trigger */}
          <div 
            onClick={handleSecretClick}
            className="flex items-center gap-3 cursor-pointer select-none group"
            title={t.previewMode.secretHint}
          >
            <span className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
              {t.appName}
            </span>
            {clickCount > 0 && clickCount < requiredClicks && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                {clickCount}/{requiredClicks}
              </span>
            )}
          </div>

          {/* Zone 2: Navigation Links (Admin tabs hidden when in Client Preview Mode) */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-400">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`hover:text-slate-100 transition-colors ${
                activeTab === 'builder' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              {t.tabs.builder}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payroll')}
              className={`hover:text-slate-100 transition-colors ${
                activeTab === 'payroll' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              {t.tabs.payroll}
            </button>

            {!isPreviewMode && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('ddl')}
                  className={`hover:text-slate-100 transition-colors ${
                    activeTab === 'ddl' ? 'text-emerald-400 font-semibold' : ''
                  }`}
                >
                  {t.tabs.ddl}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('dynamic_schema')}
                  className={`hover:text-slate-100 transition-colors ${
                    activeTab === 'dynamic_schema' ? 'text-emerald-400 font-semibold' : ''
                  }`}
                >
                  {t.tabs.dynamicSchema}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`hover:text-slate-100 transition-colors ${
                activeTab === 'matrix' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              {t.tabs.matrix}
            </button>

            {!isPreviewMode && (
              <button
                type="button"
                onClick={() => setActiveTab('deployment')}
                className={`hover:text-slate-100 transition-colors flex items-center gap-1 ${
                  activeTab === 'deployment' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                <Server className="w-3 h-3 text-sky-400" />
                <span>{t.tabs.deployment}</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Action, Language Switcher & Deployment Badge */}
          <div className="flex items-center gap-3">
            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors"
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.languageToggle}</span>
            </button>

            {/* Hybrid Deployment Indicator */}
            {deploymentMode === 'ON_PREMISE' ? (
              <button
                type="button"
                onClick={() => !isPreviewMode && setActiveTab('deployment')}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                title={isRtl ? 'وضع السيرفر المحلي للعميل' : 'On-Premise Local Server Mode'}
              >
                <Server className="w-3 h-3 text-emerald-400" />
                <span>{isRtl ? 'سيرفر محلي (On-Premise)' : 'ON-PREMISE LOCAL'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => !isPreviewMode && setActiveTab('deployment')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono hover:text-slate-200 transition-colors"
                title={isRtl ? 'وضع السحابة متعدد المستأجرين' : 'Cloud SaaS Multi-Tenant Mode'}
              >
                <Cloud className="w-3 h-3 text-sky-400" />
                <span className="text-slate-500">{t.tenantLabel}:</span>
                <span className="text-slate-300">{isRtl ? 'شركة أكمي (acme)' : 'acme-corp'}</span>
              </button>
            )}

            {!isPreviewMode && (
              <button
                type="button"
                onClick={() => setActiveTab('builder')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.newEmployeeBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Viewport Nav Scroller */}
        <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/80 gap-3 text-xs text-slate-400 font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`whitespace-nowrap ${activeTab === 'builder' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            {t.tabs.builder}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payroll')}
            className={`whitespace-nowrap ${activeTab === 'payroll' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            {t.tabs.payroll}
          </button>
          {!isPreviewMode && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('ddl')}
                className={`whitespace-nowrap ${activeTab === 'ddl' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                {t.tabs.ddl}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dynamic_schema')}
                className={`whitespace-nowrap ${activeTab === 'dynamic_schema' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                {t.tabs.dynamicSchema}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`whitespace-nowrap ${activeTab === 'matrix' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            {t.tabs.matrix}
          </button>
          {!isPreviewMode && (
            <button
              type="button"
              onClick={() => setActiveTab('deployment')}
              className={`whitespace-nowrap ${activeTab === 'deployment' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              {t.tabs.deployment}
            </button>
          )}
        </div>
      </header>

      {/* Secret Preview Mode Sticky Floating Banner */}
      {isPreviewMode && (
        <div className="bg-amber-400 text-slate-950 px-4 sm:px-6 py-2 text-xs font-semibold flex items-center justify-between shadow-lg sticky top-14 z-20 transition-all">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 shrink-0 text-slate-950 animate-pulse" />
            <span className="font-bold">{t.previewMode.bannerTitle}</span>
            <span className="hidden md:inline font-normal text-slate-900 border-l border-slate-950/20 pl-2 ml-2">
              {t.previewMode.bannerSub}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-slate-950/10 px-2 py-0.5 rounded">
              {t.previewMode.badgeReadOnly}
            </span>
            <button
              type="button"
              onClick={exitPreviewMode}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-950 text-amber-300 hover:bg-slate-900 rounded transition-colors flex items-center gap-1 shrink-0"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{t.previewMode.btnExit}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'builder' && (
          <div className="space-y-8">
            <EmployeeProfileBuilder
              tenantId={tenantId}
              onEmployeeCreated={handleEmployeeCreated}
              onOpenSchemaConfig={() => setActiveTab('dynamic_schema')}
            />

            <EmployeeList
              employees={employees}
              loading={loadingEmployees}
            />
          </div>
        )}

        {activeTab === 'payroll' && (
          <SapJournalEntryViewer
            tenantId={tenantId}
            refreshTrigger={refreshCounter}
          />
        )}

        {activeTab === 'ddl' && (
          <DdlViewer />
        )}

        {activeTab === 'dynamic_schema' && (
          <DynamicFieldConfigurator
            tenantId={tenantId}
            onSchemaUpdated={() => setRefreshCounter(c => c + 1)}
          />
        )}

        {activeTab === 'matrix' && (
          <SapMappingReference />
        )}

        {activeTab === 'deployment' && (
          <HybridDeploymentViewer />
        )}
      </main>

      {/* Clean Enterprise Footer */}
      <footer className="border-t border-slate-800/80 py-4 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span>{t.footer.erpArch}</span>
            <span aria-hidden="true">·</span>
            <span>{t.footer.sapSuite}</span>
            <span aria-hidden="true">·</span>
            <span>{t.footer.pgJsonb}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 dir-ltr">
            <span>
              {isRtl 
                ? `النمط: ${deploymentMode === 'CLOUD' ? 'سحابي متعدد المستأجرين (Cloud)' : 'محلي للعميل (On-Premise)'}` 
                : `Mode: ${deploymentMode}`}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">{t.footer.activeGateway}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
