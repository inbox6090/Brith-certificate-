import React, { useState, useRef } from 'react';
import { DemoTopEmblem } from './DemoEmblem';
import { Printer, Edit3, Check, RefreshCw, Sparkles, FileText, Download } from 'lucide-react';

export interface PadDocumentData {
  memoNo: string;
  issueDate: string;
  docTitle: string;
  adminNameBn: string;
  adminNameEn: string;
  adminTitleBn: string;
  adminTitleEn: string;
  upNameBn: string;
  upNameEn: string;
  upazilaBn: string;
  upazilaEn: string;
  districtBn: string;
  districtEn: string;
  
  // Officer 2 (Administrative Officer)
  officerNameBn: string;
  officerNameEn: string;
  officerTitleBn: string;
  officerTitleEn: string;

  // Content
  introText: string;
  institutionName: string;
  pageUrl: string;
  metaBusinessId: string;
  metaAppId: string;
  purpose: string;
  appName: string;
  authStatement: string;
  assignedPersonName: string;
  assignedPersonRole: string;
  assignedPersonMobile: string;
  assignedPersonEmail: string;
  closingStatement: string;
}

export const INITIAL_PAD_DATA: PadDocumentData = {
  memoNo: 'UP. Baheratail. Sakhipur. 137/26',
  issueDate: '19.08.26',
  docTitle: 'CERTIFICATE / AUTHORIZATION & OWNERSHIP DECLARATION',
  adminNameBn: 'মোঃ মাসুদুর রহমান',
  adminNameEn: 'Md. Masudur Rahman',
  adminTitleBn: 'প্রশাসক',
  adminTitleEn: 'Administrator',
  upNameBn: '২নং বহেড়াতৈল ইউনিয়ন পরিষদ',
  upNameEn: '2 No. Baheratail Union Parishad',
  upazilaBn: 'সখিপুর',
  upazilaEn: 'Sakhipur',
  districtBn: 'টাঙ্গাইল',
  districtEn: 'Tangail',

  officerNameBn: 'মোঃ সৈয়দউজ্জামান',
  officerNameEn: 'Md. Syeduzzaman',
  officerTitleBn: 'প্রশাসনিক কর্মকর্তা',
  officerTitleEn: 'Administrative Officer',

  introText: "This is to certify that Baheratail Union Parishad, located in Sakhipur Upazila, Tangail District, Bangladesh, is a government-recognized local government institution of the People's Republic of Bangladesh. We hereby issue this official declaration regarding our official digital assets and online services:",
  institutionName: 'Baheratail Union Parishad (বহেড়াতৈল ইউনিয়ন পরিষদ)',
  pageUrl: 'https://web.facebook.com/Baheratail.UP/',
  metaBusinessId: '2458679874568901',
  metaAppId: '1076737055010386',
  purpose: 'Citizen services, public announcements, and official communication.',
  appName: 'PersonalDigitalHub / Digital UP Portal',
  authStatement: 'The undersigned authority hereby confirms ownership and authorizes the designated personnel to manage the official page, applications, and digital integration on behalf of the Union Parishad.',
  assignedPersonName: 'Md. Jubaer Hossen',
  assignedPersonRole: 'Maintenance and Administration of Official Digital Assets & Portal',
  assignedPersonMobile: '+8801834-333300',
  assignedPersonEmail: 'baheratail.up@gmail.com',
  closingStatement: 'This certificate is issued under the official authority and seal of 2 No. Baheratail Union Parishad for verification, official records, and authorization purposes.'
};

