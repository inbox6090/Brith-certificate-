import React from 'react';
import { 
  FileText, 
  Plus, 
  LayoutDashboard, 
  History, 
  DownloadCloud,
  FileCheck2,
  ScrollText,
  Building2,
  Globe,
  Cpu
} from 'lucide-react';
import { DemoTopEmblem } from './DemoEmblem';

interface NavbarProps {
  currentTab: 'dashboard' | 'mcp' | 'form' | 'preview' | 'pad' | 'workspace' | 'logs';
  onTabChange: (tab: 'dashboard' | 'mcp' | 'form' | 'preview' | 'pad' | 'workspace' | 'logs') => void;
  onNewRecord: () => void;
  onOpenLogs: () => void;
  onOpenExport: () => void;
  onOpenEverify?: () => void;
  totalRecordsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onNewRecord,
  onOpenLogs,
  onOpenExport,
  onOpenEverify,
  totalRecordsCount
}) => {
  return (
    <header className="bg-emerald-900 text-white sticky top-0 z-40 border-b border-emerald-800 shadow-md print:hidden">
      {/* Top Office Header */}
      <div className="bg-emerald-950 px-4 py-1 text-[11px] text-emerald-200 border-b border-emerald-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-emerald-100 font-['Noto_Sans_Bengali']">
            ২নং বহেড়াতৈল ইউনিয়ন পরিষদ কার্যালয়, সখিপুর, টাঙ্গাইল
          </span>
          <span className="text-emerald-400 hidden sm:inline">•</span>
          <span className="text-emerald-300 hidden sm:inline">
            Local Government Digital Services &amp; Registration Portal
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100 border border-emerald-700">
            OFFICIAL PORTAL
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo & Office Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <DemoTopEmblem size={38} className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight font-['Noto_Sans_Bengali']">
                  ইউনিয়ন পরিষদ সেবা ও নিবন্ধন ব্যবস্থাপনা
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-200 leading-none mt-0.5">
                2 No. Baheratail Union Parishad • Sakhipur, Tangail
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-tab-dashboard"
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded font-mono">
                {totalRecordsCount}
              </span>
            </button>

            <button
              id="nav-tab-mcp"
              onClick={() => onTabChange('mcp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                currentTab === 'mcp'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">MCP ও অটোমেশন</span>
            </button>

            <button
              id="nav-tab-form"
              onClick={() => onTabChange('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                currentTab === 'form'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>নিবন্ধন এডিটর</span>
            </button>

            <button
              id="nav-tab-preview"
              onClick={() => onTabChange('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                currentTab === 'preview'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>জন্ম নিবন্ধন সনদ</span>
            </button>

            {/* BDRIS e-Verify live trigger button */}
            {onOpenEverify && (
              <button
                id="nav-tab-everify"
                onClick={onOpenEverify}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 transition cursor-pointer"
                title="https://everify.bdris.gov.bd/ থেকে অটো-ফিল করুন"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">e-Verify Auto-fill</span>
              </button>
            )}

            <button
              id="nav-tab-workspace"
              onClick={() => onTabChange('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                currentTab === 'workspace'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Google Ecosystem</span>
            </button>

            <button
              id="nav-tab-pad"
              onClick={() => onTabChange('pad')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                currentTab === 'pad'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              <span className="hidden xs:inline">ইউপি প্যাড</span>
            </button>

            <button
              onClick={onOpenLogs}
              title="Audit Logs"
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-emerald-200 hover:bg-emerald-800/60 hover:text-white transition cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">Logs</span>
            </button>

            <button
              onClick={onOpenExport}
              title="Data Backup & JSON Export"
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-emerald-200 hover:bg-emerald-800/60 hover:text-white transition cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              <span className="hidden md:inline">Backup</span>
            </button>

            <button
              id="btn-nav-new-record"
              onClick={onNewRecord}
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-md transition shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">+ New</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};
