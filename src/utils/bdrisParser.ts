import { DemoRecord } from '../types';
import { 
  convertDateToEnglishWords, 
  convertDateToBengaliWords,
  formatPlaceOfBirthBn,
  formatPlaceOfBirthEn,
  ensureBaheratailAddressBn,
  ensureBaheratailAddressEn,
  DEFAULT_BDRIS_VERIFY_KEY,
  getBdrisVerificationUrl
} from './numberToWords';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ParseResult {
  extractedRecord: Partial<DemoRecord>;
  foundFields: string[];
  missingFields: string[];
  rawParsedText: string;
}

export interface ValidationIssue {
  field: keyof DemoRecord;
  labelBn: string;
  labelEn: string;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

/**
 * Validates a DemoRecord strictly against Bangladesh BDRIS requirements.
 * If any mandatory field is missing or invalid, submission / download is blocked.
 */
export function validateCertificateRecord(record: Partial<DemoRecord>): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Birth Registration Number (17 digits)
  const cleanBrn = (record.referenceId || '').replace(/\D/g, '');
  if (!cleanBrn || cleanBrn.length !== 17) {
    issues.push({
      field: 'referenceId',
      labelBn: '১৭ ডিজিটের জন্ম নিবন্ধন নম্বর (BRN)',
      labelEn: '17-digit Birth Registration Number',
      description: 'জন্ম নিবন্ধন নম্বর অবশ্যই ১৭ সংখ্যার হতে হবে।'
    });
  }

  // 2. Date of Birth
  if (!record.dateOfBirth || record.dateOfBirth.trim() === '') {
    issues.push({
      field: 'dateOfBirth',
      labelBn: 'জন্ম তারিখ (Date of Birth)',
      labelEn: 'Date of Birth',
      description: 'জন্ম তারিখ অবশ্যই নির্বাচন করতে হবে।'
    });
  }

  // 3. Date of Registration
  if (!record.dateOfRegistration || record.dateOfRegistration.trim() === '') {
    issues.push({
      field: 'dateOfRegistration',
      labelBn: 'নিবন্ধনের তারিখ (Date of Registration)',
      labelEn: 'Date of Registration',
      description: 'নিবন্ধনের তারিখ খালি রাখা যাবে না।'
    });
  }

  // 4. Date of Issuance
  if (!record.dateOfIssuance || record.dateOfIssuance.trim() === '') {
    issues.push({
      field: 'dateOfIssuance',
      labelBn: 'সনদ প্রদানের তারিখ (Date of Issuance)',
      labelEn: 'Date of Issuance',
      description: 'সনদ প্রদানের তারিখ খালি রাখা যাবে না।'
    });
  }

  // 5. Gender / Sex
  if (!record.sex || record.sex.trim() === '') {
    issues.push({
      field: 'sex',
      labelBn: 'লিঙ্গ (Sex / Gender)',
      labelEn: 'Sex / Gender',
      description: 'লিঙ্গ (Male / Female / Other) নির্বাচন করুন।'
    });
  }

  // 6. Name in Bengali
  if (!record.nameBn || record.nameBn.trim() === '') {
    issues.push({
      field: 'nameBn',
      labelBn: 'নাগরিকের নাম (বাংলা)',
      labelEn: 'Name in Bengali',
      description: 'বাংলায় নাগরিকের পূর্ণ নাম লিখুন।'
    });
  }

  // 7. Name in English
  if (!record.nameEn || record.nameEn.trim() === '') {
    issues.push({
      field: 'nameEn',
      labelBn: 'নাগরিকের নাম (English)',
      labelEn: 'Name in English',
      description: 'ইংরেজি ক্যাপিটাল বা টাইটেল কেসে নাম লিখুন।'
    });
  }

  // 8. Mother's Name in Bengali
  if (!record.motherNameBn || record.motherNameBn.trim() === '') {
    issues.push({
      field: 'motherNameBn',
      labelBn: 'মাতার নাম (বাংলা)',
      labelEn: "Mother's Name in Bengali",
      description: 'মাতার নাম বাংলায় লিখুন।'
    });
  }

  // 9. Mother's Name in English
  if (!record.motherNameEn || record.motherNameEn.trim() === '') {
    issues.push({
      field: 'motherNameEn',
      labelBn: 'মাতার নাম (English)',
      labelEn: "Mother's Name in English",
      description: 'মাতার নাম ইংরেজিতে লিখুন।'
    });
  }

  // 10. Father's Name in Bengali
  if (!record.fatherNameBn || record.fatherNameBn.trim() === '') {
    issues.push({
      field: 'fatherNameBn',
      labelBn: 'পিতার নাম (বাংলা)',
      labelEn: "Father's Name in Bengali",
      description: 'পিতার নাম বাংলায় লিখুন।'
    });
  }