export const UnionParishadPad: React.FC = () => {
  const [data, setData] = useState<PadDocumentData>(INITIAL_PAD_DATA);
  const [isEditing, setIsEditing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setData(INITIAL_PAD_DATA);
  };

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-['Noto_Sans_Bengali']">
            ২নং বহেড়াতৈল ইউনিয়ন পরিষদ অফিশিয়াল প্যাড ও প্রত্যয়নপত্র
          </h2>
          <p className="text-xs text-slate-500">
            Official Union Parishad Letterhead, Certificate &amp; Declaration Generator
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer border ${
              isEditing 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Done Editing' : 'Edit Document Fields'}</span>
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer border border-slate-300"
            title="Reset to Baheratail UP default document"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-md transition cursor-pointer shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Pad (A4)</span>
          </button>
        </div>
      </div>

      {/* Optional Edit Panel */}
      {isEditing && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4 print:hidden">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            প্যাড ও প্রত্যয়নপত্রের তথ্য সম্পাদনা (Edit Fields)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">স্মারক নং / Memo No</label>
              <input
                type="text"
                value={data.memoNo}
                onChange={(e) => setData({ ...data, memoNo: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">তারিখ / Date</label>
              <input
                type="text"
                value={data.issueDate}
                onChange={(e) => setData({ ...data, issueDate: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ডকুমেন্ট টাইটেল / Title</label>
              <input
                type="text"
                value={data.docTitle}
                onChange={(e) => setData({ ...data, docTitle: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">প্রশাসক নাম (বাংলা)</label>
              <input
                type="text"
                value={data.adminNameBn}
                onChange={(e) => setData({ ...data, adminNameBn: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Administrator Name (En)</label>
              <input
                type="text"
                value={data.adminNameEn}
                onChange={(e) => setData({ ...data, adminNameEn: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">প্রশাসনিক কর্মকর্তা / Officer (En)</label>
              <input
                type="text"
                value={data.officerNameEn}
                onChange={(e) => setData({ ...data, officerNameEn: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="font-semibold text-slate-700 block mb-1">সার্টিফিকেট বিবরণ / Intro Text</label>
              <textarea
                rows={2}
                value={data.introText}
                onChange={(e) => setData({ ...data, introText: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Official Facebook URL</label>
              <input
                type="text"
                value={data.pageUrl}
                onChange={(e) => setData({ ...data, pageUrl: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Meta Business ID</label>
              <input
                type="text"
                value={data.metaBusinessId}
                onChange={(e) => setData({ ...data, metaBusinessId: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Meta App ID</label>
              <input
                type="text"
                value={data.metaAppId}
                onChange={(e) => setData({ ...data, metaAppId: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">দায়িত্বপ্রাপ্ত ব্যক্তি / Assigned Officer</label>
              <input
                type="text"
                value={data.assignedPersonName}
                onChange={(e) => setData({ ...data, assignedPersonName: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর / Contact Mobile</label>
              <input
                type="text"
                value={data.assignedPersonMobile}
                onChange={(e) => setData({ ...data, assignedPersonMobile: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="text"
                value={data.assignedPersonEmail}
                onChange={(e) => setData({ ...data, assignedPersonEmail: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Official Pad Sheet (A4 Proportion) */}
      <div className="flex justify-center pb-12">
        <div
          ref={printRef}
          id="union-pad-print-sheet"
          className="w-full max-w-[800px] bg-white text-slate-900 shadow-xl border border-slate-300 p-8 sm:p-12 md:p-14 relative flex flex-col justify-between overflow-hidden print:p-8 print:shadow-none print:border-none print:w-full print:max-w-none print:h-[100vh]"
          style={{
            fontFamily: "'Noto Sans Bengali', 'Plus Jakarta Sans', system-ui, sans-serif",
            minHeight: '1080px'
          }}
        >
          {/* Header */}
          <div>
            {/* Bismillah */}
            <div className="text-center font-['Noto_Sans_Bengali'] text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              বিসমিল্লাহির রাহমানির রাহিম
            </div>

            <div className="text-center font-['Noto_Sans_Bengali'] text-xs sm:text-sm font-bold text-slate-800 mb-3">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </div>

            {/* Top 3-column Letterhead layout: Left Administrator (Bn), Center Govt Emblem, Right Administrator (En) */}
            <div className="grid grid-cols-12 items-center gap-2 border-b-2 border-slate-900 pb-4">
              
              {/* Left Column: Bangla Office Details */}
              <div className="col-span-4 text-left font-['Noto_Sans_Bengali'] text-xs sm:text-sm text-slate-900 leading-tight">
                <div className="font-bold text-slate-950 text-sm sm:text-base">
                  {data.adminNameBn}
                </div>
                <div className="font-semibold text-slate-800">
                  {data.adminTitleBn}
                </div>
                <div className="text-slate-800">
                  {data.upNameBn}
                </div>
                <div className="text-slate-700 text-xs">
                  {data.upazilaBn}, {data.districtBn}।
                </div>
              </div>

              {/* Center Column: Bangladesh Govt Emblem */}
              <div className="col-span-4 flex flex-col items-center justify-center text-center">
                <DemoTopEmblem size={58} className="drop-shadow-xs" />
                <div className="font-bold text-xs sm:text-sm text-slate-900 font-['Noto_Sans_Bengali'] mt-1">
                  {data.upNameBn} কার্যালয়
                </div>
                <div className="text-[11px] sm:text-xs text-slate-700 font-['Noto_Sans_Bengali']">
                  {data.upazilaBn}, {data.districtBn}।
                </div>
              </div>

              {/* Right Column: English Office Details */}
              <div className="col-span-4 text-right text-xs sm:text-sm text-slate-900 leading-tight">
                <div className="font-bold text-slate-950 text-sm sm:text-base">
                  {data.adminNameEn}
                </div>
                <div className="font-semibold text-slate-800">
                  {data.adminTitleEn}
                </div>
                <div className="text-slate-800">
                  {data.upNameEn}
                </div>
                <div className="text-slate-700 text-xs">
                  {data.upazilaEn}, {data.districtEn}.
                </div>
              </div>

            </div>

            {/* Memo & Date Line */}
            <div className="flex items-center justify-between mt-3 text-xs sm:text-sm font-semibold text-slate-800 font-mono">
              <div>
                <span>স্মারক নং: </span>
                <span className="font-bold text-slate-950">{data.memoNo}</span>
              </div>
              <div>
                <span>তারিখ: </span>
                <span className="font-bold text-slate-950">{data.issueDate}</span>
              </div>
            </div>

            {/* Certificate Title Badge */}
            <div className="my-6 text-center">
              <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-950 uppercase tracking-wide border-b-2 border-slate-900 pb-1 inline-block px-4 font-sans">
                {data.docTitle}
              </h2>
            </div>

            {/* Document Content */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed text-justify">
              
              <p>{data.introText}</p>

              {/* Structured Key Information List */}
              <div className="bg-slate-50/90 border border-slate-200 rounded-md p-4 space-y-2 text-xs sm:text-[13px]">
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-5 font-bold text-slate-900">1. Name of the Institution</span>
                  <span className="col-span-7 text-slate-950 font-medium">: {data.institutionName}</span>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-5 font-bold text-slate-900">2. Official Facebook Page URL</span>
                  <span className="col-span-7 font-mono text-emerald-800 font-semibold break-all">: {data.pageUrl}</span>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-5 font-bold text-slate-900">3. Meta Business ID</span>
                  <span className="col-span-7 font-mono font-bold text-slate-950">: {data.metaBusinessId}</span>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-5 font-bold text-slate-900">4. Meta App ID</span>
                  <span className="col-span-7 font-mono font-bold text-slate-950">: {data.metaAppId}</span>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-5 font-bold text-slate-900">5. Primary Purpose</span>
                  <span className="col-span-7 text-slate-900">: {data.purpose}</span>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-5 font-bold text-slate-900">6. Application Name</span>
                  <span className="col-span-7 font-semibold text-slate-950">: {data.appName}</span>
                </div>

                <div className="grid grid-cols-12 gap-2 pt-2 border-t border-slate-200">
                  <span className="col-span-5 font-bold text-slate-900">7. Designated Official</span>
                  <span className="col-span-7 text-slate-950 font-medium">
                    : <strong className="text-slate-950">{data.assignedPersonName}</strong> ({data.assignedPersonRole})
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-5 font-bold text-slate-900">8. Official Contact</span>
                  <span className="col-span-7 font-mono text-slate-900">
                    : Tel: {data.assignedPersonMobile} | {data.assignedPersonEmail}
                  </span>
                </div>
              </div>

              <p>{data.authStatement}</p>
              <p>{data.closingStatement}</p>

            </div>

          </div>

          {/* Official Signatures at Bottom */}
          <div className="mt-16 pt-6">
            <div className="grid grid-cols-2 gap-8 items-end">
              
              {/* Left Signatory: Administrative Officer */}
              <div className="flex flex-col items-center text-center">
                <div className="w-48 border-t-2 border-slate-900 mb-1.5"></div>
                <span className="font-bold text-xs sm:text-sm text-slate-950">
                  {data.officerNameEn}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-800 font-medium">
                  {data.officerTitleEn}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-700">
                  {data.upNameEn}
                </span>
                <span className="text-[10px] text-slate-600">
                  {data.upazilaEn}, {data.districtEn}.
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Date: {data.issueDate}
                </span>
              </div>

              {/* Right Signatory: Administrator */}
              <div className="flex flex-col items-center text-center">
                <div className="w-48 border-t-2 border-slate-900 mb-1.5"></div>
                <span className="font-bold text-xs sm:text-sm text-slate-950">
                  {data.adminNameEn}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-800 font-medium">
                  {data.adminTitleEn}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-700">
                  {data.upNameEn}
                </span>
                <span className="text-[10px] text-slate-600">
                  {data.upazilaEn}, {data.districtEn}.
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Date: {data.issueDate}
                </span>
              </div>

            </div>

            {/* Official Seal Watermark Stamp */}
            <div className="border-t border-slate-200 mt-8 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-['Noto_Sans_Bengali']">
              <span>২নং বহেড়াতৈল ইউনিয়ন পরিষদ, সখিপুর, টাঙ্গাইল।</span>
              <span className="font-mono">Office Seal &amp; Authority Verification</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
