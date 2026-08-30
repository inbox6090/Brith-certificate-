import React from 'react';
import { DemoRecord } from '../types';
import { Check, ShieldCheck, FileText, Sliders, X, Sparkles, Stamp } from 'lucide-react';

interface CertifiedCopyOverlayProps {
  record: DemoRecord;
}

export const CertifiedCopyOverlay: React.FC<CertifiedCopyOverlayProps> = ({ record }) => {
  const overlayType = record.printOverlayType || 'NONE';

  if (overlayType === 'NONE') {
    return null;
  }

  const textEn = record.printOverlayTextEn || (
    overlayType === 'CERTIFIED_COPY' ? 'CERTIFIED TRUE COPY' :
    overlayType === 'DRAFT' ? 'DRAFT COPY - NOT FOR LEGAL USE' :
    overlayType === 'OFFICE_COPY' ? 'OFFICE RECORD COPY' :
    overlayType === 'DUPLICATE' ? 'DUPLICATE COPY' : 'CERTIFIED COPY'
  );

  const textBn = record.printOverlayTextBn || (
    overlayType === 'CERTIFIED_COPY' ? 'সত্যায়িত অনুলিপি' :
    overlayType === 'DRAFT' ? 'খসড়া কপি - চূড়ান্ত সনদের পূর্বরূপ' :
    overlayType === 'OFFICE_COPY' ? 'অফিস নথি অনুলিপি' :
    overlayType === 'DUPLICATE' ? 'দ্বিতীয় অনুলিপি' : 'সত্যায়িত কপি'
  );

  const subtext = record.printOverlaySubtext || `${record.unionParishadEn || 'Baheratail Union Parishad'}`;
  const color = record.printOverlayColor || (overlayType === 'DRAFT' ? 'amber' : 'red');
  const style = record.printOverlayStyle || 'both'; // 'stamp' | 'diagonal' | 'both'
  const position = record.printOverlayPosition || 'top-right';
  const showDate = record.printOverlayShowDate !== false;
  const dateStr = record.printOverlayDate || record.dateOfIssuance || new Date().toLocaleDateString('en-GB');

  // Color classes
  const colorStyles = {
    red: {
      border: 'border-red-600',
      text: 'text-red-700',
      bg: 'bg-red-50/70',
      watermark: 'rgba(220, 38, 38, 0.12)',
      watermarkText: 'text-red-600/15',
      badge: 'bg-red-600 text-white',
      accent: 'border-red-500'
    },
    blue: {
      border: 'border-blue-700',
      text: 'text-blue-800',
      bg: 'bg-blue-50/70',
      watermark: 'rgba(29, 78, 216, 0.12)',
      watermarkText: 'text-blue-600/15',
      badge: 'bg-blue-700 text-white',
      accent: 'border-blue-500'
    },
    green: {
      border: 'border-emerald-700',
      text: 'text-emerald-800',
      bg: 'bg-emerald-50/70',
      watermark: 'rgba(5, 150, 105, 0.12)',
      watermarkText: 'text-emerald-600/15',
      badge: 'bg-emerald-700 text-white',
      accent: 'border-emerald-500'
    },
    amber: {
      border: 'border-amber-700',
      text: 'text-amber-900',
      bg: 'bg-amber-50/70',
      watermark: 'rgba(217, 119, 6, 0.14)',
      watermarkText: 'text-amber-600/15',
      badge: 'bg-amber-700 text-white',
      accent: 'border-amber-500'
    }
  }[color];

  // Position classes for the Stamp box
  const positionClasses = {
    'top-right': 'top-2.5 right-2.5 rotate-[-2.5deg]',
    'top-left': 'top-2.5 left-2.5 rotate-[2deg]',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-5deg]',
    'bottom-right': 'bottom-16 right-4 rotate-[-3deg]'
  }[position];

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
      
      {/* 1. DIAGONAL WATERMARK OVERLAY (Large text across sheet) */}
      {(style === 'diagonal' || style === 'both') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-90">
          <div className="transform -rotate-[35deg] text-center space-y-1 pointer-events-none select-none">
            <div 
              className={`text-[52px] sm:text-[68px] font-extrabold uppercase tracking-widest font-mono ${colorStyles.watermarkText} whitespace-nowrap leading-none`}
              style={{
                textShadow: '0 0 1px currentColor',
                letterSpacing: '0.18em'
              }}
            >
              {textEn}
            </div>
            <div 
              className={`text-[22px] sm:text-[30px] font-bold font-['Noto_Sans_Bengali'] ${colorStyles.watermarkText} tracking-wider`}
            >
              {textBn}
            </div>
          </div>
        </div>
      )}

      {/* 2. AUTHENTIC OFFICIAL STAMP BADGE (Crisp Physical Stamp Box with double borders) */}
      {(style === 'stamp' || style === 'both') && (
        <div className={`absolute ${positionClasses} pointer-events-none transition-transform duration-200`}>
          <div 
            className={`relative p-1.5 border-[2.5px] border-double ${colorStyles.border} rounded-md shadow-2xs ${colorStyles.bg} backdrop-blur-[0.5px] max-w-[240px] text-center`}
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.8) inset',
            }}
          >
            {/* Inner frame border */}
            <div className={`border border-dashed ${colorStyles.accent} px-2.5 py-1.5 rounded-xs space-y-0.5`}>
              
              {/* Header Star & English Title */}
              <div className="flex items-center justify-center gap-1">
                <span className={`text-[9px] font-mono ${colorStyles.text}`}>★</span>
                <span className={`text-[11px] font-black tracking-wider uppercase font-mono ${colorStyles.text}`}>
                  {textEn.replace(/ - .*/, '')}
                </span>
                <span className={`text-[9px] font-mono ${colorStyles.text}`}>★</span>
              </div>

              {/* Bengali Text */}
              {textBn && (
                <div className={`text-[10.5px] font-bold font-['Noto_Sans_Bengali'] ${colorStyles.text} leading-tight`}>
                  {textBn.replace(/ - .*/, '')}
                </div>
              )}

              {/* Authority / Organization Subtext */}
              {subtext && (
                <div className={`text-[8.5px] font-semibold uppercase tracking-tight ${colorStyles.text} opacity-90 border-t border-dotted ${colorStyles.accent} pt-0.5 mt-0.5`}>
                  {subtext}
                </div>
              )}

              {/* Date & Ref Tag */}
              {showDate && (
                <div className={`text-[8px] font-mono ${colorStyles.text} opacity-85 pt-0.5 flex items-center justify-between px-1`}>
                  <span>ATTESTED</span>
                  <span>{dateStr}</span>
                </div>
              )}
            </div>

            {/* Official Stamp Corner Markers */}
            <div className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 ${colorStyles.border}`} />
            <div className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 ${colorStyles.border}`} />
            <div className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 ${colorStyles.border}`} />
            <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 ${colorStyles.border}`} />
          </div>
        </div>
      )}

      {/* 3. TOP-HEADER MINI BANNER STRIP (Optional print mark) */}
      {overlayType === 'CERTIFIED_COPY' && (
        <div className="absolute top-0 left-0 right-0 h-4 bg-red-600/10 border-b border-red-600/30 flex items-center justify-between px-4 text-[8.5px] font-mono font-bold text-red-800 uppercase tracking-widest">
          <span>GOVT. ATTESTED / OFFICIAL CERTIFIED COPY</span>
          <span>BDRIS VERIFIED RECORD</span>
          <span>REF: {record.referenceId}</span>
        </div>
      )}

      {overlayType === 'DRAFT' && (
        <div className="absolute top-0 left-0 right-0 h-4 bg-amber-500/15 border-b border-amber-600/40 flex items-center justify-between px-4 text-[8.5px] font-mono font-bold text-amber-900 uppercase tracking-widest">
          <span>OFFICIAL DRAFT RECORD / খসড়া সংস্করণ</span>
          <span>FOR REVIEW &amp; PREVIEW ONLY</span>
          <span>NOT A LEGAL DOCUMENT</span>
        </div>
      )}

    </div>
  );
};