  // 11. Father's Name in English
  if (!record.fatherNameEn || record.fatherNameEn.trim() === '') {
    issues.push({
      field: 'fatherNameEn',
      labelBn: 'পিতার নাম (English)',
      labelEn: "Father's Name in English",
      description: 'পিতার নাম ইংরেজিতে লিখুন।'
    });
  }

  // 12. Place of Birth in Bengali
  if (!record.placeOfBirthBn || record.placeOfBirthBn.trim() === '') {
    issues.push({
      field: 'placeOfBirthBn',
      labelBn: 'জন্মস্থান (বাংলা)',
      labelEn: 'Place of Birth in Bengali',
      description: 'জন্মস্থান বাংলায় উল্লেখ করুন।'
    });
  }

  // 13. Place of Birth in English
  if (!record.placeOfBirthEn || record.placeOfBirthEn.trim() === '') {
    issues.push({
      field: 'placeOfBirthEn',
      labelBn: 'জন্মস্থান (English)',
      labelEn: 'Place of Birth in English',
      description: 'জন্মস্থান ইংরেজিতে উল্লেখ করুন।'
    });
  }

  // 14. Permanent Address in Bengali
  if (!record.permanentAddressBn || record.permanentAddressBn.trim() === '') {
    issues.push({
      field: 'permanentAddressBn',
      labelBn: 'স্থায়ী ঠিকানা (বাংলা)',
      labelEn: 'Permanent Address in Bengali',
      description: 'স্থায়ী ঠিকানা বাংলায় প্রদান করুন।'
    });
  }

  // 15. Permanent Address in English
  if (!record.permanentAddressEn || record.permanentAddressEn.trim() === '') {
    issues.push({
      field: 'permanentAddressEn',
      labelBn: 'স্থায়ী ঠিকানা (English)',
      labelEn: 'Permanent Address in English',
      description: 'স্থায়ী ঠিকানা ইংরেজিতে প্রদান করুন।'
    });
  }

