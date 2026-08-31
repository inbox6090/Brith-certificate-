import React, { useState, useEffect } from 'react';
import { DemoRecord, ActivityLog } from './types';
import { 
  getStoredRecords, 
  saveStoredRecords, 
  saveOrUpdateRecord, 
  deleteStoredRecord, 
  duplicateStoredRecord, 
  createBlankRecord,
  getStoredLogs,
  addLog,
  INITIAL_DEMO_RECORDS
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CitizenForm } from './components/CitizenForm';
import { CertificatePreview } from './components/CertificatePreview';
import { UnionParishadPad } from './components/UnionParishadPad';
import { AuditLogModal } from './components/AuditLogModal';
import { ExportModal } from './components/ExportModal';
import { EverifyModal } from './components/EverifyModal';
import { GoogleWorkspaceHub } from './components/GoogleWorkspaceHub';
import { MasterControlPanel } from './components/MasterControlPanel';
import { 
  FileText, 
  Eye, 
  Columns, 
  Maximize2, 
  ArrowLeft, 
  Printer, 
  Sparkles, 
  CheckCircle2,
  AlertTriangle,
  Globe
} from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<DemoRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<DemoRecord>(INITIAL_DEMO_RECORDS[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mcp' | 'form' | 'preview' | 'pad' | 'workspace' | 'logs'>('dashboard');
  const [editorLayout, setEditorLayout] = useState<'split' | 'formOnly' | 'previewOnly'>('split');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEverifyModalOpen, setIsEverifyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize records on load
  useEffect(() => {
    const loaded = getStoredRecords();
    setRecords(loaded);
    if (loaded.length > 0) {
      setCurrentRecord(loaded[0]);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers for record operations
  const handleNewRecord = () => {
    const blank = createBlankRecord();
    setCurrentRecord(blank);
    setActiveTab('form');
    showToast('New draft record created.');
  };

  const handleEditRecord = (record: DemoRecord) => {
    setCurrentRecord(record);
    setActiveTab('form');
  };

  const handleViewRecord = (record: DemoRecord) => {
    setCurrentRecord(record);
    setActiveTab('preview');
  };

  const handleSaveRecord = (recordToSave: DemoRecord) => {
    const { record: saved, isNew } = saveOrUpdateRecord(recordToSave);
    setCurrentRecord(saved);
    const updatedList = getStoredRecords();
    setRecords(updatedList);
    showToast(isNew ? 'New draft created & saved successfully.' : 'Draft updated successfully.');
  };

  const handleDeleteRecord = (id: string) => {
    deleteStoredRecord(id);
    const updated = getStoredRecords();
    setRecords(updated);
    if (currentRecord.id === id && updated.length > 0) {
      setCurrentRecord(updated[0]);
    }
    showToast('Record deleted successfully.');
  };

  const handleDuplicateRecord = (id: string) => {
    const dup = duplicateStoredRecord(id);
    if (dup) {
      const updated = getStoredRecords();
      setRecords(updated);
      setCurrentRecord(dup);
      showToast(`Duplicated into ${dup.referenceId}`);
    }
  };

  const handlePrintRecord = (record?: DemoRecord) => {
    if (record) {
      setCurrentRecord(record);
    }
    window.print();
  };

  const handleImportRecords = (imported: DemoRecord[]) => {
    saveStoredRecords(imported);
    setRecords(imported);
    if (imported.length > 0) {
      setCurrentRecord(imported[0]);
    }
    addLog({
      id: 'log-' + Date.now(),
      action: 'Imported',
      description: `Imported ${imported.length} demo records from JSON backup.`,
      timestamp: new Date().toISOString()
    });
    showToast(`Successfully imported ${imported.length} records.`);
  };

  // Handler to apply extracted e-Verify data
  const handleApplyEverifyData = (extracted: Partial<DemoRecord>) => {
    const merged: DemoRecord = {
      ...currentRecord,
      ...extracted,
      updatedAt: new Date().toISOString()
    };
    
    // Auto-save the merged record to storage
    const { record: saved } = saveOrUpdateRecord(merged);
    setCurrentRecord(saved);
    const updatedList = getStoredRecords();
    setRecords(updatedList);

    addLog({
      id: 'log-' + Date.now(),
      action: 'e-Verify Auto-fill',
      description: `Auto-filled record for ${saved.nameBn || saved.nameEn} (BRN: ${saved.referenceId}) from https://everify.bdris.gov.bd/`,
      timestamp: new Date().toISOString()
    });

    showToast('BDRIS e-Verify ডাটা সফলভাবে ফর্মে ও সনদে অটো-ফিল হয়েছে!');
    setActiveTab('form');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-200">
      
      {/* Top Main Navigation */}
      <Navbar
        currentTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'logs') {
            setIsAuditModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onNewRecord={handleNewRecord}
        onOpenLogs={() => setIsAuditModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenEverify={() => setIsEverifyModalOpen(true)}
        totalRecordsCount={records.length}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-emerald-700 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        
        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard
            records={records}
            onNewRecord={handleNewRecord}
            onEditRecord={handleEditRecord}
            onViewRecord={handleViewRecord}
            onDeleteRecord={handleDeleteRecord}
            onDuplicateRecord={handleDuplicateRecord}
            onOpenMcp={() => setActiveTab('mcp')}
            onRecordsSynced={(synced) => {
              setRecords(synced);
              saveStoredRecords(synced);
              showToast('Firebase Firestore থেকে রেকর্ড সফলভাবে সিঙ্ক হয়েছে!');
            }}
            onPrintRecord={(rec) => {
              setCurrentRecord(rec);
              setActiveTab('preview');
              setTimeout(() => window.print(), 300);
            }}
          />
        )}

        {/* VIEW 1.5: MASTER CONTROL PANEL & AUTOMATION ENGINE */}
        {activeTab === 'mcp' && (
          <div className="space-y-4">
            <MasterControlPanel
              records={records}
              activeRecord={currentRecord}
              onSelectRecord={(rec) => setCurrentRecord(rec)}
              onViewRecord={handleViewRecord}
              onEditRecord={handleEditRecord}
            />
          </div>
        )}

        {/* VIEW 2: FORM & LIVE PREVIEW EDITOR */}
        {activeTab === 'form' && (
          <div className="space-y-4">
            
            {/* Editor Sub-header with breadcrumbs and layout switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition cursor-pointer"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Noto_Sans_Bengali']">
                    {currentRecord.nameBn || currentRecord.nameEn
                      ? `সম্পাদনা: ${currentRecord.nameBn || ''} (${currentRecord.nameEn || ''})`
                      : 'নতুন জন্ম নিবন্ধন রেকর্ড তৈরি'}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Ref: {currentRecord.referenceId}
                  </p>
                </div>
              </div>

              {/* View layout selector for desktop */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsEverifyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-md transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-200" />
                  <span>e-Verify অটো-ফিল</span>
                </button>

                <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
                  <button
                    onClick={() => setEditorLayout('split')}
                    className={`px-2.5 py-1 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
                      editorLayout === 'split' ? 'bg-white shadow-xs text-emerald-900 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Split View</span>
                  </button>
                  <button
                    onClick={() => setEditorLayout('formOnly')}
                    className={`px-2.5 py-1 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
                      editorLayout === 'formOnly' ? 'bg-white shadow-xs text-emerald-900 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Form Only</span>
                  </button>
                  <button
                    onClick={() => setEditorLayout('previewOnly')}
                    className={`px-2.5 py-1 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
                      editorLayout === 'previewOnly' ? 'bg-white shadow-xs text-emerald-900 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Certificate Only</span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveTab('preview')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-md transition cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full View</span>
                </button>
              </div>
            </div>

            {/* Split Screen Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Form Section */}
              <div className={`transition-all ${
                editorLayout === 'split' 
                  ? 'lg:col-span-6 xl:col-span-7' 
                  : editorLayout === 'formOnly' 
                  ? 'lg:col-span-12' 
                  : 'hidden'
              }`}>
                <CitizenForm
                  initialRecord={currentRecord}
                  onSave={handleSaveRecord}
                  onPrint={() => handlePrintRecord(currentRecord)}
                  onReset={() => setCurrentRecord(createBlankRecord())}
                  onOpenEverify={() => setIsEverifyModalOpen(true)}
                />
              </div>

              {/* Live Preview Section */}
              <div className={`transition-all ${
                editorLayout === 'split' 
                  ? 'lg:col-span-6 xl:col-span-5 sticky top-20' 
                  : editorLayout === 'previewOnly' 
                  ? 'lg:col-span-12 max-w-4xl mx-auto' 
                  : 'hidden'
              }`}>
                <div className="bg-slate-200/80 p-2 sm:p-4 rounded-xl border border-slate-300">
                  <CertificatePreview
                    record={currentRecord}
                    onUpdateRecord={(updated) => {
                      setCurrentRecord(updated);
                      saveOrUpdateRecord(updated);
                      setRecords(getStoredRecords());
                    }}
                    onPrint={() => handlePrintRecord(currentRecord)}
                    onOpenEverify={() => setIsEverifyModalOpen(true)}
                    isCompact={editorLayout === 'split'}
                  />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 3: FULL CERTIFICATE PREVIEW & PRINT */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition cursor-pointer"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Noto_Sans_Bengali']">
                    জন্ম নিবন্ধন সনদ প্রিভিউ (Certificate Fullscreen Preview)
                  </h2>
                  <p className="text-xs text-slate-500">
                    A4 Portrait Standard Document Format
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEverifyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-md transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>e-Verify অটো-ফিল</span>
                </button>

                <button
                  onClick={() => setActiveTab('form')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition cursor-pointer border border-slate-300"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition cursor-pointer shadow-xs active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print (A4)</span>
                </button>
              </div>
            </div>

            {/* Centered A4 Certificate Sheet */}
            <div className="flex justify-center pb-12">
              <CertificatePreview
                record={currentRecord}
                onUpdateRecord={(updated) => {
                  setCurrentRecord(updated);
                  saveOrUpdateRecord(updated);
                  setRecords(getStoredRecords());
                }}
                onPrint={() => window.print()}
                onOpenEverify={() => setIsEverifyModalOpen(true)}
              />
            </div>

          </div>
        )}

        {/* VIEW 4: UNION PARISHAD OFFICIAL PAD & DECLARATION */}
        {activeTab === 'pad' && (
          <UnionParishadPad />
        )}

        {/* VIEW 5: GOOGLE WORKSPACE & FIREBASE HUB */}
        {activeTab === 'workspace' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition cursor-pointer"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Noto_Sans_Bengali']">
                    Google Workspace &amp; Firebase ক্লাউড সেবা কেন্দ্র
                  </h2>
                  <p className="text-xs text-slate-500">
                    Drive, Sheets, Docs, Forms, Tasks, Contacts, Gmail &amp; Slides Integration
                  </p>
                </div>
              </div>
            </div>

            <GoogleWorkspaceHub
              records={records}
              selectedRecord={currentRecord}
              onRecordsSynced={(synced) => {
                setRecords(synced);
                saveStoredRecords(synced);
                showToast('Firebase Firestore থেকে রেকর্ড সফলভাবে সিঙ্ক হয়েছে!');
              }}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-200 font-['Noto_Sans_Bengali']">
              ২নং বহেড়াতৈল ইউনিয়ন পরিষদ কার্যালয় (সখিপুর, টাঙ্গাইল)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Local Government Digital Portal • জন্ম নিবন্ধন সনদ ও অফিশিয়াল প্রত্যয়নপত্র সার্ভিস
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-mono text-emerald-400">UP-BAHERATAIL</span>
            <span>•</span>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="hover:text-slate-200 transition cursor-pointer"
            >
              Activity Log
            </button>
            <span>•</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-slate-200 transition cursor-pointer"
            >
              Backup &amp; Export
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={getStoredLogs()}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={records}
        onImportRecords={handleImportRecords}
      />

      {/* BDRIS e-Verify Browser & Smart Parser Modal */}
      <EverifyModal
        isOpen={isEverifyModalOpen}
        onClose={() => setIsEverifyModalOpen(false)}
        onApplyData={handleApplyEverifyData}
        currentRecord={currentRecord}
      />

    </div>
  );
}
