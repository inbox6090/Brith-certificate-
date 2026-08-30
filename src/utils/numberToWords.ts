// Utility functions for converting numbers, dates, and Bengali/English text

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toBengaliDigits(input: string | number): string {
  if (input === undefined || input === null) return '';
  const str = input.toString();
  return str.replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
}

export function toEnglishDigits(input: string): string {
  if (!input) return '';
  return input.replace(/[০-৯]/g, (d) => {
    const idx = BENGALI_DIGITS.indexOf(d);
    return idx !== -1 ? ENGLISH_DIGITS[idx] : d;
  });
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const ORDINAL_DAYS_EN: Record<number, string> = {
  1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', 5: 'Fifth',
  6: 'Sixth', 7: 'Seventh', 8: 'Eighth', 9: 'Ninth', 10: 'Tenth',
  11: 'Eleventh', 12: 'Twelfth', 13: 'Thirteenth', 14: 'Fourteenth', 15: 'Fifteenth',
  16: 'Sixteenth', 17: 'Seventeenth', 18: 'Eighteenth', 19: 'Nineteenth', 20: 'Twentieth',
  21: 'Twenty-First', 22: 'Twenty-Second', 23: 'Twenty-Third', 24: 'Twenty-Fourth', 25: 'Twenty-Fifth',
  26: 'Twenty-Sixth', 27: 'Twenty-Seventh', 28: 'Twenty-Eighth', 29: 'Twenty-Ninth', 30: 'Thirtieth',
  31: 'Thirty-First'
};

const ORDINAL_DAYS_BN: Record<number, string> = {
  1: 'পহেলা', 2: 'দোসরা', 3: 'তেসরা', 4: 'চৌঠা', 5: 'পাঁচই',
  6: 'ছয়ই', 7: 'সাতই', 8: 'আটই', 9: 'নয়ই', 10: 'দশই',
  11: 'এগারোই', 12: 'বারোই', 13: 'তেরোই', 14: 'চৌদ্দই', 15: 'পনেরোই',
  16: 'ষোলই', 17: 'সতেরোই', 18: 'আঠারোই', 19: 'উনিশে', 20: 'বিশই',
  21: 'একুশে', 22: 'বাইশে', 23: 'তেইশে', 24: 'চব্বিশে', 25: 'পঁচিশে',
  26: 'ছাব্বিশে', 27: 'সাতাশে', 28: 'আঠাশে', 29: 'উনত্রিশে', 30: 'ত্রিশে',
  31: 'একত্রিশে'
};

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

function numberToWordsUnder100(n: number): string {
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return TENS[ten] + (one > 0 ? ' ' + ONES[one] : '');
}

export function yearToEnglishWords(year: number): string {
  if (year >= 1900 && year < 2000) {
    const lastTwo = year % 100;
    if (lastTwo === 0) return 'Nineteen Hundred';
    return 'Nineteen ' + numberToWordsUnder100(lastTwo);
  }
  if (year >= 2000 && year < 2100) {
    const lastTwo = year % 100;
    if (lastTwo === 0) return 'Two Thousand';
    return 'Two Thousand ' + numberToWordsUnder100(lastTwo);
  }
  return year.toString();
}

const BN_NUMBERS_1_100: Record<number, string> = {
  0: 'শূন্য', 1: 'এক', 2: 'দুই', 3: 'তিন', 4: 'চার', 5: 'পাঁচ', 6: 'ছয়', 7: 'সাত', 8: 'আট', 9: 'নয়', 10: 'দশ',
  11: 'এগারো', 12: 'বারো', 13: 'তেরো', 14: 'চৌদ্দ', 15: 'পনেরো', 16: 'ষোল', 17: 'সতেরো', 18: 'আঠারো', 19: 'উনিশ', 20: 'বিশ',
  21: 'একুশ', 22: 'বাইশ', 23: 'তেইশ', 24: 'চব্বিশ', 25: 'পঁচিশ', 26: 'ছাব্বিশ', 27: 'সাতাশ', 28: 'আঠাশ', 29: 'উনত্রিশ', 30: 'ত্রিশ',
  31: 'একত্রিশ', 32: 'বত্রিশ', 33: 'তেত্রিশ', 34: 'চৌত্রিশ', 35: 'পঁয়ত্রিশ', 36: 'ছত্রিশ', 37: 'সাঁইত্রিশ', 38: 'আটত্রিশ', 39: 'উনচল্লিশ', 40: 'চল্লিশ',
  41: 'একচল্লিশ', 42: 'বিয়াল্লিশ', 43: 'তেতাল্লিশ', 44: 'চুয়াল্লিশ', 45: 'পঁয়তাল্লিশ', 46: 'ছেচল্লিশ', 47: 'সাতচল্লিশ', 48: 'আটচল্লিশ', 49: 'উনপঞ্চাশ', 50: 'পঞ্চাশ',
  51: 'একান্ন', 52: 'বায়ান্ন', 53: 'তিপ্পান্ন', 54: 'চুয়ান্ন', 55: 'পঞ্চান্ন', 56: 'ছাপ্পান্ন', 57: 'সাতান্ন', 58: 'আটান্ন', 59: 'উনষাট', 60: 'ষাট',
  61: 'একষট্টি', 62: 'বাষট্টি', 63: 'তেষট্টি', 64: 'চৌষট্টি', 65: 'পঁয়ষট্টি', 66: 'ছেষট্টি', 67: 'সাতষট্টি', 68: 'আটষট্টি', 69: 'উনসত্তর', 70: 'সত্তর',
  71: 'একাত্তর', 72: 'বাহাত্তর', 73: 'তিয়াত্তর', 74: 'চৌহাত্তর', 75: 'পঁচাত্তর', 76: 'ছিয়াত্তর', 77: 'সাতাত্তর', 78: 'আটাত্তর', 79: 'উনাশি', 80: 'আশি',
  81: 'একাশি', 82: 'বিরাশি', 83: 'তিরাশি', 84: 'চৌরাশি', 85: 'পঁচাশি', 86: 'ছিয়াশি', 87: 'সাতাশি', 88: 'অষ্টআশি', 89: 'উননব্বই', 90: 'নব্বই',
  91: 'একানব্বই', 92: 'বানব্বই', 93: 'তিরানব্বই', 94: 'চুরানব্বই', 95: 'পঁচানব্বই', 96: 'ছিয়ানব্বই', 97: 'সাতানব্বই', 98: 'আটানব্বই', 99: 'নিরানব্বই'
};

export function yearToBengaliWords(year: number): string {
  if (year >= 1900 && year < 2000) {
    const lastTwo = year % 100;
    if (lastTwo === 0) return 'উনিশ শত';
    return 'উনিশ শত ' + (BN_NUMBERS_1_100[lastTwo] || '');
  }
  if (year >= 2000 && year < 2100) {
    const lastTwo = year % 100;
    if (lastTwo === 0) return 'দুই হাজার';
    return 'দুই হাজার ' + (BN_NUMBERS_1_100[lastTwo] || '');
  }
  return toBengaliDigits(year);
}

/**
 * Converts a date (string in YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY, with English or Bengali digits) to English words
 * Example: 1987-09-05 -> "Fifth of September Nineteen Eighty Seven"
 */
export function convertDateToEnglishWords(dateInput: string): string {
  if (!dateInput || !dateInput.trim()) return '';

  const cleanInput = toEnglishDigits(dateInput.trim());
  let day = 0, month = 0, year = 0;
  
  if (cleanInput.includes('-')) {
    const parts = cleanInput.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else {
        // DD-MM-YYYY
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
    }
  } else if (cleanInput.includes('/') || cleanInput.includes('.')) {
    const parts = cleanInput.split(/[\/\.]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // DD/MM/YYYY
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      } else if (parts[0].length === 4) {
        // YYYY/MM/DD
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      }
    }
  }

  if (!day || !month || !year || month < 1 || month > 12 || day < 1 || day > 31) {
    return dateInput;
  }

  const ordinalDay = ORDINAL_DAYS_EN[day] || `${day}th`;
  const monthName = MONTHS_EN[month - 1];
  const yearWords = yearToEnglishWords(year);

  return `${ordinalDay} of ${monthName} ${yearWords}`;
}

