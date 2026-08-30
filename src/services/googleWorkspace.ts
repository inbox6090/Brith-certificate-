import { DemoRecord } from '../types';
import { getAccessToken } from './firebase';

/**
 * Google Workspace API Client for:
 * - Google Drive
 * - Google Sheets
 * - Google Docs
 * - Google Slides
 * - Google Forms
 * - Google Tasks
 * - Google Contacts (People API)
 * - Gmail
 */

// Helper to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Workspace OAuth token not available. Please sign in with Google.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMessage = errorBody;
    try {
      const errJson = JSON.parse(errorBody);
      parsedMessage = errJson.error?.message || errorBody;
    } catch {
      // use raw text
    }
    throw new Error(`Google API Error (${response.status}): ${parsedMessage}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ----------------------------------------------------
// 1. GOOGLE DRIVE
// ----------------------------------------------------
export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
}

export async function findOrCreateDriveFolder(folderName = 'BDRIS_Birth_Registrations'): Promise<string> {
  // Check if folder exists
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  const data = await fetchWithAuth(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`);
  
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createData = await fetchWithAuth('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Baheratail Union Parishad Birth Registration Management Records',
    }),
  });

  return createData.id;
}

export async function uploadJsonToDrive(fileName: string, jsonData: any): Promise<{ id: string; webViewLink?: string }> {
  const folderId = await findOrCreateDriveFolder();
  const token = await getAccessToken();
  if (!token) throw new Error('No access token');

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to upload to Drive: ${err}`);
  }

  return response.json();
}

export async function listDriveBackupFiles(): Promise<DriveFileItem[]> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return [];
    }
    const folderId = await findOrCreateDriveFolder();
    const query = `'${folderId}' in parents and trashed=false`;
    const data = await fetchWithAuth(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webViewLink,createdTime,size)&orderBy=createdTime desc`);
    return data.files || [];
  } catch (error) {
    // Only log if not token-related
    if (!(error instanceof Error && error.message.includes('token not available'))) {
      console.error('List Drive files error:', error);
    }
    return [];
  }
}

