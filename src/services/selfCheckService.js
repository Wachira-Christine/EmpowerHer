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
    sideChecked: recordData.sideChecked,
    feltNormal: recordData.feltNormal,
    changesNoticed: recordData.changesNoticed || [],
    notes: recordData.notes || '',
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
    sideChecked: recordData.sideChecked,
    feltNormal: recordData.feltNormal,
    changesNoticed: recordData.changesNoticed || [],
    notes: recordData.notes || '',
    reminderRequested: recordData.reminderRequested,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updates);
};

// Delete a record
export const deleteSelfCheckRecord = async (recordId) => {
  const docRef = doc(db, COLLECTION_NAME, recordId);
  await deleteDoc(docRef);
};
