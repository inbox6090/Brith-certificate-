export type RecordStatus = 'Draft' | 'Pending Review' | 'Verified Demo' | 'Archived';

export interface DemoRecord {
  id: string;
  referenceId: string; // e.g. "DEMO-19879318-5131" or "DEMO-20260829-0001"
  status: RecordStatus;
  
  // Office details
  officeNameBn: string;
  officeNameEn: string;
  unionParishadBn: string;
  unionParishadEn: string;
  upazilaBn: string;
  upazilaEn: string;
  districtBn: string;
  districtEn: string;
  ruleText: string;

  // Registration & Issuance dates
  dateOfRegistration: string; // DD/MM/YYYY
  dateOfIssuance: string; // DD/MM/YYYY

  // Citizen personal info
  nameBn: string;
  nameEn: string;
  dateOfBirth: string; // YYYY-MM-DD or DD/MM/YYYY
  dateOfBirthWordsEn: string;
  dateOfBirthWordsBn: string;
  sex: 'Male' | 'Female' | 'Other';
  sexBn: 'পুরুষ' | 'মহিলা' | 'অন্যান্য';
  nationalityBn: string;
  nationalityEn: string;
  placeOfBirthBn: string;
  placeOfBirthEn: string;

  // Parent Information
  motherNameBn: string;
  motherNameEn: string;
  motherNationalityBn: string;
  motherNationalityEn: string;

  fatherNameBn: string;
  fatherNameEn: string;
  fatherNationalityBn: string;
  fatherNationalityEn: string;

  // Detailed Address Fields
  villageBn: string;
  villageEn: string;
  postOfficeBn: string;
  postOfficeEn: string;
  wardBn: string;
  wardEn: string;
  unionBn: string;
  unionEn: string;
  upazilaFieldBn: string;
  upazilaFieldEn: string;
  districtFieldBn: string;
  districtFieldEn: string;
  divisionBn: string;
  divisionEn: string;

  // Combined Permanent Address
  permanentAddressBn: string;
  permanentAddressEn: string;

  // Signatories
  assistantTitleBn: string;
  assistantTitleEn: string;
  registrarTitleBn: string;
  registrarTitleEn: string;

  // Custom Logo & Watermark Settings
  topLogoUrl?: string;
  topLogoSize?: number; // px, default 56
  topLogoOpacity?: number; // 0 - 100, default 100
  topLogoVisible?: boolean;

  watermarkUrl?: string;
  watermarkSize?: number; // px, default 420
  watermarkOpacity?: number; // 0 - 100, default 20
  watermarkVisible?: boolean;

  // Visual State & Print Overlays (Draft / Certified Copy / Office Copy)
  printOverlayType?: 'NONE' | 'CERTIFIED_COPY' | 'DRAFT' | 'OFFICE_COPY' | 'DUPLICATE' | 'CUSTOM';
  printOverlayTextEn?: string; // e.g. "CERTIFIED TRUE COPY" or "DRAFT COPY"
  printOverlayTextBn?: string; // e.g. "সত্যায়িত অনুলিপি"
  printOverlaySubtext?: string; // e.g. "Baheratail Union Parishad"
  printOverlayColor?: 'red' | 'blue' | 'green' | 'amber'; // default 'red'
  printOverlayStyle?: 'stamp' | 'diagonal' | 'both'; // default 'both'
  printOverlayPosition?: 'top-right' | 'top-left' | 'center' | 'bottom-right';
  printOverlayShowDate?: boolean;
  printOverlayDate?: string;

  // QR Code & Barcode Settings
  qrReferenceCode?: string; // e.g. "EETT" or manual word underneath QR code
  qrVerificationUrl?: string; // Full verification URL e.g. "https://bdris.gov.bd/certificate/verify?key=..."
  qrVerificationKey?: string; // 64-char key e.g. "Qtq6RrDDa4pD8RxM9kk6ZR4hBrlXEcYzrs3DQiZe3Vk9YtjZdVmsaufXJguELoG8"
  barcodeValue?: string; // Barcode value, defaults to referenceId (17-digit BRN)

  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  recordId?: string;
  referenceId?: string;
  action: 'Created' | 'Updated' | 'Deleted' | 'Exported' | 'Printed' | 'Imported' | 'Status Changed' | 'e-Verify Auto-fill';
  description: string;
  timestamp: string;
}
