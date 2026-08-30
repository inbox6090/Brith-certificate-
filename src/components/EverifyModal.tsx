import React, { useState } from 'react';
import { DemoRecord } from '../types';
import { parseEverifyContent, validateCertificateRecord, ValidationResult } from '../utils/bdrisParser';
import { 
  Globe, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ClipboardPaste, 
  ArrowRight, 
  X, 
  Search, 
  Copy, 
  Check, 
  ShieldCheck, 
  RefreshCw,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface EverifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (parsedRecord: Partial<DemoRecord>) => void;
  currentRecord?: DemoRecord;
}

const DEMO_E_VERIFY_SAMPLE = `Birth Registration Number : 19879318513121621
Date of Registration : 24/08/2026
Date of Issuance : 27/08/2026
Date of Birth : 05/09/1987
In Word : Fifth of September Nineteen Eighty Seven
Sex : Female (মহিলা)
নাম : সাজেদা আক্তার
Name : Shajeda Akter
মাতা : জাহানারা বেগম
মাতার জাতীয়তা : বাংলাদেশী
Mother : Jahanara Begum
Nationality : Bangladeshi
পিতা : মোঃ শাহজাহান
পিতার জাতীয়তা : বাংলাদেশী
Father : Md Shahjahan
Nationality : Bangladeshi
জন্মস্থান : টাঙ্গাইল, বাংলাদেশ
Place of Birth : Tangail, Bangladesh
স্থায়ী ঠিকানা : ডাবাইল নাগবাড়ী-১৯৭২, ওয়ার্ড - ১, বহেরাতৈল, সখিপুর, টাঙ্গাইল
Permanent Address : Dabail Nagbari-1972, Ward - 1, Baheratail, Sakhipur, Tangail
Office : Baheratail Union Parishad, Sakhipur, Tangail`;

