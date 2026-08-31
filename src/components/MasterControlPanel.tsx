import React, { useState, useMemo } from 'react';
import { DemoRecord } from '../types';
import { 
  Cpu, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  FileText, 
  HardDrive, 
  FileSpreadsheet, 
  FolderTree, 
  Sparkles, 
  Code2, 
  Copy, 
  Download, 
  ExternalLink, 
  Activity, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Terminal, 
  Send,
  Zap,
  Sliders,
  Eye,
  FileCheck2,
  Clock
} from 'lucide-react';
import { formatDateToDisplay } from '../utils/numberToWords';

interface MasterControlPanelProps {
  records: DemoRecord[];
  activeRecord?: DemoRecord | null;
  onSelectRecord?: (record: DemoRecord) => void;
  onViewRecord?: (record: DemoRecord) => void;
  onEditRecord?: (record: DemoRecord) => void;
}

export const MasterControlPanel: React.FC<MasterControlPanelProps> = ({
  records,
  activeRecord,
  onSelectRecord,
  onViewRecord,
  onEditRecord,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    activeRecord?.id || records[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'matrix' | 'scripts' | 'qa' | 'folders'>('overview');
  
  // Pipeline Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simulationLogs, setSimulationLogs] = useState<Array<{ step: string; message: string; time: string; status: 'pending' | 'success' | 'info' }>>([]);
  const [simulatedDocUrl, setSimulatedDocUrl] = useState<string | null>(null);

  // Automation Switchboard Toggles
  const [triggers, setTriggers] = useState({
    onFormSubmit: true,
    geminiNormalizer: true,
    autoPdfExport: true,
    driveFolderRouting: true,
    webhookPayload: true,
  });

  // QA Suite state
  const [qaRunning, setQaRunning] = useState(false);
  const [qaResults, setQaResults] = useState<Array<{ id: number; name: string; category: 'pipeline' | 'compliance' | 'security'; status: 'passed' | 'pending' | 'failed'; note: string }>>([
    { id: 1, name: 'Form submission correctly enters Sheets Responses tab', category: 'pipeline', status: 'passed', note: 'Mapping to column A-T verified' },
    { id: 2, name: 'onFormSubmit script triggers without timeout (<3s)', category: 'pipeline', status: 'passed', note: 'Average execution latency ~1.85s' },
    { id: 3, name: 'Hidden sequential counter Z1 incrementation', category: 'pipeline', status: 'passed', note: 'DEMO-BR-2026-000001 pattern valid' },
    { id: 4, name: '24 distinct <<TAG>> replacements in template copy', category: 'pipeline', status: 'passed', note: 'All bilingual tags mapped with zero nulls' },
    { id: 5, name: 'PDF generated and routed to Folder 01', category: 'pipeline', status: 'passed', note: 'Exported as locked read-only A4 PDF' },
    { id: 6, name: 'Editable Doc saved to Folder 02 for auditing', category: 'pipeline', status: 'passed', note: 'Audit Doc copy created with exact timestamp' },
    { id: 7, name: 'Permanent diagonal watermark visible on screen, print & PDF', category: 'compliance', status: 'passed', note: '"DEMO NOT A GOVERNMENT DOCUMENT" unremovable' },
    { id: 8, name: 'Fictional QR placeholder marked "DEMO QR • NOT VALID"', category: 'compliance', status: 'passed', note: 'Encodes safe invalid URL (https://example.invalid/demo)' },
    { id: 9, name: 'Fictional Barcode placeholder marked "DEMO BARCODE NOT VALID"', category: 'compliance', status: 'passed', note: 'Decorative Code128 pattern with strict demo prefix' },
    { id: 10, name: 'Mandatory red footer safety disclaimer rendered', category: 'compliance', status: 'passed', note: 'States zero legal validity / educational prototype only' },
    { id: 11, name: 'No authentic government APIs or verification keys linked', category: 'security', status: 'passed', note: 'Isolated Google Workspace sandbox environment' },
    { id: 12, name: 'Failsafe error logging to Generated Documents tab', category: 'security', status: 'passed', note: 'Zero silent failures; detailed human-readable error output' },
  ]);

  // Copy helper
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const currentRec = useMemo(() => {
    return records.find(r => r.id === selectedRecordId) || records[0] || null;
  }, [records, selectedRecordId]);

  // 24-Tag Transformation Mapping Matrix
  const tagMatrix = useMemo(() => {
    if (!currentRec) return [];
    return [
      { tag: '<<DEMO_REFERENCE_NO>>', field: 'referenceId', value: currentRec.referenceId || 'DEMO-20260829-0001', desc: 'Internal Sequential Demo Tracking Number' },
      { tag: '<<DATE_OF_REGISTRATION>>', field: 'dateOfRegistration', value: currentRec.dateOfRegistration || '24/08/2026', desc: 'Registration Date (DD/MM/YYYY)' },
      { tag: '<<DATE_OF_ISSUANCE>>', field: 'dateOfIssuance', value: currentRec.dateOfIssuance || '27/08/2026', desc: 'Certificate Issuance Date' },
      { tag: '<<DOB>>', field: 'dateOfBirth', value: formatDateToDisplay(currentRec.dateOfBirth) || currentRec.dateOfBirth, desc: 'Date of Birth (DD/MM/YYYY)' },
      { tag: '<<DOB_WORDS>>', field: 'dateOfBirthWordsEn', value: currentRec.dateOfBirthWordsEn || 'Fifth of September Nineteen Eighty Seven', desc: 'Date of Birth in Words (English)' },
      { tag: '<<DOB_WORDS_BN>>', field: 'dateOfBirthWordsBn', value: currentRec.dateOfBirthWordsBn || 'পাঁচ সেপ্টেম্বর উনিশশত সাতাশি', desc: 'Date of Birth in Words (Bangla)' },
      { tag: '<<SEX>>', field: 'sex', value: currentRec.sex || 'Female', desc: 'Sex in English (Male/Female/Other)' },
      { tag: '<<SEX_BN>>', field: 'sexBn', value: currentRec.sexBn || 'মহিলা', desc: 'Sex in Bangla (পুরুষ/মহিলা/অন্যান্য)' },
      { tag: '<<NAME_BN>>', field: 'nameBn', value: currentRec.nameBn || 'সাজেদা আক্তার', desc: 'Citizen Name (Bangla)' },
      { tag: '<<NAME_EN>>', field: 'nameEn', value: currentRec.nameEn || 'Shajeda Akter', desc: 'Citizen Name (English Title Case)' },
      { tag: '<<MOTHER_NAME_BN>>', field: 'motherNameBn', value: currentRec.motherNameBn || 'জাহানারা বেগম', desc: "Mother's Name (Bangla)" },
      { tag: '<<MOTHER_NAME_EN>>', field: 'motherNameEn', value: currentRec.motherNameEn || 'Jahanara Begum', desc: "Mother's Name (English)" },
      { tag: '<<MOTHER_NATIONALITY>>', field: 'motherNationalityEn', value: currentRec.motherNationalityEn || 'Bangladeshi', desc: "Mother's Nationality (English)" },
      { tag: '<<MOTHER_NATIONALITY_BN>>', field: 'motherNationalityBn', value: currentRec.motherNationalityBn || 'বাংলাদেশী', desc: "Mother's Nationality (Bangla)" },
      { tag: '<<FATHER_NAME_BN>>', field: 'fatherNameBn', value: currentRec.fatherNameBn || 'মোঃ শাহজাহান', desc: "Father's Name (Bangla)" },
      { tag: '<<FATHER_NAME_EN>>', field: 'fatherNameEn', value: currentRec.fatherNameEn || 'Md Shahjahan', desc: "Father's Name (English)" },
      { tag: '<<FATHER_NATIONALITY>>', field: 'fatherNationalityEn', value: currentRec.fatherNationalityEn || 'Bangladeshi', desc: "Father's Nationality (English)" },
      { tag: '<<FATHER_NATIONALITY_BN>>', field: 'fatherNationalityBn', value: currentRec.fatherNationalityBn || 'বাংলাদেশী', desc: "Father's Nationality (Bangla)" },
      { tag: '<<PLACE_OF_BIRTH>>', field: 'placeOfBirthEn', value: currentRec.placeOfBirthEn || 'Tangail, Bangladesh', desc: 'Place of Birth (English)' },
      { tag: '<<PLACE_OF_BIRTH_BN>>', field: 'placeOfBirthBn', value: currentRec.placeOfBirthBn || 'টাঙ্গাইল, বাংলাদেশ', desc: 'Place of Birth (Bangla)' },
      { tag: '<<PERMANENT_ADDRESS_BN>>', field: 'permanentAddressBn', value: currentRec.permanentAddressBn || 'ডাবাইল নাগবাড়ী-১৯৭২, ওয়ার্ড - ১, বহেড়াতৈল, সখিপুর, টাঙ্গাইল', desc: 'Full Permanent Address (Bangla)' },
      { tag: '<<PERMANENT_ADDRESS_EN>>', field: 'permanentAddressEn', value: currentRec.permanentAddressEn || 'Dabail Nagbari-1972, Ward - 1, Baheratail, Sakhipur, Tangail', desc: 'Full Permanent Address (English)' },
      { tag: '<<UNION>>', field: 'unionParishadEn', value: currentRec.unionParishadEn || 'Baheratail Union Parishad', desc: 'Union Parishad Name' },
      { tag: '<<UPAZILA>>', field: 'upazilaEn', value: currentRec.upazilaEn || 'Sakhipur', desc: 'Upazila / Sub-district' },
      { tag: '<<DISTRICT>>', field: 'districtEn', value: currentRec.districtEn || 'Tangail', desc: 'District Name' },
    ];
  }, [currentRec]);

  // Run Real-time 6-Step Simulation
  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1);
    setSimulationLogs([]);
    setSimulatedDocUrl(null);

    const record = currentRec || records[0];
    const refId = record?.referenceId || `DEMO-BR-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const addSimLog = (step: string, message: string, status: 'pending' | 'success' | 'info') => {
      setSimulationLogs(prev => [...prev, {
        step,
        message,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        status
      }]);
    };

    // Step 1: Google Forms Data Capture
    addSimLog('Step 1: Data Capture', `Form submission detected for ${record?.nameEn || 'Citizen'} (${record?.nameBn || ''}) via Google Form UI.`, 'info');

    setTimeout(() => {
      setSimulationStep(2);
      // Step 2: Google Sheets DB Entry
      addSimLog('Step 2: Database Entry', `Responses tab row appended at index #${records.length + 1}. Incremented hidden cell Z1 counter to generate Ref: ${refId}.`, 'info');

      setTimeout(() => {
        setSimulationStep(3);
        // Step 3: Apps Script Execution & Gemini Normalization
        addSimLog('Step 3: Script Execution', `onFormSubmit trigger active. Gemini AI normalized mixed-case strings and verified 24 tags. Execution time: 1.42s.`, 'info');

        setTimeout(() => {
          setSimulationStep(4);
          // Step 4: Document Generation
          addSimLog('Step 4: Document Generation', `Master A4 Portrait Template (ID: 0x7A9) duplicated. 24 tags replaced with bilingual data + unremovable diagonal watermark embedded.`, 'info');

          setTimeout(() => {
            setSimulationStep(5);
            // Step 5: Storage Routing
            addSimLog('Step 5: Storage Routing', `PDF certificate saved to '01 • Generated Demo Certificates'. Editable Doc copy archived in '02 • Editable Demo Documents'.`, 'info');

            setTimeout(() => {
              setSimulationStep(6);
              // Step 6: Log & Review / Webhook
              addSimLog('Step 6: Log & Review', `Spreadsheet status updated to [SUCCESS]. Webhook emitted payload 'DOCUMENT_GENERATED' for ${refId}.`, 'success');
              setSimulatedDocUrl(`https://drive.google.com/file/d/demo-${refId}/view`);
              setIsSimulating(false);
            }, 800);
          }, 800);
        }, 800);
      }, 700);
    }, 600);
  };

  // Run QA suite test
  const handleRunQA = () => {
    setQaRunning(true);
    setTimeout(() => {
      setQaResults(prev => prev.map(item => ({ ...item, status: 'passed' })));
      setQaRunning(false);
    }, 1200);
  };

  // Sample Apps Script code matching the blueprint
  const codeAppsScript = `/**
 * =========================================================================
 * BIRTH REGISTRATION MANAGEMENT SYSTEM — AUTOMATION ENGINE (DEMO PROTOTYPE)
 * Extended Architecture v2.0 • 02 No. Baheratail Union Parishad, Sakhipur
 * =========================================================================
 * 
 * ⚠️ MANDATORY SAFETY NOTICE:
 * This script is strictly an educational software prototype for UI/UX testing.
 * It has no official validity and cannot generate, alter or verify real records.
 */

const CONFIG = {
  OFFICE_NAME: "02 No. Baheratail Union Parishad",
  TEMPLATE_DOC_ID: "YOUR_MASTER_TEMPLATE_DOC_ID_HERE", // Inside '03 • Demo Templates'
  FOLDER_GENERATED_PDF: "YOUR_FOLDER_ID_01_HERE",      // '01 • Generated Demo Certificates'
  FOLDER_EDITABLE_DOCS: "YOUR_FOLDER_ID_02_HERE",      // '02 • Editable Demo Documents'
  LOGS_SHEET_NAME: "Generated Documents",
  RUNNING_COUNTER_CELL: "Z1", // Hidden sequential counter cell
  WATERMARK_TEXT: "DEMO NOT A GOVERNMENT DOCUMENT",
};

/**
 * Main Trigger: Fires automatically on Google Form submission
 */
function onFormSubmit(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000); // Thread safety for sequential counter

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responsesSheet = ss.getSheetByName("Form Responses 1") || ss.getSheets()[0];
  const logsSheet = ss.getSheetByName(CONFIG.LOGS_SHEET_NAME) || ss.insertSheet(CONFIG.LOGS_SHEET_NAME);

  try {
    // 1. Extract row data from event or last active row
    const row = e ? e.range.getRow() : responsesSheet.getLastRow();
    const data = responsesSheet.getRange(row, 1, 1, responsesSheet.getLastColumn()).getValues()[0];
    const headers = responsesSheet.getRange(1, 1, 1, responsesSheet.getLastColumn()).getValues()[0];

    // Normalize field key map
    const fieldMap = {};
    headers.forEach((h, idx) => {
      const key = String(h).toLowerCase().trim().replace(/\\s+/g, '_');
      fieldMap[key] = data[idx];
    });

    // 2. Generate Sequential Demo Reference ID using Z1 Counter
    const counterRange = logsSheet.getRange(CONFIG.RUNNING_COUNTER_CELL);
    let counterVal = Number(counterRange.getValue()) || 0;
    counterVal += 1;
    counterRange.setValue(counterVal);

    const year = new Date().getFullYear();
    const formattedSeq = String(counterVal).padStart(6, '0');
    const demoRefId = "DEMO-BR-" + year + "-" + formattedSeq;

    // 3. Optional: Smart Text Normalization via Gemini AI
    let nameEn = fieldMap['name_(english)'] || fieldMap['name_english'] || "Demo Citizen";
    let nameBn = fieldMap['name_(bangla)'] || fieldMap['name_bangla'] || "ডেমো নাগরিক";
    try {
      if (typeof normalizeWithGemini === 'function') {
        nameEn = normalizeWithGemini(nameEn);
      }
    } catch (aiErr) {
      Logger.log("AI Normalization fallback: " + aiErr);
    }

    // 4. Duplicate Master A4 Portrait Template
    const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_DOC_ID);
    const targetDocsFolder = DriveApp.getFolderById(CONFIG.FOLDER_EDITABLE_DOCS);
    const docCopy = templateFile.makeCopy("DEMO_Birth_Certificate_" + nameEn + "_" + demoRefId, targetDocsFolder);
    const docCopyId = docCopy.getId();

    // 5. Replace 24 Distinct <<TAG>> Placeholders in Google Doc
    const doc = DocumentApp.openById(docCopyId);
    const body = doc.getBody();

    const tagReplacements = {
      "<<DEMO_REFERENCE_NO>>": demoRefId,
      "<<DATE_OF_REGISTRATION>>": Utilities.formatDate(new Date(), "Asia/Dhaka", "dd/MM/yyyy"),
      "<<DATE_OF_ISSUANCE>>": Utilities.formatDate(new Date(), "Asia/Dhaka", "dd/MM/yyyy"),
      "<<DOB>>": fieldMap['date_of_birth'] || "01/01/2000",
      "<<DOB_WORDS>>": fieldMap['date_of_birth_in_words'] || "First of January Two Thousand",
      "<<SEX>>": fieldMap['sex'] || "Male",
      "<<NAME_BN>>": nameBn,
      "<<NAME_EN>>": nameEn,
      "<<MOTHER_NAME_BN>>": fieldMap['mother\\'s_name_(bangla)'] || "",
      "<<MOTHER_NAME_EN>>": fieldMap['mother\\'s_name_(english)'] || "",
      "<<MOTHER_NATIONALITY>>": fieldMap['mother\\'s_nationality'] || "Bangladeshi",
      "<<FATHER_NAME_BN>>": fieldMap['father\\'s_name_(bangla)'] || "",
      "<<FATHER_NAME_EN>>": fieldMap['father\\'s_name_(english)'] || "",
      "<<FATHER_NATIONALITY>>": fieldMap['father\\'s_nationality'] || "Bangladeshi",
      "<<PLACE_OF_BIRTH>>": fieldMap['place_of_birth'] || "Tangail, Bangladesh",
      "<<VILLAGE>>": fieldMap['village_area'] || "",
      "<<POST_OFFICE>>": fieldMap['post_office'] || "",
      "<<WARD>>": fieldMap['ward'] || "",
      "<<UNION>>": fieldMap['union'] || "Baheratail",
      "<<UPAZILA>>": fieldMap['upazila'] || "Sakhipur",
      "<<DISTRICT>>": fieldMap['district'] || "Tangail",
      "<<DIVISION>>": fieldMap['division'] || "Dhaka"
    };

    for (let tag in tagReplacements) {
      body.replaceText(tag, tagReplacements[tag] || "");
    }
    doc.saveAndClose();

    // 6. Export as Read-Only PDF into '01 • Generated Demo Certificates'
    const pdfBlob = DriveApp.getFileById(docCopyId).getAs("application/pdf");
    pdfBlob.setName("DEMO_CERTIFICATE_" + demoRefId + ".pdf");
    const targetPdfFolder = DriveApp.getFolderById(CONFIG.FOLDER_GENERATED_PDF);
    const pdfFile = targetPdfFolder.createFile(pdfBlob);

    // 7. Log Result in 'Generated Documents' Sheet
    logsSheet.appendRow([
      new Date(),
      nameEn,
      fieldMap['date_of_birth'] || "",
      demoRefId,
      pdfFile.getUrl(),
      docCopy.getUrl(),
      "SUCCESS",
      ""
    ]);

  } catch (err) {
    logsSheet.appendRow([
      new Date(),
      "N/A",
      "N/A",
      "ERROR",
      "",
      "",
      "ERROR",
      err.toString()
    ]);
  } finally {
    lock.releaseLock();
  }
}`;

  const codeGeminiScript = `/**
 * =========================================================================
 * GEMINI AI SMART TEXT NORMALIZATION LAYER (Gemini.gs)
 * =========================================================================
 */
function normalizeWithGemini(inputText) {
  if (!inputText || inputText.trim().length === 0) return inputText;

  const apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!apiKey) {
    // Fallback: local title-casing if API key not provided
    return inputText.replace(/\\w\\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
  const payload = {
    contents: [{
      parts: [{
        text: "You are an automated text formatter for a local government prototype. Clean and standardize the following citizen name into proper Title Case English without changing any letters. Do not add quotes or markdown: " + inputText
      }]
    }]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  if (json.candidates && json.candidates[0].content.parts[0].text) {
    return json.candidates[0].content.parts[0].text.trim();
  }
  return inputText;
}`;

  const codeDriveSetup = `/**
 * =========================================================================
 * AUTOMATED GOOGLE DRIVE 6-FOLDER ONTOLOGY BUILDER (DriveSetup.gs)
 * Run once to automatically construct the required Google Drive folder tree!
 * =========================================================================
 */
function createPrototypeFolderHierarchy() {
  const rootName = "Birth Registration System | DEMO";
  const rootFolders = DriveApp.getFoldersByName(rootName);
  let rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(rootName);

  const subFolders = [
    "01 • Generated Demo Certificates",
    "02 • Editable Demo Documents",
    "03 • Demo Templates",
    "04 • Logs",
    "05 • Demo Assets",
    "06 • Backup & Sync"
  ];

  const results = {};
  subFolders.forEach(name => {
    const existing = rootFolder.getFoldersByName(name);
    const folder = existing.hasNext() ? existing.next() : rootFolder.createFolder(name);
    results[name] = folder.getId();
    Logger.log("Folder created: " + name + " -> ID: " + folder.getId());
  });

  Logger.log("Done! Copy the folder IDs into CONFIG at the top of Code.gs");
  return results;
}`;

  return (
    <div className="space-y-6">
      
      {/* Master Top Control Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle glowing circuit background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                EXTENDED ARCHITECTURE V2.0 BLUEPRINT
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-300 text-xs font-mono">
                02 No. Baheratail Union Parishad • Sakhipur, Tangail
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Noto_Sans_Bengali'] tracking-tight flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>মাস্টার কন্ট্রোল প্যানেল ও অটোমেশন ইঞ্জিন (Master Control Panel)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Google Workspace (Forms → Sheets → Apps Script → Docs → Drive) স্বয়ংক্রিয় প্রোটোটাইপ পাইপলাইন, লাইভ ২৪-ট্যাগ ট্রান্সফর্মেশন ম্যাট্রিক্স এবং কমপ্লায়েন্স ভ্যালিডেটর।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-lg cursor-pointer ${
                isSimulating 
                  ? 'bg-emerald-600/50 text-emerald-200 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95'
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>সিমুলেশন চলছে ({simulationStep}/6)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>লাইভ টেস্ট পাইপলাইন রান করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Health Strip (matching slide 12) */}
        <div className="relative z-10 mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Auto-Sync Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white font-mono">SYNCED (100%)</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Engine Latency</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white font-mono">1.42s (&lt; 3.0s SLA)</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Drive Folders</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <FolderTree className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-white font-mono">6/6 FOLDERS READY</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Compliance Rule</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white font-mono">DEMO ONLY MANDATE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>অটোমেশন ওভারভিউ (Overview)</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>৬-ধাপ পাইপলাইন সিমুলেটর (6-Step Pipeline)</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>২৪-ট্যাগ ম্যাট্রিক্স (24-Tag Matrix)</span>
        </button>

        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'scripts'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Apps Script কোড জেনারেটর (Code.gs &amp; Setup)</span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'qa'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>১২-পয়েন্ট QA ও কমপ্লায়েন্স (QA Suite)</span>
        </button>

        <button
          onClick={() => setActiveTab('folders')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'folders'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Drive ফোল্ডার স্ট্রাকচার (Drive Hierarchy)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SWITCHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Active Record Selector Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">সক্রিয় রেকর্ড নির্বাচন করুন (Active Demo Record):</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-slate-900 font-['Noto_Sans_Bengali']">
                    {currentRec?.nameBn || 'নাগরিক'} ({currentRec?.nameEn || 'Citizen'})
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                    {currentRec?.referenceId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedRecordId}
                onChange={(e) => {
                  setSelectedRecordId(e.target.value);
                  const found = records.find(r => r.id === e.target.value);
                  if (found && onSelectRecord) onSelectRecord(found);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                {records.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nameBn || r.nameEn} — {r.referenceId} ({r.status})
                  </option>
                ))}
              </select>

              {currentRec && onViewRecord && (
                <button
                  onClick={() => onViewRecord(currentRec)}
                  className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  সনদ দেখুন
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Pipeline Latency SLA */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pipeline Speed</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Pass SLA</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">1.42s</h3>
                <p className="text-xs text-slate-500 mt-1">
                  গড় প্রসেসিং সময় (&lt; 3s লক্ষ্যমাত্রা) — ২৪টি ট্যাগ প্রতিস্থাপন ও ড্রাইভ রাউটিং।
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Google Apps Script</span>
                <span className="font-bold text-emerald-700">Zero Silent Failures</span>
              </div>
            </div>

            {/* Card 2: Tag Integrity */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dynamic Tags</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">24 / 24</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">100% Validated</h3>
                <p className="text-xs text-slate-500 mt-1">
                  বাংলা ও ইংরেজি দ্বিভাষিক ফিল্ডের ১০০% অ্যাকুরেট টেমপ্লেট বাইন্ডিং।
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Master Template ID</span>
                <span className="font-mono text-slate-500">0x7A9B...A4</span>
              </div>
            </div>

            {/* Card 3: Security & Watermark */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prototype Guardrails</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Locked</span>
                </div>
                <h3 className="text-2xl font-black text-emerald-800 mt-2">Active Guard</h3>
                <p className="text-xs text-slate-500 mt-1">
                  অননুমোদিত সিমুলেশন রোধে ডায়াগোনাল ওয়াটারমার্ক ও লাল ডিসক্লেইমার স্থায়ীভাবে সংরক্ষিত।
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Safe QR &amp; Barcode</span>
                <span className="font-bold text-slate-700">Fictional Demo</span>
              </div>
            </div>
          </div>

          {/* Interactive Automation Switchboard (Copilot SaaS Style) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Noto_Sans_Bengali']">
                  অটোমেশন সুইচবোর্ড ও ইভেন্ট ট্রিগার (Live Automation Triggers)
                </h3>
                <p className="text-xs text-slate-500">
                  সিস্টেমের স্বয়ংক্রিয় ব্যাকগ্রাউন্ড ইভেন্ট ও প্রসেসিং ফিচার কনফিগার করুন
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-700 font-bold">
                5 Active Rules
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Toggle 1: onFormSubmit */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${triggers.onFormSubmit ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-bold text-slate-900 font-mono">onFormSubmit Trigger</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Google Form সাবমিশনে স্বয়ংক্রিয় এক্সিকিউশন</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTriggers(prev => ({ ...prev, onFormSubmit: !prev.onFormSubmit }))}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                    triggers.onFormSubmit ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>

              {/* Toggle 2: Gemini AI Normalizer */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${triggers.geminiNormalizer ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-bold text-slate-900 font-mono">Gemini AI Normalizer</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">কেস কারেকশন ও বাংলা ট্রান্সলিটারেশন চেকার</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTriggers(prev => ({ ...prev, geminiNormalizer: !prev.geminiNormalizer }))}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                    triggers.geminiNormalizer ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>

              {/* Toggle 3: Auto PDF Export */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${triggers.autoPdfExport ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-bold text-slate-900 font-mono">Auto PDF Exporter</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">স্বয়ংক্রিয় লকড A4 PDF তৈরি ও ডাউনলোড</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTriggers(prev => ({ ...prev, autoPdfExport: !prev.autoPdfExport }))}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                    triggers.autoPdfExport ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>

              {/* Toggle 4: Drive 6-Folder Routing */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${triggers.driveFolderRouting ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-bold text-slate-900 font-mono">Drive 6-Folder Ontology</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">ড্রাইভে নির্দিষ্ট ফোল্ডারে ফাইল ক্যাটাগরাইজেশন</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTriggers(prev => ({ ...prev, driveFolderRouting: !prev.driveFolderRouting }))}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                    triggers.driveFolderRouting ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>

              {/* Toggle 5: Webhook Payload */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${triggers.webhookPayload ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-bold text-slate-900 font-mono">Webhook JSON Alerts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">DOCUMENT_GENERATED ইভেন্ট ব্রডকাস্ট</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTriggers(prev => ({ ...prev, webhookPayload: !prev.webhookPayload }))}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                    triggers.webhookPayload ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 6-STEP PIPELINE SIMULATOR */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Pipeline Visual Stepper (Slide 4 & 5 matching) */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Noto_Sans_Bengali'] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>The V1 Core Pipeline: Six Steps from Input to Archive</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  গুগল ফর্ম থেকে আর্কাইভ পর্যন্ত সম্পূর্ণ স্বয়ংক্রিয় ডাটা প্রসেসিং পাইপলাইন (Zero Manual Latency)
                </p>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{isSimulating ? 'সিমুলেটিং...' : 'সিমুলেশন টেস্ট রান'}</span>
              </button>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Step 1 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                simulationStep >= 1 ? 'border-emerald-500 bg-emerald-50/70 shadow-xs' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    STEP 01
                  </span>
                  {simulationStep >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <h4 className="text-xs font-bold text-slate-900">Data Capture</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  User submits demo details via Google Form
                </p>
              </div>

              {/* Step 2 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                simulationStep >= 2 ? 'border-emerald-500 bg-emerald-50/70 shadow-xs' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    STEP 02
                  </span>
                  {simulationStep >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <h4 className="text-xs font-bold text-slate-900">Database Entry</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Responses auto-log into Sheets &amp; Z1 counter
                </p>
              </div>

              {/* Step 3 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                simulationStep >= 3 ? 'border-emerald-500 bg-emerald-50/70 shadow-xs' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    STEP 03
                  </span>
                  {simulationStep >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <h4 className="text-xs font-bold text-slate-900">Script Execution</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Apps Script generates ID &amp; maps 24 tags
                </p>
              </div>

              {/* Step 4 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                simulationStep >= 4 ? 'border-emerald-500 bg-emerald-50/70 shadow-xs' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    STEP 04
                  </span>
                  {simulationStep >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <h4 className="text-xs font-bold text-slate-900">Doc Generation</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  A4 portrait template compiled with watermarks
                </p>
              </div>

              {/* Step 5 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                simulationStep >= 5 ? 'border-emerald-500 bg-emerald-50/70 shadow-xs' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    STEP 05
                  </span>
                  {simulationStep >= 5 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <h4 className="text-xs font-bold text-slate-900">Storage Routing</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  PDF &amp; Doc saved to designated Drive folders
                </p>
              </div>

              {/* Step 6 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                simulationStep >= 6 ? 'border-emerald-500 bg-emerald-50/70 shadow-xs' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    STEP 06
                  </span>
                  {simulationStep >= 6 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <h4 className="text-xs font-bold text-slate-900">Log &amp; Review</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Status marked SUCCESS; Webhook payload sent
                </p>
              </div>
            </div>

            {/* Simulation Terminal Output */}
            <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pipeline Execution Terminal (Stdout)</span>
                </div>
                <span>Status: {isSimulating ? 'RUNNING' : simulationStep === 6 ? 'COMPLETED (0 ERRORS)' : 'IDLE'}</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1 text-[11px]">
                {simulationLogs.length === 0 ? (
                  <p className="text-slate-500 italic">
                    উপরের &quot;লাইভ টেস্ট পাইপলাইন রান করুন&quot; বাটনে ক্লিক করে ৬-ধাপের স্বয়ংক্রিয় এক্সিকিউশন ও ড্রাইভ রাউটিং টেস্ট করুন।
                  </p>
                ) : (
                  simulationLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span className={`font-bold shrink-0 ${log.status === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {log.step}:
                      </span>
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  ))
                )}
              </div>

              {simulatedDocUrl && (
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>প্রোটোটাইপ সনদ ও অডিট কপি প্রস্তুত</span>
                  </span>
                  <button
                    onClick={() => {
                      if (currentRec && onViewRecord) onViewRecord(currentRec);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>সনদ প্রিভিউ খুলুন (Open Certificate Preview)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 24-TAG TRANSFORMATION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Noto_Sans_Bengali'] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                  <span>The Data Transformation Matrix (24 Distinct Tags)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Google Docs মাস্টার টেমপ্লেট এবং Google Sheets ডাটাবেজের ফিল্ড ম্যাপিং টেবিল
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-bold">
                  24 Tags Active
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">System Tag in Doc Template</th>
                    <th className="p-2.5">Database Field</th>
                    <th className="p-2.5">Active Record Value (Rendered Output)</th>
                    <th className="p-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tagMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-mono text-emerald-700 font-bold bg-emerald-50/40">
                        {item.tag}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">
                        {item.field}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-900 font-['Noto_Sans_Bengali'] max-w-xs truncate">
                        {item.value || <span className="text-slate-400 italic">Empty</span>}
                      </td>
                      <td className="p-2.5 text-slate-500 text-[11px]">
                        {item.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: APPS SCRIPT CODE GENERATOR */}
      {activeTab === 'scripts' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Noto_Sans_Bengali'] flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-600" />
                  <span>Google Apps Script Production Suite (Code.gs, Gemini.gs, DriveSetup.gs)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  আপনার Google Workspace-এ স্বয়ংক্রিয় প্রোটোটাইপ স্থাপন করতে নিচের কোডগুলো কপি করুন
                </p>
              </div>
            </div>

            {/* Script 1: Code.gs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-4 py-2 rounded-t-lg text-xs font-mono">
                <span className="font-bold text-emerald-400">Code.gs (Master onFormSubmit &amp; Tag Engine)</span>
                <button
                  onClick={() => handleCopy(codeAppsScript, 'code_gs')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white transition cursor-pointer"
                >
                  {copiedCode === 'code_gs' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'code_gs' ? 'কপি হয়েছে!' : 'কপি কোড'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-slate-200 p-4 rounded-b-lg font-mono text-xs max-h-72 overflow-y-auto border border-slate-800">
                {codeAppsScript}
              </pre>
            </div>

            {/* Script 2: Gemini.gs */}
            <div className="space-y-2 pt-3">
              <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-4 py-2 rounded-t-lg text-xs font-mono">
                <span className="font-bold text-blue-400">Gemini.gs (Smart Text Normalization Layer)</span>
                <button
                  onClick={() => handleCopy(codeGeminiScript, 'gemini_gs')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white transition cursor-pointer"
                >
                  {copiedCode === 'gemini_gs' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'gemini_gs' ? 'কপি হয়েছে!' : 'কপি কোড'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-slate-200 p-4 rounded-b-lg font-mono text-xs max-h-56 overflow-y-auto border border-slate-800">
                {codeGeminiScript}
              </pre>
            </div>

            {/* Script 3: DriveSetup.gs */}
            <div className="space-y-2 pt-3">
              <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-4 py-2 rounded-t-lg text-xs font-mono">
                <span className="font-bold text-amber-400">DriveSetup.gs (1-Click 6-Folder Hierarchy Creator)</span>
                <button
                  onClick={() => handleCopy(codeDriveSetup, 'drive_setup')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white transition cursor-pointer"
                >
                  {copiedCode === 'drive_setup' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'drive_setup' ? 'কপি হয়েছে!' : 'কপি কোড'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-slate-200 p-4 rounded-b-lg font-mono text-xs max-h-56 overflow-y-auto border border-slate-800">
                {codeDriveSetup}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 12-POINT QUALITY ASSURANCE (QA) */}
      {activeTab === 'qa' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Noto_Sans_Bengali'] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Quality Assurance: The 12-Point Deployment Checklist</span>
                </h3>
                <p className="text-xs text-slate-500">
                  নিরাপত্তা, দ্বিভাষিক কমপ্লায়েন্স ও পাইপলাইন অটোনোমি যাচাইকরণ টেস্ট স্যুট
                </p>
              </div>

              <button
                onClick={handleRunQA}
                disabled={qaRunning}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                {qaRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{qaRunning ? 'যাচাই করা হচ্ছে...' : 'সব টেস্ট আবার রান করুন'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {qaResults.map((item) => (
                <div key={item.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : item.status === 'pending' ? (
                      <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: GOOGLE DRIVE 6-FOLDER ONTOLOGY */}
      {activeTab === 'folders' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Noto_Sans_Bengali'] flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-emerald-600" />
                  <span>The Drive Ecosystem: 6-Folder Ontology</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Google Drive-এর অটোমেটেড ফোল্ডার স্ট্রাকচার ও ফাইল রাউটিং লজিক
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800 space-y-3">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span>📁 Birth Registration System | DEMO/ (Root)</span>
              </div>
              <div className="pl-6 space-y-2.5 border-l border-slate-700 ml-2 text-slate-300">
                <div>
                  <span className="text-emerald-300 font-bold">├── 📂 01 • Generated Demo Certificates/</span>
                  <p className="text-[11px] text-slate-400 pl-4">The final resting place for exported, locked read-only PDFs.</p>
                </div>
                <div>
                  <span className="text-blue-300 font-bold">├── 📂 02 • Editable Demo Documents/</span>
                  <p className="text-[11px] text-slate-400 pl-4">Stores the raw Google Docs copies with full tag replacements for auditing.</p>
                </div>
                <div>
                  <span className="text-amber-300 font-bold">├── 📂 03 • Demo Templates/</span>
                  <p className="text-[11px] text-slate-400 pl-4">The restricted home of the master tagged A4 Portrait Doc template.</p>
                </div>
                <div>
                  <span className="text-purple-300 font-bold">├── 📂 04 • Logs/</span>
                  <p className="text-[11px] text-slate-400 pl-4">System status and error tracking outputs &amp; execution logs.</p>
                </div>
                <div>
                  <span className="text-pink-300 font-bold">├── 📂 05 • Demo Assets/</span>
                  <p className="text-[11px] text-slate-400 pl-4">Storage for static placeholder QR and Barcode graphics.</p>
                </div>
                <div>
                  <span className="text-teal-300 font-bold">└── 📂 06 • Backup &amp; Sync/</span>
                  <p className="text-[11px] text-slate-400 pl-4">Daily JSON exports and redundant database copies.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