/**
 * Converts a date to Bengali words
 * Example: 1987-09-05 -> "পাঁচই সেপ্টেম্বর উনিশ শত সাতাশি"
 */
export function convertDateToBengaliWords(dateInput: string): string {
  if (!dateInput || !dateInput.trim()) return '';

  const cleanInput = toEnglishDigits(dateInput.trim());
  let day = 0, month = 0, year = 0;
  
  if (cleanInput.includes('-')) {
    const parts = cleanInput.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
    }
  } else if (cleanInput.includes('/') || cleanInput.includes('.')) {
    const parts = cleanInput.split(/[\/\.]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      } else if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      }
    }
  }

  if (!day || !month || !year || month < 1 || month > 12 || day < 1 || day > 31) {
    return dateInput;
  }

  const ordinalDayBn = ORDINAL_DAYS_BN[day] || toBengaliDigits(day);
  const monthNameBn = MONTHS_BN[month - 1];
  const yearWordsBn = yearToBengaliWords(year);

  return `${ordinalDayBn} ${monthNameBn} ${yearWordsBn}`;
}

/**
 * Automatically formats Place of Birth (Bengali).
 * If user writes "টাঙ্গাইল" or any district without "বাংলাদেশ", automatically appends ", বাংলাদেশ".
 * Prevents duplicates if "বাংলাদেশ" is already present.
 */
