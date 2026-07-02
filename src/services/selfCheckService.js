import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const COLLECTION_NAME = 'selfCheckRecords';

// Create a new self-check record linked to a user UID
export const createSelfCheckRecord = async (userId, recordData) => {
  const collectionRef = collection(db, COLLECTION_NAME);
  const data = {
    userId,
    date: recordData.date,
    completedGuide: recordData.completedGuide,
    // New step-by-step format
    stepResponses: recordData.stepResponses || null,
    generalNotes: recordData.generalNotes || '',
    clinicDirectoryRequested: recordData.clinicDirectoryRequested || false,
    // Legacy format
    sideChecked: recordData.sideChecked || null,
    feltNormal: recordData.feltNormal || null,
    changesNoticed: recordData.changesNoticed || [],
    notes: recordData.notes || '',
    // Common
    reminderRequested: recordData.reminderRequested,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const docRef = await addDoc(collectionRef, data);
  return { id: docRef.id, ...data };
};

// Retrieve all self-check records for a specific user ordered by date descending
export const getSelfCheckRecords = async (userId) => {
  const collectionRef = collection(db, COLLECTION_NAME);
  const q = query(
    collectionRef,
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const records = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    records.push({
      id: doc.id,
      ...data,
      // Fallback formatting for dates if serverTimestamp is not yet hydrated
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt
    });
  });
  return records;
};

// Update an existing record
export const updateSelfCheckRecord = async (recordId, recordData) => {
  const docRef = doc(db, COLLECTION_NAME, recordId);
  const updates = {
    date: recordData.date,
    completedGuide: recordData.completedGuide,
    reminderRequested: recordData.reminderRequested,
    updatedAt: serverTimestamp()
  };

  // Conditionally add new format fields if present
  if (recordData.stepResponses !== undefined) updates.stepResponses = recordData.stepResponses;
  if (recordData.generalNotes !== undefined) updates.generalNotes = recordData.generalNotes;
  if (recordData.clinicDirectoryRequested !== undefined) updates.clinicDirectoryRequested = recordData.clinicDirectoryRequested;

  // Conditionally add legacy format fields if present
  if (recordData.sideChecked !== undefined) updates.sideChecked = recordData.sideChecked;
  if (recordData.feltNormal !== undefined) updates.feltNormal = recordData.feltNormal;
  if (recordData.changesNoticed !== undefined) updates.changesNoticed = recordData.changesNoticed;
  if (recordData.notes !== undefined) updates.notes = recordData.notes;
  await updateDoc(docRef, updates);
};

// Delete a record
export const deleteSelfCheckRecord = async (recordId) => {
  const docRef = doc(db, COLLECTION_NAME, recordId);
  await deleteDoc(docRef);
};

// Clear all records for a specific user
export const clearUserRecords = async (userId) => {
  const collectionRef = collection(db, COLLECTION_NAME);
  const q = query(
    collectionRef,
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  const deletePromises = [];
  querySnapshot.forEach((document) => {
    const docRef = doc(db, COLLECTION_NAME, document.id);
    deletePromises.push(deleteDoc(docRef));
  });
  
  await Promise.all(deletePromises);
};
