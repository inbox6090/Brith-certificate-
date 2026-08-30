import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { DemoRecord } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Workspace OAuth Provider
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/presentations.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly'
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account'
});

// In-memory & session token cache
let cachedAccessToken: string | null = null;
try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    cachedAccessToken = sessionStorage.getItem('bdris_g_oauth_token');
  }
} catch {
  // Ignore storage access restrictions
}
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.removeItem('bdris_g_oauth_token');
        }
      } catch {}
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('bdris_g_oauth_token', credential.accessToken);
        }
      } catch {}
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedAccessToken) {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        cachedAccessToken = sessionStorage.getItem('bdris_g_oauth_token');
      }
    } catch {}
  }
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (token) {
        sessionStorage.setItem('bdris_g_oauth_token', token);
      } else {
        sessionStorage.removeItem('bdris_g_oauth_token');
      }
    }
  } catch {}
};

export const signOutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('bdris_g_oauth_token');
    }
  } catch {}
};

// Firestore Error handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Firestore Record Persistence Helpers
const RECORDS_COLLECTION = 'records';

export const saveRecordToFirestore = async (record: DemoRecord): Promise<void> => {
  try {
    const user = auth.currentUser;
    const recordDocRef = doc(db, RECORDS_COLLECTION, record.id);
    await setDoc(recordDocRef, {
      ...record,
      userId: user ? user.uid : 'anonymous',
      userEmail: user ? user.email : '',
      syncedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${RECORDS_COLLECTION}/${record.id}`);
  }
};

export const deleteRecordFromFirestore = async (recordId: string): Promise<void> => {
  try {
    const recordDocRef = doc(db, RECORDS_COLLECTION, recordId);
    await deleteDoc(recordDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${RECORDS_COLLECTION}/${recordId}`);
  }
};

export const fetchRecordsFromFirestore = async (): Promise<DemoRecord[]> => {
  try {
    const recordsQuery = query(collection(db, RECORDS_COLLECTION), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(recordsQuery);
    return snapshot.docs.map(doc => doc.data() as DemoRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, RECORDS_COLLECTION);
    return [];
  }
};

export const subscribeToFirestoreRecords = (
  onUpdate: (records: DemoRecord[]) => void,
  onError?: (error: Error) => void
) => {
  const recordsQuery = query(collection(db, RECORDS_COLLECTION), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    recordsQuery,
    (snapshot) => {
      const records = snapshot.docs.map(doc => doc.data() as DemoRecord);
      onUpdate(records);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, RECORDS_COLLECTION);
      if (onError) onError(error);
    }
  );
};
