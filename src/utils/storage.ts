import { DemoRecord, ActivityLog } from '../types';
import { generateDemoReferenceNumber } from './numberToWords';

const STORAGE_KEY = 'bd_birth_registration_demo_records_v1';
const LOGS_STORAGE_KEY = 'bd_birth_registration_demo_logs_v1';

export const INITIAL_DEMO_RECORDS: DemoRecord[] = [
  {
    id: 'rec-001',
    referenceId: '19879318513121621',
    status: 'Verified Demo',
    officeNameBn: 'জন্ম ও মৃত্যু নিবন্ধকের কার্যালয়',
    officeNameEn: 'Office of the Registrar, Birth and Death Registration',
    unionParishadBn: 'বহেরাতৈল ইউনিয়ন পরিষদ',
    unionParishadEn: 'Baheratail Union Parishad',
    upazilaBn: 'সখিপুর',
    upazilaEn: 'Sakhipur',
    districtBn: 'টাঙ্গাইল',
    districtEn: 'Tangail',
    ruleText: '(Rule 9, 10)',
    dateOfRegistration: '24/08/2026',
    dateOfIssuance: '27/08/2026',
    nameBn: 'সাজেদা আক্তার',
    nameEn: 'Shajeda Akter',
    dateOfBirth: '1987-09-05',
    dateOfBirthWordsEn: 'Fifth of September Nineteen Eighty Seven',
    dateOfBirthWordsBn: 'পাঁচই সেপ্টেম্বর উনিশ শত সাতাশি',
    sex: 'Female',
    sexBn: 'মহিলা',
    nationalityBn: 'বাংলাদেশী',
    nationalityEn: 'Bangladeshi',
    placeOfBirthBn: 'টাঙ্গাইল, বাংলাদেশ',
    placeOfBirthEn: 'Tangail, Bangladesh',
    motherNameBn: 'জাহানারা বেগম',
    motherNameEn: 'Jahanara Begum',
    motherNationalityBn: 'বাংলাদেশী',
    motherNationalityEn: 'Bangladeshi',
    fatherNameBn: 'মোঃ শাহজাহান',
    fatherNameEn: 'Md Shahjahan',
    fatherNationalityBn: 'বাংলাদেশী',
    fatherNationalityEn: 'Bangladeshi',
    villageBn: 'দাবাইল নাগবাড়ী-১৯৭২',
    villageEn: 'Dabail Nagbari-1972',
    postOfficeBn: 'বহেরাতৈল',
    postOfficeEn: 'Baheratail',
    wardBn: '১',
    wardEn: '1',
    unionBn: 'বহেরাতৈল',
    unionEn: 'Baheratail',
    upazilaFieldBn: 'সখিপুর',
    upazilaFieldEn: 'Sakhipur',
    districtFieldBn: 'টাঙ্গাইল',
    districtFieldEn: 'Tangail',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    permanentAddressBn: 'দাবাইল নাগবাড়ী-১৯৭২, ওয়ার্ড - ১, বহেরাতৈল, সখিপুর, টাঙ্গাইল',
    permanentAddressEn: 'Dabail Nagbari-1972, Ward - 1, Baheratail, Sakhipur, Tangail',
    assistantTitleBn: '(Preparation, Verification)',
    assistantTitleEn: 'Assistant to Registrar',
    registrarTitleBn: '',
    registrarTitleEn: 'Registrar',
    qrReferenceCode: 'EETT',
    qrVerificationKey: 'Qtq6RrDDa4pD8RxM9kk6ZR4hBrlXEcYzrs3DQiZe3Vk9YtjZdVmsaufXJguELoG8',
    qrVerificationUrl: 'https://bdris.gov.bd/certificate/verify?key=Qtq6RrDDa4pD8RxM9kk6ZR4hBrlXEcYzrs3DQiZe3Vk9YtjZdVmsaufXJguELoG8',
    barcodeValue: '19879318513121621',
    notes: 'Official Baheratail UP Certificate sample from BDRIS.',
    createdAt: '2026-08-24T10:30:00.000Z',
    updatedAt: '2026-08-27T14:20:00.000Z'
  },
  {
    id: 'rec-002',
    referenceId: '20260829100234512',
    status: 'Draft',
    officeNameBn: 'জন্ম ও মৃত্যু নিবন্ধকের কার্যালয়',
    officeNameEn: 'Office of the Registrar, Birth and Death Registration',
    unionParishadBn: 'বহেরাতৈল ইউনিয়ন পরিষদ',
    unionParishadEn: 'BAHERATAIL UNION PARISHAD',
    upazilaBn: 'সখিপুর',
    upazilaEn: 'Sakhipur',
    districtBn: 'টাঙ্গাইল',
    districtEn: 'Tangail',
    ruleText: '(Rule 9, 10)',
    dateOfRegistration: '15/08/2026',
    dateOfIssuance: '20/08/2026',
    nameBn: 'তানভীর আহমেদ',
    nameEn: 'Tanvir Ahmed',
    dateOfBirth: '1995-12-16',
    dateOfBirthWordsEn: 'Sixteenth of December Nineteen Ninety Five',
    dateOfBirthWordsBn: 'ষোলই ডিসেম্বর উনিশ শত পঁচানব্বই',
    sex: 'Male',
    sexBn: 'পুরুষ',
    nationalityBn: 'বাংলাদেশী',
    nationalityEn: 'Bangladeshi',
    placeOfBirthBn: 'টাঙ্গাইল, বাংলাদেশ',
    placeOfBirthEn: 'Tangail, Bangladesh',
    motherNameBn: 'রোকেয়া সুলতানা',
    motherNameEn: 'Rokeya Sultana',
    motherNationalityBn: 'বাংলাদেশী',
    motherNationalityEn: 'Bangladeshi',
    fatherNameBn: 'মোজাম্মেল হক',
    fatherNameEn: 'Mozammel Haque',
    fatherNationalityBn: 'বাংলাদেশী',
    fatherNationalityEn: 'Bangladeshi',
    villageBn: 'বক্তারপুর',
    villageEn: 'Baktarpur',
    postOfficeBn: 'বহেরাতৈল',
    postOfficeEn: 'Baheratail',
    wardBn: '৩',
    wardEn: '3',
    unionBn: 'বহেরাতৈল',
    unionEn: 'Baheratail',
    upazilaFieldBn: 'সখিপুর',
    upazilaFieldEn: 'Sakhipur',
    districtFieldBn: 'টাঙ্গাইল',
    districtFieldEn: 'Tangail',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    permanentAddressBn: 'বক্তারপুর, ওয়ার্ড - ৩, বহেরাতৈল, সখিপুর, টাঙ্গাইল',
    permanentAddressEn: 'Baktarpur, Ward - 3, Baheratail, Sakhipur, Tangail',
    assistantTitleBn: '(Preparation, Verification)',
    assistantTitleEn: 'Assistant to Registrar',
    registrarTitleBn: '',
    registrarTitleEn: 'Registrar',
    notes: 'Baheratail UP entry.',
    createdAt: '2026-08-25T09:15:00.000Z',
    updatedAt: '2026-08-28T18:00:00.000Z'
  },
  {
    id: 'demo-rec-003',
    referenceId: 'DEMO-20260829-0002',
    status: 'Verified Demo',
    officeNameBn: 'জন্ম ও মৃত্যু নিবন্ধকের কার্যালয়',
    officeNameEn: 'Office of the Registrar, Birth and Death Registration',
    unionParishadBn: 'পতেঙ্গা আঞ্চলিক কার্যালয়',
    unionParishadEn: 'Patenga Zonal Office, Chattogram City Corporation',
    upazilaBn: 'পতেঙ্গা',
    upazilaEn: 'Patenga',
    districtBn: 'চট্টগ্রাম',
    districtEn: 'Chattogram',
    ruleText: '(Rule 9, 10)',
    dateOfRegistration: '10/08/2026',
    dateOfIssuance: '12/08/2026',
    nameBn: 'নুসরাত জাহান রিয়া',
    nameEn: 'Nusrat Jahan Riya',
    dateOfBirth: '2004-03-26',
    dateOfBirthWordsEn: 'Twenty-Sixth of March Two Thousand Four',
    dateOfBirthWordsBn: 'ছাব্বিশে মার্চ দুই হাজার চার',
    sex: 'Female',
    sexBn: 'মহিলা',
    nationalityBn: 'বাংলাদেশী',
    nationalityEn: 'Bangladeshi',
    placeOfBirthBn: 'চট্টগ্রাম, বাংলাদেশ',
    placeOfBirthEn: 'Chattogram, Bangladesh',
    motherNameBn: 'ফরিদা ইয়াসমিন',
    motherNameEn: 'Farida Yasmin',
    motherNationalityBn: 'বাংলাদেশী',
    motherNationalityEn: 'Bangladeshi',
    fatherNameBn: 'কামাল উদ্দিন চৌধুরী',
    fatherNameEn: 'Kamal Uddin Chowdhury',
    fatherNationalityBn: 'বাংলাদেশী',
    fatherNationalityEn: 'Bangladeshi',
    villageBn: 'দক্ষিণ পতেঙ্গা',
    villageEn: 'South Patenga',
    postOfficeBn: 'পতেঙ্গা',
    postOfficeEn: 'Patenga',
    wardBn: '৪১',
    wardEn: '41',
    unionBn: 'সিটি কর্পোরেশন',
    unionEn: 'City Corporation',
    upazilaFieldBn: 'পতেঙ্গা',
    upazilaFieldEn: 'Patenga',
    districtFieldBn: 'চট্টগ্রাম',
    districtFieldEn: 'Chattogram',
    divisionBn: 'চট্টগ্রাম',
    divisionEn: 'Chattogram',
    permanentAddressBn: 'দক্ষিণ পতেঙ্গা, ওয়ার্ড - ৪১, পতেঙ্গা, চট্টগ্রাম',
    permanentAddressEn: 'South Patenga, Ward - 41, Patenga, Chattogram',
    assistantTitleBn: 'সহকারী স্বাস্থ্য কর্মকর্তা ও নিবন্ধক',
    assistantTitleEn: 'Assistant Health Officer & Registrar',
    registrarTitleBn: 'আঞ্চলিক নির্বাহী কর্মকর্তা ও নিবন্ধক',
    registrarTitleEn: 'Zonal Executive Officer & Registrar',
    notes: 'City Corporation format test sample.',
    createdAt: '2026-08-20T11:40:00.000Z',
    updatedAt: '2026-08-26T16:10:00.000Z'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-001',
    referenceId: 'DEMO-19879318513121621',
    action: 'Created',
    description: 'Reference demo draft record initialized.',
    timestamp: '2026-08-27T10:30:00.000Z'
  },
  {
    id: 'log-002',
    referenceId: 'DEMO-20260829-0001',
    action: 'Created',
    description: 'New demo prototype draft for Tanvir Ahmed created.',
    timestamp: '2026-08-25T09:15:00.000Z'
  },
  {
    id: 'log-003',
    referenceId: 'DEMO-20260829-0002',
    action: 'Status Changed',
    description: 'Draft marked as Verified Demo sample.',
    timestamp: '2026-08-26T16:10:00.000Z'
  }
];

