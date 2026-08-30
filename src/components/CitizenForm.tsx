import React, { useState, useEffect } from 'react';
import { DemoRecord, RecordStatus } from '../types';
import { 
  convertDateToEnglishWords, 
  convertDateToBengaliWords, 
  formatPlaceOfBirthBn,
  formatPlaceOfBirthEn,
  composePermanentAddressBn,
  composePermanentAddressEn,
  ensureBaheratailAddressBn,
  ensureBaheratailAddressEn,
  BAHERATAIL_SUFFIX_BN,
  BAHERATAIL_SUFFIX_EN,
  FIXED_UNION_PARISHAD_BN,
  FIXED_UNION_PARISHAD_EN,
  FIXED_UPAZILA_DISTRICT_BN,
  FIXED_UPAZILA_DISTRICT_EN,
  DEFAULT_ASSISTANT_TITLE_EN,
  DEFAULT_ASSISTANT_TITLE_BN,
  DEFAULT_REGISTRAR_TITLE_EN,
  generateDemoReferenceNumber,
  toBengaliDigits,
  toEnglishDigits,
  DEFAULT_BDRIS_VERIFY_KEY,
  generateBdrisVerifyKey,
  getBdrisVerificationUrl
} from '../utils/numberToWords';
import { validateCertificateRecord, ValidationIssue } from '../utils/bdrisParser';
import { ValidationGuardModal } from './ValidationGuardModal';
import { LogoWatermarkController } from './LogoWatermarkController';
import { CertifiedCopyController } from './CertifiedCopyOverlay';
import { SignaturePadModal } from './SignaturePadModal';
import { 
  Save, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Building2, 
  User, 
  Users, 
  MapPin, 
  Calendar, 
  FileText,
  FileCheck2,
  Sliders,
  ChevronDown,
  ChevronUp,
  QrCode,
  Key,
  Link as LinkIcon,
  Barcode,
  Globe,
  Check,
  AlertTriangle,
  Stamp,
  PenTool,
  FileSignature,
  Upload,
  Trash2,
  Image as ImageIcon,
  RotateCw,
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react';

interface CitizenFormProps {
  initialRecord: DemoRecord;
  onSave: (record: DemoRecord) => void;
  onPrint: () => void;
  onReset: () => void;
  onOpenEverify?: () => void;
}

export const CitizenForm: React.FC<CitizenFormProps> = ({
  initialRecord,
  onSave,
  onPrint,
  onReset,
  onOpenEverify
}) => {
  const [formData, setFormData] = useState<DemoRecord>(initialRecord);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showLogoSection, setShowLogoSection] = useState<boolean>(false);
  const [showQrSection, setShowQrSection] = useState<boolean>(true);
  const [showCertifiedSection, setShowCertifiedSection] = useState<boolean>(false);
  const [showSignatureSection, setShowSignatureSection] = useState<boolean>(true);
  const [validationModalOpen, setValidationModalOpen] = useState<boolean>(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  
  // Digital Signature Pad Modal State
  const [signatureModalOpen, setSignatureModalOpen] = useState<boolean>(false);
  const [activeSignatureTarget, setActiveSignatureTarget] = useState<'assistant' | 'registrar'>('registrar');

  // Auto Generate Verification Key
  const handleAutoGenerateKey = () => {
    const newKey = generateBdrisVerifyKey();
    const newUrl = getBdrisVerificationUrl(newKey);
    setFormData((prev) => ({
      ...prev,
      qrVerificationKey: newKey,
      qrVerificationUrl: newUrl
    }));
  };

  // Reset to Default BDRIS Key
  const handleResetToDefaultKey = () => {
    setFormData((prev) => ({
      ...prev,
      qrVerificationKey: DEFAULT_BDRIS_VERIFY_KEY,
      qrVerificationUrl: `https://bdris.gov.bd/certificate/verify?key=${DEFAULT_BDRIS_VERIFY_KEY}`,
      qrReferenceCode: prev.qrReferenceCode || 'EETT'
    }));
  };

  // Sync internal state when initialRecord changes
  useEffect(() => {
    setFormData(initialRecord);
    setErrors({});
    setSaveStatus('idle');
  }, [initialRecord]);

  // Handle generic field change with smart auto-formatting
  const handleChange = (field: keyof DemoRecord, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // 1. Auto compute DOB in words (both English and Bengali) in official format whenever date changes
      if (field === 'dateOfBirth') {
        updated.dateOfBirthWordsEn = convertDateToEnglishWords(value);
        updated.dateOfBirthWordsBn = convertDateToBengaliWords(value);
      }

      // 2. Auto update permanent address (Bengali) when village, ward or post office is typed
      if (field === 'villageBn' || field === 'wardBn' || field === 'postOfficeBn') {
        const vBn = field === 'villageBn' ? value : prev.villageBn || '';
        const wBn = field === 'wardBn' ? value : prev.wardBn || '';
        const pBn = field === 'postOfficeBn' ? value : prev.postOfficeBn || '';
        updated.permanentAddressBn = composePermanentAddressBn(vBn, wBn, pBn);
      }

      // 3. Auto update permanent address (English) when village, ward or post office is typed
      if (field === 'villageEn' || field === 'wardEn' || field === 'postOfficeEn') {
        const vEn = field === 'villageEn' ? value : prev.villageEn || '';
        const wEn = field === 'wardEn' ? value : prev.wardEn || '';
        const pEn = field === 'postOfficeEn' ? value : prev.postOfficeEn || '';
        updated.permanentAddressEn = composePermanentAddressEn(vEn, wEn, pEn);
      }

      // Sync Sex Bn / En
      if (field === 'sex') {
        if (value === 'Male') updated.sexBn = 'পুরুষ';
        else if (value === 'Female') updated.sexBn = 'মহিলা';
        else updated.sexBn = 'অন্যান্য';
      }

      return updated;
    });

    // Clear error for that field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Helper to re-compose permanent address from sub-fields with fixed suffix
  const autoComposeAddress = () => {
    setFormData((prev) => ({
      ...prev,
      permanentAddressBn: composePermanentAddressBn(prev.villageBn || '', prev.wardBn || '', prev.postOfficeBn || ''),
      permanentAddressEn: composePermanentAddressEn(prev.villageEn || '', prev.wardEn || '', prev.postOfficeEn || '')
    }));
  };

  // Helper for quick setting Place of Birth with auto ", বাংলাদেশ" / ", Bangladesh"
  const setQuickPlaceOfBirth = (districtBn: string, districtEn: string) => {
    setFormData((prev) => ({
      ...prev,
      placeOfBirthBn: formatPlaceOfBirthBn(districtBn),
      placeOfBirthEn: formatPlaceOfBirthEn(districtEn)
    }));
  };

  // Quick Presets
  const loadPreset = (type: 'rural' | 'urban' | 'metro') => {
    if (type === 'rural') {
      setFormData((prev) => ({
        ...prev,
        unionParishadBn: 'বাহেরাতৈল ইউনিয়ন পরিষদ',
        unionParishadEn: 'Baheratail Union Parishad',
        upazilaBn: 'সখিপুর',
        upazilaEn: 'Sakhipur',
        districtBn: 'টাঙ্গাইল',
        districtEn: 'Tangail',
        nameBn: 'সাজেদা আক্তার',
        nameEn: 'Shajeda Akter',
        dateOfBirth: '1987-09-05',
        dateOfBirthWordsEn: 'Fifth of September Nineteen Eighty Seven',
        dateOfBirthWordsBn: 'পাঁচই সেপ্টেম্বর উনিশ শত সাতাশি',
        sex: 'Female',
        sexBn: 'মহিলা',
        placeOfBirthBn: 'টাঙ্গাইল, বাংলাদেশ',
        placeOfBirthEn: 'Tangail, Bangladesh',
        motherNameBn: 'জাহানারা বেগম',
        motherNameEn: 'Jahanara Begum',
        fatherNameBn: 'মোঃ শাহজাহান',
        fatherNameEn: 'Md Shahjahan',
        villageBn: 'ডাবাইল নাগবাড়ী-১৯৭২',
        villageEn: 'Dabail Nagbari-1972',
        wardBn: '১',
        wardEn: '1',
        unionBn: 'বাহেরাতৈল',
        unionEn: 'Baheratail',
        upazilaFieldBn: 'সখিপুর',
        upazilaFieldEn: 'Sakhipur',
        districtFieldBn: 'টাঙ্গাইল',
        districtFieldEn: 'Tangail',
        permanentAddressBn: 'ডাবাইল নাগবাড়ী-১৯৭২, ওয়ার্ড - ১, বহেরাতৈল, সখিপুর, টাঙ্গাইল',
        permanentAddressEn: 'Dabail Nagbari-1972, Ward - 1, Baheratail, Sakhipur, Tangail'
      }));
    } else if (type === 'urban') {
      setFormData((prev) => ({
        ...prev,
        unionParishadBn: 'কালীগঞ্জ পৌরসভা',
        unionParishadEn: 'Kaliganj Municipality',
        upazilaBn: 'কালীগঞ্জ',
        upazilaEn: 'Kaliganj',
        districtBn: 'গাজীপুর',
        districtEn: 'Gazipur',
        nameBn: 'তানভীর আহমেদ',
        nameEn: 'Tanvir Ahmed',
        dateOfBirth: '1995-12-16',
        dateOfBirthWordsEn: 'Sixteenth of December Nineteen Ninety Five',
        dateOfBirthWordsBn: 'ষোলই ডিসেম্বর উনিশ শত পঁচানব্বই',
        sex: 'Male',
        sexBn: 'পুরুষ',
        placeOfBirthBn: 'গাজীপুর, বাংলাদেশ',
        placeOfBirthEn: 'Gazipur, Bangladesh',
        motherNameBn: 'রোকেয়া সুলতানা',
        motherNameEn: 'Rokeya Sultana',
        fatherNameBn: 'মোজাম্মেল হক',
        fatherNameEn: 'Mozammel Haque',
        villageBn: 'বক্তারপুর',
        villageEn: 'Baktarpur',
        wardBn: '৩',
        wardEn: '3',
        unionBn: 'কালীগঞ্জ',
        unionEn: 'Kaliganj',
        upazilaFieldBn: 'কালীগঞ্জ',
        upazilaFieldEn: 'Kaliganj',
        districtFieldBn: 'গাজীপুর',
        districtFieldEn: 'Gazipur',
        permanentAddressBn: 'বক্তারপুর, ওয়ার্ড - ৩, কালীগঞ্জ, গাজীপুর',
        permanentAddressEn: 'Baktarpur, Ward - 3, Kaliganj, Gazipur'
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        unionParishadBn: 'পতেঙ্গা আঞ্চলিক কার্যালয়',
        unionParishadEn: 'Patenga Zonal Office, Chattogram City Corporation',
        upazilaBn: 'পতেঙ্গা',
        upazilaEn: 'Patenga',
        districtBn: 'চট্টগ্রাম',
        districtEn: 'Chattogram',
        nameBn: 'নুসরাত জাহান রিয়া',
        nameEn: 'Nusrat Jahan Riya',
        dateOfBirth: '2004-03-26',
        dateOfBirthWordsEn: 'Twenty-Sixth of March Two Thousand Four',
        dateOfBirthWordsBn: 'ছাব্বিশে মার্চ দুই হাজার চার',
        sex: 'Female',
        sexBn: 'মহিলা',
        placeOfBirthBn: 'চট্টগ্রাম, বাংলাদেশ',
        placeOfBirthEn: 'Chattogram, Bangladesh',
        motherNameBn: 'ফরিদা ইয়াসমিন',
        motherNameEn: 'Farida Yasmin',
        fatherNameBn: 'কামাল উদ্দিন চৌধুরী',
        fatherNameEn: 'Kamal Uddin Chowdhury',
        villageBn: 'দক্ষিণ পতেঙ্গা',
        villageEn: 'South Patenga',
        wardBn: '৪১',
        wardEn: '41',
        unionBn: 'সিটি কর্পোরেশন',
        unionEn: 'City Corporation',
        upazilaFieldBn: 'পতেঙ্গা',
        upazilaFieldEn: 'Patenga',
        districtFieldBn: 'চট্টগ্রাম',
        districtFieldEn: 'Chattogram',
        permanentAddressBn: 'দক্ষিণ পতেঙ্গা, ওয়ার্ড - ৪১, পতেঙ্গা, চট্টগ্রাম',
        permanentAddressEn: 'South Patenga, Ward - 41, Patenga, Chattogram'
      }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const val = validateCertificateRecord(formData);
    const newErrors: Record<string, string> = {};

    val.issues.forEach((issue) => {
      newErrors[issue.field] = issue.description;
    });

    setErrors(newErrors);

    if (!val.isValid) {
      setValidationIssues(val.issues);
      setValidationModalOpen(true);
      setSaveStatus('error');
      setStatusMessage(`বাধ্যতামূলক ${val.issues.length} টি তথ্য অসম্পূর্ণ থাকায় সনদ সংরক্ষণ করা সম্ভব নয়।`);
      return false;
    }

    return true;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave(formData);
    setSaveStatus('success');
    setStatusMessage('Draft saved successfully. (ড্রাফট সফলভাবে সংরক্ষিত হয়েছে।)');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 4000);
  };

  const handleGenerateNewRef = () => {
    const newRef = generateDemoReferenceNumber(formData.dateOfBirth);
    handleChange('referenceId', newRef);
  };

  return (
    <form id="citizen-registration-form" onSubmit={handleSave} className="space-y-6">
      
      {/* e-Verify & Live Auto-fill Quick Access Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-xl p-4 shadow-md border border-emerald-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-800 rounded-lg border border-emerald-600/50">
            <Globe className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold">
                BDRIS e-Verify লাইভ ব্রাউজিং ও অটো-ফিল
              </h4>
              <span className="text-[10px] bg-emerald-700/80 px-2 py-0.5 rounded font-mono text-emerald-200">
                https://everify.bdris.gov.bd/
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/90 mt-0.5">
              অফিসিয়াল সাইটের তথ্য পেস্ট করলেই সকল ফিল্ড স্বয়ংক্রিয়ভাবে বসে যাবে এবং বাকি ফিল্ডগুলো ম্যানুয়ালি পূরণ করা যাবে।
            </p>
          </div>
        </div>

        {onOpenEverify && (
          <button
            type="button"
            onClick={onOpenEverify}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Globe className="w-4 h-4" />
            <span>e-Verify অটো-ফিল ওপেন করুন</span>
          </button>
        )}
      </div>

      {/* Top Presets & Controls */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-semibold text-emerald-900">
            নমুনা টেমপ্লেট লোড করুন (Quick Demo Presets):
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => loadPreset('rural')}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-300 transition cursor-pointer shadow-2xs"
          >
            বাহেরাতৈল ইউনিয়ন (Sample 1)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('urban')}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-300 transition cursor-pointer shadow-2xs"
          >
            কালীগঞ্জ পৌরসভা (Sample 2)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('metro')}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-300 transition cursor-pointer shadow-2xs"
          >
            পতেঙ্গা সিটি কর্পোরেশন (Sample 3)
          </button>
        </div>
      </div>

      {/* Validation / Status Alert Banner */}
      {saveStatus === 'error' && (
        <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-start gap-2.5 text-red-800 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold">{statusMessage}</p>
          </div>
        </div>
      )}

      {saveStatus === 'success' && (
        <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-md flex items-start gap-2.5 text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* SECTION 1: REGISTRATION OFFICE & REFERENCE */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800 font-['Noto_Sans_Bengali']">
              ১. নিবন্ধন কার্যালয় ও প্রশাসনিক তথ্য (Registration Office &amp; Metadata)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Status:</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as RecordStatus)}
              className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Draft">Draft (ড্রাফট)</option>
              <option value="Pending Review">Pending Review (পর্যালোচনাধীন)</option>
              <option value="Verified Demo">Verified Demo (যাচাইকৃত ডেমো)</option>
              <option value="Archived">Archived (আর্কাইভ)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Union / Municipality (Bn & En) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                ইউনিয়ন পরিষদ / পৌরসভা (বাংলা) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    unionParishadBn: FIXED_UNION_PARISHAD_BN,
                    unionParishadEn: FIXED_UNION_PARISHAD_EN,
                    upazilaBn: 'সখিপুর',
                    upazilaEn: 'Sakhipur',
                    districtBn: 'টাঙ্গাইল',
                    districtEn: 'Tangail'
                  }));
                }}
                className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 cursor-pointer"
                title="বহেরাতৈল ইউনিয়ন পরিষদ ফিক্সড সেট করুন"
              >
                🔒 বহেরাতৈল ইউপি ফিক্সড
              </button>
            </div>
            <input
              type="text"
              value={formData.unionParishadBn}
              onChange={(e) => handleChange('unionParishadBn', e.target.value)}
              placeholder="যেমন: বহেরাতৈল ইউনিয়ন পরিষদ"
              className={`w-full text-xs sm:text-sm px-3 py-2 border rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                errors.unionParishadEn ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Union Parishad / Municipality / Office (English) <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">BAHERATAIL UNION PARISHAD</span>
            </div>
            <input
              type="text"
              value={formData.unionParishadEn}
              onChange={(e) => handleChange('unionParishadEn', e.target.value)}
              placeholder="BAHERATAIL UNION PARISHAD"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-medium uppercase"
            />
          </div>

          {/* Upazila & District */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              উপজেলা ও জেলা (বাংলা)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.upazilaBn}
                onChange={(e) => handleChange('upazilaBn', e.target.value)}
                placeholder="উপজেলা (যেমন: সখিপুর)"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={formData.districtBn}
                onChange={(e) => handleChange('districtBn', e.target.value)}
                placeholder="জেলা (যেমন: টাঙ্গাইল)"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Upazila &amp; District (English)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.upazilaEn}
                onChange={(e) => handleChange('upazilaEn', e.target.value)}
                placeholder="Upazila (e.g. Sakhipur)"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={formData.districtEn}
                onChange={(e) => handleChange('districtEn', e.target.value)}
                placeholder="District (e.g. Tangail)"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Reference Number & Dates */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Demo Reference Number (নমুনা রেফারেন্স নং)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.referenceId}
                onChange={(e) => handleChange('referenceId', e.target.value)}
                className="w-full text-xs sm:text-sm font-mono px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-bold"
              />
              <button
                type="button"
                onClick={handleGenerateNewRef}
                title="Generate new demo number"
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-700 shrink-0 cursor-pointer"
              >
                Regen
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Dates: Registration &amp; Issuance (DD/MM/YYYY)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.dateOfRegistration}
                onChange={(e) => handleChange('dateOfRegistration', e.target.value)}
                placeholder="Reg Date: 24/08/2026"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
              <input
                type="text"
                value={formData.dateOfIssuance}
                onChange={(e) => handleChange('dateOfIssuance', e.target.value)}
                placeholder="Issue Date: 27/08/2026"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CITIZEN PERSONAL INFORMATION */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <User className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-800 font-['Noto_Sans_Bengali']">
            ২. নাগরিকের ব্যক্তিগত তথ্য (Citizen Personal Information)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Bangla */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              নাম (বাংলা) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nameBn}
              onChange={(e) => handleChange('nameBn', e.target.value)}
              placeholder="যেমন: সাজেদা আক্তার"
              className={`w-full text-xs sm:text-sm px-3 py-2 border rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                errors.nameBn ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {errors.nameBn && <p className="text-[11px] text-red-600 mt-1">{errors.nameBn}</p>}
          </div>

          {/* Name English */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Name in English <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => handleChange('nameEn', e.target.value)}
              placeholder="e.g. Shajeda Akter"
              className={`w-full text-xs sm:text-sm px-3 py-2 border rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                errors.nameEn ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {errors.nameEn && <p className="text-[11px] text-red-600 mt-1">{errors.nameEn}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Date of Birth / জন্ম তারিখ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className={`w-full text-xs sm:text-sm px-3 py-2 border rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                errors.dateOfBirth ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {errors.dateOfBirth && <p className="text-[11px] text-red-600 mt-1">{errors.dateOfBirth}</p>}
          </div>

          {/* Sex / Gender */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Sex / লিঙ্গ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Female', 'Male', 'Other'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleChange('sex', s)}
                  className={`py-2 px-2 text-xs font-medium rounded-md border text-center transition cursor-pointer ${
                    formData.sex === s
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {s === 'Female' ? 'Female (মহিলা)' : s === 'Male' ? 'Male (পুরুষ)' : 'Other (অন্যান্য)'}
                </button>
              ))}
            </div>
          </div>

          {/* In Word (English) */}
          <div className="md:col-span-2 bg-slate-50 p-3 rounded-md border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Date of Birth in Words (কথায় জন্ম তারিখ)
              </label>
              <button
                type="button"
                onClick={() => {
                  const enWords = convertDateToEnglishWords(formData.dateOfBirth);
                  const bnWords = convertDateToBengaliWords(formData.dateOfBirth);
                  handleChange('dateOfBirthWordsEn', enWords);
                  handleChange('dateOfBirthWordsBn', bnWords);
                }}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium underline cursor-pointer"
              >
                Auto-generate from Date
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">English:</span>
                <input
                  type="text"
                  value={formData.dateOfBirthWordsEn}
                  onChange={(e) => handleChange('dateOfBirthWordsEn', e.target.value)}
                  placeholder="e.g. Fifth of September Nineteen Eighty Seven"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded bg-white font-serif italic text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">বাংলা:</span>
                <input
                  type="text"
                  value={formData.dateOfBirthWordsBn}
                  onChange={(e) => handleChange('dateOfBirthWordsBn', e.target.value)}
                  placeholder="যেমন: পাঁচই সেপ্টেম্বর উনিশ শত সাতাশি"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded bg-white font-['Noto_Sans_Bengali'] text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Place of Birth */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                জন্মস্থান (বাংলা) <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                &ldquo;, বাংলাদেশ&rdquo; অটো বসবে
              </span>
            </div>
            <input
              type="text"
              value={formData.placeOfBirthBn}
              onChange={(e) => handleChange('placeOfBirthBn', e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleChange('placeOfBirthBn', formatPlaceOfBirthBn(e.target.value));
                }
              }}
              placeholder="শুধু জেলার নাম (যেমন: টাঙ্গাইল) লিখলেও অটো বাংলাদেশ বসবে"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              <span className="text-[10px] text-slate-400 self-center mr-1">দ্রুত সেট:</span>
              {[
                { bn: 'টাঙ্গাইল', en: 'Tangail' },
                { bn: 'ঢাকা', en: 'Dhaka' },
                { bn: 'গাজীপুর', en: 'Gazipur' },
                { bn: 'ময়মনসিংহ', en: 'Mymensingh' }
              ].map((dist) => (
                <button
                  key={dist.bn}
                  type="button"
                  onClick={() => setQuickPlaceOfBirth(dist.bn, dist.en)}
                  className="text-[10px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 px-2 py-0.5 rounded border border-slate-200 cursor-pointer transition"
                >
                  {dist.bn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Place of Birth (English) <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                &ldquo;, Bangladesh&rdquo; Auto
              </span>
            </div>
            <input
              type="text"
              value={formData.placeOfBirthEn}
              onChange={(e) => handleChange('placeOfBirthEn', e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleChange('placeOfBirthEn', formatPlaceOfBirthEn(e.target.value));
                }
              }}
              placeholder="e.g. Tangail (Auto-appends Bangladesh)"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Example: &ldquo;Tangail&rdquo; will automatically become &ldquo;Tangail, Bangladesh&rdquo;
            </p>
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              জাতীয়তা (বাংলা)
            </label>
            <input
              type="text"
              value={formData.nationalityBn}
              onChange={(e) => handleChange('nationalityBn', e.target.value)}
              placeholder="বাংলাদেশী"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nationality (English)
            </label>
            <input
              type="text"
              value={formData.nationalityEn}
              onChange={(e) => handleChange('nationalityEn', e.target.value)}
              placeholder="Bangladeshi"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: PARENT INFORMATION */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Users className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-800 font-['Noto_Sans_Bengali']">
            ৩. পিতা ও মাতার তথ্য (Parent Information)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Father Name Bn & En */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              পিতার নাম (বাংলা) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fatherNameBn}
              onChange={(e) => handleChange('fatherNameBn', e.target.value)}
              placeholder="যেমন: মোঃ শাহজাহান"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Father&apos;s Name in English <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fatherNameEn}
              onChange={(e) => handleChange('fatherNameEn', e.target.value)}
              placeholder="e.g. Md Shahjahan"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Father Nationality */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              পিতার জাতীয়তা (বাংলা)
            </label>
            <input
              type="text"
              value={formData.fatherNationalityBn}
              onChange={(e) => handleChange('fatherNationalityBn', e.target.value)}
              placeholder="বাংলাদেশী"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Father&apos;s Nationality (English)
            </label>
            <input
              type="text"
              value={formData.fatherNationalityEn}
              onChange={(e) => handleChange('fatherNationalityEn', e.target.value)}
              placeholder="Bangladeshi"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Mother Name Bn & En */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              মাতার নাম (বাংলা) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.motherNameBn}
              onChange={(e) => handleChange('motherNameBn', e.target.value)}
              placeholder="যেমন: জাহানারা বেগম"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Mother&apos;s Name in English <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.motherNameEn}
              onChange={(e) => handleChange('motherNameEn', e.target.value)}
              placeholder="e.g. Jahanara Begum"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Mother Nationality */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              মাতার জাতীয়তা (বাংলা)
            </label>
            <input
              type="text"
              value={formData.motherNationalityBn}
              onChange={(e) => handleChange('motherNationalityBn', e.target.value)}
              placeholder="বাংলাদেশী"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Mother&apos;s Nationality (English)
            </label>
            <input
              type="text"
              value={formData.motherNationalityEn}
              onChange={(e) => handleChange('motherNationalityEn', e.target.value)}
              placeholder="Bangladeshi"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: ADDRESS INFORMATION */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800 font-['Noto_Sans_Bengali']">
              ৪. স্থায়ী ঠিকানার বিবরণ (Permanent Address Information)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ফিক্সড শেষাংশ: বহেরাতৈল, সখিপুর, টাঙ্গাইল
            </span>
            <button
              type="button"
              onClick={autoComposeAddress}
              className="text-xs text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300 font-medium transition cursor-pointer"
            >
              Re-compose
            </button>
          </div>
        </div>

        {/* Informative notification box */}
        <div className="mb-4 p-3 bg-emerald-50/60 border border-emerald-200 rounded-md text-xs text-emerald-900 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">স্থায়ী ঠিকানার নিয়মাবলী:</p>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              আপনি শুধু <strong>গ্রাম, ওয়ার্ড নং ও ডাকঘর</strong> ম্যানুয়াল লিখবেন। শেষাংশ <span className="font-bold underline">বহেরাতৈল, সখিপুর, টাঙ্গাইল</span> (এবং <span className="font-bold underline">Baheratail, Sakhipur, Tangail</span>) সবসময় স্বয়ংক্রিয়ভাবে জুড়ে থাকবে।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Village */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              গ্রাম / এলাকা (বাংলা) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.villageBn || ''}
              onChange={(e) => handleChange('villageBn', e.target.value)}
              placeholder="যেমন: ডাবাইল নাগবাড়ী-১৯৭২"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Village / Area (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.villageEn || ''}
              onChange={(e) => handleChange('villageEn', e.target.value)}
              placeholder="e.g. Dabail Nagbari-1972"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Ward & Post Office */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ওয়ার্ড নং ও ডাকঘর (বাংলা)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.wardBn || ''}
                onChange={(e) => handleChange('wardBn', e.target.value)}
                placeholder="ওয়ার্ড নং (যেমন: ১)"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={formData.postOfficeBn || ''}
                onChange={(e) => handleChange('postOfficeBn', e.target.value)}
                placeholder="ডাকঘর (যেমন: বহেরাতৈল)"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Ward No &amp; Post Office (English)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.wardEn || ''}
                onChange={(e) => handleChange('wardEn', e.target.value)}
                placeholder="Ward No (e.g. 1)"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={formData.postOfficeEn || ''}
                onChange={(e) => handleChange('postOfficeEn', e.target.value)}
                placeholder="Post Office (e.g. Baheratail)"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Combined Permanent Address textareas */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                সনদে প্রদর্শিত সম্পূর্ণ স্থায়ী ঠিকানা (বাংলা)
              </label>
              <span className="text-[10px] text-slate-500">অটো জেনারেট হয়</span>
            </div>
            <textarea
              rows={2}
              value={formData.permanentAddressBn}
              onChange={(e) => handleChange('permanentAddressBn', e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleChange('permanentAddressBn', ensureBaheratailAddressBn(e.target.value));
                }
              }}
              placeholder="ডাবাইল নাগবাড়ী-১৯৭২, ওয়ার্ড - ১, বহেরাতৈল, সখিপুর, টাঙ্গাইল"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-['Noto_Sans_Bengali'] bg-slate-50/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Full Permanent Address on Certificate (English)
              </label>
              <span className="text-[10px] text-slate-500">Auto Generated</span>
            </div>
            <textarea
              rows={2}
              value={formData.permanentAddressEn}
              onChange={(e) => handleChange('permanentAddressEn', e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleChange('permanentAddressEn', ensureBaheratailAddressEn(e.target.value));
                }
              }}
              placeholder="Dabail Nagbari-1972, Ward - 1, Baheratail, Sakhipur, Tangail"
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Section 6: Logo & Watermark Customization */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xs overflow-hidden">
        <div 
          onClick={() => setShowLogoSection(!showLogoSection)}
          className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">
              ৬. লোগো ও জলছাপ কাস্টমাইজেশন (Logo &amp; Watermark Controls)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>{showLogoSection ? 'সংকুচিত করুন' : 'লোগো আপলোড ও সাইজ/দৃশ্যমানতা পরিবর্তন'}</span>
            {showLogoSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {showLogoSection && (
          <div className="p-4 bg-slate-950">
            <LogoWatermarkController
              record={formData}
              onUpdateRecord={(updated) => setFormData(updated)}
            />
          </div>
        )}
      </div>

      {/* Section 7: QR Code & Barcode Auto Generator & Customizer */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xs overflow-hidden">
        <div 
          onClick={() => setShowQrSection(!showQrSection)}
          className="bg-emerald-900 text-white px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-emerald-850 transition"
        >
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-300" />
            <h3 className="font-semibold text-sm">
              ৭. কিউআর কোড ও বারকোড জেনারেটর (QR Code &amp; Barcode Controls)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <span>{showQrSection ? 'সংকুচিত করুন' : 'ম্যানুয়াল শব্দ ও লিংক পরিবর্তন'}</span>
            {showQrSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {showQrSection && (
          <div className="p-4 sm:p-5 bg-slate-50 space-y-4 border-t border-slate-200">
            
            {/* Top Row: Manual Word & Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Field 1: QR Reference Word */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  QR কোডের নিচের ম্যানুয়াল শব্দ (Word beneath QR Code)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.qrReferenceCode || 'EETT'}
                    onChange={(e) => handleChange('qrReferenceCode', e.target.value.toUpperCase())}
                    placeholder="EETT"
                    className="w-full text-sm font-mono tracking-widest font-bold uppercase px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('qrReferenceCode', 'EETT')}
                    className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 whitespace-nowrap cursor-pointer"
                    title="ডিফল্ট EETT সেট করুন"
                  >
                    EETT
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  সনদের ওপরের বামে থাকা QR কোডের নিচে এই শব্দটি প্রদর্শিত হবে।
                </p>
              </div>

              {/* Field 2: Barcode value */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  বারকোড নম্বর (Barcode Value)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.barcodeValue || formData.referenceId || '19879318513121621'}
                    onChange={(e) => handleChange('barcodeValue', e.target.value)}
                    placeholder="19879318513121621"
                    className="w-full text-sm font-mono font-bold px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('barcodeValue', formData.referenceId || '19879318513121621')}
                    className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 whitespace-nowrap cursor-pointer"
                    title="১৭ ডিজিটের জন্ম নিবন্ধন নম্বর সিঙ্ক করুন"
                  >
                    BRN সিঙ্ক
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  স্বয়ংক্রিয়ভাবে ১৭ ডিজিট জন্ম নিবন্ধন নম্বরের বারকোড স্ট্রাইপ তৈরি হয়।
                </p>
              </div>

            </div>

            {/* Verification Link and Key Auto Generator */}
            <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <LinkIcon className="w-4 h-4 text-emerald-700" />
                  <span>QR কোড স্ক্যান করলে তৈরি হওয়া ভেরিফিকেশন লিংক (Live Verification URL)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoGenerateKey}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-xs transition cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Auto Key জেনারেট করুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefaultKey}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ডিফল্ট কী</span>
                  </button>
                </div>
              </div>

              {/* Full URL Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  সম্পূর্ণ ভেরিফিকেশন ইউআরএল (Full Verification URL):
                </label>
                <input
                  type="text"
                  value={formData.qrVerificationUrl || `https://bdris.gov.bd/certificate/verify?key=${formData.qrVerificationKey || DEFAULT_BDRIS_VERIFY_KEY}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange('qrVerificationUrl', val);
                    if (val.includes('key=')) {
                      const extractedKey = val.split('key=')[1]?.split('&')[0];
                      if (extractedKey) handleChange('qrVerificationKey', extractedKey);
                    }
                  }}
                  className="w-full text-xs font-mono text-emerald-900 bg-emerald-50/50 px-3 py-2 border border-emerald-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Verification 64-char Key Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ভেরিফিকেশন সিক্রেট কী (64-character Verification Key):
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.qrVerificationKey || DEFAULT_BDRIS_VERIFY_KEY}
                      onChange={(e) => {
                        const k = e.target.value.trim();
                        handleChange('qrVerificationKey', k);
                        handleChange('qrVerificationUrl', getBdrisVerificationUrl(k));
                      }}
                      className="w-full text-xs font-mono pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2.5 rounded-md border border-emerald-200/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  যেকোনো স্মার্টফোনের ক্যামেরা বা কিউআর কোড স্ক্যানার দিয়ে স্ক্যান করলে তৎক্ষণাৎ এই অফিসিয়াল ভেরিফিকেশন লিংক লোড হবে।
                </span>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Section 8: Certified / Draft Copy Visual State Controls */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xs overflow-hidden">
        <div 
          onClick={() => setShowCertifiedSection(!showCertifiedSection)}
          className="bg-red-950 text-white px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-red-900 transition"
        >
          <div className="flex items-center gap-2">
            <Stamp className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span>৮. সত্যায়িত / ড্রাফট কপি ওভারলে (Draft &amp; Certified Copy)</span>
              {formData.printOverlayType && formData.printOverlayType !== 'NONE' && (
                <span className="text-[10px] bg-red-800 text-red-100 border border-red-600 px-2 py-0.5 rounded-full font-mono font-bold">
                  {formData.printOverlayType} সক্রিয়
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>{showCertifiedSection ? 'সংকুচিত করুন' : 'লাল কালির সত্যায়িত সিল বা খসড়া জলছাপ টগল'}</span>
            {showCertifiedSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {showCertifiedSection && (
          <div className="p-4 bg-slate-950">
            <CertifiedCopyController
              record={formData}
              onChange={(updatedFields) => setFormData((prev) => ({ ...prev, ...updatedFields }))}
            />
          </div>
        )}
      </div>

      {/* Section 9: Signature & Official Titles Configuration */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xs overflow-hidden">
        <div 
          onClick={() => setShowSignatureSection(!showSignatureSection)}
          className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition"
        >
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span>৯. নিচের স্বাক্ষর ও পদবী কনফিগারেশন (Official Signatures &amp; Titles)</span>
              <span className="text-[10px] bg-emerald-900/90 text-emerald-200 border border-emerald-700 px-2 py-0.5 rounded-full font-mono">
                BDRIS Sample Standard
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>{showSignatureSection ? 'সংকুচিত করুন' : 'প্রশাসনিক কর্মকর্তা ও চেয়ারম্যান সাইন পদবী'}</span>
            {showSignatureSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {showSignatureSection && (
          <div className="p-4 sm:p-5 bg-slate-50 space-y-4 border-t border-slate-200">
            
            {/* Quick 1-Click Presets */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-700">নমুনা প্রিসেট:</span>
              
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    assistantTitleEn: DEFAULT_ASSISTANT_TITLE_EN,
                    assistantTitleBn: DEFAULT_ASSISTANT_TITLE_BN,
                    registrarTitleEn: DEFAULT_REGISTRAR_TITLE_EN,
                    registrarTitleBn: ''
                  }));
                }}
                className="px-2.5 py-1 text-xs font-medium bg-emerald-700 hover:bg-emerald-800 text-white rounded transition cursor-pointer shadow-2xs"
                title="BDRIS অফিসিয়াল নমুনা অনুযায়ী (Assistant to Registrar & Registrar)"
              >
                ✓ BDRIS নমুনা (Assistant to Registrar &amp; Registrar)
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    assistantTitleEn: 'Administrative Officer',
                    assistantTitleBn: '(Preparation, Verification)',
                    registrarTitleEn: 'Chairman & Registrar',
                    registrarTitleBn: ''
                  }));
                }}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 text-slate-800 rounded border border-slate-300 transition cursor-pointer shadow-2xs"
                title="প্রশাসনিক কর্মকর্তা ও চেয়ারম্যান পদবী"
              >
                প্রশাসনিক কর্মকর্তা ও চেয়ারম্যান (Administrative Officer &amp; Chairman)
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    assistantTitleEn: 'Assistant to Registrar',
                    assistantTitleBn: '(প্রস্তুতকারী ও যাচাইকারী)',
                    registrarTitleEn: 'Registrar',
                    registrarTitleBn: '(অনুমোদনকারী)'
                  }));
                }}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 text-slate-800 rounded border border-slate-300 transition cursor-pointer shadow-2xs"
                title="দ্বিভাষিক সাবটাইটেল"
              >
                বাংলা সাবটাইটেল সহ
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Signature: Assistant / Administrative Officer */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      বাম দিকের সাইন (সহকারী / কর্মকর্তা)
                    </span>
                    {formData.assistantSignatureUrl && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        formData.assistantSignatureVisible !== false 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {formData.assistantSignatureVisible !== false ? 'সক্রিয়' : 'লুকানো'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Seal and Signature</span>
                </div>

                {/* Digital Signature Pad / Upload Action for Assistant */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ডিজিটাল স্বাক্ষর (Signature Image):</span>
                    </span>
                    {formData.assistantSignatureUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const isVis = formData.assistantSignatureVisible !== false;
                            handleChange('assistantSignatureVisible', !isVis);
                          }}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                          title="সনদে স্বাক্ষর প্রদর্শন / গোপন করুন"
                        >
                          {formData.assistantSignatureVisible !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">দৃশ্যমান</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-amber-700">লুকানো</span>
                            </>
                          )}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleChange('assistantSignatureUrl', undefined);
                            handleChange('assistantSignatureHeight', undefined);
                            handleChange('assistantSignatureRotation', undefined);
                          }}
                          className="text-red-500 hover:text-red-700 text-[11px] font-normal flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>মুছুন</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {formData.assistantSignatureUrl ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-3 p-2.5 bg-white border border-slate-200 rounded-md">
                        <div className="flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded p-1 min-w-[100px] h-14 overflow-hidden">
                          <img 
                            src={formData.assistantSignatureUrl} 
                            alt="Assistant Signature" 
                            style={{
                              height: `${Math.min(48, formData.assistantSignatureHeight || 44)}px`,
                              transform: `rotate(${formData.assistantSignatureRotation || 0}deg)`,
                              opacity: formData.assistantSignatureVisible !== false ? 1 : 0.4
                            }}
                            className="object-contain transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSignatureTarget('assistant');
                            setSignatureModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>এডিট ও রোটেট</span>
                        </button>
                      </div>

                      {/* Controls for size & rotation directly inside form */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-medium">
                            <span>উচ্চতা (সাইজ):</span>
                            <span className="font-mono text-emerald-700">{formData.assistantSignatureHeight || 48}px</span>
                          </div>
                          <input 
                            type="range"
                            min="24"
                            max="80"
                            step="2"
                            value={formData.assistantSignatureHeight || 48}
                            onChange={(e) => handleChange('assistantSignatureHeight', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-medium">
                            <span>ঘূর্ণন (Rotation):</span>
                            <span className="font-mono text-emerald-700">{formData.assistantSignatureRotation || 0}°</span>
                          </div>
                          <input 
                            type="range"
                            min="-25"
                            max="25"
                            step="1"
                            value={formData.assistantSignatureRotation || 0}
                            onChange={(e) => handleChange('assistantSignatureRotation', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSignatureTarget('assistant');
                        setSignatureModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-dashed border-emerald-300 rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                      <span>স্বাক্ষর আঁকুন বা ছবি আপলোড করুন (AI Background Remove)</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    English Title (পদবী) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.assistantTitleEn || DEFAULT_ASSISTANT_TITLE_EN}
                    onChange={(e) => handleChange('assistantTitleEn', e.target.value)}
                    placeholder="Assistant to Registrar"
                    className="w-full text-xs sm:text-sm font-semibold px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Subtitle / Note (ব্র্যাকেটের লেখা)
                  </label>
                  <input
                    type="text"
                    value={formData.assistantTitleBn || DEFAULT_ASSISTANT_TITLE_BN}
                    onChange={(e) => handleChange('assistantTitleBn', e.target.value)}
                    placeholder="(Preparation, Verification)"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden text-slate-700"
                  />
                </div>
              </div>

              {/* Right Signature: Registrar / Chairman */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      ডান দিকের সাইন (চেয়ারম্যান / নিবন্ধক)
                    </span>
                    {formData.registrarSignatureUrl && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        formData.registrarSignatureVisible !== false 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {formData.registrarSignatureVisible !== false ? 'সক্রিয়' : 'লুকানো'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Seal and Signature</span>
                </div>

                {/* Digital Signature Pad / Upload Action for Chairman/Registrar */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ডিজিটাল স্বাক্ষর (Signature Image):</span>
                    </span>
                    {formData.registrarSignatureUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const isVis = formData.registrarSignatureVisible !== false;
                            handleChange('registrarSignatureVisible', !isVis);
                          }}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                          title="সনদে স্বাক্ষর প্রদর্শন / গোপন করুন"
                        >
                          {formData.registrarSignatureVisible !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">দৃশ্যমান</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-amber-700">লুকানো</span>
                            </>
                          )}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleChange('registrarSignatureUrl', undefined);
                            handleChange('registrarSignatureHeight', undefined);
                            handleChange('registrarSignatureRotation', undefined);
                          }}
                          className="text-red-500 hover:text-red-700 text-[11px] font-normal flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>মুছুন</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {formData.registrarSignatureUrl ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-3 p-2.5 bg-white border border-slate-200 rounded-md">
                        <div className="flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded p-1 min-w-[100px] h-14 overflow-hidden">
                          <img 
                            src={formData.registrarSignatureUrl} 
                            alt="Registrar Signature" 
                            style={{
                              height: `${Math.min(48, formData.registrarSignatureHeight || 44)}px`,
                              transform: `rotate(${formData.registrarSignatureRotation || 0}deg)`,
                              opacity: formData.registrarSignatureVisible !== false ? 1 : 0.4
                            }}
                            className="object-contain transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSignatureTarget('registrar');
                            setSignatureModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>এডিট ও রোটেট</span>
                        </button>
                      </div>

                      {/* Controls for size & rotation directly inside form */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-medium">
                            <span>উচ্চতা (সাইজ):</span>
                            <span className="font-mono text-emerald-700">{formData.registrarSignatureHeight || 48}px</span>
                          </div>
                          <input 
                            type="range"
                            min="24"
                            max="80"
                            step="2"
                            value={formData.registrarSignatureHeight || 48}
                            onChange={(e) => handleChange('registrarSignatureHeight', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-medium">
                            <span>ঘূর্ণন (Rotation):</span>
                            <span className="font-mono text-emerald-700">{formData.registrarSignatureRotation || 0}°</span>
                          </div>
                          <input 
                            type="range"
                            min="-25"
                            max="25"
                            step="1"
                            value={formData.registrarSignatureRotation || 0}
                            onChange={(e) => handleChange('registrarSignatureRotation', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSignatureTarget('registrar');
                        setSignatureModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-dashed border-emerald-300 rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                      <span>স্বাক্ষর আঁকুন বা ছবি আপলোড করুন (AI Background Remove)</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    English Title (নিবন্ধক / চেয়ারম্যান পদবী) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.registrarTitleEn || DEFAULT_REGISTRAR_TITLE_EN}
                    onChange={(e) => handleChange('registrarTitleEn', e.target.value)}
                    placeholder="Registrar"
                    className="w-full text-xs sm:text-sm font-semibold px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Subtitle / Note (ঐচ্ছিক ব্র্যাকেটের লেখা)
                  </label>
                  <input
                    type="text"
                    value={formData.registrarTitleBn || ''}
                    onChange={(e) => handleChange('registrarTitleBn', e.target.value)}
                    placeholder="যেমন: (Approval) বা খালি রাখুন"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden text-slate-700"
                  />
                </div>
              </div>

            </div>

            <div className="text-[11px] text-slate-600 bg-emerald-50/70 p-2.5 rounded border border-emerald-200">
              💡 <strong>নমুনা অনুযায়ী:</strong> সরকারি বার্থ সার্টিফিকেটের অফিসিয়াল ফরম্যাটে বামে <code>Seal and Signature</code> এর নিচে <code>Assistant to Registrar</code> এবং ব্র্যাকেটে <code>(Preparation, Verification)</code> থাকে, এবং ডানে <code>Seal and Signature</code> এর নিচে <code>Registrar</code> থাকে। আপনি যেকোনো স্বাক্ষরের ছবি তুলে আপলোড করলে স্বয়ংক্রিয়ভাবে সাদা ব্যাকগ্রাউন্ড মুছে কাগজের আসল কালির রূপ দেওয়া হবে।
            </div>

          </div>
        )}
      </div>


      {/* Action Buttons Sticky / Bottom */}
      <div className="sticky bottom-3 z-20 bg-white/95 backdrop-blur-xs p-3.5 rounded-lg border border-slate-300 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer border border-slate-300"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reset Form</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-md transition cursor-pointer border border-emerald-300"
          >
            <Printer className="w-4 h-4" />
            <span>Print Preview</span>
          </button>

          <button
            id="btn-save-draft"
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-md transition cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft (সংরক্ষণ করুন)</span>
          </button>
        </div>
      </div>

      {/* Validation Guard Modal */}
      <ValidationGuardModal
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        issues={validationIssues}
        actionName="সংরক্ষণ ও সাবমিট"
      />

      {/* Digital Signature Pad Modal */}
      <SignaturePadModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        title={
          activeSignatureTarget === 'assistant'
            ? 'প্রশাসনিক কর্মকর্তা / সহকারী স্বাক্ষর ও সিল (Assistant to Registrar)'
            : 'চেয়ারম্যান ও নিবন্ধকের স্বাক্ষর ও সিল (Registrar / Chairman)'
        }
        currentSignatureUrl={
          activeSignatureTarget === 'assistant'
            ? formData.assistantSignatureUrl
            : formData.registrarSignatureUrl
        }
        currentHeight={
          activeSignatureTarget === 'assistant'
            ? formData.assistantSignatureHeight || 48
            : formData.registrarSignatureHeight || 48
        }
        currentRotation={
          activeSignatureTarget === 'assistant'
            ? formData.assistantSignatureRotation || 0
            : formData.registrarSignatureRotation || 0
        }
        currentVisible={
          activeSignatureTarget === 'assistant'
            ? formData.assistantSignatureVisible !== false
            : formData.registrarSignatureVisible !== false
        }
        onSaveSignature={({ signatureDataUrl, height, rotation, visible }) => {
          if (activeSignatureTarget === 'assistant') {
            setFormData((prev) => ({
              ...prev,
              assistantSignatureUrl: signatureDataUrl,
              assistantSignatureHeight: height,
              assistantSignatureRotation: rotation,
              assistantSignatureVisible: visible
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              registrarSignatureUrl: signatureDataUrl,
              registrarSignatureHeight: height,
              registrarSignatureRotation: rotation,
              registrarSignatureVisible: visible
            }));
          }
        }}
        onRemoveSignature={() => {
          if (activeSignatureTarget === 'assistant') {
            setFormData((prev) => ({
              ...prev,
              assistantSignatureUrl: undefined,
              assistantSignatureHeight: undefined,
              assistantSignatureRotation: undefined,
              assistantSignatureVisible: true
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              registrarSignatureUrl: undefined,
              registrarSignatureHeight: undefined,
              registrarSignatureRotation: undefined,
              registrarSignatureVisible: true
            }));
          }
        }}
      />

    </form>
  );
};