  // 16. Union Parishad / Office
  if (!record.unionParishadBn && !record.unionParishadEn) {
    issues.push({
      field: 'unionParishadBn',
      labelBn: 'নিবন্ধন কার্যালয় / ইউনিয়ন পরিষদ',
      labelEn: 'Registration Office / Union Parishad',
      description: 'ইউনিয়ন পরিষদ বা নিবন্ধন অফিসের নাম লিখুন।'
    });
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Intelligent BDRIS e-Verify text / HTML parser.
 * Extracts details copied from https://everify.bdris.gov.bd/ or direct verification text.
 */
export function parseEverifyContent(rawInput: string): ParseResult {
  const result: Partial<DemoRecord> = {};
  const foundFields: string[] = [];
  const text = rawInput.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

  // 1. Extract 17-digit BRN
  const brnMatch = text.match(/\b(19\d{15}|20\d{15}|\d{17})\b/);
  if (brnMatch) {
    result.referenceId = brnMatch[1];
    result.barcodeValue = brnMatch[1];
    foundFields.push('Birth Registration Number (BRN)');
  }

  // 2. Extract Date of Birth
  // Support DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
  const dobMatch = text.match(/(?:Date of Birth|DOB|জন্ম তারিখ|Date\s*:\s*)[:\s]*([0-3]?\d[\/\-\.][0-1]?\d[\/\-\.](?:19|20)\d{2}|(?:19|20)\d{2}[\/\-\.][0-1]?\d[\/\-\.][0-3]?\d)/i);
  if (dobMatch) {
    const rawDob = dobMatch[1];
    let formattedDob = rawDob;
    if (rawDob.includes('-') && rawDob.indexOf('-') === 4) {
      // YYYY-MM-DD
      const [y, m, d] = rawDob.split('-');
      formattedDob = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      result.dateOfBirth = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else {
      const parts = rawDob.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        formattedDob = `${d}/${m}/${y}`;
        result.dateOfBirth = `${y}-${m}-${d}`;
      }
    }
    result.dateOfBirthWordsEn = convertDateToEnglishWords(result.dateOfBirth || formattedDob);
    result.dateOfBirthWordsBn = convertDateToBengaliWords(result.dateOfBirth || formattedDob);
    foundFields.push('Date of Birth');
  }

  // 3. Extract Gender / Sex
  if (/Female|মহিলা|নারী/i.test(text)) {
    result.sex = 'Female';
    result.sexBn = 'মহিলা';
    foundFields.push('Sex (Female)');
  } else if (/Male|পুরুষ|ছেলে/i.test(text)) {
    result.sex = 'Male';
    result.sexBn = 'পুরুষ';
    foundFields.push('Sex (Male)');
  } else if (/Other|অন্যান্য/i.test(text)) {
    result.sex = 'Other';
    result.sexBn = 'অন্যান্য';
    foundFields.push('Sex (Other)');
  }

  // 4. Extract Date of Registration
  const regDateMatch = text.match(/(?:Date of Registration|নিবন্ধন তারিখ|Registration Date)[:\s]*([0-3]?\d[\/\-\.][0-1]?\d[\/\-\.](?:19|20)\d{2})/i);
  if (regDateMatch) {
    result.dateOfRegistration = regDateMatch[1].replace(/[\-\.]/g, '/');
    foundFields.push('Date of Registration');
  }

  // 5. Extract Date of Issuance
  const issDateMatch = text.match(/(?:Date of Issuance|ইস্যু তারিখ|প্রদানের তারিখ|Issuance Date)[:\s]*([0-3]?\d[\/\-\.][0-1]?\d[\/\-\.](?:19|20)\d{2})/i);
  if (issDateMatch) {
    result.dateOfIssuance = issDateMatch[1].replace(/[\-\.]/g, '/');
    foundFields.push('Date of Issuance');
  }

  // 6. Extract Citizen Name (Bangla & English)
  // Matches "নাম : ..." or "Name : ..."
  const nameBnMatch = text.match(/(?:নাম|নাগরিকের নাম)\s*[:：]\s*([\u0980-\u09FF\s\.]+?)(?=\s*(?:Name|মাতা|Mother|পিতা|Father|Sex|লিঙ্গ|Date|জন্ম|$))/i);
  if (nameBnMatch && nameBnMatch[1].trim()) {
    result.nameBn = nameBnMatch[1].trim();
    foundFields.push('Name (Bengali)');
  }

  const nameEnMatch = text.match(/(?:Name|Person'?s Name)\s*[:：]\s*([A-Za-z\s\.\-']+?)(?=\s*(?:Mother|মাতা|Father|পিতা|Sex|Nationality|Place|Permanent|$))/i);
  if (nameEnMatch && nameEnMatch[1].trim() && !/^(Female|Male|Bangladeshi)$/i.test(nameEnMatch[1].trim())) {
    result.nameEn = nameEnMatch[1].trim();
    foundFields.push('Name (English)');
  }

  // 7. Extract Mother's Name (Bangla & English)
  const motherBnMatch = text.match(/(?:মাতা|মাতার নাম)\s*[:：]\s*([\u0980-\u09FF\s\.]+?)(?=\s*(?:Mother|মাতার জাতীয়তা|Nationality|পিতা|Father|$))/i);
  if (motherBnMatch && motherBnMatch[1].trim()) {
    result.motherNameBn = motherBnMatch[1].trim();
    foundFields.push("Mother's Name (Bengali)");
  }

  const motherEnMatch = text.match(/(?:Mother|Mother'?s Name)\s*[:：]\s*([A-Za-z\s\.\-']+?)(?=\s*(?:Nationality|মাতার জাতীয়তা|Father|পিতা|Place|$))/i);
  if (motherEnMatch && motherEnMatch[1].trim() && !/^(Bangladeshi)$/i.test(motherEnMatch[1].trim())) {
    result.motherNameEn = motherEnMatch[1].trim();
    foundFields.push("Mother's Name (English)");
  }

  // 8. Extract Father's Name (Bangla & English)
  const fatherBnMatch = text.match(/(?:পিতা|পিতার নাম)\s*[:：]\s*([\u0980-\u09FF\s\.]+?)(?=\s*(?:Father|পিতার জাতীয়তা|Nationality|জন্মস্থান|Place|$))/i);
  if (fatherBnMatch && fatherBnMatch[1].trim()) {
    result.fatherNameBn = fatherBnMatch[1].trim();
    foundFields.push("Father's Name (Bengali)");
  }

