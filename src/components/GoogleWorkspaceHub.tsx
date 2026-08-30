import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  FileSpreadsheet, 
  HardDrive, 
  FileText, 
  FormInput, 
  CheckSquare, 
  Users, 
  Mail, 
  Presentation, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  FolderPlus, 
  Sparkles,
  Send,
  UserCheck,
  Globe
} from 'lucide-react';
import { DemoRecord } from '../types';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  saveRecordToFirestore, 
  fetchRecordsFromFirestore,
  getAccessToken
} from '../services/firebase';
import { 
  createRegistrySpreadsheet, 
  uploadJsonToDrive, 
  listDriveBackupFiles, 
  DriveFileItem,
  createCitizenVerificationDoc, 
  createBirthRegistrationForm,
  createGoogleTask, 
  listGoogleTasks, 
  TaskItem,
  createCitizenContact, 
  sendCitizenEmail,
  createRegistryPresentation
} from '../services/googleWorkspace';
import { User } from 'firebase/auth';

interface GoogleWorkspaceHubProps {
  records: DemoRecord[];
  onRecordsSynced?: (records: DemoRecord[]) => void;
  selectedRecord?: DemoRecord | null;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({
  records,
  onRecordsSynced,
  selectedRecord,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [activeTab, setActiveTab] = useState<'firebase' | 'sheets' | 'drive' | 'docs' | 'forms' | 'tasks' | 'contacts' | 'gmail' | 'slides'>('firebase');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string; link?: string; linkText?: string } | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  // Forms state
  const [createdForm, setCreatedForm] = useState<{ formUrl: string; editUrl: string } | null>(null);
  // Email state
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('বহেরাতৈল ইউপি: জন্ম নিবন্ধন আবেদন/সনদ সংক্রান্ত নোটিশ');
  const [emailBody, setEmailBody] = useState('');
  // Contact state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await getAccessToken();
        if (token) {
          loadDriveFiles();
          loadTasks();
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      setContactName(selectedRecord.nameBn || selectedRecord.nameEn);
      setEmailBody(`শ্রদ্ধেয় নাগরিক,\n\nবহেরাতৈল ইউনিয়ন পরিষদ ডিজিটাল সেবা কেন্দ্র থেকে জানানো যাচ্ছে যে, আপনার জন্ম নিবন্ধন রেকর্ড (${selectedRecord.referenceId}) সফলভাবে সিস্টেমে প্রক্রিয়াধীন রয়েছে।\n\nনাম: ${selectedRecord.nameBn} (${selectedRecord.nameEn})\nজন্ম তারিখ: ${selectedRecord.dateOfBirth}\nবর্তমান স্ট্যাটাস: ${selectedRecord.status}\n\nধন্যবাদ,\nবহেরাতৈল ইউনিয়ন পরিষদ কার্যালয়\nসখিপুর, টাঙ্গাইল`);
    }
  }, [selectedRecord]);

  const loadDriveFiles = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const files = await listDriveBackupFiles();
      setDriveFiles(files);
    } catch {
      // ignore
    }
  };

  const loadTasks = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const taskList = await listGoogleTasks();
      setTasks(taskList);
    } catch {
      // ignore
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const result = await signInWithGoogle();
      if (result?.user) {
        setCurrentUser(result.user);
        setStatusMessage({ type: 'success', text: `স্বাগতম ${result.user.displayName || result.user.email}! Google Ecosystem সফলভাবে কানেক্ট হয়েছে।` });
        loadDriveFiles();
        loadTasks();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `লগইন ব্যর্থ হয়েছে: ${err.message || 'Error connecting to Google'}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setStatusMessage({ type: 'info', text: 'Google একাউন্ট থেকে সাইন আউট করা হয়েছে।' });
  };

  // 1. Firebase Sync All
  const handleSyncFirestore = async () => {
    if (!currentUser) {
      handleLogin();
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      for (const rec of records) {
        await saveRecordToFirestore(rec);
      }
      const updatedList = await fetchRecordsFromFirestore();
      if (onRecordsSynced && updatedList.length > 0) {
        onRecordsSynced(updatedList);
      }
      setStatusMessage({ 
        type: 'success', 
        text: `সফলভাবে ${records.length}টি জন্ম নিবন্ধন রেকর্ড Firebase Firestore ক্লাউডে সিঙ্ক ও সুরক্ষিত করা হয়েছে!` 
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Firebase সিঙ্ক এরর: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Google Sheets Export
  const handleExportToSheets = async () => {
    if (!currentUser) {
      handleLogin();
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await createRegistrySpreadsheet(records);
      setStatusMessage({
        type: 'success',
        text: 'গুগল শিট সফলভাবে তৈরি হয়েছে!',
        link: res.url,
        linkText: 'গুগল শিট খুলুন (Open in Google Sheets)'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Google Sheets এরর: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Google Drive Backup
  const handleBackupToDrive = async () => {
    if (!currentUser) {
      handleLogin();
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const fileName = `BDRIS_Records_Backup_${new Date().toISOString().slice(0,10)}.json`;
      const res = await uploadJsonToDrive(fileName, {
        exportDate: new Date().toISOString(),
        office: 'Baheratail Union Parishad',
        totalRecords: records.length,
        records: records,
      });
      await loadDriveFiles();
      setStatusMessage({
        type: 'success',
        text: `Google Drive ফোল্ডারে ব্যাকআপ সফল হয়েছে: ${fileName}`,
        link: res.webViewLink,
        linkText: 'গুগল ড্রাইভে ফাইলটি দেখুন (View in Drive)'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Google Drive ব্যাকআপ এরর: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Google Docs Verification Letter
  const handleCreateDoc = async () => {
    if (!currentUser) {
      handleLogin();
      return;
    }
    const targetRecord = selectedRecord || records[0];
    if (!targetRecord) {
      setStatusMessage({ type: 'error', text: 'কোনো রেকর্ড পাওয়া যায়নি।' });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await createCitizenVerificationDoc(targetRecord);
      setStatusMessage({
        type: 'success',
        text: `নাগরিক প্রত্যয়ন পত্র Google Docs ফাইলে তৈরি হয়েছে (${targetRecord.nameBn})!`,
        link: res.url,
        linkText: 'Google Docs ফাইল খুলুন (Open in Google Docs)'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Google Docs এরর: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Google Forms Citizen Portal
  const handleCreateForm = async () => {
    if (!currentUser) {
      handleLogin();
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await createBirthRegistrationForm();
      setCreatedForm(res);
      setStatusMessage({
        type: 'success',
        text: 'নাগরিক জন্ম নিবন্ধন অনলাইন গুগল ফরম সফলভাবে প্রস্তুত হয়েছে!',
        link: res.formUrl,
        linkText: 'অনলাইন ফর্ম প্রিভিউ লিংক (Citizen Live Form)'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Google Forms এরর: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Google Tasks
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    if (!currentUser) {
      handleLogin();
      return;
    }
    setIsLoading(true);
    try {
      await createGoogleTask(newTaskTitle, `বহেরাতৈল ইউনিয়ন পরিষদ জন্ম নিবন্ধন প্রোটোটাইপ টাস্ক (${new Date().toLocaleDateString('bn-BD')})`);
      setNewTaskTitle('');
      await loadTasks();
      setStatusMessage({ type: 'success', text: 'Google Tasks এ নতুন টাস্ক যুক্ত হয়েছে!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Google Tasks এরর: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Google Contacts
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName) return;
    if (!currentUser) {
      handleLogin();
      return;
    }
    setIsLoading(true);
    try {
      await createCitizenContact({
        givenName: contactName,
        phoneNumber: contactPhone,
        email: contactEmail,
        address: selectedRecord ? selectedRecord.permanentAddressBn : 'বহেরাতৈল, সখিপুর, টাঙ্গাইল',
      });
      setStatusMessage({ type: 'success', text: `Google Contacts এ "${contactName}" সফলভাবে সংরক্ষিত হয়েছে!` });
      setContactName('');
      setContactPhone('');
      setContactEmail('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Google Contacts এরর: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Gmail
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo || !emailBody) {
      setStatusMessage({ type: 'error', text: 'অনুগ্রহ করে প্রাপকের ইমেইল ও মেসেজ লিখুন।' });
      return;
    }
    if (!currentUser) {
      handleLogin();
      return;
    }
    setIsLoading(true);
    try {
      await sendCitizenEmail(emailTo, emailSubject, emailBody);
      setStatusMessage({ type: 'success', text: `Gmail এর মাধ্যমে ${emailTo} এ নোটিশ ইমেইল সফলভাবে পাঠানো হয়েছে!` });
      setEmailTo('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Gmail প্রেরণে এরর: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Google Slides Presentation
  const handleCreateSlides = async () => {
    if (!currentUser) {
      handleLogin();
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const stats = {
        total: records.length,
        today: records.filter(r => r.createdAt?.startsWith(new Date().toISOString().slice(0, 10))).length,
        verified: records.filter(r => r.status === 'Verified Demo').length,
        pending: records.filter(r => r.status === 'Pending Review' || r.status === 'Draft').length,
      };
      const res = await createRegistryPresentation(stats);
      setStatusMessage({
        type: 'success',
        text: 'Google Slides প্রেজেন্টেশন সফলভাবে তৈরি হয়েছে!',
        link: res.url,
        linkText: 'Google Slides এ প্রেজেন্টেশন খুলুন'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Google Slides এরর: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      
      {/* Header Bar */}
      <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold">
              Google Workspace &amp; Firebase Ecosystem Hub
            </h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
              100% Free Ecosystem
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            বহেরাতৈল ইউনিয়ন পরিষদ ডিজিটাল সেবা: Firebase Firestore, Drive, Sheets, Docs, Forms, Gmail, Tasks &amp; Contacts
          </p>
        </div>

        {/* Auth / Account Controls */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <div className="text-right">
                <div className="text-xs font-semibold text-emerald-300">{currentUser.displayName || 'Google User'}</div>
                <div className="text-[10px] text-slate-400">{currentUser.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs bg-red-600/80 hover:bg-red-600 text-white px-2.5 py-1 rounded transition cursor-pointer"
              >
                সাইন আউট
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg shadow transition cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Google দিয়ে সাইন ইন করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-2 py-1 gap-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('firebase')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
            activeTab === 'firebase' ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-500" />
          <span>Firebase Cloud</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
            activeTab === 'sheets' ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Google Sheets</span>
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
            activeTab === 'drive' ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 text-blue-500" />
          <span>Google Drive</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
            activeTab === 'docs' ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Google Docs</span>
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
            activeTab === 'forms' ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FormInput className="w-3.5 h-3.5 text-purple-600" />
          <span>Google Forms</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
            activeTab === 'tasks' ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span>Google Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
            activeTab === 'contacts' ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-teal-600" />
          <span>Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
            activeTab === 'gmail' ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-red-500" />
          <span>Gmail</span>
        </button>

        <button
          onClick={() => setActiveTab('slides')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
            activeTab === 'slides' ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Presentation className="w-3.5 h-3.5 text-amber-600" />
          <span>Slides</span>
        </button>
      </div>

      {/* Notifications / Alerts */}
      {statusMessage && (
        <div className={`p-3 mx-4 mt-4 rounded-lg flex items-center justify-between text-xs sm:text-sm border ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          statusMessage.type === 'error' ? 'bg-red-50 text-red-900 border-red-200' : 'bg-blue-50 text-blue-900 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          {statusMessage.link && (
            <a
              href={statusMessage.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline ml-2 shrink-0"
            >
              <span>{statusMessage.linkText || 'Open'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Tab Panels */}
      <div className="p-4 sm:p-5">
        
        {/* 1. Firebase Firestore Panel */}
        {activeTab === 'firebase' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/60 p-4 rounded-lg border border-amber-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>Firebase Cloud Firestore ডেটাবেজ সিঙ্ক</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  অ্যাপের সকল জন্ম নিবন্ধন খসড়া ও সনদ সরাসরি ক্লাউড ফায়ারস্টোরে সংরক্ষণ করুন। একাধিক কম্পিউটার ও মোবাইলে স্বয়ংক্রিয়ভাবে আপডেটেড থাকবে।
                </p>
              </div>
              <button
                onClick={handleSyncFirestore}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>ক্লাউডে সিঙ্ক করুন ({records.length} রেকর্ড)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500">মোট লোকাল রেকর্ড:</span>
                <div className="text-lg font-bold text-slate-800">{records.length} টি</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500">সিঙ্ক স্ট্যাটাস:</span>
                <div className="text-lg font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{currentUser ? 'Active Cloud Sync' : 'Local Offline Mode'}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500">Firebase Region:</span>
                <div className="text-lg font-bold text-slate-800">asia-southeast1</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Google Sheets Panel */}
        {activeTab === 'sheets' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/60 p-4 rounded-lg border border-emerald-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>গুগল শিটে সম্পূর্ণ রেজিস্টার এক্সপোর্ট</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  সকল জন্ম নিবন্ধন তথ্যাবলী ১-ক্লিকে একটি রিয়েল-টাইম গুগল শিটে এক্সপোর্ট করুন। পরবর্তীতে এক্সেল বা শিট হিসেবে ডাউনলোড করা যাবে।
                </p>
              </div>
              <button
                onClick={handleExportToSheets}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন গুগল শিট তৈরি করুন</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Google Drive Panel */}
        {activeTab === 'drive' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50/60 p-4 rounded-lg border border-blue-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span>Google Drive ক্লাউড ব্যাকআপ ও ফাইল ম্যানেজার</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  আপনার গুগল ড্রাইভে <code>BDRIS_Birth_Registrations</code> ফোল্ডারে স্বয়ংক্রিয় ব্যাকআপ সংরক্ষণ করুন।
                </p>
              </div>
              <button
                onClick={handleBackupToDrive}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              >
                <FolderPlus className="w-4 h-4" />
                <span>ড্রাইভে ব্যাকআপ রাখুন</span>
              </button>
            </div>

            {/* Drive files list */}
            <div>
              <h5 className="text-xs font-bold text-slate-700 mb-2">গুগল ড্রাইভ ব্যাকআপ ফাইলসমূহ ({driveFiles.length}):</h5>
              {driveFiles.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-200">
                  এখনো কোনো ড্রাইভ ব্যাকআপ নেওয়া হয়নি। উপরের বাটনে ক্লিক করে ব্যাকআপ নিন।
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                  {driveFiles.map(file => (
                    <div key={file.id} className="p-2.5 text-xs flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2 truncate">
                        <HardDrive className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{file.name}</span>
                        {file.createdTime && (
                          <span className="text-[10px] text-slate-400">{new Date(file.createdTime).toLocaleDateString()}</span>
                        )}
                      </div>
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 shrink-0 ml-2"
                        >
                          <span>ড্রাইভে দেখুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Google Docs Panel */}
        {activeTab === 'docs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/60 p-4 rounded-lg border border-indigo-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Google Docs জন্ম নিবন্ধন সনদ টেমপ্লেট (১০০% নমুনা অনুযায়ী)</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  নমুনা জন্ম নিবন্ধন সনদের অনুরূপ হেডার, ৩-কলাম মেটাডাটা, সমান্তরাল বাংলা-ইংরেজি ফিল্ড ও সিল-স্বাক্ষর ব্লকে সাজানো অফিসিয়াল Google Doc তৈরি করুন।
                </p>
              </div>
              <button
                onClick={handleCreateDoc}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Google Docs সনদ তৈরি করুন</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. Google Forms Panel */}
        {activeTab === 'forms' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-purple-50/60 p-4 rounded-lg border border-purple-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FormInput className="w-4 h-4 text-purple-600" />
                  <span>অনলাইন নাগরিক আবেদন গুগল ফর্ম (১০০% সনদের তথ্যানুযায়ী)</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  আবেদনকারীর নাম, ইংরেজি নাম, জন্ম তারিখ, কথায় তারিখ, লিঙ্গ, পিতামাতার বাংলা/ইংরেজি নাম ও জাতীয়তা, জন্মস্থান এবং স্থায়ী ঠিকানার সম্পূর্ণ ফিল্ড সম্বলিত অনলাইন Google Form তৈরি করুন।
                </p>
              </div>
              <button
                onClick={handleCreateForm}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>নাগরিক আবেদন ফরম তৈরি করুন</span>
              </button>
            </div>

            {createdForm && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs space-y-2">
                <div className="font-bold text-purple-900">তৈরি করা গুগল ফর্ম লিঙ্ক:</div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={createdForm.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-purple-700 text-white px-3 py-1.5 rounded hover:bg-purple-800 font-semibold"
                  >
                    <span>নাগরিকদের জন্য লাইভ ফর্ম লিঙ্ক</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={createdForm.editUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-white text-purple-900 border border-purple-300 px-3 py-1.5 rounded hover:bg-purple-50 font-semibold"
                  >
                    <span>অফিস এডিট ও রেসপন্স দেখুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. Google Tasks Panel */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="যেমন: ওয়ার্ড ৩ এর জন্ম নিবন্ধন রেকর্ড যাচাই করুন..."
                className="flex-1 text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>টাস্ক যোগ করুন</span>
              </button>
            </form>

            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-700 mb-1">Google Tasks তালিকা:</h5>
              {tasks.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-200">
                  কোনো টাস্ক নেই। নতুন টাস্ক যোগ করুন।
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                  {tasks.map(t => (
                    <div key={t.id} className="p-2.5 text-xs flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-slate-800 font-medium">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Google Tasks</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. Google Contacts Panel */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <form onSubmit={handleSaveContact} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>নাগরিককে Google Contacts এ সেভ করুন</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="নাগরিকের নাম *"
                  required
                  className="text-xs px-3 py-2 border border-slate-300 rounded bg-white"
                />
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="মোবাইল নম্বর"
                  className="text-xs px-3 py-2 border border-slate-300 rounded bg-white"
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="ইমেইল এড্রেস"
                  className="text-xs px-3 py-2 border border-slate-300 rounded bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded transition cursor-pointer shadow-xs"
              >
                Google Contacts এ যুক্ত করুন
              </button>
            </form>
          </div>
        )}

        {/* 8. Gmail Panel */}
        {activeTab === 'gmail' && (
          <div className="space-y-4">
            <form onSubmit={handleSendEmail} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-red-500" />
                <span>নাগরিককে সরাসরি Gmail থেকে নোটিশ / সনদ পাঠান</span>
              </h5>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="প্রাপকের ইমেইল এড্রেস *"
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white"
              />
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="বিষয় (Subject)"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white"
              />
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={4}
                placeholder="ইমেইল মেসেজ..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded transition cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gmail দিয়ে ইমেইল পাঠান</span>
              </button>
            </form>
          </div>
        )}

        {/* 9. Google Slides Panel */}
        {activeTab === 'slides' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/60 p-4 rounded-lg border border-amber-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-amber-600" />
                  <span>Google Slides প্রেজেন্টেশন ও পরিসংখ্যান ডেক</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  ইউনিয়ন পরিষদের মাসিক জন্ম নিবন্ধন পরিসংখ্যান ও সেবার তথ্য নিয়ে একটি গুগল স্লাইডস প্রেজেন্টেশন তৈরি করুন।
                </p>
              </div>
              <button
                onClick={handleCreateSlides}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Google Slides ডেক তৈরি করুন</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
