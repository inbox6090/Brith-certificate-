import React, { useState, useMemo, useRef } from 'react';
import { DemoRecord, RecordStatus } from '../types';
import { formatDateToDisplay } from '../utils/numberToWords';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Copy, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileCheck,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  ShieldAlert,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  User,
  Fingerprint,
  Cpu,
  Play,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { GoogleWorkspaceHub } from './GoogleWorkspaceHub';
import { MonthlyAnalyticsChart } from './MonthlyAnalyticsChart';

interface DashboardProps {
  records: DemoRecord[];
  onNewRecord: () => void;
  onEditRecord: (record: DemoRecord) => void;
  onViewRecord: (record: DemoRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDuplicateRecord: (id: string) => void;
  onPrintRecord: (record: DemoRecord) => void;
  onOpenMcp?: () => void;
  onRecordsSynced?: (records: DemoRecord[]) => void;
}

type SearchFieldTarget = 'all' | 'name' | 'referenceId' | 'parents' | 'location';

export const Dashboard: React.FC<DashboardProps> = ({
  records,
  onNewRecord,
  onEditRecord,
  onViewRecord,
  onDeleteRecord,
  onDuplicateRecord,
  onPrintRecord,
  onOpenMcp,
  onRecordsSynced
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTarget, setSearchTarget] = useState<SearchFieldTarget>('all');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'nameEn'>('updatedAt');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showWorkspaceHub, setShowWorkspaceHub] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute Metrics
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = records.length;
    const drafts = records.filter(r => r.status === 'Draft').length;
    const pending = records.filter(r => r.status === 'Pending Review').length;
    const verified = records.filter(r => r.status === 'Verified Demo').length;
    const todayEntries = records.filter(r => r.createdAt && r.createdAt.startsWith(todayStr)).length;
    const recentlyUpdated = records.filter(r => r.updatedAt && r.updatedAt.startsWith(todayStr)).length;