  const fatherEnMatch = text.match(/(?:Father|Father'?s Name)\s*[:：]\s*([A-Za-z\s\.\-']+?)(?=\s*(?:Nationality|পিতার জাতীয়তা|Place of Birth|জন্মস্থান|Permanent|$))/i);
  if (fatherEnMatch && fatherEnMatch[1].trim() && !/^(Bangladeshi)$/i.test(fatherEnMatch[1].trim())) {
    result.fatherNameEn = fatherEnMatch[1].trim();
    foundFields.push("Father's Name (English)");
  }

  // 9. Extract Place of Birth
  const pobBnMatch = text.match(/(?:জন্মস্থান)\s*[:：]\s*([\u0980-\u09FF\s\.,\-]+?)(?=\s*(?:Place of Birth|স্থায়ী ঠিকানা|Permanent|$))/i);
  if (pobBnMatch && pobBnMatch[1].trim()) {
    result.placeOfBirthBn = formatPlaceOfBirthBn(pobBnMatch[1].trim());
    foundFields.push('Place of Birth (Bengali)');
  }

  const pobEnMatch = text.match(/(?:Place of Birth)\s*[:：]\s*([A-Za-z0-9\s\.,\-]+?)(?=\s*(?:Permanent Address|স্থায়ী ঠিকানা|Seal|$))/i);
  if (pobEnMatch && pobEnMatch[1].trim()) {
    result.placeOfBirthEn = formatPlaceOfBirthEn(pobEnMatch[1].trim());
    foundFields.push('Place of Birth (English)');
  }

  // 10. Extract Permanent Address
  const addrBnMatch = text.match(/(?:স্থায়ী ঠিকানা)\s*[:：]\s*([\u0980-\u09FF0-9\s\.,\-\/]+?)(?=\s*(?:Permanent Address|Seal|স্বাক্ষর|$))/i);
  if (addrBnMatch && addrBnMatch[1].trim()) {
    result.permanentAddressBn = ensureBaheratailAddressBn(addrBnMatch[1].trim());
    foundFields.push('Permanent Address (Bengali)');
  }

  const addrEnMatch = text.match(/(?:Permanent Address)\s*[:：]\s*([A-Za-z0-9\s\.,\-\/]+?)(?=\s*(?:Seal|Signature|Assistant|Registrar|$))/i);
  if (addrEnMatch && addrEnMatch[1].trim()) {
    result.permanentAddressEn = ensureBaheratailAddressEn(addrEnMatch[1].trim());
    foundFields.push('Permanent Address (English)');
  }

  // 11. Extract Union Parishad / Office name if found
  const officeEnMatch = text.match(/(?:Union Parishad|Pourashava|City Corporation|Cantonment Board|Paurashava)[\s\w,]+/i);
  if (officeEnMatch && officeEnMatch[0]) {
    result.unionParishadEn = officeEnMatch[0].trim();
    foundFields.push('Union / Office (English)');
  }

  // Set default national flags if not set
  result.motherNationalityBn = 'বাংলাদেশী';
  result.motherNationalityEn = 'Bangladeshi';
  result.fatherNationalityBn = 'বাংলাদেশী';
  result.fatherNationalityEn = 'Bangladeshi';
  result.qrReferenceCode = result.qrReferenceCode || 'EETT';
  result.qrVerificationKey = result.qrVerificationKey || DEFAULT_BDRIS_VERIFY_KEY;
  result.qrVerificationUrl = getBdrisVerificationUrl(result.qrVerificationKey);

  // Missing fields list for user feedback
  const mandatoryKeys: (keyof DemoRecord)[] = [
    'referenceId',
    'dateOfBirth',
    'nameBn',
    'nameEn',
    'motherNameBn',
    'motherNameEn',
    'fatherNameBn',
    'fatherNameEn',
    'placeOfBirthBn',
    'placeOfBirthEn',
    'permanentAddressBn',
    'permanentAddressEn'
  ];

  const missingFields: string[] = [];
  mandatoryKeys.forEach((key) => {
    if (!result[key]) {
      missingFields.push(key);
    }
  });

  return {
    extractedRecord: result,
    foundFields,
    missingFields,
    rawParsedText: text
  };
}

/**
 * High quality direct PDF download to Phone / Device storage
 */
export async function downloadCertificatePdf(
  elementId: string = 'certificate-print-sheet',
  filename: string = 'birth_certificate.pdf'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Certificate preview container not found.');
  }

  // Create high-res canvas at 2x or 3x scale for crisp font rendering
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  
  // Standard A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  pdf.save(filename);
  return true;
}

/**
 * High quality direct PNG image download to Phone / Device gallery / storage
 */
export async function downloadCertificateImage(
  elementId: string = 'certificate-print-sheet',
  filename: string = 'birth_certificate.png'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Certificate preview container not found.');
  }

  const canvas = await html2canvas(element, {
    scale: 3.0,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

/**
 * Google Drive / Phone Share API saver
 */
export async function saveToGoogleDriveOrShare(
  elementId: string = 'certificate-print-sheet',
  title: string = 'Birth Registration Certificate',
  filename: string = 'birth_certificate.pdf'
): Promise<{ method: 'share' | 'download' | 'drive'; success: boolean }> {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    const pdfBlob = pdf.output('blob');

    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    // Check if navigator.canShare supports files (Mobile devices / Google Drive direct share)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: title,
        text: 'Save your birth registration certificate to Google Drive or local storage.',
        files: [file]
      });
      return { method: 'share', success: true };
    } else {
      // Fallback: Trigger download to phone/PC storage
      pdf.save(filename);
      return { method: 'download', success: true };
    }
  } catch (err) {
    // If share was canceled or failed, trigger standard download
    return { method: 'download', success: false };
  }
}