export function getStoredRecords(): DemoRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_RECORDS));
      return INITIAL_DEMO_RECORDS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_RECORDS;
  } catch {
    return INITIAL_DEMO_RECORDS;
  }
}

export function saveStoredRecords(records: DemoRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving records to localStorage:', err);
  }
}

export function getRecordById(id: string): DemoRecord | undefined {
  const records = getStoredRecords();
  return records.find((r) => r.id === id);
}

export function saveOrUpdateRecord(record: DemoRecord): { success: boolean; record: DemoRecord; isNew: boolean } {
  const records = getStoredRecords();
  const index = records.findIndex((r) => r.id === record.id);
  const now = new Date().toISOString();
  let isNew = false;
  let savedRecord: DemoRecord;

  if (index >= 0) {
    savedRecord = {
      ...record,
      updatedAt: now
    };
    records[index] = savedRecord;
    addLog({
      id: 'log-' + Date.now(),
      recordId: savedRecord.id,
      referenceId: savedRecord.referenceId,
      action: 'Updated',
      description: `Updated draft record for ${savedRecord.nameEn || savedRecord.nameBn || 'Demo User'}.`,
      timestamp: now
    });
  } else {
    isNew = true;
    savedRecord = {
      ...record,
      id: record.id || 'demo-rec-' + Date.now(),
      referenceId: record.referenceId || generateDemoReferenceNumber(record.dateOfBirth),
      createdAt: now,
      updatedAt: now
    };
    records.unshift(savedRecord);
    addLog({
      id: 'log-' + Date.now(),
      recordId: savedRecord.id,
      referenceId: savedRecord.referenceId,
      action: 'Created',
      description: `Created new draft record for ${savedRecord.nameEn || savedRecord.nameBn || 'Demo User'}.`,
      timestamp: now
    });
  }

  saveStoredRecords(records);
  return { success: true, record: savedRecord, isNew };
}