// ----------------------------------------------------
// 2. GOOGLE SHEETS
// ----------------------------------------------------
export async function createRegistrySpreadsheet(records: DemoRecord[], title = 'ইউপি জন্ম নিবন্ধন রেজিস্টার - বহেরাতৈল'): Promise<{ id: string; url: string }> {
  // 1. Create spreadsheet
  const spreadsheet = await fetchWithAuth('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        title: `${title} (${new Date().toLocaleDateString('bn-BD')})`,
      },
      sheets: [
        {
          properties: {
            title: 'জন্ম নিবন্ধন তালিকা',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  const spreadsheetId = spreadsheet.spreadsheetId;

  // 2. Build rows data
  const headers = [
    'রেফারেন্স নম্বর (Demo Ref)',
    'নাম (বাংলা)',
    'Name (English)',
    'জন্ম তারিখ (DOB)',
    'লিঙ্গ (Sex)',
    'পিতার নাম (বাংলা)',
    'Father Name (English)',
    'মাতার নাম (বাংলা)',
    'Mother Name (English)',
    'গ্রাম / মহল্লা',
    'ওয়ার্ড',
    'ডাকঘর',
    'ইউনিয়ন / উপজেলা',
    'বর্তমান অবস্থা (Status)',
    'সর্বশেষ আপডেট (Updated)',
  ];

  const rows = records.map(rec => [
    rec.referenceId,
    rec.nameBn,
    rec.nameEn,
    rec.dateOfBirth,
    rec.sex,
    rec.fatherNameBn,
    rec.fatherNameEn,
    rec.motherNameBn,
    rec.motherNameEn,
    rec.villageBn,
    rec.wardBn,
    rec.postOfficeBn,
    `${rec.unionBn || 'বহেরাতৈল'}, ${rec.upazilaFieldBn || 'সখিপুর'}`,
    rec.status,
    rec.updatedAt,
  ]);

  // 3. Append headers and rows
  await fetchWithAuth(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:O${rows.length + 1}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({
        range: `A1:O${rows.length + 1}`,
        majorDimension: 'ROWS',
        values: [headers, ...rows],
      }),
    }
  );

  return {
    id: spreadsheetId,
    url: spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

export async function appendRecordToSheet(spreadsheetId: string, record: DemoRecord): Promise<void> {
  const row = [
    record.referenceId,
    record.nameBn,
    record.nameEn,
    record.dateOfBirth,
    record.sex,
    record.fatherNameBn,
    record.fatherNameEn,
    record.motherNameBn,
    record.motherNameEn,
    record.villageBn,
    record.wardBn,
    record.postOfficeBn,
    `${record.unionBn || 'বহেরাতৈল'}, ${record.upazilaFieldBn || 'সখিপুর'}`,
    record.status,
    record.updatedAt,
  ];

  await fetchWithAuth(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      body: JSON.stringify({
        range: 'A1',
        majorDimension: 'ROWS',
        values: [row],
      }),
    }
  );
}

// ----------------------------------------------------
// 3. GOOGLE DOCS (100% Official Certificate Template)
// ----------------------------------------------------
export async function createCitizenVerificationDoc(record: DemoRecord): Promise<{ id: string; url: string }> {
  // 1. Create blank doc
  const doc = await fetchWithAuth('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    body: JSON.stringify({
      title: `Birth Registration Certificate - ${record.nameEn || record.nameBn} (${record.referenceId})`,
    }),
  });

  const documentId = doc.documentId;

  // 2. Prepare 100% formatted text matching the sample certificate
  const docText = `
Government of the People's Republic of Bangladesh
Office of the Registrar, Birth and Death Registration
${record.unionParishadEn || 'Baheratail Union Parishad'}
${record.upazilaEn || 'Sakhipur'}, ${record.districtEn || 'Tangail'}
(Rule 9, 10)

জন্ম নিবন্ধন সনদ / Birth Registration Certificate

====================================================================================================
Date of Registration: ${record.dateOfRegistration || '24/08/2026'}    Birth Registration Number: ${record.referenceId}    Date of Issuance: ${record.dateOfIssuance || '27/08/2026'}
====================================================================================================

Date of Birth : ${record.dateOfBirth || '05/09/1987'}                                         Sex : ${record.sex || 'Female'}
In Word       : ${record.dateOfBirthWordsEn || record.dateOfBirthWordsBn || 'Fifth of September Nineteen Eighty Seven'}

----------------------------------------------------------------------------------------------------
[ বাংলা বিবরণ ]                                                [ English Details ]
----------------------------------------------------------------------------------------------------
নাম           : ${record.nameBn || 'সাজেদা আক্তার'}
Name          :                                                ${record.nameEn || 'Shajeda Akter'}

মাতা          : ${record.motherNameBn || 'জাহানারা বেগম'}
Mother        :                                                ${record.motherNameEn || 'Jahanara Begum'}

মাতার জাতীয়তা : ${record.motherNationalityBn || 'বাংলাদেশী'}
Nationality   :                                                ${record.motherNationalityEn || 'Bangladeshi'}

পিতা          : ${record.fatherNameBn || 'মোঃ শাহজাহান'}
Father        :                                                ${record.fatherNameEn || 'Md Shahjahan'}

পিতার জাতীয়তা : ${record.fatherNationalityBn || 'বাংলাদেশী'}
Nationality   :                                                ${record.fatherNationalityEn || 'Bangladeshi'}

জন্মস্থান      : ${record.placeOfBirthBn || 'টাঙ্গাইল, বাংলাদেশ'}
Place of Birth:                                                ${record.placeOfBirthEn || 'Tangail, Bangladesh'}

স্থায়ী ঠিকানা : ${record.permanentAddressBn || 'দাবাইল নাগবাড়ী-১৯৭২, ওয়ার্ড - ১, বহেরাতৈল, সখিপুর, টাঙ্গাইল'}
Permanent     : 
Address       :                                                ${record.permanentAddressEn || 'Dabail Nagbari-1972, Ward - 1, Baheratail, Sakhipur, Tangail'}

====================================================================================================


       Seal & Signature                                                Seal & Signature
    Assistant to Registrar                                                 Registrar
  (Preparation, Verification)


====================================================================================================
This certificate is generated from bdris.gov.bd, and to verify this certificate, please scan the above QR Code & Bar Code.
[DEMO PROTOTYPE • NOT AN OFFICIAL GOVERNMENT DOCUMENT • FOR SOFTWARE TESTING ONLY]
`;

  // 3. Insert text into document
  await fetchWithAuth(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: docText,
          },
        },
      ],
    }),
  });

  return {
    id: documentId,
    url: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

// ----------------------------------------------------
// 4. GOOGLE FORMS (100% Sample Matched Citizen Application Portal)
// ----------------------------------------------------
export async function createBirthRegistrationForm(): Promise<{ id: string; formUrl: string; editUrl: string }> {
  // 1. Create Form
  const form = await fetchWithAuth('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    body: JSON.stringify({
      info: {
        title: 'জন্ম নিবন্ধন আবেদন ফরম - বহেরাতৈল ইউনিয়ন পরিষদ (Birth Registration Application Form)',
        description: "Government of the People's Republic of Bangladesh\nOffice of the Registrar, Birth and Death Registration\nBaheratail Union Parishad, Sakhipur, Tangail (Rule 9, 10)\n\nনমুনা জন্ম নিবন্ধন সনদ অনুযায়ী ১০০% তথ্য সংগ্রহের অনলাইন ফরম।",
      },
    }),
  });

  const formId = form.formId;

  // 2. Add question items covering all fields of the certificate
  const requests = [
    {
      createItem: {
        item: {
          title: 'আবেদনের ধরন (Application Type)',
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: [
                  { value: 'নতুন জন্ম নিবন্ধন (New Birth Registration)' },
                  { value: 'তথ্য সংশোধন (Correction / Update)' },
                  { value: 'সনদ পুনঃমুদ্রণ (Re-print Certificate)' },
                ],
              },
            },
          },
        },
        location: { index: 0 },
      },
    },
    {
      createItem: {
        item: {
          title: 'আবেদনকারীর নাম (বাংলায়)',
          description: 'যেমন: সাজেদা আক্তার / মোঃ আবদুল্লাহ আল নোমান',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 1 },
      },
    },
    {
      createItem: {
        item: {
          title: "Applicant's Full Name (In English Capital Letters)",
          description: 'e.g. SHAJEDA AKTER / MD ABDULLAH AL NOMAN',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 2 },
      },
    },
    {
      createItem: {
        item: {
          title: 'জন্ম তারিখ (Date of Birth: DD/MM/YYYY)',
          description: 'যেমন: 05/09/1987',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 3 },
      },
    },
    {
      createItem: {
        item: {
          title: 'জন্ম তারিখ কথায় ইংরেজিতে (Date of Birth In Words)',
          description: 'e.g. Fifth of September Nineteen Eighty Seven',
          questionItem: {
            question: {
              required: false,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 4 },
      },
    },
    {
      createItem: {
        item: {
          title: 'লিঙ্গ (Sex)',
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: [
                  { value: 'নারী (Female)' },
                  { value: 'পুরুষ (Male)' },
                  { value: 'অন্যান্য (Other)' },
                ],
              },
            },
          },
        },
        location: { index: 5 },
      },
    },
    {
      createItem: {
        item: {
          title: 'মাতার নাম (বাংলায়)',
          description: 'যেমন: জাহানারা বেগম',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 6 },
      },
    },
    {
      createItem: {
        item: {
          title: "Mother's Name (In English)",
          description: 'e.g. Jahanara Begum',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 7 },
      },
    },
    {
      createItem: {
        item: {
          title: "মাতার জাতীয়তা (Mother's Nationality)",
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: [
                  { value: 'বাংলাদেশী (Bangladeshi)' },
                  { value: 'অন্যান্য (Other)' },
                ],
              },
            },
          },
        },
        location: { index: 8 },
      },
    },
    {
      createItem: {
        item: {
          title: 'পিতার নাম (বাংলায়)',
          description: 'যেমন: মোঃ শাহজাহান',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 9 },
      },
    },
    {
      createItem: {
        item: {
          title: "Father's Name (In English)",
          description: 'e.g. Md Shahjahan',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 10 },
      },
    },
    {
      createItem: {
        item: {
          title: "পিতার জাতীয়তা (Father's Nationality)",
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: [
                  { value: 'বাংলাদেশী (Bangladeshi)' },
                  { value: 'অন্যান্য (Other)' },
                ],
              },
            },
          },
        },
        location: { index: 11 },
      },
    },
    {
      createItem: {
        item: {
          title: 'জন্মস্থান (বাংলায়)',
          description: 'যেমন: টাঙ্গাইল, বাংলাদেশ',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 12 },
      },
    },
    {
      createItem: {
        item: {
          title: 'Place of Birth (In English)',
          description: 'e.g. Tangail, Bangladesh',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 13 },
      },
    },
    {
      createItem: {
        item: {
          title: 'স্থায়ী ঠিকানা (বাংলায় - গ্রাম/পাড়া, ডাকঘর, ওয়ার্ড, ইউনিয়ন, উপজেলা, জেলা)',
          description: 'যেমন: দাবাইল নাগবাড়ী-১৯৭২, ওয়ার্ড - ১, বহেরাতৈল, সখিপুর, টাঙ্গাইল',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: true },
            },
          },
        },
        location: { index: 14 },
      },
    },
    {
      createItem: {
        item: {
          title: 'Permanent Address (In English)',
          description: 'e.g. Dabail Nagbari-1972, Ward - 1, Baheratail, Sakhipur, Tangail',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: true },
            },
          },
        },
        location: { index: 15 },
      },
    },
    {
      createItem: {
        item: {
          title: 'মোবাইল নম্বর (এসএমএস নোটিফিকেশনের জন্য)',
          description: 'যেমন: 017XXXXXXXX',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 16 },
      },
    },
    {
      createItem: {
        item: {
          title: 'ইমেইল ঠিকানা (ঐচ্ছিক / Optional)',
          questionItem: {
            question: {
              required: false,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 17 },
      },
    },
  ];

  await fetchWithAuth(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ requests }),
  });

  return {
    id: formId,
    formUrl: form.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`,
    editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
  };
}

// ----------------------------------------------------
// 5. GOOGLE SLIDES (PRESENTATION DASHBOARD)
// ----------------------------------------------------
export async function createRegistryPresentation(stats: { total: number; today: number; verified: number; pending: number }): Promise<{ id: string; url: string }> {
  // 1. Create Presentation
  const presentation = await fetchWithAuth('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    body: JSON.stringify({
      title: `বহেরাতৈল ইউপি জন্ম নিবন্ধন পরিসংখ্যান (${new Date().toLocaleDateString('bn-BD')})`,
    }),
  });

  const presentationId = presentation.presentationId;

  return {
    id: presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
}

// ----------------------------------------------------
// 6. GOOGLE TASKS (VERIFICATION & REVIEW REMINDERS)
// ----------------------------------------------------
export interface TaskItem {
  id?: string;
  title: string;
  notes?: string;
  due?: string;
  status?: string;
}

export async function createGoogleTask(title: string, notes?: string, dueDate?: string): Promise<any> {
  // 1. Get primary tasklist
  const tasklists = await fetchWithAuth('https://tasks.googleapis.com/tasks/v1/users/@me/lists');
  const tasklistId = tasklists.items && tasklists.items.length > 0 ? tasklists.items[0].id : '@default';

  // 2. Insert task
  return fetchWithAuth(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      notes,
      due: dueDate ? new Date(dueDate).toISOString() : undefined,
    }),
  });
}

export async function listGoogleTasks(): Promise<TaskItem[]> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return [];
    }
    const tasklists = await fetchWithAuth('https://tasks.googleapis.com/tasks/v1/users/@me/lists');
    const tasklistId = tasklists.items && tasklists.items.length > 0 ? tasklists.items[0].id : '@default';
    const data = await fetchWithAuth(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks?showCompleted=true&maxResults=20`);
    return data.items || [];
  } catch (error) {
    // Only log if not token-related
    if (!(error instanceof Error && error.message.includes('token not available'))) {
      console.error('List Tasks error:', error);
    }
    return [];
  }
}