export const EverifyModal: React.FC<EverifyModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
  currentRecord
}) => {
  const [rawInput, setRawInput] = useState('');
  const [brnInput, setBrnInput] = useState(currentRecord?.referenceId || '');
  const [dobInput, setDobInput] = useState(currentRecord?.dateOfBirth || '');
  const [parsedData, setParsedData] = useState<Partial<DemoRecord> | null>(null);
  const [foundFields, setFoundFields] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  if (!isOpen) return null;

  const handleParse = (textToParse: string) => {
    if (!textToParse.trim()) {
      setParsedData(null);
      setFoundFields([]);
      setValidationResult(null);
      return;
    }

    const result = parseEverifyContent(textToParse);
    setParsedData(result.extractedRecord);
    setFoundFields(result.foundFields);

    // Merge with existing record to check overall readiness
    const merged = { ...(currentRecord || {}), ...result.extractedRecord };
    const val = validateCertificateRecord(merged);
    setValidationResult(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawInput(val);
    handleParse(val);
  };

  const handleLoadDemoSample = () => {
    setRawInput(DEMO_E_VERIFY_SAMPLE);
    handleParse(DEMO_E_VERIFY_SAMPLE);
  };

  const handleApply = () => {
    if (!parsedData) return;
    onApplyData(parsedData);
    onClose();
  };

  const handleCopySearchTerms = () => {
    const text = `BRN: ${brnInput} | DOB: ${dobInput}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800/60 rounded-xl border border-emerald-600/40">
              <Globe className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  BDRIS e-Verify অটো-ফিল ও ব্রাউজার ইন্টিগ্রেশন
                </h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  LIVE PARSER
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-mono mt-0.5">
                https://everify.bdris.gov.bd/
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          
          {/* Step 1: Browse Official e-Verify Portal */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">১</span>
                <span>অফিসিয়াল e-Verify পোর্টাল ব্রাউজ ও সার্চ করুন:</span>
              </div>
              <a
                href="https://everify.bdris.gov.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                <span>everify.bdris.gov.bd ওপেন করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              উপরের বাটনে ক্লিক করে BDRIS e-Verify সাইটে ১৭-ডিজিট জন্ম নিবন্ধন নম্বর ও জন্ম তারিখ দিয়ে সার্চ করুন। সার্চ রেজাল্টের টেবিল বা টেক্সট কপি করে নিচের বক্সে পেস্ট করলেই স্বয়ংক্রিয়ভাবে সনদের সকল ফিল্ড পূরণ হয়ে যাবে।
            </p>

            {/* Helper quick copy row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">১৭ ডিজিট BRN:</label>
                <input
                  type="text"
                  value={brnInput}
                  onChange={(e) => setBrnInput(e.target.value)}
                  placeholder="19879318513121621"
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">জন্ম তারিখ (YYYY-MM-DD):</label>
                <input
                  type="text"
                  value={dobInput}
                  onChange={(e) => setDobInput(e.target.value)}
                  placeholder="1987-09-05"
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleCopySearchTerms}
                  className="w-full py-1.5 px-3 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{copied ? 'কপি হয়েছে!' : 'সার্চ তথ্য কপি করুন'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Paste Area & Smart Extractor */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">২</span>
                <span>e-Verify থেকে কপি করা টেক্সট এখানে পেস্ট করুন (Paste Result):</span>
              </div>
              <button
                type="button"
                onClick={handleLoadDemoSample}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>টেস্ট ডেমো ডাটা লোড করুন</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={rawInput}
                onChange={handleInputChange}
                rows={5}
                placeholder="e-Verify পৃষ্ঠার সম্পূর্ণ বা আংশিক টেক্সট কপি করে এখানে পেস্ট করুন (যেমন: Birth Registration Number, নাম, মাতা, পিতা, জন্মস্থান, ইত্যাদি)..."
                className="w-full text-xs sm:text-sm font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition"
              />
              {rawInput && (
                <button
                  onClick={() => {
                    setRawInput('');
                    handleParse('');
                  }}
                  className="absolute top-2.5 right-2.5 p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-md text-xs transition"
                  title="ক্লিয়ার করুন"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Step 3: Parsing Results & Field Mapping Analysis */}
          {parsedData && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-emerald-950 text-sm">
                    সনাক্তকৃত ও পার্স হওয়া তথ্য ({foundFields.length} টি ফিল্ড সক্রিয়):
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>অটো-এক্সট্র্যাক্ট সম্পন্ন</span>
                </div>
              </div>

              {/* Extracted Fields Grid Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {parsedData.referenceId && (
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">১৭ ডিজিট BRN:</span>
                    <span className="font-mono font-bold text-slate-900">{parsedData.referenceId}</span>
                  </div>
                )}

                {parsedData.nameBn && (
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">নাম (বাংলা):</span>
                    <span className="font-bold text-slate-900 font-['Noto_Sans_Bengali']">{parsedData.nameBn}</span>
                  </div>
                )}

                {parsedData.nameEn && (
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Name (English):</span>
                    <span className="font-bold text-slate-900">{parsedData.nameEn}</span>
                  </div>
                )}

                {parsedData.dateOfBirth && (
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">জন্ম তারিখ:</span>
                    <span className="font-mono font-bold text-slate-900">{parsedData.dateOfBirth} ({parsedData.sex || 'N/A'})</span>
                  </div>
                )}

                {parsedData.motherNameBn && (
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">মাতার নাম:</span>
                    <span className="font-medium text-slate-900">{parsedData.motherNameBn} / {parsedData.motherNameEn}</span>
                  </div>
                )}

                {parsedData.fatherNameBn && (
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">পিতার নাম:</span>
                    <span className="font-medium text-slate-900">{parsedData.fatherNameBn} / {parsedData.fatherNameEn}</span>
                  </div>
                )}

                {parsedData.placeOfBirthBn && (
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs sm:col-span-2 md:col-span-3">
                    <span className="text-[10px] text-slate-500 font-semibold block">জন্মস্থান ও স্থায়ী ঠিকানা:</span>
                    <span className="text-slate-800 block">{parsedData.placeOfBirthBn} • {parsedData.permanentAddressBn}</span>
                  </div>
                )}
              </div>

              {/* Validation Status summary */}
              {validationResult && (
                <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  validationResult.isValid 
                    ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}>
                  {validationResult.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  <div>
                    {validationResult.isValid ? (
                      <p className="font-semibold">
                        অভিনন্দন! সনদের সকল বাধ্যতামূলক তথ্য সফলভাবে পূরণ করা হয়েছে। এখন সরাসরি সাবমিট ও ডাউনলোড করা যাবে।
                      </p>
                    ) : (
                      <div>
                        <p className="font-semibold">
                          কিছু অতিরিক্ত ফিল্ড এখনো খালি রয়েছে ({validationResult.issues.length} টি তথ্য বাকি):
                        </p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          ডাটা ফর্মে যুক্ত করার পর বাকি ফিল্ডগুলো আপনি ফর্মে টাইপ করে পূরণ করতে পারবেন। সকল তথ্য পূরণ না হওয়া পর্যন্ত সনদ ডাউনলোড ও সাবমিট সুরক্ষিতভাবে লক থাকবে।
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            বাতিল
          </button>

          <button
            onClick={handleApply}
            disabled={!parsedData || Object.keys(parsedData).length === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white transition shadow-md cursor-pointer ${
              parsedData && Object.keys(parsedData).length > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 active:scale-95'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>সনদে ও ফর্মে অটো-ফিল করুন (Apply Data)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
