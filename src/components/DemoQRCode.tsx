import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { DemoRecord } from '../types';
import { DEFAULT_BDRIS_VERIFY_KEY, getBdrisVerificationUrl } from '../utils/numberToWords';
import { QrCode, CheckCircle2, ExternalLink, ShieldCheck, X, Copy, Check, Sparkles, Key, Link as LinkIcon, Edit3 } from 'lucide-react';

interface DemoQRCodeProps {
  size?: number;
  className?: string;
  referenceText?: string;
  record?: DemoRecord;
  customData?: string;
  isInlineEditing?: boolean;
  onReferenceTextChange?: (text: string) => void;
  onVerificationUrlChange?: (url: string) => void;
}

export const DemoQRCode: React.FC<DemoQRCodeProps> = ({
  size = 82,
  className = '',
  referenceText = 'EETT',
  record,
  customData,
  isInlineEditing = false,
  onReferenceTextChange,
  onVerificationUrlChange
}) => {
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute the exact verification payload
  const verificationPayload = React.useMemo(() => {
    if (customData) return customData;
    if (record?.qrVerificationUrl && record.qrVerificationUrl.trim() !== '') {
      return record.qrVerificationUrl.trim();
    }
    if (record?.qrVerificationKey && record.qrVerificationKey.trim() !== '') {
      return getBdrisVerificationUrl(record.qrVerificationKey);
    }
    // Default standard BDRIS verify URL requested by user
    return `https://bdris.gov.bd/certificate/verify?key=${DEFAULT_BDRIS_VERIFY_KEY}`;
  }, [record?.qrVerificationUrl, record?.qrVerificationKey, customData]);

  const displayedWord = (record?.qrReferenceCode !== undefined && record?.qrReferenceCode !== null && record.qrReferenceCode !== '') 
    ? record.qrReferenceCode 
    : (referenceText || 'EETT');

  // Generate real SVG QR code dynamically
  useEffect(() => {
    let isMounted = true;
    QRCode.toString(verificationPayload, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111827',
        light: '#ffffff'
      }
    })
      .then((svg) => {
        if (isMounted) {
          setQrSvgString(svg);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [verificationPayload]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(verificationPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div 
        id="demo-qr-container"
        className={`inline-flex flex-col items-center select-none text-center ${className}`}
        title="কিউআর কোড স্ক্যান বা ক্লিক করে ডিজিটাল ভেরিফিকেশন দেখুন"
      >
        <div 
          onClick={() => setShowVerifyModal(true)}
          className="relative bg-white p-0.5 flex items-center justify-center cursor-pointer hover:opacity-90 transition group"
          style={{ width: size, height: size }}
        >
          {qrSvgString ? (
            <div 
              className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: qrSvgString }}
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center animate-pulse">
              <QrCode className="w-6 h-6 text-slate-400" />
            </div>
          )}

          {/* Hover indicator for verification in web preview */}
          <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center print:hidden">
            <span className="bg-emerald-900/90 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow">
              Scan
            </span>
          </div>
        </div>

        {/* Label beneath (e.g. EETT / User Manual Word) */}
        {isInlineEditing ? (
          <input
            type="text"
            value={displayedWord}
            onChange={(e) => onReferenceTextChange?.(e.target.value)}
            placeholder="EETT"
            className="text-[11px] font-mono tracking-[0.2em] text-slate-800 mt-1 font-bold uppercase w-16 text-center bg-amber-50/90 border border-amber-400 rounded px-1 py-0"
            title="QR কোডের নিচের ম্যানুয়াল শব্দ পরিবর্তন করুন"
          />
        ) : (
          <span 
            className="text-[11px] font-mono tracking-[0.2em] text-slate-800 mt-1 font-bold block uppercase cursor-pointer hover:text-emerald-700 transition"
            onClick={() => setShowVerifyModal(true)}
            title="ক্লিক করে এই শব্দ বা QR লিংক পরিবর্তন করুন"
          >
            {displayedWord}
          </span>
        )}
      </div>

      {/* Digital Verification Emulation Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-700/80 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    QR কোড ভেরিফিকেশন ও লিংক স্ক্যান
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    BDRIS Live QR Verification Link &amp; Code Inspector
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowVerifyModal(false)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Verification Status Badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-xs sm:text-sm">
                      QR কোড স্ক্যান রেজাল্ট (Auto-Generated URL)
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Live Link
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    যেকোনো মোবাইল ক্যামেরা দিয়ে QR কোড স্ক্যান করলে নিচের লিংকে রিডাইরেক্ট হবে:
                  </p>
                </div>
              </div>

              {/* QR Encoded Payload Box */}
              <div className="space-y-1.5 bg-slate-900 rounded-xl p-3.5 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5 text-emerald-400">
                    <LinkIcon className="w-3.5 h-3.5" /> স্ক্যান করলে তৈরি হওয়া লিংক:
                  </span>
                  <button
                    onClick={handleCopyPayload}
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950 text-emerald-300 font-mono text-[11px] rounded-lg break-all select-all border border-slate-800 leading-relaxed">
                  {verificationPayload}
                </div>
              </div>

              {/* Manual Word and Quick Change */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-700" />
                  QR এর নিচের ম্যানুয়াল শব্দ (Label Word)
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600">বর্তমান শব্দ:</span>
                  <span className="px-2.5 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-sm tracking-widest text-slate-900">
                    {displayedWord}
                  </span>
                  <span className="text-[11px] text-slate-500">(ফর্ম বা সনদের এডিট মোড থেকে সরাসরি পরিবর্তনযোগ্য)</span>
                </div>
              </div>

              {/* Verified Details Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">নিবন্ধন নম্বর (BRN):</span>
                  <span className="font-mono font-bold text-slate-900">{record?.referenceId || '19879318513121621'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">নাগরিকের নাম:</span>
                  <span className="font-semibold text-slate-900">{record?.nameEn || record?.nameBn || 'Shajeda Akter'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">জন্ম তারিখ:</span>
                  <span className="font-bold text-slate-900">{record?.dateOfBirth || '05/09/1987'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">নিবন্ধন কার্যালয়:</span>
                  <span className="text-slate-900 text-right">
                    {record?.unionParishadBn || 'বাহেরাতৈল ইউনিয়ন পরিষদ'}, {record?.upazilaBn || 'সখিপুর'}
                  </span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center">
              <a
                href={verificationPayload}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                ব্রাউজারে লিংক খুলুন
              </a>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                ঠিক আছে (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
