import React, { useState, useRef } from 'react';
import { DemoRecord } from '../types';
import { DemoTopEmblem, DemoBackgroundWatermark } from './DemoEmblem';
import { DemoQRCode } from './DemoQRCode';
import { DemoBarcode } from './DemoBarcode';
import { LogoWatermarkController } from './LogoWatermarkController';
import { CertifiedCopyOverlay, CertifiedCopyController } from './CertifiedCopyOverlay';
import { ValidationGuardModal } from './ValidationGuardModal';
import { SignaturePadModal } from './SignaturePadModal';
import { 
  validateCertificateRecord, 
  downloadCertificatePdf, 
  downloadCertificateImage, 
  saveToGoogleDriveOrShare,
  ValidationIssue 
} from '../utils/bdrisParser';
import { 
  formatDateToDisplay, 
  convertDateToEnglishWords, 
  convertDateToBengaliWords,
  formatPlaceOfBirthBn,
  formatPlaceOfBirthEn,
  ensureBaheratailAddressBn,
  ensureBaheratailAddressEn,
  DEFAULT_BDRIS_VERIFY_KEY,
  generateBdrisVerifyKey,
  getBdrisVerificationUrl,
  FIXED_UNION_PARISHAD_EN,
  FIXED_UPAZILA_DISTRICT_EN,
  DEFAULT_ASSISTANT_TITLE_EN,
  DEFAULT_ASSISTANT_TITLE_BN,
  DEFAULT_REGISTRAR_TITLE_EN
} from '../utils/numberToWords';
import { 
  Printer, 
  Edit3, 
  Check, 
  Sliders, 
  Image as ImageIcon, 
  QrCode, 
  Sparkles, 
  Key, 
  Link as LinkIcon, 
  RotateCcw, 
  X,
  Download,
  FileDown,
  Cloud,
  Share2,
  AlertTriangle,
  Globe,
  Stamp,
  Layers,
  PenTool,
  FileSignature,
  RotateCw,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';

interface CertificatePreviewProps {
  record: DemoRecord;
  onUpdateRecord?: (updated: DemoRecord) => void;
  onPrint?: () => void;
  onOpenEverify?: () => void;
  isCompact?: boolean;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  record,
  onUpdateRecord,
  onPrint,
  onOpenEverify,
  isCompact = false
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [showLogoSettings, setShowLogoSettings] = useState(false);
  const [showQrSettings, setShowQrSettings] = useState(false);
  const [showCertifiedOverlaySettings, setShowCertifiedOverlaySettings] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isSavingDrive, setIsSavingDrive] = useState(false);

  // Digital Signature Modal State
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [activeSignatureTarget, setActiveSignatureTarget] = useState<'assistant' | 'registrar'>('registrar');

  // Validation Guard Modal State
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [blockedActionName, setBlockedActionName] = useState('ডাউনলোড');

  const checkValidation = (actionName: string): boolean => {
    const val = validateCertificateRecord(record);
    if (!val.isValid) {
      setValidationIssues(val.issues);
      setBlockedActionName(actionName);
      setValidationModalOpen(true);
      return false;
    }
    return true;
  };

  const handlePrintTrigger = () => {
    if (!checkValidation('প্রিন্ট ও PDF তৈরি')) return;
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDirectPdfDownload = async () => {
    if (!checkValidation('PDF ডাউনলোড')) return;
    try {
      setIsExportingPdf(true);
      const filename = `birth_certificate_${record.referenceId || 'draft'}.pdf`;
      await downloadCertificatePdf('certificate-print-sheet', filename);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDirectImageDownload = async () => {
    if (!checkValidation('ইমেজ ডাউনলোড')) return;
    try {
      setIsExportingImage(true);
      const filename = `birth_certificate_${record.referenceId || 'draft'}.png`;
      await downloadCertificateImage('certificate-print-sheet', filename);
    } catch (err) {
      console.error('Image download error:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleGoogleDriveSave = async () => {
    if (!checkValidation('Google Drive সংরক্ষণ')) return;
    try {
      setIsSavingDrive(true);
      const filename = `birth_certificate_${record.referenceId || 'draft'}.pdf`;
      await saveToGoogleDriveOrShare('certificate-print-sheet', `Birth Certificate - ${record.nameEn || record.nameBn}`, filename);
    } catch (err) {
      console.error('Drive save error:', err);
    } finally {
      setIsSavingDrive(false);
    }
  };

  const handleFieldChange = (field: keyof DemoRecord, value: any) => {
    if (!onUpdateRecord) return;
    const updated = { ...record, [field]: value };
    
    // Auto-update date words if date changes
    if (field === 'dateOfBirth') {
      updated.dateOfBirthWordsEn = convertDateToEnglishWords(value);
      updated.dateOfBirthWordsBn = convertDateToBengaliWords(value);
    }

    // Auto-format Place of Birth
    if (field === 'placeOfBirthBn' && typeof value === 'string' && value.trim()) {
      updated.placeOfBirthBn = formatPlaceOfBirthBn(value);
    }
    if (field === 'placeOfBirthEn' && typeof value === 'string' && value.trim()) {
      updated.placeOfBirthEn = formatPlaceOfBirthEn(value);
    }

    // Ensure permanent address suffix
    if (field === 'permanentAddressBn' && typeof value === 'string' && value.trim()) {
      updated.permanentAddressBn = ensureBaheratailAddressBn(value);
    }
    if (field === 'permanentAddressEn' && typeof value === 'string' && value.trim()) {
      updated.permanentAddressEn = ensureBaheratailAddressEn(value);
    }
    
    onUpdateRecord(updated);
  };

  const handleAutoGenerateQrKey = () => {
    if (!onUpdateRecord) return;
    const newKey = generateBdrisVerifyKey();
    const newUrl = getBdrisVerificationUrl(newKey);
    onUpdateRecord({
      ...record,
      qrVerificationKey: newKey,
      qrVerificationUrl: newUrl
    });
  };

  const handleResetQrKey = () => {
    if (!onUpdateRecord) return;
    onUpdateRecord({
      ...record,
      qrVerificationKey: DEFAULT_BDRIS_VERIFY_KEY,
      qrVerificationUrl: `https://bdris.gov.bd/certificate/verify?key=${DEFAULT_BDRIS_VERIFY_KEY}`,
      qrReferenceCode: record.qrReferenceCode || 'EETT'
    });
  };

  // Formatted date values
  const formattedRegDate = formatDateToDisplay(record.dateOfRegistration || '24/08/2026');
  const formattedIssueDate = formatDateToDisplay(record.dateOfIssuance || '27/08/2026');
  const formattedDob = formatDateToDisplay(record.dateOfBirth || '05/09/1987');

  return (
    <div className="flex flex-col items-center w-full space-y-3">
      {/* Top Toolbar (Not printed) */}
      {!isCompact && (
        <div className="w-full max-w-[800px] flex flex-wrap items-center justify-between gap-2 bg-emerald-900 text-emerald-50 px-4 py-2.5 rounded-t-lg shadow-sm border-b border-emerald-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-800 text-emerald-200 border border-emerald-700">
              A4 Portrait Preview
            </span>
            {onOpenEverify && (
              <button
                onClick={onOpenEverify}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded border border-emerald-600 transition cursor-pointer"
                title="BDRIS e-Verify সাইট থেকে অটো-ফিল করুন"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                <span>e-Verify অটো-ফিল</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onUpdateRecord && (
              <>
                <button
                  id="btn-toggle-qr-settings"
                  onClick={() => {
                    setShowQrSettings(!showQrSettings);
                    if (showLogoSettings) setShowLogoSettings(false);
                    if (showCertifiedOverlaySettings) setShowCertifiedOverlaySettings(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition cursor-pointer border ${
                    showQrSettings
                      ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold'
                      : 'bg-emerald-800 text-emerald-100 border-emerald-700 hover:bg-emerald-700'
                  }`}
                  title="QR কোডের নিচের শব্দ ও ভেরিফিকেশন লিংক/কী এবং বারকোড পরিবর্তন"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQrSettings ? 'QR কন্ট্রোলার লুকান' : 'QR ও বারকোড'}</span>
                </button>

                <button
                  id="btn-toggle-logo-settings"
                  onClick={() => {
                    setShowLogoSettings(!showLogoSettings);
                    if (showQrSettings) setShowQrSettings(false);
                    if (showCertifiedOverlaySettings) setShowCertifiedOverlaySettings(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition cursor-pointer border ${
                    showLogoSettings
                      ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold'
                      : 'bg-emerald-800 text-emerald-100 border-emerald-700 hover:bg-emerald-700'
                  }`}
                  title="লোগো ও জলছাপ আপলোড এবং সাইজ/দৃশ্যমানতা নিয়ন্ত্রণ"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showLogoSettings ? 'লোগো প্যানেল লুকান' : 'লোগো ও জলছাপ'}</span>
                </button>

                <button
                  id="btn-toggle-certified-overlay"
                  onClick={() => {
                    setShowCertifiedOverlaySettings(!showCertifiedOverlaySettings);
                    if (showQrSettings) setShowQrSettings(false);
                    if (showLogoSettings) setShowLogoSettings(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition cursor-pointer border ${
                    showCertifiedOverlaySettings
                      ? 'bg-red-500 text-white border-red-400 font-bold shadow-xs'
                      : record.printOverlayType && record.printOverlayType !== 'NONE'
                      ? 'bg-red-900/90 text-red-200 border-red-600 font-bold'
                      : 'bg-emerald-800 text-emerald-100 border-emerald-700 hover:bg-emerald-700'
                  }`}
                  title="সত্যায়িত সিল (Certified Copy) বা ড্রাফট সংস্করণ টগল করুন"
                >
                  <Stamp className="w-3.5 h-3.5 text-red-300" />
                  <span>
                    {record.printOverlayType === 'CERTIFIED_COPY'
                      ? '🔴 Certified Copy অন'
                      : record.printOverlayType === 'DRAFT'
                      ? '🟡 Draft Copy অন'
                      : record.printOverlayType && record.printOverlayType !== 'NONE'
                      ? `Overlay (${record.printOverlayType})`
                      : 'সত্যায়িত / Draft কপি'}
                  </span>
                </button>

                <button
                  id="btn-toggle-inline-edit"
                  onClick={() => setIsInlineEditing(!isInlineEditing)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition cursor-pointer border ${
                    isInlineEditing 
                      ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold' 
                      : 'bg-emerald-800 text-emerald-100 border-emerald-700 hover:bg-emerald-700'
                  }`}
                >
                  {isInlineEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{isInlineEditing ? 'সম্পাদনা সম্পন্ন' : 'সনদে সরাসরি লিখুন'}</span>
                </button>

                <button
                  id="btn-open-signature-manager"
                  onClick={() => {
                    setActiveSignatureTarget('registrar');
                    setSignatureModalOpen(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition cursor-pointer border ${
                    record.registrarSignatureUrl || record.assistantSignatureUrl
                      ? 'bg-emerald-700 text-white border-emerald-500 font-bold'
                      : 'bg-emerald-800 text-emerald-100 border-emerald-700 hover:bg-emerald-700'
                  }`}
                  title="চেয়ারম্যান ও প্রশাসনিক কর্মকর্তার ডিজিটাল স্বাক্ষর আঁকুন বা আপলোড করুন"
                >
                  <PenTool className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    {record.registrarSignatureUrl || record.assistantSignatureUrl
                      ? 'ডিজিটাল স্বাক্ষর (যুক্ত আছে)'
                      : 'ডিজিটাল স্বাক্ষর (Draw/Upload)'}
                  </span>
                </button>
              </>
            )}

            {/* Direct Phone Storage PDF Download */}
            <button
              id="btn-download-pdf-direct"
              onClick={handleDirectPdfDownload}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="সরাসরি মোবাইল বা পিসির Download ফোল্ডারে PDF সেভ করুন"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
            </button>

            {/* Direct Phone Storage Image (PNG) Download */}
            <button
              id="btn-download-png-direct"
              onClick={handleDirectImageDownload}
              disabled={isExportingImage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded border border-emerald-700 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="হাই-রেজ্যুলুশন PNG ছবি ডাউনলোড করুন"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isExportingImage ? 'ছবি হচ্ছে...' : 'HD ছবি (PNG)'}</span>
            </button>

            {/* Google Drive / Share button */}
            <button
              id="btn-drive-share"
              onClick={handleGoogleDriveSave}
              disabled={isSavingDrive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-700 hover:bg-sky-600 text-white rounded transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="Google Drive এ সেভ বা শেয়ার করুন"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Drive / Share</span>
            </button>

            {/* Native Browser Print button */}
            <button
              id="btn-print-certificate"
              onClick={handlePrintTrigger}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded transition shadow-xs cursor-pointer active:scale-95"
              title="A4 সাইজ সরাসরি প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট (A4)</span>
            </button>
          </div>
        </div>
      )}

      {/* Expandable QR Code & Barcode Customizer Panel */}
      {showQrSettings && onUpdateRecord && !isCompact && (
        <div className="w-full max-w-[800px] bg-slate-900 text-slate-100 p-4 rounded-lg shadow-xl border border-slate-800 space-y-4 print:hidden animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                কিউআর কোড ও বারকোড কনফিগারেশন (Live QR &amp; Barcode Controller)
              </h3>
            </div>
            <button
              onClick={() => setShowQrSettings(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field 1: Manual QR Word */}
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <label className="block text-xs font-semibold text-emerald-300 mb-1">
                QR কোডের নিচের ম্যানুয়াল শব্দ (Word underneath QR):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={record.qrReferenceCode || 'EETT'}
                  onChange={(e) => handleFieldChange('qrReferenceCode', e.target.value.toUpperCase())}
                  placeholder="EETT"
                  className="w-full text-sm font-mono tracking-widest font-bold uppercase px-3 py-1.5 border border-slate-600 rounded bg-slate-900 text-white focus:ring-1 focus:ring-emerald-400 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleFieldChange('qrReferenceCode', 'EETT')}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded cursor-pointer"
                >
                  EETT
                </button>
              </div>
            </div>

            {/* Field 2: Barcode value & options */}
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-300">
                  বারকোড (Code 128 Standard Barcode):
                </label>
                <button
                  type="button"
                  onClick={() => handleFieldChange('barcodeValue', record.referenceId || '19879318513121621')}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded cursor-pointer"
                  title="রেফারেন্স নম্বর বা BRN-এর সাথে হুবহু সিঙ্ক করুন"
                >
                  ⚡ BRN সিঙ্ক
                </button>
              </div>

              <input
                type="text"
                value={record.barcodeValue || record.referenceId || '19879318513121621'}
                onChange={(e) => handleFieldChange('barcodeValue', e.target.value)}
                placeholder="19879318513121621"
                className="w-full text-sm font-mono font-bold px-3 py-1.5 border border-slate-600 rounded bg-slate-900 text-white focus:ring-1 focus:ring-emerald-400 focus:outline-hidden"
              />

              {/* Barcode Controls: Height & Text display */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>উচ্চতা (Height):</span>
                    <span className="font-mono text-emerald-300 font-bold">{record.barcodeHeight || 32}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="48"
                    step="2"
                    value={record.barcodeHeight || 32}
                    onChange={(e) => handleFieldChange('barcodeHeight', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={record.barcodeShowText || false}
                      onChange={(e) => handleFieldChange('barcodeShowText', e.target.checked)}
                      className="rounded border-slate-600 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>নিচে সংখ্যা দেখান</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Verification URL and Auto Key Generator */}
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>QR কোড স্ক্যান করলে তৈরি হওয়া ভেরিফিকেশন লিঙ্ক (URL):</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoGenerateQrKey}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded cursor-pointer active:scale-95 transition"
                >
                  <Sparkles className="w-3 h-3 text-emerald-200" />
                  <span>Auto Key জেনারেট</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetQrKey}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-300 bg-slate-700 hover:bg-slate-600 rounded cursor-pointer transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ডিফল্ট কী</span>
                </button>
              </div>
            </div>

            <input
              type="text"
              value={record.qrVerificationUrl || `https://bdris.gov.bd/certificate/verify?key=${record.qrVerificationKey || DEFAULT_BDRIS_VERIFY_KEY}`}
              onChange={(e) => {
                const val = e.target.value;
                handleFieldChange('qrVerificationUrl', val);
                if (val.includes('key=')) {
                  const extractedKey = val.split('key=')[1]?.split('&')[0];
                  if (extractedKey) handleFieldChange('qrVerificationKey', extractedKey);
                }
              }}
              className="w-full text-xs font-mono text-emerald-300 bg-slate-950 px-3 py-2 border border-slate-700 rounded focus:ring-1 focus:ring-emerald-400 focus:outline-hidden"
            />
          </div>
        </div>
      )}

      {/* Expandable Logo and Watermark Customizer Panel */}
      {showLogoSettings && onUpdateRecord && !isCompact && (
        <div className="w-full max-w-[800px] print:hidden">
          <LogoWatermarkController
            record={record}
            onUpdateRecord={onUpdateRecord}
            onClose={() => setShowLogoSettings(false)}
          />
        </div>
      )}

      {/* Expandable Certified Copy / Draft Overlay Controller Panel */}
      {showCertifiedOverlaySettings && onUpdateRecord && !isCompact && (
        <div className="w-full max-w-[800px] print:hidden">
          <CertifiedCopyController
            record={record}
            onChange={(updatedFields) => onUpdateRecord({ ...record, ...updatedFields })}
            onClose={() => setShowCertifiedOverlaySettings(false)}
          />
        </div>
      )}

      {/* Main Certificate Sheet (Strict A4 Dimensions 210mm x 297mm matching PDF screenshot exactly) */}
      <div 
        id="certificate-print-sheet"
        ref={printRef}
        className="certificate-a4-sheet bg-white text-slate-900 shadow-2xl border border-slate-300 relative flex flex-col justify-between overflow-hidden print:shadow-none print:border-none print:m-0"
        style={{
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          width: '210mm',
          height: '297mm',
          minHeight: '297mm',
          maxHeight: '297mm',
          maxWidth: '210mm',
          padding: '18mm 18mm 14mm 18mm',
          boxSizing: 'border-box'
        }}
      >
        {/* Background Decorative Watermark (Baby Silhouette + Circular Seal matching BDRIS) */}
        <DemoBackgroundWatermark 
          size={record.watermarkSize ?? 440}
          opacity={record.watermarkOpacity ?? 22}
          visible={record.watermarkVisible ?? true}
          customUrl={record.watermarkUrl}
        />

        {/* Draft / Certified Copy Visual Overlays & Red Seals */}
        <CertifiedCopyOverlay record={record} />

        {/* Certificate Content Wrapper */}
        <div className="relative z-10 flex flex-col h-full justify-between flex-1">
          
          {/* Header & Meta & Body Data Section */}
          <div className="flex flex-col">
            
            {/* Top Row: Left QR Code, Center Emblem, Right Barcode */}
            <div className="grid grid-cols-12 items-start">
              
              {/* Left QR Code with manual word underneath */}
              <div className="col-span-3 flex flex-col items-start justify-start">
                <DemoQRCode 
                  size={isCompact ? 72 : 82} 
                  referenceText={record.qrReferenceCode || "EETT"} 
                  record={record} 
                  isInlineEditing={isInlineEditing}
                  onReferenceTextChange={(txt) => handleFieldChange('qrReferenceCode', txt)}
                  onVerificationUrlChange={(url) => handleFieldChange('qrVerificationUrl', url)}
                />
              </div>

              {/* Center Emblem */}
              <div className="col-span-6 flex flex-col items-center justify-center text-center pt-0.5">
                <div 
                  className="cursor-pointer"
                  title="লোগো সাইজ ও দৃশ্যমানতা বদলাতে ক্লিক করুন"
                  onClick={() => onUpdateRecord && setShowLogoSettings(true)}
                >
                  <DemoTopEmblem 
                    size={record.topLogoSize ?? 58} 
                    opacity={record.topLogoOpacity ?? 100}
                    visible={record.topLogoVisible ?? true}
                    customUrl={record.topLogoUrl}
                    className="drop-shadow-2xs" 
                  />
                </div>
              </div>

              {/* Right Barcode (Official Code 128 dynamic vector barcode reflecting Reference ID) */}
              <div 
                className="col-span-3 flex justify-end pt-1.5 cursor-pointer"
                title="বারকোড সেটিং পরিবর্তন করতে ক্লিক করুন"
                onClick={() => onUpdateRecord && setShowQrSettings(true)}
              >
                <DemoBarcode 
                  referenceNumber={record.barcodeValue || record.referenceId || "19879318513121621"} 
                  height={record.barcodeHeight || 32}
                  showText={record.barcodeShowText || false}
                  isInlineEditing={isInlineEditing}
                  onBarcodeChange={(val) => handleFieldChange('barcodeValue', val)}
                />
              </div>

            </div>


            {/* Office & Government Title Details (Centered) */}
            <div className="flex flex-col items-center text-center space-y-0.5 text-slate-900 mt-1">
              
              <h1 className="text-[15.5px] font-normal text-slate-900 tracking-normal font-sans">
                {isInlineEditing ? (
                  <input
                    type="text"
                    value="Government of the People's Republic of Bangladesh"
                    readOnly
                    className="text-center font-normal bg-amber-50/80 border border-amber-300 rounded px-1 text-sm"
                  />
                ) : (
                  "Government of the People's Republic of Bangladesh"
                )}
              </h1>
              
              <div className="text-[13px] text-slate-850 font-normal">
                {isInlineEditing ? (
                  <input
                    type="text"
                    value={record.officeNameEn}
                    onChange={(e) => handleFieldChange('officeNameEn', e.target.value)}
                    className="text-center bg-amber-50/80 border border-amber-300 rounded px-1 text-xs"
                  />
                ) : (
                  record.officeNameEn || "Office of the Registrar, Birth and Death Registration"
                )}
              </div>
              
              <div className="text-[13px] text-slate-850 font-normal tracking-wide">
                {isInlineEditing ? (
                  <input
                    type="text"
                    value={record.unionParishadEn || FIXED_UNION_PARISHAD_EN}
                    onChange={(e) => handleFieldChange('unionParishadEn', e.target.value)}
                    className="text-center bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-medium"
                  />
                ) : (
                  record.unionParishadEn || "Baheratail Union Parishad"
                )}
              </div>
              
              <div className="text-[13px] text-slate-850 font-normal tracking-wide">
                {isInlineEditing ? (
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="text"
                      value={record.upazilaEn || "Sakhipur"}
                      onChange={(e) => handleFieldChange('upazilaEn', e.target.value)}
                      className="text-center bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-24"
                    />
                    <span>,</span>
                    <input
                      type="text"
                      value={record.districtEn || "Tangail"}
                      onChange={(e) => handleFieldChange('districtEn', e.target.value)}
                      className="text-center bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-24"
                    />
                  </div>
                ) : (
                  `${record.upazilaEn || "Sakhipur"}, ${record.districtEn || "Tangail"}`
                )}
              </div>
              
              <div className="text-[11.5px] text-slate-700 font-sans font-normal">
                {isInlineEditing ? (
                  <input
                    type="text"
                    value={record.ruleText}
                    onChange={(e) => handleFieldChange('ruleText', e.target.value)}
                    className="text-center bg-amber-50/80 border border-amber-300 rounded px-1 text-[11px] w-28"
                  />
                ) : (
                  record.ruleText || "(Rule 9, 10)"
                )}
              </div>

              {/* Main Title (Exact font weight & size matching screenshot) */}
              <div className="pt-3 pb-3.5">
                <h2 className="text-[16px] font-bold text-slate-950 font-['Noto_Sans_Bengali',sans-serif]">
                  জন্ম নিবন্ধন সনদ / Birth Registration Certificate
                </h2>
              </div>
            </div>

            {/* Registration Dates & 17-digit BRN Number Row */}
            <div className="grid grid-cols-12 items-baseline text-[12.5px] font-sans pb-3 mb-2">
              
              {/* Left: Date of Registration */}
              <div className="col-span-4 text-left">
                <div className="text-slate-800 font-normal">Date of Registration</div>
                <div className="font-normal text-slate-950 mt-0.5 text-[13px]">
                  {isInlineEditing ? (
                    <input
                      type="text"
                      value={record.dateOfRegistration}
                      onChange={(e) => handleFieldChange('dateOfRegistration', e.target.value)}
                      className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-24 font-normal"
                    />
                  ) : (
                    formattedRegDate
                  )}
                </div>
              </div>

              {/* Center: Birth Registration Number (17 Digits) */}
              <div className="col-span-4 text-center">
                <div className="text-slate-800 font-normal">Birth Registration Number</div>
                <div className="font-bold text-slate-950 text-[15px] mt-0.5 tracking-normal font-sans">
                  {isInlineEditing ? (
                    <input
                      type="text"
                      value={record.referenceId}
                      onChange={(e) => handleFieldChange('referenceId', e.target.value)}
                      className="text-center bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-bold w-44"
                    />
                  ) : (
                    record.referenceId || "19879318513121621"
                  )}
                </div>
              </div>

              {/* Right: Date of Issuance */}
              <div className="col-span-4 text-right">
                <div className="text-slate-800 font-normal">Date of Issuance</div>
                <div className="font-normal text-slate-950 mt-0.5 text-[13px]">
                  {isInlineEditing ? (
                    <input
                      type="text"
                      value={record.dateOfIssuance}
                      onChange={(e) => handleFieldChange('dateOfIssuance', e.target.value)}
                      className="text-right bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-24 font-normal"
                    />
                  ) : (
                    formattedIssueDate
                  )}
                </div>
              </div>

            </div>

            {/* Main Certificate Data Section (Exact 2-Column Tabular Alignment & Precise Line-Spacing) */}
            <div className="space-y-3 text-[13px] text-slate-900 leading-normal font-sans pt-1">
              
              {/* Row 1: Date of Birth & Sex */}
              <div className="grid grid-cols-12 gap-3 items-baseline">
                <div className="col-span-7 flex items-baseline">
                  <span className="w-[110px] text-slate-850 shrink-0 font-normal">Date of Birth</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.dateOfBirth}
                        onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-28"
                      />
                    ) : (
                      formattedDob
                    )}
                  </span>
                </div>
                <div className="col-span-5 flex items-baseline">
                  <span className="w-[50px] text-slate-850 shrink-0 font-normal">Sex</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950">
                    {isInlineEditing ? (
                      <select
                        value={record.sex}
                        onChange={(e) => {
                          const val = e.target.value as 'Male' | 'Female' | 'Other';
                          const bn = val === 'Male' ? 'পুরুষ' : val === 'Female' ? 'মহিলা' : 'অন্যান্য';
                          if (onUpdateRecord) {
                            onUpdateRecord({ ...record, sex: val, sexBn: bn });
                          }
                        }}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      record.sex || "Female"
                    )}
                  </span>
                </div>
              </div>

              {/* Row 2: In Word (Full width) */}
              <div className="flex items-baseline">
                <span className="w-[110px] text-slate-850 shrink-0 font-normal">In Word</span>
                <span className="w-4 text-slate-850">:</span>
                <span className="font-normal text-slate-950">
                  {isInlineEditing ? (
                    <input
                      type="text"
                      value={record.dateOfBirthWordsEn}
                      onChange={(e) => handleFieldChange('dateOfBirthWordsEn', e.target.value)}
                      className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-full max-w-md"
                    />
                  ) : (
                    record.dateOfBirthWordsEn || "Fifth of September Nineteen Eighty Seven"
                  )}
                </span>
              </div>

              {/* Row 3: নাম (Bangla) & Name (English) */}
              <div className="grid grid-cols-12 gap-3 items-baseline pt-0.5">
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[110px] text-slate-850 shrink-0 font-['Noto_Sans_Bengali']">নাম</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950 font-['Noto_Sans_Bengali']">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.nameBn}
                        onChange={(e) => handleFieldChange('nameBn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-['Noto_Sans_Bengali'] w-40"
                      />
                    ) : (
                      record.nameBn || "সাজেদা আক্তার"
                    )}
                  </span>
                </div>
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[105px] text-slate-850 shrink-0 font-normal">Name</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.nameEn}
                        onChange={(e) => handleFieldChange('nameEn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-40"
                      />
                    ) : (
                      record.nameEn || "Shajeda Akter"
                    )}
                  </span>
                </div>
              </div>

              {/* Row 4: মাতা (Bangla) & Mother (English) */}
              <div className="grid grid-cols-12 gap-3 items-baseline">
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[110px] text-slate-850 shrink-0 font-['Noto_Sans_Bengali']">মাতা</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950 font-['Noto_Sans_Bengali']">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.motherNameBn}
                        onChange={(e) => handleFieldChange('motherNameBn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-['Noto_Sans_Bengali'] w-40"
                      />
                    ) : (
                      record.motherNameBn || "জাহানারা বেগম"
                    )}
                  </span>
                </div>
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[105px] text-slate-850 shrink-0 font-normal">Mother</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.motherNameEn}
                        onChange={(e) => handleFieldChange('motherNameEn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-40"
                      />
                    ) : (
                      record.motherNameEn || "Jahanara Begum"
                    )}
                  </span>
                </div>
              </div>

              {/* Row 5: মাতার জাতীয়তা (Bangla) & Nationality (English) */}
              <div className="grid grid-cols-12 gap-3 items-baseline">
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[110px] text-slate-850 shrink-0 font-['Noto_Sans_Bengali']">মাতার জাতীয়তা</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950 font-['Noto_Sans_Bengali']">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.motherNationalityBn}
                        onChange={(e) => handleFieldChange('motherNationalityBn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-['Noto_Sans_Bengali'] w-32"
                      />
                    ) : (
                      record.motherNationalityBn || "বাংলাদেশী"
                    )}
                  </span>
                </div>
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[105px] text-slate-850 shrink-0 font-normal">Nationality</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.motherNationalityEn}
                        onChange={(e) => handleFieldChange('motherNationalityEn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-32"
                      />
                    ) : (
                      record.motherNationalityEn || "Bangladeshi"
                    )}
                  </span>
                </div>
              </div>

              {/* Row 6: পিতা (Bangla) & Father (English) */}
              <div className="grid grid-cols-12 gap-3 items-baseline">
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[110px] text-slate-850 shrink-0 font-['Noto_Sans_Bengali']">পিতা</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950 font-['Noto_Sans_Bengali']">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.fatherNameBn}
                        onChange={(e) => handleFieldChange('fatherNameBn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-['Noto_Sans_Bengali'] w-40"
                      />
                    ) : (
                      record.fatherNameBn || "মোঃ শাহজাহান"
                    )}
                  </span>
                </div>
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[105px] text-slate-850 shrink-0 font-normal">Father</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.fatherNameEn}
                        onChange={(e) => handleFieldChange('fatherNameEn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-40"
                      />
                    ) : (
                      record.fatherNameEn || "Md Shahjahan"
                    )}
                  </span>
                </div>
              </div>

              {/* Row 7: পিতার জাতীয়তা (Bangla) & Nationality (English) */}
              <div className="grid grid-cols-12 gap-3 items-baseline">
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[110px] text-slate-850 shrink-0 font-['Noto_Sans_Bengali']">পিতার জাতীয়তা</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950 font-['Noto_Sans_Bengali']">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.fatherNationalityBn}
                        onChange={(e) => handleFieldChange('fatherNationalityBn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-['Noto_Sans_Bengali'] w-32"
                      />
                    ) : (
                      record.fatherNationalityBn || "বাংলাদেশী"
                    )}
                  </span>
                </div>
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[105px] text-slate-850 shrink-0 font-normal">Nationality</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.fatherNationalityEn}
                        onChange={(e) => handleFieldChange('fatherNationalityEn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-32"
                      />
                    ) : (
                      record.fatherNationalityEn || "Bangladeshi"
                    )}
                  </span>
                </div>
              </div>

              {/* Row 8: জন্মস্থান (Bangla) & Place of Birth (English) */}
              <div className="grid grid-cols-12 gap-3 items-baseline">
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[110px] text-slate-850 shrink-0 font-['Noto_Sans_Bengali']">জন্মস্থান</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950 font-['Noto_Sans_Bengali']">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.placeOfBirthBn}
                        onChange={(e) => handleFieldChange('placeOfBirthBn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-['Noto_Sans_Bengali'] w-40"
                      />
                    ) : (
                      record.placeOfBirthBn || "টাঙ্গাইল, বাংলাদেশ"
                    )}
                  </span>
                </div>
                <div className="col-span-6 flex items-baseline">
                  <span className="w-[105px] text-slate-850 shrink-0 font-normal">Place of Birth</span>
                  <span className="w-4 text-slate-850">:</span>
                  <span className="font-normal text-slate-950">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.placeOfBirthEn}
                        onChange={(e) => handleFieldChange('placeOfBirthEn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-40"
                      />
                    ) : (
                      record.placeOfBirthEn || "Tangail, Bangladesh"
                    )}
                  </span>
                </div>
              </div>

              {/* Row 9: স্থায়ী ঠিকানা (Bangla) & Permanent Address (English) */}
              <div className="grid grid-cols-12 gap-3 items-start pt-0.5">
                <div className="col-span-6 flex items-start">
                  <span className="w-[110px] text-slate-850 shrink-0 font-['Noto_Sans_Bengali'] pt-0.5">স্থায়ী ঠিকানা</span>
                  <span className="w-4 pt-0.5 text-slate-850">:</span>
                  <span className="font-normal text-slate-950 font-['Noto_Sans_Bengali'] leading-relaxed">
                    {isInlineEditing ? (
                      <textarea
                        rows={2}
                        value={record.permanentAddressBn}
                        onChange={(e) => handleFieldChange('permanentAddressBn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-['Noto_Sans_Bengali'] w-full"
                      />
                    ) : (
                      <div className="space-y-0.5">
                        {record.permanentAddressBn ? (
                          record.permanentAddressBn.includes('\n') ? (
                            record.permanentAddressBn.split('\n').map((line, idx) => (
                              <div key={idx}>{line}</div>
                            ))
                          ) : record.permanentAddressBn.includes('ওয়ার্ড') ? (
                            <>
                              <div>{record.permanentAddressBn.split(',')[0]}, {record.permanentAddressBn.split(',')[1]},</div>
                              <div>{record.permanentAddressBn.split(',').slice(2).join(',').trim()}</div>
                            </>
                          ) : (
                            <div>{record.permanentAddressBn}</div>
                          )
                        ) : (
                          <>
                            <div>দাবাইল নাগবাড়ী-১৯৭২, ওয়ার্ড - ১,</div>
                            <div>বহেরাতৈল, সখিপুর, টাঙ্গাইল</div>
                          </>
                        )}
                      </div>
                    )}
                  </span>
                </div>
                <div className="col-span-6 flex items-start">
                  <div className="w-[105px] text-slate-850 shrink-0 pt-0.5 leading-tight">
                    <span>Permanent</span><br />
                    <span>Address</span>
                  </div>
                  <span className="w-4 pt-0.5 text-slate-850">:</span>
                  <span className="font-normal text-slate-950 leading-relaxed">
                    {isInlineEditing ? (
                      <textarea
                        rows={2}
                        value={record.permanentAddressEn}
                        onChange={(e) => handleFieldChange('permanentAddressEn', e.target.value)}
                        className="bg-amber-50/80 border border-amber-300 rounded px-1 text-xs w-full"
                      />
                    ) : (
                      <div className="space-y-0.5">
                        {record.permanentAddressEn ? (
                          record.permanentAddressEn.includes('\n') ? (
                            record.permanentAddressEn.split('\n').map((line, idx) => (
                              <div key={idx}>{line}</div>
                            ))
                          ) : record.permanentAddressEn.includes('Ward') ? (
                            <>
                              <div>{record.permanentAddressEn.split('Ward')[0]}Ward -</div>
                              <div>{record.permanentAddressEn.split('Ward')[1]?.replace(/^[\s\-]+/, '') || '1, Baheratail, Sakhipur, Tangail'}</div>
                            </>
                          ) : (
                            <div>{record.permanentAddressEn}</div>
                          )
                        ) : (
                          <>
                            <div>Dabail Nagbari-1972, Ward -</div>
                            <div>1, Baheratail, Sakhipur,</div>
                            <div>Tangail</div>
                          </>
                        )}
                      </div>
                    )}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Signatures & Footer Notice (Exact alignment matching screenshot) */}
          <div className="mt-auto pt-8">
            
            {/* Signature Blocks with Optional Digital Signature & Seal Rendering */}
            <div className="grid grid-cols-2 gap-8 items-end pb-12">
              
              {/* Left: Assistant Signature Block */}
              <div className="flex flex-col items-center text-center relative group">
                {/* Rendered Digital Signature if present */}
                {record.assistantSignatureUrl ? (
                  <div className="relative flex flex-col items-center mb-1">
                    {record.assistantSignatureVisible !== false ? (
                      <img 
                        src={record.assistantSignatureUrl} 
                        alt="Assistant Signature" 
                        style={{ 
                          height: `${record.assistantSignatureHeight || 48}px`,
                          transform: `rotate(${record.assistantSignatureRotation || 0}deg)`
                        }}
                        className="max-w-[150px] object-contain filter drop-shadow-xs transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-9 flex items-center justify-center text-[10px] text-slate-400 border border-dashed border-slate-300 rounded px-2 py-0.5 mb-1 print:hidden bg-slate-50">
                        <EyeOff className="w-3 h-3 text-slate-400 mr-1" />
                        <span>স্বাক্ষর লুকানো রয়েছে</span>
                      </div>
                    )}

                    {onUpdateRecord && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-slate-900/90 text-white px-2 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 print:hidden text-[10px]">
                        {/* Size Minus */}
                        <button
                          type="button"
                          onClick={() => {
                            const curH = record.assistantSignatureHeight || 48;
                            handleFieldChange('assistantSignatureHeight', Math.max(24, curH - 4));
                          }}
                          className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
                          title="ছোট করুন (-4px)"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="font-mono px-0.5 text-[9px] text-emerald-400">
                          {record.assistantSignatureHeight || 48}px
                        </span>
                        {/* Size Plus */}
                        <button
                          type="button"
                          onClick={() => {
                            const curH = record.assistantSignatureHeight || 48;
                            handleFieldChange('assistantSignatureHeight', Math.min(96, curH + 4));
                          }}
                          className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
                          title="বড় করুন (+4px)"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>

                        <div className="w-px h-3 bg-slate-700 mx-0.5" />

                        {/* Rotate Left */}
                        <button
                          type="button"
                          onClick={() => {
                            const curR = record.assistantSignatureRotation || 0;
                            handleFieldChange('assistantSignatureRotation', Math.max(-30, curR - 3));
                          }}
                          className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
                          title="বামে ঘোরান (-3°)"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                        </button>
                        {/* Rotate Right */}
                        <button
                          type="button"
                          onClick={() => {
                            const curR = record.assistantSignatureRotation || 0;
                            handleFieldChange('assistantSignatureRotation', Math.min(30, curR + 3));
                          }}
                          className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
                          title="ডানে ঘোরান (+3°)"
                        >
                          <RotateCw className="w-2.5 h-2.5" />
                        </button>

                        <div className="w-px h-3 bg-slate-700 mx-0.5" />

                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const isVis = record.assistantSignatureVisible !== false;
                            handleFieldChange('assistantSignatureVisible', !isVis);
                          }}
                          className={`p-1 hover:bg-slate-700 rounded-full ${
                            record.assistantSignatureVisible !== false ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                          title={record.assistantSignatureVisible !== false ? "স্বাক্ষর সাময়িক লুকান" : "স্বাক্ষর প্রদর্শন করুন"}
                        >
                          {record.assistantSignatureVisible !== false ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        </button>

                        {/* Edit Pad */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSignatureTarget('assistant');
                            setSignatureModalOpen(true);
                          }}
                          className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
                          title="স্বাক্ষর পরিবর্তন ও AI ব্যাকগ্রাউন্ড রিমুভ"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleFieldChange('assistantSignatureUrl', undefined)}
                          className="p-1 hover:bg-red-800 rounded-full text-red-400 hover:text-red-200"
                          title="স্বাক্ষর মুছুন"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : onUpdateRecord ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSignatureTarget('assistant');
                      setSignatureModalOpen(true);
                    }}
                    className="mb-2 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-dashed border-slate-300 hover:border-emerald-500 rounded-md transition cursor-pointer print:hidden flex items-center gap-1"
                    title="প্রশাসনিক কর্মকর্তা / সহকারী স্বাক্ষর আঁকুন বা আপলোড করুন"
                  >
                    <PenTool className="w-3 h-3 text-emerald-600" />
                    <span>+ ডিজিটাল স্বাক্ষর যুক্ত করুন</span>
                  </button>
                ) : (
                  <div className="h-6" />
                )}

                <span className="text-[13px] text-slate-850 font-normal">
                  Seal &amp; Signature
                </span>
                <span className="text-[13.5px] font-bold text-slate-950 mt-1">
                  {isInlineEditing ? (
                    <input
                      type="text"
                      value={record.assistantTitleEn || DEFAULT_ASSISTANT_TITLE_EN}
                      onChange={(e) => handleFieldChange('assistantTitleEn', e.target.value)}
                      className="text-center bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-bold"
                    />
                  ) : (
                    record.assistantTitleEn || DEFAULT_ASSISTANT_TITLE_EN
                  )}
                </span>
                <span className="text-[11.5px] text-slate-700 mt-0.5 font-normal">
                  {isInlineEditing ? (
                    <input
                      type="text"
                      value={record.assistantTitleBn || DEFAULT_ASSISTANT_TITLE_BN}
                      onChange={(e) => handleFieldChange('assistantTitleBn', e.target.value)}
                      className="text-center bg-amber-50/80 border border-amber-300 rounded px-1 text-[11px]"
                    />
                  ) : (
                    record.assistantTitleBn || DEFAULT_ASSISTANT_TITLE_BN
                  )}
                </span>
              </div>

              {/* Right: Registrar Signature Block */}
              <div className="flex flex-col items-center text-center relative group">
                {/* Rendered Digital Signature if present */}
                {record.registrarSignatureUrl ? (
                  <div className="relative flex flex-col items-center mb-1">
                    {record.registrarSignatureVisible !== false ? (
                      <img 
                        src={record.registrarSignatureUrl} 
                        alt="Registrar Signature" 
                        style={{ 
                          height: `${record.registrarSignatureHeight || 48}px`,
                          transform: `rotate(${record.registrarSignatureRotation || 0}deg)`
                        }}
                        className="max-w-[150px] object-contain filter drop-shadow-xs transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-9 flex items-center justify-center text-[10px] text-slate-400 border border-dashed border-slate-300 rounded px-2 py-0.5 mb-1 print:hidden bg-slate-50">
                        <EyeOff className="w-3 h-3 text-slate-400 mr-1" />
                        <span>স্বাক্ষর লুকানো রয়েছে</span>
                      </div>
                    )}

                    {onUpdateRecord && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-slate-900/90 text-white px-2 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 print:hidden text-[10px]">
                        {/* Size Minus */}
                        <button
                          type="button"
                          onClick={() => {
                            const curH = record.registrarSignatureHeight || 48;
                            handleFieldChange('registrarSignatureHeight', Math.max(24, curH - 4));
                          }}
                          className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
                          title="ছোট করুন (-4px)"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="font-mono px-0.5 text-[9px] text-emerald-400">
                          {record.registrarSignatureHeight || 48}px
                        </span>
                        {/* Size Plus */}
                        <button
                          type="button"
                          onClick={() => {
                            const curH = record.registrarSignatureHeight || 48;
                            handleFieldChange('registrarSignatureHeight', Math.min(96, curH + 4));
                          }}
                          className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
                          title="বড় করুন (+4px)"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>

                        <div className="w-px h-3 bg-slate-700 mx-0.5" />

                        {/* Rotate Left */}
                        <button
                          type="button"
                          onClick={() => {
                            const curR = record.registrarSignatureRotation || 0;
                            handleFieldChange('registrarSignatureRotation', Math.max(-30, curR - 3));
                          }}
                          className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
                          title="বামে ঘোরান (-3°)"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                        </button>
                        {/* Rotate Right */}
                        <button
                          type="button"
                          onClick={() => {
                            const curR = record.registrarSignatureRotation || 0;
                            handleFieldChange('registrarSignatureRotation', Math.min(30, curR + 3));
                          }}
                          className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
                          title="ডানে ঘোরান (+3°)"
                        >
                          <RotateCw className="w-2.5 h-2.5" />
                        </button>

                        <div className="w-px h-3 bg-slate-700 mx-0.5" />

                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const isVis = record.registrarSignatureVisible !== false;
                            handleFieldChange('registrarSignatureVisible', !isVis);
                          }}
                          className={`p-1 hover:bg-slate-700 rounded-full ${
                            record.registrarSignatureVisible !== false ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                          title={record.registrarSignatureVisible !== false ? "স্বাক্ষর সাময়িক লুকান" : "স্বাক্ষর প্রদর্শন করুন"}
                        >
                          {record.registrarSignatureVisible !== false ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        </button>

                        {/* Edit Pad */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSignatureTarget('registrar');
                            setSignatureModalOpen(true);
                          }}
                          className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
                          title="স্বাক্ষর পরিবর্তন ও AI ব্যাকগ্রাউন্ড রিমুভ"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleFieldChange('registrarSignatureUrl', undefined)}
                          className="p-1 hover:bg-red-800 rounded-full text-red-400 hover:text-red-200"
                          title="স্বাক্ষর মুছুন"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : onUpdateRecord ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSignatureTarget('registrar');
                      setSignatureModalOpen(true);
                    }}
                    className="mb-2 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-dashed border-slate-300 hover:border-emerald-500 rounded-md transition cursor-pointer print:hidden flex items-center gap-1"
                    title="চেয়ারম্যান / নিবন্ধক স্বাক্ষর আঁকুন বা আপলোড করুন"
                  >
                    <PenTool className="w-3 h-3 text-emerald-600" />
                    <span>+ ডিজিটাল স্বাক্ষর যুক্ত করুন</span>
                  </button>
                ) : (
                  <div className="h-6" />
                )}

                <span className="text-[13px] text-slate-850 font-normal">
                  Seal &amp; Signature
                </span>
                <span className="text-[13.5px] font-bold text-slate-950 mt-1">
                  {isInlineEditing ? (
                    <input
                      type="text"
                      value={record.registrarTitleEn || DEFAULT_REGISTRAR_TITLE_EN}
                      onChange={(e) => handleFieldChange('registrarTitleEn', e.target.value)}
                      className="text-center bg-amber-50/80 border border-amber-300 rounded px-1 text-xs font-bold"
                    />
                  ) : (
                    record.registrarTitleEn || DEFAULT_REGISTRAR_TITLE_EN
                  )}
                </span>
                {record.registrarTitleBn && (
                  <span className="text-[11.5px] text-slate-700 mt-0.5 font-normal">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={record.registrarTitleBn}
                        onChange={(e) => handleFieldChange('registrarTitleBn', e.target.value)}
                        className="text-center bg-amber-50/80 border border-amber-300 rounded px-1 text-[11px]"
                      />
                    ) : (
                      record.registrarTitleBn
                    )}
                  </span>
                )}
              </div>

            </div>

            {/* Official Footer Verification Disclaimer Line matching screenshot */}
            <div className="text-center pt-2">
              <p className="text-[10px] text-slate-700 font-sans tracking-tight">
                This certificate is generated from bdris.gov.bd, and to verify this certificate, please scan the above QR Code &amp; Bar Code.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Validation Guard Modal */}
      <ValidationGuardModal
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        issues={validationIssues}
        actionName={blockedActionName}
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
            ? record.assistantSignatureUrl
            : record.registrarSignatureUrl
        }
        currentHeight={
          activeSignatureTarget === 'assistant'
            ? record.assistantSignatureHeight || 48
            : record.registrarSignatureHeight || 48
        }
        currentRotation={
          activeSignatureTarget === 'assistant'
            ? record.assistantSignatureRotation || 0
            : record.registrarSignatureRotation || 0
        }
        currentVisible={
          activeSignatureTarget === 'assistant'
            ? record.assistantSignatureVisible !== false
            : record.registrarSignatureVisible !== false
        }
        onSaveSignature={({ signatureDataUrl, height, rotation, visible }) => {
          if (!onUpdateRecord) return;
          if (activeSignatureTarget === 'assistant') {
            onUpdateRecord({
              ...record,
              assistantSignatureUrl: signatureDataUrl,
              assistantSignatureHeight: height,
              assistantSignatureRotation: rotation,
              assistantSignatureVisible: visible
            });
          } else {
            onUpdateRecord({
              ...record,
              registrarSignatureUrl: signatureDataUrl,
              registrarSignatureHeight: height,
              registrarSignatureRotation: rotation,
              registrarSignatureVisible: visible
            });
          }
        }}
        onRemoveSignature={() => {
          if (!onUpdateRecord) return;
          if (activeSignatureTarget === 'assistant') {
            onUpdateRecord({
              ...record,
              assistantSignatureUrl: undefined,
              assistantSignatureHeight: undefined,
              assistantSignatureRotation: undefined,
              assistantSignatureVisible: true
            });
          } else {
            onUpdateRecord({
              ...record,
              registrarSignatureUrl: undefined,
              registrarSignatureHeight: undefined,
              registrarSignatureRotation: undefined,
              registrarSignatureVisible: true
            });
          }
        }}
      />
    </div>
  );
};