interface CertifiedCopyControllerProps {
  record: DemoRecord;
  onChange: (updatedFields: Partial<DemoRecord>) => void;
  onClose?: () => void;
}

export const CertifiedCopyController: React.FC<CertifiedCopyControllerProps> = ({
  record,
  onChange,
  onClose
}) => {
  const currentType = record.printOverlayType || 'NONE';

  const applyPreset = (preset: 'NONE' | 'CERTIFIED_COPY' | 'DRAFT' | 'OFFICE_COPY' | 'DUPLICATE') => {
    if (preset === 'NONE') {
      onChange({
        printOverlayType: 'NONE'
      });
      return;
    }

    if (preset === 'CERTIFIED_COPY') {
      onChange({
        printOverlayType: 'CERTIFIED_COPY',
        printOverlayTextEn: 'CERTIFIED TRUE COPY',
        printOverlayTextBn: 'সত্যায়িত অনুলিপি',
        printOverlaySubtext: record.unionParishadEn || 'Baheratail Union Parishad',
        printOverlayColor: 'red',
        printOverlayStyle: 'both',
        printOverlayPosition: 'top-right',
        printOverlayShowDate: true,
        printOverlayDate: record.dateOfIssuance || new Date().toLocaleDateString('en-GB')
      });
    } else if (preset === 'DRAFT') {
      onChange({
        printOverlayType: 'DRAFT',
        printOverlayTextEn: 'DRAFT COPY',
        printOverlayTextBn: 'খসড়া অনুলিপি',
        printOverlaySubtext: 'For Verification & Review Only',
        printOverlayColor: 'amber',
        printOverlayStyle: 'both',
        printOverlayPosition: 'top-right',
        printOverlayShowDate: true,
        printOverlayDate: record.dateOfIssuance || new Date().toLocaleDateString('en-GB')
      });
    } else if (preset === 'OFFICE_COPY') {
      onChange({
        printOverlayType: 'OFFICE_COPY',
        printOverlayTextEn: 'OFFICE RECORD COPY',
        printOverlayTextBn: 'অফিস নথি অনুলিপি',
        printOverlaySubtext: record.unionParishadEn || 'Baheratail Union Parishad',
        printOverlayColor: 'blue',
        printOverlayStyle: 'stamp',
        printOverlayPosition: 'top-right',
        printOverlayShowDate: true,
        printOverlayDate: record.dateOfIssuance || new Date().toLocaleDateString('en-GB')
      });
    } else if (preset === 'DUPLICATE') {
      onChange({
        printOverlayType: 'DUPLICATE',
        printOverlayTextEn: 'DUPLICATE COPY',
        printOverlayTextBn: 'দ্বিতীয় অনুলিপি',
        printOverlaySubtext: record.unionParishadEn || 'Baheratail Union Parishad',
        printOverlayColor: 'red',
        printOverlayStyle: 'both',
        printOverlayPosition: 'top-right',
        printOverlayShowDate: true,
        printOverlayDate: record.dateOfIssuance || new Date().toLocaleDateString('en-GB')
      });
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg shadow-xl border border-slate-800 space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-red-950 border border-red-700 flex items-center justify-center text-red-400">
            <Stamp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              Draft / Certified Copy Visual Overlays
              <span className="text-[10px] bg-red-900/60 text-red-300 border border-red-700/60 px-1.5 py-0.5 rounded font-mono">
                Print State
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              সনদে লাল কালির সত্যায়িত সিল (Certified Copy) বা খসড়া জলছাপ টগল করুন
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick 1-Click Mode Presets */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          ১-ক্লিক ভিজ্যুয়াল স্ট্যাটাস নির্বাচন (Quick Preset):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          
          {/* None / Original */}
          <button
            type="button"
            onClick={() => applyPreset('NONE')}
            className={`p-2 rounded-md border text-left flex flex-col justify-between transition cursor-pointer ${
              currentType === 'NONE'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-1 ring-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">অরিজিনাল (Clean)</span>
              {currentType === 'NONE' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">কোনো সিল বা ওয়াটারমার্ক ছাড়া</span>
          </button>

          {/* Certified Copy */}
          <button
            type="button"
            onClick={() => applyPreset('CERTIFIED_COPY')}
            className={`p-2 rounded-md border text-left flex flex-col justify-between transition cursor-pointer ${
              currentType === 'CERTIFIED_COPY'
                ? 'bg-red-950/80 border-red-500 text-red-100 ring-1 ring-red-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400">🔴 Certified Copy</span>
              {currentType === 'CERTIFIED_COPY' && <Check className="w-3.5 h-3.5 text-red-400" />}
            </div>
            <span className="text-[10px] text-red-300/80 mt-1">সত্যায়িত অনুলিপি (Red Stamp)</span>
          </button>

          {/* Draft Copy */}
          <button
            type="button"
            onClick={() => applyPreset('DRAFT')}
            className={`p-2 rounded-md border text-left flex flex-col justify-between transition cursor-pointer ${
              currentType === 'DRAFT'
                ? 'bg-amber-950/80 border-amber-500 text-amber-100 ring-1 ring-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">🟡 Draft Copy</span>
              {currentType === 'DRAFT' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <span className="text-[10px] text-amber-300/80 mt-1">অফিসিয়াল খসড়া সংস্করণ</span>
          </button>

          {/* Office Copy */}
          <button
            type="button"
            onClick={() => applyPreset('OFFICE_COPY')}
            className={`p-2 rounded-md border text-left flex flex-col justify-between transition cursor-pointer ${
              currentType === 'OFFICE_COPY'
                ? 'bg-blue-950/80 border-blue-500 text-blue-100 ring-1 ring-blue-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400">🔵 Office Copy</span>
              {currentType === 'OFFICE_COPY' && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <span className="text-[10px] text-blue-300/80 mt-1">অফিস নথি অনুলিপি</span>
          </button>

          {/* Duplicate Copy */}
          <button
            type="button"
            onClick={() => applyPreset('DUPLICATE')}
            className={`p-2 rounded-md border text-left flex flex-col justify-between transition cursor-pointer ${
              currentType === 'DUPLICATE'
                ? 'bg-purple-950/80 border-purple-500 text-purple-100 ring-1 ring-purple-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">🟣 Duplicate</span>
              {currentType === 'DUPLICATE' && <Check className="w-3.5 h-3.5 text-purple-400" />}
            </div>
            <span className="text-[10px] text-purple-300/80 mt-1">দ্বিতীয় অনুলিপি</span>
          </button>

        </div>
      </div>

      {/* Advanced Customization (When overlay is active) */}
      {currentType !== 'NONE' && (
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-red-400" />
              সিল ও টেক্সট কাস্টমাইজেশন (Custom Settings)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* English Stamp Text */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                ইংরেজি টেক্সট (English Stamp Text):
              </label>
              <input
                type="text"
                value={record.printOverlayTextEn || ''}
                onChange={(e) => onChange({ printOverlayTextEn: e.target.value.toUpperCase() })}
                placeholder="CERTIFIED TRUE COPY"
                className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-slate-600 rounded bg-slate-900 text-white focus:ring-1 focus:ring-red-400 focus:outline-hidden"
              />
            </div>

            {/* Bengali Stamp Text */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                বাংলা টেক্সট (Bengali Stamp Text):
              </label>
              <input
                type="text"
                value={record.printOverlayTextBn || ''}
                onChange={(e) => onChange({ printOverlayTextBn: e.target.value })}
                placeholder="সত্যায়িত অনুলিপি"
                className="w-full text-xs font-bold font-['Noto_Sans_Bengali'] px-2.5 py-1.5 border border-slate-600 rounded bg-slate-900 text-white focus:ring-1 focus:ring-red-400 focus:outline-hidden"
              />
            </div>

            {/* Authority Subtext */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                কর্তৃপক্ষ / কার্যালয় (Authority Subtext):
              </label>
              <input
                type="text"
                value={record.printOverlaySubtext || ''}
                onChange={(e) => onChange({ printOverlaySubtext: e.target.value })}
                placeholder="Baheratail Union Parishad"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-600 rounded bg-slate-900 text-white focus:ring-1 focus:ring-red-400 focus:outline-hidden"
              />
            </div>

            {/* Stamp Date */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                সত্যায়নের তারিখ (Attestation Date):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={record.printOverlayDate || record.dateOfIssuance || ''}
                  onChange={(e) => onChange({ printOverlayDate: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-600 rounded bg-slate-900 text-white focus:ring-1 focus:ring-red-400 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => onChange({ printOverlayDate: new Date().toLocaleDateString('en-GB') })}
                  className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1.5 rounded whitespace-nowrap cursor-pointer"
                >
                  আজকের তারিখ
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700">
            {/* Color selection */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">কালার (Color):</label>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'red', name: 'Red', bg: 'bg-red-600' },
                  { id: 'blue', name: 'Blue', bg: 'bg-blue-600' },
                  { id: 'green', name: 'Green', bg: 'bg-emerald-600' },
                  { id: 'amber', name: 'Amber', bg: 'bg-amber-600' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onChange({ printOverlayColor: c.id as any })}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer ${
                      (record.printOverlayColor || 'red') === c.id
                        ? 'bg-slate-700 text-white ring-1 ring-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Style */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">প্রদর্শন ধরন (Overlay Style):</label>
              <select
                value={record.printOverlayStyle || 'both'}
                onChange={(e) => onChange({ printOverlayStyle: e.target.value as any })}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-600 rounded bg-slate-900 text-white focus:ring-1 focus:ring-red-400 focus:outline-hidden"
              >
                <option value="both">সিল ও ডায়াগনাল জলছাপ দুটোই (Both)</option>
                <option value="stamp">শুধু সিল বক্স (Stamp Box Only)</option>
                <option value="diagonal">শুধু ডায়াগনাল জলছাপ (Diagonal Only)</option>
              </select>
            </div>

            {/* Stamp Position */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">সিলের অবস্থান (Position):</label>
              <select
                value={record.printOverlayPosition || 'top-right'}
                onChange={(e) => onChange({ printOverlayPosition: e.target.value as any })}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-600 rounded bg-slate-900 text-white focus:ring-1 focus:ring-red-400 focus:outline-hidden"
              >
                <option value="top-right">উপরে ডান কোণায় (Top Right)</option>
                <option value="top-left">উপরে বাম কোণায় (Top Left)</option>
                <option value="bottom-right">নিচে ডানে (Bottom Right)</option>
                <option value="center">মাঝখানে (Center)</option>
              </select>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