export function deleteStoredRecord(id: string): boolean {
  const records = getStoredRecords();
  const target = records.find((r) => r.id === id);
  const filtered = records.filter((r) => r.id !== id);
  saveStoredRecords(filtered);
  
  if (target) {
    addLog({
      id: 'log-' + Date.now(),
      recordId: id,
      referenceId: target.referenceId,
      action: 'Deleted',
      description: `Deleted demo draft record ${target.referenceId}.`,
      timestamp: new Date().toISOString()
    });
  }
  return true;
}

export function duplicateStoredRecord(id: string): DemoRecord | null {
  const records = getStoredRecords();
  const target = records.find((r) => r.id === id);
  if (!target) return null;

  const now = new Date().toISOString();
  const duplicated: DemoRecord = {
    ...target,
    id: 'demo-rec-' + Date.now(),
    referenceId: generateDemoReferenceNumber(target.dateOfBirth),
    status: 'Draft',
    nameBn: `${target.nameBn} (কপি)`,
    nameEn: `${target.nameEn} (Copy)`,
    createdAt: now,
    updatedAt: now
  };

  records.unshift(duplicated);
  saveStoredRecords(records);
  
  addLog({
    id: 'log-' + Date.now(),
    recordId: duplicated.id,
    referenceId: duplicated.referenceId,
    action: 'Created',
    description: `Duplicated from record ${target.referenceId}.`,
    timestamp: now
  });

  return duplicated;
}