// ----------------------------------------------------
// 7. GOOGLE CONTACTS (PEOPLE API)
// ----------------------------------------------------
export interface CitizenContactInput {
  givenName: string;
  familyName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

export async function createCitizenContact(contact: CitizenContactInput): Promise<any> {
  return fetchWithAuth('https://people.googleapis.com/v1/people:createContact', {
    method: 'POST',
    body: JSON.stringify({
      names: [
        {
          givenName: contact.givenName,
          familyName: contact.familyName || '',
        },
      ],
      phoneNumbers: contact.phoneNumber ? [{ value: contact.phoneNumber, type: 'mobile' }] : undefined,
      emailAddresses: contact.email ? [{ value: contact.email, type: 'work' }] : undefined,
      postalAddresses: contact.address
        ? [
            {
              formattedValue: contact.address,
              type: 'home',
            },
          ]
        : undefined,
      userDefined: [
        { key: 'Department', value: 'Baheratail Union Parishad' },
        { key: 'Service', value: 'Birth Registration' },
      ],
    }),
  });
}

// ----------------------------------------------------
// 8. GMAIL (EMAIL ACKNOWLEDGMENT / DISPATCH)
// ----------------------------------------------------
export async function sendCitizenEmail(to: string, subject: string, messageBody: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('No access token');

  // Build raw MIME email string
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    messageBody,
  ];

  const emailRaw = emailLines.join('\r\n');
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailRaw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return fetchWithAuth('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    body: JSON.stringify({
      raw: base64EncodedEmail,
    }),
  });
}