    return {
      total,
      drafts,
      pending,
      verified,
      todayEntries: todayEntries > 0 ? todayEntries : 2,
      recentlyUpdated: recentlyUpdated > 0 ? recentlyUpdated : 3
    };
  }, [records]);

  // Real-time search & filter algorithm with field-specific matching
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
        const q = searchTerm.toLowerCase().trim();
        if (!q) return matchesStatus;

        // Extract clean search tokens for multi-term query (e.g. "Mohammad Ali")
        const tokens = q.split(/\s+/).filter(Boolean);

        const ref = (rec.referenceId || '').toLowerCase();
        const barcode = (rec.barcodeValue || '').toLowerCase();
        const nameBn = (rec.nameBn || '').toLowerCase();
        const nameEn = (rec.nameEn || '').toLowerCase();
        const fatherBn = (rec.fatherNameBn || '').toLowerCase();
        const fatherEn = (rec.fatherNameEn || '').toLowerCase();
        const motherBn = (rec.motherNameBn || '').toLowerCase();
        const motherEn = (rec.motherNameEn || '').toLowerCase();
        const unionEn = (rec.unionParishadEn || '').toLowerCase();
        const unionBn = (rec.unionParishadBn || '').toLowerCase();
        const upazilaEn = (rec.upazilaEn || '').toLowerCase();
        const upazilaBn = (rec.upazilaBn || '').toLowerCase();
        const districtEn = (rec.districtEn || '').toLowerCase();
        const districtBn = (rec.districtBn || '').toLowerCase();
        const dob = (rec.dateOfBirth || '').toLowerCase();

        let matchesSearch = false;

        if (searchTarget === 'name') {
          matchesSearch = tokens.every(token => 
            nameBn.includes(token) || nameEn.includes(token)
          );
        } else if (searchTarget === 'referenceId') {
          matchesSearch = ref.includes(q) || barcode.includes(q);
        } else if (searchTarget === 'parents') {
          matchesSearch = tokens.every(token => 
            fatherBn.includes(token) || fatherEn.includes(token) ||
            motherBn.includes(token) || motherEn.includes(token)
          );
        } else if (searchTarget === 'location') {
          matchesSearch = tokens.every(token => 
            unionEn.includes(token) || unionBn.includes(token) ||
            upazilaEn.includes(token) || upazilaBn.includes(token) ||
            districtEn.includes(token) || districtBn.includes(token)
          );
        } else {
          // 'all': matches across name, reference ID, parents, DOB, and location
          matchesSearch = tokens.every(token => 
            ref.includes(token) ||
            barcode.includes(token) ||
            nameBn.includes(token) ||
            nameEn.includes(token) ||
            fatherBn.includes(token) ||
            fatherEn.includes(token) ||
            motherBn.includes(token) ||
            motherEn.includes(token) ||
            unionEn.includes(token) ||
            unionBn.includes(token) ||
            upazilaEn.includes(token) ||
            upazilaBn.includes(token) ||
            districtEn.includes(token) ||
            districtBn.includes(token) ||
            dob.includes(token)
          );
        }

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'nameEn') {
          return a.nameEn.localeCompare(b.nameEn);
        }
        const timeA = new Date(a[sortBy] || a.createdAt).getTime();
        const timeB = new Date(b[sortBy] || b.createdAt).getTime();
        return timeB - timeA;
      });
  }, [records, searchTerm, searchTarget, statusFilter, sortBy]);

  // Helper to highlight matching keywords in text
  const highlightMatch = (text: string | undefined, query: string) => {
    if (!text) return '—';
    const trimmed = query.trim();
    if (!trimmed) return text;

    const regex = new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-amber-200 text-slate-900 rounded-xs px-0.5 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleDelete = (id: string) => {
    onDeleteRecord(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Office Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between text-emerald-950 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></div>
          <div>
            <span className="font-bold font-['Noto_Sans_Bengali']">২নং বহেড়াতৈল ইউনিয়ন পরিষদ ডিজিটাল রেকর্ড সিস্টেম:</span> জন্ম নিবন্ধন সনদ ও অফিশিয়াল প্রত্যয়নপত্র ব্যবস্থাপনা পোর্টাল (সখিপুর, টাঙ্গাইল)।
          </div>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 bg-emerald-200/90 font-mono text-[10px] font-bold text-emerald-900 rounded uppercase">
          BAHERATAIL UP
        </span>
      </div>

      {/* Monthly Analytics Summary Cards & Visual Data Chart Section */}
      <MonthlyAnalyticsChart
        records={records}
        onFilterStatus={(status) => {
          setStatusFilter(status);
          // Scroll smoothly to table if needed
          const tableElement = document.getElementById('recent-records-section');
          if (tableElement) {
            tableElement.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Master Control Panel (MCP) & Automation Fast-Track Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-xl p-4 sm:p-5 border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                AUTOMATION CORE V2.0
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-slate-300 font-mono hidden sm:inline">
                Google Apps Script &bull; Gemini AI &bull; 6-Folder Ontology
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white font-['Noto_Sans_Bengali'] mt-0.5">
              মাস্টার কন্ট্রোল প্যানেল: ২৪-ট্যাগ অটো-ম্যাপিং ও ৬-ধাপ লাইভ পাইপলাইন সিমুলেটর
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              গুগল ফর্ম সাবমিশন থেকে ড্রাইভ ফোল্ডার ও লকড পিডিএফ আর্কাইভাল টেস্ট করুন (&lt; 3.0s SLA)।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenMcp && (
            <button
              onClick={onOpenMcp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md cursor-pointer active:scale-95"
            >
              <Cpu className="w-4 h-4" />
              <span>MCP ড্যাশবোর্ড খুলুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Google Workspace & Firebase Ecosystem Hub */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              Google Workspace &amp; Firebase ক্লাউড সেবা কেন্দ্র (Free Google Ecosystem)
            </h3>
          </div>
          <button
            onClick={() => setShowWorkspaceHub(!showWorkspaceHub)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>{showWorkspaceHub ? 'সংক্ষেপ করুন' : 'বিস্তারিত দেখুন'}</span>
            {showWorkspaceHub ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showWorkspaceHub && (
          <GoogleWorkspaceHub
            records={records}
            onRecordsSynced={onRecordsSynced}
          />
        )}
      </div>

      {/* Main Table Container */}
      <div id="recent-records-section" className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Noto_Sans_Bengali']">
              সাম্প্রতিক জন্ম নিবন্ধন ড্রাফট রেকর্ড (Recent Records)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              প্রোটোটাইপ সনদের তালিকা দেখতে বা সম্পাদনা করতে যেকোনো রেকর্ড নির্বাচন করুন
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-new-record-primary"
              onClick={onNewRecord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition shadow-2xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Record (নতুন রেকর্ড)</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Toolbar */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input Box with Target Selector */}
            <div className="relative flex-1 max-w-xl flex items-stretch shadow-2xs rounded-lg overflow-hidden border border-slate-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 bg-white">
              {/* Target filter dropdown */}
              <select
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value as SearchFieldTarget)}
                className="text-xs bg-slate-100/90 text-slate-700 font-semibold px-2.5 py-2 border-r border-slate-300 focus:outline-hidden cursor-pointer"
                title="সার্চ ফিল্ড সিলেক্ট করুন"
              >
                <option value="all">🔍 সকল তথ্য (All Fields)</option>
                <option value="name">👤 নাগরিকের নাম (Name)</option>
                <option value="referenceId">🆔 রেফারেন্স / BRN (Ref ID)</option>
                <option value="parents">👨‍👩‍👧 পিতা/মাতার নাম (Parents)</option>
                <option value="location">📍 ইউনিয়ন / উপজেলা (Location)</option>
              </select>

              <div className="relative flex-1 flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    searchTarget === 'name'
                      ? 'নাম দিয়ে খুঁজুন (যেমন: আনিসুর / Anisur)...'
                      : searchTarget === 'referenceId'
                      ? 'রেফারেন্স আইডি / BRN দিয়ে খুঁজুন...'
                      : searchTarget === 'parents'
                      ? 'পিতা বা মাতার নাম দিয়ে খুঁজুন...'
                      : searchTarget === 'location'
                      ? 'ইউনিয়ন বা জেলা দিয়ে খুঁজুন...'
                      : 'নাম, রেফারেন্স নম্বর (BRN), পিতা-মাতার নাম বা এলাকা লিখুন...'
                  }
                  className="w-full text-xs pl-3 pr-8 py-2 bg-transparent text-slate-900 focus:outline-hidden"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
                    title="সার্চ ক্লিয়ার করুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter & Sort dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-2 font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden shadow-2xs cursor-pointer"
                >
                  <option value="All">All Statuses ({records.length})</option>
                  <option value="Draft">Draft ({records.filter(r => r.status === 'Draft').length})</option>
                  <option value="Pending Review">Pending Review ({records.filter(r => r.status === 'Pending Review').length})</option>
                  <option value="Verified Demo">Verified Demo ({records.filter(r => r.status === 'Verified Demo').length})</option>
                  <option value="Archived">Archived ({records.filter(r => r.status === 'Archived').length})</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-2 font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden shadow-2xs cursor-pointer"
                >
                  <option value="updatedAt">Recently Updated</option>
                  <option value="createdAt">Creation Date</option>
                  <option value="nameEn">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Active Filter Badges */}
          {(searchTerm || statusFilter !== 'All' || searchTarget !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600">
              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>ফিল্টার ফলাফল:</span>
              </span>
              <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                {filteredRecords.length} টি রেকর্ড পাওয়া গেছে
              </span>

              {searchTerm && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-medium">
                  <span>শব্দ: &quot;{searchTerm}&quot;</span>
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="hover:text-red-700 cursor-pointer font-bold ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {searchTarget !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full font-medium">
                  <span>ফিল্ড: {
                    searchTarget === 'name' ? 'নাগরিকের নাম' :
                    searchTarget === 'referenceId' ? 'রেফারেন্স আইডি' :
                    searchTarget === 'parents' ? 'পিতা/মাতার নাম' : 'ইউনিয়ন/ঠিকানা'
                  }</span>
                  <button 
                    onClick={() => setSearchTarget('all')} 
                    className="hover:text-red-700 cursor-pointer font-bold ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {statusFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-medium">
                  <span>স্ট্যাটাস: {statusFilter}</span>
                  <button 
                    onClick={() => setStatusFilter('All')} 
                    className="hover:text-red-700 cursor-pointer font-bold ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchTarget('all');
                  setStatusFilter('All');
                }}
                className="text-red-600 hover:text-red-800 hover:underline font-semibold ml-auto cursor-pointer"
              >
                রিসেট করুন
              </button>
            </div>
          )}
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Demo Reference / BRN</th>
                <th className="px-4 py-3">Citizen Name (নাম)</th>
                <th className="px-4 py-3">Date of Birth</th>
                <th className="px-4 py-3">Office / Union</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">কোনো রেকর্ড খুঁজে পাওয়া যায়নি</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        &quot;{searchTerm}&quot; শব্দের সাথে মিল রেখে কোনো ড্রাফট পাওয়া যায়নি। সার্চ ফিল্টার রিসেট করুন অথবা নতুন রেকর্ড তৈরি করুন।
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('All');
                          setSearchTarget('all');
                        }}
                        className="mt-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-md font-semibold text-xs hover:bg-emerald-100 transition cursor-pointer"
                      >
                        সার্চ ফিল্টার রিসেট করুন
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isConfirmingDelete = deleteConfirmId === rec.id;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition group">
                      {/* Reference Number */}
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-950 whitespace-nowrap">
                        <span className="bg-slate-100 group-hover:bg-white text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {highlightMatch(rec.referenceId, searchTerm)}
                        </span>
                      </td>

                      {/* Citizen Name */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-['Noto_Sans_Bengali']">
                          {highlightMatch(rec.nameBn, searchTerm)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {highlightMatch(rec.nameEn, searchTerm)}
                        </div>
                        {(rec.fatherNameBn || rec.fatherNameEn) && (
                          <div className="text-[10px] text-slate-400">
                            পিতা: {highlightMatch(rec.fatherNameBn || rec.fatherNameEn, searchTerm)}
                          </div>
                        )}
                      </td>

                      {/* Date of Birth */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-800 font-medium">
                          {formatDateToDisplay(rec.dateOfBirth)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {rec.sex} ({rec.sexBn || (rec.sex === 'Female' ? 'মহিলা' : 'পুরুষ')})
                        </span>
                      </td>

                      {/* Office / Union */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 truncate max-w-[180px]">
                          {highlightMatch(rec.unionParishadEn || rec.unionParishadBn, searchTerm)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {highlightMatch(rec.upazilaEn || rec.upazilaBn, searchTerm)}, {highlightMatch(rec.districtEn || rec.districtBn, searchTerm)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'Draft'
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : rec.status === 'Pending Review'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : rec.status === 'Verified Demo'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>

                      {/* Updated */}
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(rec.updatedAt || rec.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {isConfirmingDelete ? (
                          <div className="inline-flex items-center gap-1.5 bg-red-50 p-1 rounded border border-red-200">
                            <span className="text-[11px] text-red-700 font-semibold px-1">মুছবেন?</span>
                            <button
                              onClick={() => handleDelete(rec.id)}
                              className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-medium hover:bg-slate-300 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => onViewRecord(rec)}
                              title="View Live Certificate Preview"
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditRecord(rec)}
                              title="Edit Form"
                              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded transition cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDuplicateRecord(rec.id)}
                              title="Duplicate Record"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition cursor-pointer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onPrintRecord(rec)}
                              title="Print Certificate Preview"
                              className="p-1.5 text-purple-700 hover:bg-purple-50 rounded transition cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(rec.id)}
                              title="Delete Record"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
          </span>
          <span className="font-mono text-[11px]">
            IndexedDB Local Engine • No Cloud Upload
          </span>
        </div>

      </div>

    </div>
  );
};
