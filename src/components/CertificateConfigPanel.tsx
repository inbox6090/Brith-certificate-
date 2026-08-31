import React from 'react';
import { DemoRecord } from '../types';
import { 
  Sliders, 
  Eye, 
  EyeOff, 
  Layout, 
  Square, 
  CheckSquare, 
  Maximize2, 
  RotateCcw, 
  Sparkles, 
  Printer, 
  Stamp, 
  QrCode, 
  Barcode, 
  FileText, 
  User, 
  MapPin, 
  X,
  Palette,
  ShieldCheck,
  Check
} from 'lucide-react';

interface CertificateConfigPanelProps {
  record: DemoRecord;
  onUpdateRecord: (updated: DemoRecord) => void;
  onClose: () => void;
  onPrint?: () => void;
}

export const CertificateConfigPanel: React.FC<CertificateConfigPanelProps> = ({
  record,
  onUpdateRecord,
  onClose,
  onPrint
}) => {
  const currentBorderStyle = record.certificateBorderStyle || 'default';
  const currentBorderColor = record.certificateBorderColor || '#0f172a';

  // Toggle helper
  const handleToggle = (key: keyof DemoRecord, defaultState: boolean = true) => {
    const currentState = record[key] !== undefined ? Boolean(record[key]) : defaultState;
    onUpdateRecord({
      ...record,
      [key]: !currentState
    });
  };

  // Set specific value
  const handleChange = (key: keyof DemoRecord, value: any) => {
    onUpdateRecord({
      ...record,
      [key]: value
    });
  };

  // Preset Configurations
  const applyPreset = (presetName: 'full' | 'stationery' | 'manual_sign' | 'minimal') => {
    switch (presetName) {
      case 'full':
        onUpdateRecord({
          ...record,
          certificateBorderStyle: 'default',
          certificateBorderColor: '#0f172a',
          qrCodeVisible: true,
          barcodeVisible: true,
          topLogoVisible: true,
          watermarkVisible: true,
          headerTitlesVisible: true,
          certificateTitleVisible: true,
          registrationDatesVisible: true,
          registrationNumberVisible: true,
          citizenInfoVisible: true,
          parentInfoVisible: true,
          addressInfoVisible: true,
          assistantSignatureVisible: true,
          assistantSignatureBlockVisible: true,
          registrarSignatureVisible: true,
          registrarSignatureBlockVisible: true,
          footerDisclaimerVisible: true
        });
        break;

      case 'stationery':
        // For pre-printed security stationery sheets
        onUpdateRecord({
          ...record,
          certificateBorderStyle: 'none',
          topLogoVisible: false,
          watermarkVisible: false,
          headerTitlesVisible: false,
          certificateTitleVisible: false,
          footerDisclaimerVisible: false,
          qrCodeVisible: true,
          barcodeVisible: true,
          registrationDatesVisible: true,
          registrationNumberVisible: true,
          citizenInfoVisible: true,
          parentInfoVisible: true,
          addressInfoVisible: true,
          assistantSignatureVisible: true,
          assistantSignatureBlockVisible: true,
          registrarSignatureVisible: true,
          registrarSignatureBlockVisible: true
        });
        break;

      case 'manual_sign':
        // All data on, but digital signatures hidden for manual pen signing & seal stamping
        onUpdateRecord({
          ...record,
          certificateBorderStyle: 'default',
          qrCodeVisible: true,
          barcodeVisible: true,
          topLogoVisible: true,
          watermarkVisible: true,
          headerTitlesVisible: true,
          certificateTitleVisible: true,
          registrationDatesVisible: true,
          registrationNumberVisible: true,
          citizenInfoVisible: true,
          parentInfoVisible: true,
          addressInfoVisible: true,
          assistantSignatureVisible: false,
          assistantSignatureBlockVisible: true,
          registrarSignatureVisible: false,
          registrarSignatureBlockVisible: true,
          footerDisclaimerVisible: true
        });
        break;

      case 'minimal':
        onUpdateRecord({
          ...record,
          certificateBorderStyle: 'default',
          qrCodeVisible: false,
          barcodeVisible: false,
          watermarkVisible: false,
          topLogoVisible: true,
          headerTitlesVisible: true,
          certificateTitleVisible: true,
          registrationDatesVisible: true,
          registrationNumberVisible: true,
          citizenInfoVisible: true,
          parentInfoVisible: true,
          addressInfoVisible: true,
          assistantSignatureVisible: false,
          assistantSignatureBlockVisible: true,
          registrarSignatureVisible: false,
          registrarSignatureBlockVisible: true,
          footerDisclaimerVisible: true
        });
        break;
    }
  };

  const borderStyles = [
    {
      id: 'default',
      nameBn: 'সাধারণ বর্ডার (Default Single)',
      desc: 'স্ট্যান্ডার্ড ১px ক্লিন চারকোল বর্ডার',
      previewClass: 'border border-slate-700'
    },
    {
      id: 'double',
      nameBn: 'অফিসিয়াল ডাবল বর্ডার (Double Line)',
      desc: 'সরকারি সার্টিফিকেটের জন্য স্ট্যান্ডার্ড ডাবল বর্ডার ফ্রেম',
      previewClass: 'border-4 border-double border-slate-800'
    },
    {
      id: 'security_green',
      nameBn: 'সিকিউরিটি গ্রিন বর্ডার (Security Green)',
      desc: 'গাঢ় সবুজ সিকিউরিটি ফ্রেম ও হালকা কর্নার মার্জিন',
      previewClass: 'border-2 border-emerald-800 ring-1 ring-emerald-600'
    },
    {
      id: 'classic',
      nameBn: 'ফরমাল থিক ফ্রেম (Classic Thick)',
      desc: 'গাঢ় ও স্পষ্ট ফরমাল আউটলাইন',
      previewClass: 'border-[3px] border-slate-900'
    },
    {
      id: 'ornamental',
      nameBn: 'অলঙ্কৃত ফ্রেম (Ornamental)',
      desc: 'ডাবল লাইন ও ইনার প্যাডিং ফ্রেম',
      previewClass: 'border-2 border-slate-800 p-0.5 outline outline-1 outline-slate-700'
    },
    {
      id: 'none',
      nameBn: 'বর্ডারহীন (Pre-printed Paper)',
      desc: 'আগে থেকে বর্ডার ও সিল প্রিন্ট করা সিকিউরিটি পেপারের জন্য',
      previewClass: 'border border-dashed border-slate-400 bg-slate-100'
    }
  ];

  const borderColors = [
    { label: 'চারকোল / ব্ল্যাক', value: '#0f172a' },
    { label: 'অফিসিয়াল গ্রিন', value: '#065f46' },
    { label: 'নেভি ব্লু', value: '#1e3a8a' },
    { label: 'বারগান্ডি মেরুন', value: '#831843' },
    { label: 'ব্রোঞ্জ গোল্ডেন', value: '#78350f' }
  ];

  const sections = [
    {
      id: 'qrCodeVisible',
      labelBn: 'কিউআর কোড (QR Code)',
      labelEn: 'Show/Hide QR Code',
      icon: QrCode,
      default: true,
      category: 'Header'
    },
    {
      id: 'barcodeVisible',
      labelBn: 'বারকোড (Barcode)',
      labelEn: 'Show/Hide Code 128 Barcode',
      icon: Barcode,
      default: true,
      category: 'Header'
    },
    {
      id: 'topLogoVisible',
      labelBn: 'সরকারি লোগো/সিল (Top Emblem)',
      labelEn: 'Government Top Logo',
      icon: Stamp,
      default: true,
      category: 'Header'
    },
    {
      id: 'watermarkVisible',
      labelBn: 'পটভূমির জলছাপ (Background Watermark)',
      labelEn: 'Baby Silhouette Watermark',
      icon: Sparkles,
      default: true,
      category: 'Header'
    },
    {
      id: 'headerTitlesVisible',
      labelBn: 'সরকারি ও অফিস শিরোনাম (Header Titles)',
      labelEn: 'Government & Office Titles',
      icon: Layout,
      default: true,
      category: 'Header'
    },
    {
      id: 'certificateTitleVisible',
      labelBn: 'সনদ নাম ও আইন (Rule & Certificate Title)',
      labelEn: 'Rule 9, 10 & Certificate Title',
      icon: FileText,
      default: true,
      category: 'Content'
    },
    {
      id: 'registrationDatesVisible',
      labelBn: 'রেজিস্ট্রেশন ও ইস্যু তারিখ (Dates)',
      labelEn: 'Registration & Issuance Dates',
      icon: FileText,
      default: true,
      category: 'Content'
    },
    {
      id: 'registrationNumberVisible',
      labelBn: '১৭-ডিজিটের BRN নম্বর (Registration No)',
      labelEn: '17-digit Birth Registration Number',
      icon: FileText,
      default: true,
      category: 'Content'
    },
    {
      id: 'citizenInfoVisible',
      labelBn: 'নাগরিকের নাম, জন্ম তারিখ ও লিঙ্গ (Citizen Info)',
      labelEn: 'Name, DOB, Gender',
      icon: User,
      default: true,
      category: 'Content'
    },
    {
      id: 'parentInfoVisible',
      labelBn: 'পিতা-মাতার নাম ও জাতীয়তা (Parent Details)',
      labelEn: 'Father & Mother Details',
      icon: User,
      default: true,
      category: 'Content'
    },
    {
      id: 'addressInfoVisible',
      labelBn: 'জন্মস্থান ও স্থায়ী ঠিকানা (Address & Birthplace)',
      labelEn: 'Birthplace & Permanent Address',
      icon: MapPin,
      default: true,
      category: 'Content'
    },
    {
      id: 'assistantSignatureBlockVisible',
      labelBn: 'প্রশাসনিক কর্মকর্তা ব্লক (Assistant Block)',
      labelEn: 'Left Signature Block & Title',
      icon: Stamp,
      default: true,
      category: 'Signatures'
    },
    {
      id: 'assistantSignatureVisible',
      labelBn: 'প্রশাসনিক কর্মকর্তা স্বাক্ষর ছবি (Assistant Sig Image)',
      labelEn: 'Assistant Digital Signature Image',
      icon: Stamp,
      default: true,
      category: 'Signatures'
    },
    {
      id: 'registrarSignatureBlockVisible',
      labelBn: 'নিবন্ধক/চেয়ারম্যান ব্লক (Registrar Block)',
      labelEn: 'Right Signature Block & Title',
      icon: Stamp,
      default: true,
      category: 'Signatures'
    },
    {
      id: 'registrarSignatureVisible',
      labelBn: 'নিবন্ধক/চেয়ারম্যান স্বাক্ষর ছবি (Registrar Sig Image)',
      labelEn: 'Registrar Digital Signature Image',
      icon: Stamp,
      default: true,
      category: 'Signatures'
    },
    {
      id: 'footerDisclaimerVisible',
      labelBn: 'প্রোটোটাইপ ফুটার সতর্কবার্তা (Footer Disclaimer)',
      labelEn: 'Bottom Prototype Disclaimer',
      icon: ShieldCheck,
      default: true,
      category: 'Footer'
    }
  ];

  return (
    <div className="w-full bg-slate-900 text-slate-100 p-4 sm:p-5 rounded-lg shadow-2xl border border-slate-800 space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <span>সনদ প্রিন্ট ও লেআউট কনফিগারেশন প্যানেল</span>
              <span className="text-[10px] bg-emerald-900 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-700">
                Live Toggle
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              প্রিন্ট বা ডাউনলোডের পূর্বে পছন্দমতো নির্দিষ্ট সেকশন চালু/বন্ধ করুন ও বর্ডার স্টাইল নির্ধারণ করুন।
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="প্যানেল বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Presets Section */}
      <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>এক-ক্লিকে দ্রুত প্রিসেট (Quick Presets):</span>
          </span>
          <button
            onClick={() => applyPreset('full')}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ডিফল্ট রিস্টোর</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => applyPreset('full')}
            className="p-2 text-left rounded-md bg-slate-800 hover:bg-emerald-950/70 border border-slate-700 hover:border-emerald-500 transition cursor-pointer group"
          >
            <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
              <span>📄 পূর্ণাঙ্গ সনদ</span>
              <Check className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">সব সেকশন, লোগো ও বর্ডার অন</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('stationery')}
            className="p-2 text-left rounded-md bg-slate-800 hover:bg-amber-950/70 border border-slate-700 hover:border-amber-500 transition cursor-pointer group"
          >
            <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center justify-between">
              <span>🖨️ প্রি-প্রিন্টেড প্যাড</span>
              <Check className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">বর্ডার ও লোগোহীন (শুধু ডাটা)</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('manual_sign')}
            className="p-2 text-left rounded-md bg-slate-800 hover:bg-blue-950/70 border border-slate-700 hover:border-blue-500 transition cursor-pointer group"
          >
            <div className="text-xs font-bold text-white group-hover:text-blue-300 flex items-center justify-between">
              <span>✍️ হাতে স্বাক্ষরের জন্য</span>
              <Check className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">ডিজিটাল সাইন ছাড়া খালি সাইন-বক্স</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('minimal')}
            className="p-2 text-left rounded-md bg-slate-800 hover:bg-purple-950/70 border border-slate-700 hover:border-purple-500 transition cursor-pointer group"
          >
            <div className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center justify-between">
              <span>🔲 মিনিমাল ডাটা</span>
              <Check className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">QR/বারকোড ও সিল ব্যতীত</div>
          </button>
        </div>
      </div>

      {/* Border Styles Section */}
      <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
            <Square className="w-3.5 h-3.5 text-emerald-400" />
            <span>সনদের বর্ডার স্টাইল (Certificate Border Style):</span>
          </label>

          {/* Border Color selector */}
          {currentBorderStyle !== 'none' && (
            <div className="flex items-center gap-1.5 text-xs">
              <Palette className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400 text-[11px]">কালার:</span>
              <div className="flex items-center gap-1">
                {borderColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleChange('certificateBorderColor', c.value)}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                    className={`w-4 h-4 rounded-full border ${
                      currentBorderColor === c.value
                        ? 'ring-2 ring-emerald-400 border-white scale-110'
                        : 'border-slate-600 opacity-80 hover:opacity-100'
                    } transition cursor-pointer`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {borderStyles.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleChange('certificateBorderStyle', b.id)}
              className={`p-2.5 text-left rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                currentBorderStyle === b.id
                  ? 'bg-emerald-950/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                  : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-white">
                  {b.nameBn}
                </span>
                <div className={`w-5 h-5 rounded-xs ${b.previewClass} shrink-0 ml-1`} />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 leading-tight">
                {b.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Individual Section Visibility Toggles */}
      <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>সনদের নির্দিষ্ট সেকশন অন/অফ (Section Visibility Controls):</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {sections.filter(s => record[s.id as keyof DemoRecord] !== false).length} / {sections.length} টি দৃশ্যমান
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isVisible = record[sec.id as keyof DemoRecord] !== false;

            return (
              <div
                key={sec.id}
                onClick={() => handleToggle(sec.id as keyof DemoRecord, sec.default)}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer select-none ${
                  isVisible
                    ? 'bg-slate-800 border-slate-700 hover:border-emerald-600'
                    : 'bg-slate-900/60 border-slate-800/80 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-md ${isVisible ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-semibold truncate ${isVisible ? 'text-slate-200' : 'text-slate-400 line-through'}`}>
                      {sec.labelBn}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {sec.labelEn}
                    </div>
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ml-2 ${
                  isVisible
                    ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isVisible ? 'দৃশ্যমান (ON)' : 'গোপন (OFF)'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>পরিবর্তনগুলো লাইভ সনদে সাথে সাথেই প্রতিফলিত হবে।</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition cursor-pointer"
          >
            প্যানেল সম্পন্ন
          </button>

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