export function formatPlaceOfBirthBn(input: string): string {
  if (!input || !input.trim()) return '';
  let clean = input.trim().replace(/[,।\.\s]+$/, '');
  if (!clean.includes('বাংলাদেশ')) {
    return `${clean}, বাংলাদেশ`;
  }
  return clean.replace(/\s*[,，]?\s*বাংলাদেশ$/, ', বাংলাদেশ');
}

/**
 * Automatically formats Place of Birth (English).
 * If user writes "Tangail" or any district without "Bangladesh", automatically appends ", Bangladesh".
 * Prevents duplicates if "Bangladesh" is already present.
 */
export function formatPlaceOfBirthEn(input: string): string {
  if (!input || !input.trim()) return '';
  let clean = input.trim().replace(/[,।\.\s]+$/, '');
  if (!/bangladesh/i.test(clean)) {
    return `${clean}, Bangladesh`;
  }
  return clean.replace(/\s*[,]?\s*bangladesh$/i, ', Bangladesh');
}

export const BAHERATAIL_SUFFIX_BN = 'বহেরাতৈল, সখিপুর, টাঙ্গাইল';
export const BAHERATAIL_SUFFIX_EN = 'Baheratail, Sakhipur, Tangail';

export const FIXED_UNION_PARISHAD_BN = 'বহেরাতৈল ইউনিয়ন পরিষদ';
export const FIXED_UNION_PARISHAD_EN = 'Baheratail Union Parishad';
export const FIXED_UPAZILA_DISTRICT_BN = 'সখিপুর, টাঙ্গাইল';
export const FIXED_UPAZILA_DISTRICT_EN = 'Sakhipur, Tangail';

// Official BDRIS Sample Signatures (Assistant to Registrar / Registrar)
export const DEFAULT_ASSISTANT_TITLE_EN = 'Assistant to Registrar';
export const DEFAULT_ASSISTANT_TITLE_BN = '(Preparation, Verification)';
export const DEFAULT_REGISTRAR_TITLE_EN = 'Registrar';
export const DEFAULT_REGISTRAR_TITLE_BN = '';


/**
 * Automatically composes Permanent Address in Bengali for Baheratail Union.
 * The suffix "বহেরাতৈল, সখিপুর, টাঙ্গাইল" is ALWAYS automatically attached.
 * User only provides village, ward, postOffice.
 */