export function getStoredLogs(): ActivityLog[] {
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_LOGS;
  } catch {
    return INITIAL_LOGS;
  }
}

export function addLog(log: ActivityLog): void {
  try {
    const logs = getStoredLogs();
    logs.unshift(log);
    // Keep last 100 logs
    const trimmed = logs.slice(0, 100);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Error saving log:', err);
  }
}

export function createBlankRecord(): DemoRecord {
  const today = new Date();
  const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  
  return {
    id: 'demo-rec-' + Date.now(),
    referenceId: generateDemoReferenceNumber(),
    status: 'Draft',
    officeNameBn: 'জন্ম ও মৃত্যু নিবন্ধকের কার্যালয়',
    officeNameEn: 'Office of the Registrar, Birth and Death Registration',
    unionParishadBn: 'বহেরাতৈল ইউনিয়ন পরিষদ',
    unionParishadEn: 'BAHERATAIL UNION PARISHAD',
    upazilaBn: 'সখিপুর',
    upazilaEn: 'Sakhipur',
    districtBn: 'টাঙ্গাইল',
    districtEn: 'Tangail',
    ruleText: '(Rule 9, 10)',
    dateOfRegistration: formattedToday,
    dateOfIssuance: formattedToday,
    nameBn: '',
    nameEn: '',
    dateOfBirth: '2000-01-01',
    dateOfBirthWordsEn: 'First of January Two Thousand',
    dateOfBirthWordsBn: 'পহেলা জানুয়ারি দুই হাজার',
    sex: 'Male',
    sexBn: 'পুরুষ',
    nationalityBn: 'বাংলাদেশী',
    nationalityEn: 'Bangladeshi',
    placeOfBirthBn: '',
    placeOfBirthEn: '',
    motherNameBn: '',
    motherNameEn: '',
    motherNationalityBn: 'বাংলাদেশী',
    motherNationalityEn: 'Bangladeshi',
    fatherNameBn: '',
    fatherNameEn: '',
    fatherNationalityBn: 'বাংলাদেশী',
    fatherNationalityEn: 'Bangladeshi',
    villageBn: '',
    villageEn: '',
    postOfficeBn: '',
    postOfficeEn: '',
    wardBn: '',
    wardEn: '',
    unionBn: '',
    unionEn: '',
    upazilaFieldBn: '',
    upazilaFieldEn: '',
    districtFieldBn: '',
    districtFieldEn: '',
    divisionBn: 'ঢাকা',
    divisionEn: 'Dhaka',
    permanentAddressBn: '',
    permanentAddressEn: '',
    assistantTitleBn: '(Preparation, Verification)',
    assistantTitleEn: 'Assistant to Registrar',
    registrarTitleBn: '',
    registrarTitleEn: 'Registrar',
    qrReferenceCode: 'EETT',
    qrVerificationKey: 'Qtq6RrDDa4pD8RxM9kk6ZR4hBrlXEcYzrs3DQiZe3Vk9YtjZdVmsaufXJguELoG8',
    qrVerificationUrl: 'https://bdris.gov.bd/certificate/verify?key=Qtq6RrDDa4pD8RxM9kk6ZR4hBrlXEcYzrs3DQiZe3Vk9YtjZdVmsaufXJguELoG8',
    barcodeValue: '',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
