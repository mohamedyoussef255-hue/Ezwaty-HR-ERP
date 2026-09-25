/**
 * Phase 1 Database Architecture Viewer
 * Component Name: DdlViewer
 * 
 * Bilingual (Arabic & English) support for PostgreSQL DDL inspection.
 */

import React, { useState } from 'react';
import { POSTGRESQL_DDL_SCRIPT } from '../shared/ddl';
import { useLanguage } from '../context/LanguageContext';
import { 
  Copy, 
  Check, 
  Download, 
  Key, 
  Layers, 
  ShieldCheck, 
  Code2, 
  Table 
} from 'lucide-react';

export const DdlViewer: React.FC = () => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);

  const copyScript = () => {
    navigator.clipboard.writeText(POSTGRESQL_DDL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([POSTGRESQL_DDL_SCRIPT], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ezwaty_cloud_erp_hr_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>{t.ddlViewer.title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {t.ddlViewer.badgeDeliverable}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.ddlViewer.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyScript}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t.ddlViewer.btnCopiedSql : t.ddlViewer.btnCopyDdl}
          </button>

          <button
            type="button"
            onClick={downloadScript}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {t.ddlViewer.btnDownloadSql}
          </button>
        </div>
      </div>

      {/* Schema Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
            <Table className="w-4 h-4 text-emerald-400" />
            <span>{t.ddlViewer.cardRelationalTitle}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.ddlViewer.cardRelationalDesc}
          </p>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>{t.ddlViewer.cardJsonbTitle}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.ddlViewer.cardJsonbDesc}
          </p>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
            <Key className="w-4 h-4 text-sky-400" />
            <span>{t.ddlViewer.cardSapTitle}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.ddlViewer.cardSapDesc}
          </p>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span>{t.ddlViewer.cardRlsTitle}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.ddlViewer.cardRlsDesc}
          </p>
        </div>
      </div>

      {/* SQL Script Display */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden dir-ltr text-left">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>{t.ddlViewer.editorHeader}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {t.ddlViewer.editorStats}
          </span>
        </div>

        <pre className="p-4 text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto max-h-[560px]">
          {POSTGRESQL_DDL_SCRIPT}
        </pre>
      </div>
    </div>
  );
};