export function composePermanentAddressBn(village: string, ward: string, postOffice?: string): string {
  const parts: string[] = [];
  
  if (village && village.trim()) {
    parts.push(village.trim());
  }
  
  if (ward && ward.trim()) {
    const cleanWard = ward.trim().replace(/^ওয়ার্ড\s*[:-]?\s*/i, '');
    parts.push(`ওয়ার্ড - ${cleanWard}`);
  }
  
  if (postOffice && postOffice.trim()) {
    const cleanPost = postOffice.trim().replace(/^ডাকঘর\s*[:-]?\s*/i, '');
    if (!cleanPost.includes('বহেরাতৈল') && !cleanPost.includes('বহেড়াতৈল')) {
      parts.push(`ডাকঘর: ${cleanPost}`);
    }
  }
  
  parts.push(BAHERATAIL_SUFFIX_BN);
  return parts.join(', ');
}

/**
 * Automatically composes Permanent Address in English for Baheratail Union.
 * The suffix "Baheratail, Sakhipur, Tangail" is ALWAYS automatically attached.
 */
export function composePermanentAddressEn(village: string, ward: string, postOffice?: string): string {
  const parts: string[] = [];
  
  if (village && village.trim()) {
    parts.push(village.trim());
  }
  
  if (ward && ward.trim()) {
    const cleanWard = ward.trim().replace(/^ward\s*[:-]?\s*/i, '');
    parts.push(`Ward - ${cleanWard}`);
  }
  
  if (postOffice && postOffice.trim()) {
    const cleanPost = postOffice.trim().replace(/^post\s*[:-]?\s*/i, '');
    if (!/baheratail/i.test(cleanPost)) {
      parts.push(`Post: ${cleanPost}`);
    }
  }
  
  parts.push(BAHERATAIL_SUFFIX_EN);
  return parts.join(', ');
}

/**
 * Ensures any freeform text has the Baheratail suffix if it doesn't already have it
 */
export function ensureBaheratailAddressBn(currentText: string): string {
  if (!currentText || !currentText.trim()) {
    return BAHERATAIL_SUFFIX_BN;
  }
  let clean = currentText.trim().replace(/[,।\.\s]+$/, '');
  if (!clean.includes('বহেরাতৈল') && !clean.includes('বহেড়াতৈল')) {
    return `${clean}, ${BAHERATAIL_SUFFIX_BN}`;
  }
  return clean;
}

export function ensureBaheratailAddressEn(currentText: string): string {
  if (!currentText || !currentText.trim()) {
    return BAHERATAIL_SUFFIX_EN;
  }
  let clean = currentText.trim().replace(/[,।\.\s]+$/, '');
  if (!/baheratail/i.test(clean)) {
    return `${clean}, ${BAHERATAIL_SUFFIX_EN}`;
  }
  return clean;
}

export function formatDateToDisplay(dateInput: string): string {
  if (!dateInput) return '';
  if (dateInput.includes('/')) return dateInput;
  if (dateInput.includes('-')) {
    const parts = dateInput.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
  }
  return dateInput;
}

export function generateDemoReferenceNumber(dateOfBirth?: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  if (dateOfBirth && dateOfBirth.includes('-')) {
    const birthYear = dateOfBirth.split('-')[0] || '1987';
    const randPart1 = Math.floor(1000 + Math.random() * 9000);
    const randPart2 = Math.floor(1000 + Math.random() * 9000);
    return `DEMO-${birthYear}${randPart1.toString().slice(0, 4)}${randPart2.toString().slice(0, 4)}`;
  }

  return `DEMO-${year}${month}${day}-${randomSuffix}`;
}

export const DEFAULT_BDRIS_VERIFY_KEY = "Qtq6RrDDa4pD8RxM9kk6ZR4hBrlXEcYzrs3DQiZe3Vk9YtjZdVmsaufXJguELoG8";

export function generateBdrisVerifyKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getBdrisVerificationUrl(key?: string): string {
  const cleanKey = (key || DEFAULT_BDRIS_VERIFY_KEY).trim();
  if (cleanKey.startsWith("http://") || cleanKey.startsWith("https://")) {
    return cleanKey;
  }
  return `https://bdris.gov.bd/certificate/verify?key=${cleanKey}`;
}
