import React, { useState, useRef } from 'react';
import { DemoRecord } from '../types';
import { 
  Download, 
  Upload, 
  FileJson, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldAlert, 
  HardDrive, 
  Cloud, 
  Smartphone,
  Share2,
  Check,
  ExternalLink
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: DemoRecord[];
  onImportRecords: (imported: DemoRecord[]) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  records,
  onImportRecords
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedDriveLink, setCopiedDriveLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bdris_birth_records_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareOrDriveBackup = async () => {
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const filename = `bdris_birth_records_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([blob], filename, { type: 'application/json' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'BDRIS Birth Registration Backup',
          text: 'Google Drive বা ফোন স্টোরেজে BDRIS জন্ম নিবন্ধন ডাটা ব্যাকআপ সংরক্ষণ করুন।',
          files: [file]
        });
      } catch (e) {
        handleExportJSON();
      }
    } else {
      handleExportJSON();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportRecords(parsed);
          setImportStatus(`Successfully imported ${parsed.length} records!`);
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus('Invalid backup file structure: expected array of DemoRecord.');
        }
      } catch (err) {
        setImportStatus('Error parsing JSON file. Please ensure it is a valid backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-950 text-emerald-50 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-900 rounded-lg">
              <HardDrive className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                ডাটা ব্যাকআপ, ফোন স্টোরেজ ও Google Drive
              </h3>
              <p className="text-xs text-emerald-300">
                অটো-সেভ ও লোকাল ডাটাবেজ ব্যাকআপ ব্যবস্থাপনা
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-400 hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700 max-h-[75vh] overflow-y-auto">
          
          {/* Storage & Auto-save Status */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950">
                স্বয়ংক্রিয় অটো-সেভ (Auto-Save) সক্রিয়
              </p>
              <p className="text-xs text-emerald-800 mt-0.5">
                আপনার ব্রাউজার বা ডিভাইসে প্রতিটি পরিবর্তন সাথে সাথে সংরক্ষিত হচ্ছে। বর্তমান ডাটাবেজে মোট <b>{records.length}</b> টি রেকর্ড সক্রিয় রয়েছে।
              </p>
            </div>
          </div>

          {/* Option 1: Phone Storage & PC Download */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>ফোন স্টোরেজে ব্যাকআপ ডাউনলোড (Phone Storage Download):</span>
            </div>
            <p className="text-xs text-slate-600">
              সকল রেকর্ড একটি পূর্ণাঙ্গ JSON ফাইল হিসেবে আপনার মোবাইল বা কম্পিউটারের Download ফোল্ডারে সেভ করুন।
            </p>
            <button
              onClick={handleExportJSON}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON to Device Storage</span>
            </button>
          </div>

          {/* Option 2: Google Drive & Cloud Backup */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Cloud className="w-4 h-4 text-sky-600" />
                <span>Google Drive এ সংরক্ষণ ও শেয়ার:</span>
              </div>
              <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                Cloud Sync
              </span>
            </div>
            <p className="text-xs text-slate-600">
              মোবাইলের Share শিটের মাধ্যমে সরাসরি আপনার Google Drive অ্যাপ বা অন্য ডিভাইসে ব্যাকআপ ফাইল পাঠান।
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleShareOrDriveBackup}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Google Drive / Share এ পাঠান</span>
              </button>
              <a
                href="https://drive.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition"
                title="Open Google Drive"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Drive</span>
              </a>
            </div>
          </div>

          {/* Option 3: Restore / Import */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <span className="font-bold text-slate-900 block flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-700" />
              <span>পূর্বে ডাউনলোড করা ব্যাকআপ থেকে রিস্টোর (Restore):</span>
            </span>
            <p className="text-xs text-slate-500">
              আপনার সংরক্ষিত `.json` ফাইলটি নির্বাচন করে সকল রেকর্ড পুনরুদ্ধার করুন।
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold text-xs transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Select Backup File (.json)</span>
            </button>
          </div>

          {importStatus && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              importStatus.includes('Successfully')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-red-50 text-red-800 border border-red-300'
            }`}>
              {importStatus}
            </div>
          )}

          <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              আপনার তথ্যের পূর্ণ গোপনীয়তা বজায় রাখতে সকল ডাটা সরাসরি আপনার ক্লায়েন্ট ডিভাইসে প্রসেস ও সংরক্ষিত হয়।
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
