import React, { useRef } from 'react';
import { DemoRecord } from '../types';
import { 
  Sliders, 
  Upload, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Image as ImageIcon, 
  Sparkles,
  Maximize2,
  Minimize2,
  Layers,
  X
} from 'lucide-react';

interface LogoWatermarkControllerProps {
  record: DemoRecord;
  onUpdateRecord: (updated: DemoRecord) => void;
  onClose?: () => void;
}

export const LogoWatermarkController: React.FC<LogoWatermarkControllerProps> = ({
  record,
  onUpdateRecord,
  onClose
}) => {
  const topLogoFileInputRef = useRef<HTMLInputElement>(null);
  const watermarkFileInputRef = useRef<HTMLInputElement>(null);

  // Top Logo values with defaults
  const topLogoSize = record.topLogoSize ?? 56;
  const topLogoOpacity = record.topLogoOpacity ?? 100;
  const topLogoVisible = record.topLogoVisible ?? true;
  const topLogoUrl = record.topLogoUrl || '';

  // Watermark values with defaults
  const watermarkSize = record.watermarkSize ?? 420;
  const watermarkOpacity = record.watermarkOpacity ?? 20;
  const watermarkVisible = record.watermarkVisible ?? true;
  const watermarkUrl = record.watermarkUrl || '';

  // Handle Top Logo upload
  const handleTopLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdateRecord({
          ...record,
          topLogoUrl: result,
          topLogoVisible: true
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Watermark upload
  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdateRecord({
          ...record,
          watermarkUrl: result,
          watermarkVisible: true
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-4 sm:p-6 rounded-xl border border-slate-700 shadow-2xl space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600/30 text-emerald-400 rounded-lg border border-emerald-500/40">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              লোগো ও জলছাপ নিয়ন্ত্রণ (Logo &amp; Watermark Settings)
            </h3>
            <p className="text-xs text-slate-400">
              উপরের লোগো এবং পেছনের জলছাপ আপলোড করুন, সাইজ বড়/ছোট ও দৃশ্যমানতা (অস্বচ্ছতা) নিয়ন্ত্রণ করুন
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ================= 1. TOP LOGO CONTROLS ================= */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm text-slate-100">
                  ১. উপরের প্রধান লোগো (Top Header Logo)
                </span>
              </div>
              
              {/* Visibility Toggle */}
              <button
                type="button"
                onClick={() => onUpdateRecord({ ...record, topLogoVisible: !topLogoVisible })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer border ${
                  topLogoVisible
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/40'
                    : 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/40'
                }`}
              >
                {topLogoVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{topLogoVisible ? 'দৃশ্যমান (Visible)' : 'লুকানো (Hidden)'}</span>
              </button>
            </div>

            {/* Current Top Logo Preview & Upload Actions */}
            <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="w-16 h-16 bg-slate-950 rounded-lg flex items-center justify-center p-1 border border-slate-700 shrink-0 overflow-hidden relative">
                {topLogoUrl ? (
                  <img src={topLogoUrl} alt="Top Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-[10px] text-center font-medium text-emerald-400 font-sans leading-tight">
                    ডিফল্ট সরকারি প্রতীক
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={topLogoFileInputRef}
                  onChange={handleTopLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => topLogoFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>নতুন লোগো আপলোড</span>
                  </button>

                  {topLogoUrl && (
                    <button
                      type="button"
                      onClick={() => onUpdateRecord({ ...record, topLogoUrl: undefined })}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
                      title="Revert to Default Official Emblem"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>ডিফল্ট প্রতীক</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">PNG, JPG, SVG বা যেকোনো লোগো সাপোর্ট করে</p>
              </div>
            </div>

            {/* Top Logo Size Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" /> লোগোর সাইজ (Size):
                </span>
                <span className="font-mono font-semibold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {topLogoSize}px
                </span>
              </div>
              <input
                type="range"
                min="24"
                max="130"
                step="2"
                value={topLogoSize}
                onChange={(e) => onUpdateRecord({ ...record, topLogoSize: Number(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between gap-1 pt-1">
                {[
                  { label: 'ছোট (40px)', val: 40 },
                  { label: 'আদর্শ (56px)', val: 56 },
                  { label: 'মাঝারি (70px)', val: 70 },
                  { label: 'বড় (90px)', val: 90 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => onUpdateRecord({ ...record, topLogoSize: preset.val })}
                    className={`px-2 py-1 text-[10px] rounded border transition cursor-pointer ${
                      topLogoSize === preset.val
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Logo Opacity / Visibility Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" /> দৃশ্যমানতা / অস্বচ্ছতা (Opacity):
                </span>
                <span className="font-mono font-semibold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {topLogoOpacity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={topLogoOpacity}
                onChange={(e) => onUpdateRecord({ ...record, topLogoOpacity: Number(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between gap-1 pt-1">
                {[
                  { label: 'হালকা (30%)', val: 30 },
                  { label: 'মাঝারি (60%)', val: 60 },
                  { label: 'স্পষ্ট (85%)', val: 85 },
                  { label: '১০০% দৃশ্যমান', val: 100 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => onUpdateRecord({ ...record, topLogoOpacity: preset.val })}
                    className={`px-2 py-1 text-[10px] rounded border transition cursor-pointer ${
                      topLogoOpacity === preset.val
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. WATERMARK CONTROLS ================= */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-sm text-slate-100">
                  ২. বডির পেছনের ওয়াটারমার্ক (Background Watermark)
                </span>
              </div>
              
              {/* Visibility Toggle */}
              <button
                type="button"
                onClick={() => onUpdateRecord({ ...record, watermarkVisible: !watermarkVisible })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer border ${
                  watermarkVisible
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500/50 hover:bg-amber-500/40'
                    : 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/40'
                }`}
              >
                {watermarkVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{watermarkVisible ? 'দৃশ্যমান (Visible)' : 'লুকানো (Hidden)'}</span>
              </button>
            </div>

            {/* Current Watermark Preview & Upload Actions */}
            <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="w-16 h-16 bg-slate-950 rounded-lg flex items-center justify-center p-1 border border-slate-700 shrink-0 overflow-hidden relative">
                {watermarkUrl ? (
                  <img src={watermarkUrl} alt="Watermark" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-[10px] text-center font-medium text-amber-400 font-sans leading-tight">
                    ডিফল্ট BDRIS সিলমোহর
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={watermarkFileInputRef}
                  onChange={handleWatermarkUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => watermarkFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>নতুন জলছাপ আপলোড</span>
                  </button>

                  {watermarkUrl && (
                    <button
                      type="button"
                      onClick={() => onUpdateRecord({ ...record, watermarkUrl: undefined })}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
                      title="Revert to Default Official Seal"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>ডিফল্ট সিল</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">ইউনিয়ন পরিষদ সিল বা যেকোনো জলছাপ ছবি</p>
              </div>
            </div>

            {/* Watermark Size Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" /> জলছাপের সাইজ (Size):
                </span>
                <span className="font-mono font-semibold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {watermarkSize}px
                </span>
              </div>
              <input
                type="range"
                min="150"
                max="650"
                step="10"
                value={watermarkSize}
                onChange={(e) => onUpdateRecord({ ...record, watermarkSize: Number(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between gap-1 pt-1">
                {[
                  { label: 'ছোট (280px)', val: 280 },
                  { label: 'আদর্শ (420px)', val: 420 },
                  { label: 'মাঝারি (500px)', val: 500 },
                  { label: 'বড় (600px)', val: 600 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => onUpdateRecord({ ...record, watermarkSize: preset.val })}
                    className={`px-2 py-1 text-[10px] rounded border transition cursor-pointer ${
                      watermarkSize === preset.val
                        ? 'bg-amber-600 text-white border-amber-500 font-bold'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark Opacity / Lightness Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" /> হালকা/গাঢ় দৃশ্যমানতা (Opacity):
                </span>
                <span className="font-mono font-semibold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {watermarkOpacity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={watermarkOpacity}
                onChange={(e) => onUpdateRecord({ ...record, watermarkOpacity: Number(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between gap-1 pt-1">
                {[
                  { label: 'খুব হালকা (10%)', val: 10 },
                  { label: 'অফিশিয়াল হালকা (20%)', val: 20 },
                  { label: 'মাঝারি (45%)', val: 45 },
                  { label: 'গাঢ় (80%)', val: 80 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => onUpdateRecord({ ...record, watermarkOpacity: preset.val })}
                    className={`px-2 py-1 text-[10px] rounded border transition cursor-pointer ${
                      watermarkOpacity === preset.val
                        ? 'bg-amber-600 text-white border-amber-500 font-bold'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Reset All Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>পরিবর্তনসমূহ সনদের সাথে সাথে স্বয়ংক্রিয়ভাবে সংরক্ষিত ও প্রিভিউ হচ্ছে</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onUpdateRecord({
              ...record,
              topLogoUrl: undefined,
              topLogoSize: 56,
              topLogoOpacity: 100,
              topLogoVisible: true,
              watermarkUrl: undefined,
              watermarkSize: 420,
              watermarkOpacity: 20,
              watermarkVisible: true
            });
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>সবকিছু পূর্বনির্ধারিত মানে রিসেট (Reset Defaults)</span>
        </button>
      </div>
    </div>
  );
};
