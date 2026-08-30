import React from 'react';
import { ValidationIssue } from '../utils/bdrisParser';
import { AlertTriangle, X, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

interface ValidationGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: ValidationIssue[];
  actionName?: string; // e.g. "প্রিন্ট", "PDF ডাউনলোড", "রেকর্ড সাবমিট"
  onGoToForm?: () => void;
}

export const ValidationGuardModal: React.FC<ValidationGuardModalProps> = ({
  isOpen,
  onClose,
  issues,
  actionName = 'ডাউনলোড বা সাবমিট',
  onGoToForm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-red-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-4 bg-red-900 text-white flex items-center justify-between border-b border-red-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-800 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                বাধ্যতামূলক তথ্য অসম্পূর্ণ (Validation Error)
              </h3>
              <p className="text-xs text-red-200">
                সকল তথ্য পূরণ না হওয়া পর্যন্ত {actionName} করা সম্ভব নয়
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-300 hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700 max-h-[60vh] overflow-y-auto">
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-950">
                অফিসিয়াল জন্ম নিবন্ধন সনদের {issues.length} টি তথ্য এখনো খালি বা ত্রুটিপূর্ণ রয়েছে:
              </p>
              <p className="text-xs text-red-800 mt-1">
                সরকারি নিয়ম অনুযায়ী সনদের উভয় ভাষা (বাংলা ও ইংরেজি) এবং ১৭-ডিজিট নিবন্ধন নম্বর নির্ভুলভাবে পূরণ করা বাধ্যতামূলক।
              </p>
            </div>
          </div>

          {/* List of missing fields */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 text-xs block">
              অসম্পূর্ণ ফিল্ডসমূহের তালিকা:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {issues.map((issue, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2 text-xs"
                >
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 font-['Noto_Sans_Bengali'] block">
                      {issue.labelBn}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {issue.labelEn} • {issue.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>

          {onGoToForm && (
            <button
              onClick={() => {
                onClose();
                onGoToForm();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <span>ফর্মে গিয়ে পূরণ করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
