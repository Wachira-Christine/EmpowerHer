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
  writeBatch,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';

// ==========================================
// FILE UPLOAD UTILITY (Firebase Storage)
// ==========================================
export const uploadFile = async (file, folderPath) => {
  if (!file) return null;
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const fileRef = ref(storage, `${folderPath}/${fileName}`);
  
  // Standard upload
  const snapshot = await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

// ==========================================
// PAGE 1: EDUCATIONAL CONTENT SERVICES
// ==========================================
const CONTENT_COLL = 'educationalArticles';

export const fetchArticles = async () => {
  const colRef = collection(db, CONTENT_COLL);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const articles = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    articles.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt
    });
  });
  return articles;
};

export const addArticle = async (articleData) => {
  const colRef = collection(db, CONTENT_COLL);
  const docRef = await addDoc(colRef, {
    ...articleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateArticle = async (id, articleData) => {
  const docRef = doc(db, CONTENT_COLL, id);
  await updateDoc(docRef, {
    ...articleData,
    updatedAt: serverTimestamp()
  });
};

export const deleteArticle = async (id) => {
  const docRef = doc(db, CONTENT_COLL, id);
  await deleteDoc(docRef);
};

export const duplicateArticle = async (article) => {
  const { id, createdAt, updatedAt, ...rest } = article;
  const duplicatedData = {
    ...rest,
    title: `${rest.title} (Copy)`,
    status: 'Draft'
  };
  return await addArticle(duplicatedData);
};

// ==========================================
// PAGE 2: SELF-EXAM GUIDE SERVICES
// ==========================================
const EXAM_COLL = 'selfExamGuides';

export const fetchSteps = async () => {
  const colRef = collection(db, EXAM_COLL);
  const q = query(colRef, orderBy('stepNumber', 'asc'));
  const snapshot = await getDocs(q);
  const steps = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    steps.push({
      id: doc.id,
      ...data,
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt
    });
  });
  return steps;
};

export const addStep = async (stepData) => {
  const colRef = collection(db, EXAM_COLL);
  const docRef = await addDoc(colRef, {
    ...stepData,
    stepNumber: parseInt(stepData.stepNumber, 10),
    published: stepData.published ?? false,
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateStep = async (id, stepData) => {
  const docRef = doc(db, EXAM_COLL, id);
  await updateDoc(docRef, {
    ...stepData,
    stepNumber: parseInt(stepData.stepNumber, 10),
    updatedAt: serverTimestamp()
  });
};

export const deleteStep = async (id) => {
  const docRef = doc(db, EXAM_COLL, id);
  await deleteDoc(docRef);
};

export const saveStepsOrder = async (orderedSteps) => {
  const batch = writeBatch(db);
  orderedSteps.forEach((step, index) => {
    const docRef = doc(db, EXAM_COLL, step.id);
    batch.update(docRef, { 
      stepNumber: index + 1,
      updatedAt: serverTimestamp()
    });
  });
  await batch.commit();
};

// ==========================================
// PAGE 3: HEALTHCARE CLINICS SERVICES
// ==========================================
const FACILITY_COLL = 'healthcareFacilities';

export const fetchFacilities = async (includeDeleted = false) => {
  const colRef = collection(db, FACILITY_COLL);
  const snapshot = await getDocs(colRef);
  const facilities = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    // Only return non-deleted unless specified
    if (includeDeleted || data.status !== 'deleted') {
      facilities.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt
      });
    }
  });
  return facilities;
};

export const addFacility = async (facilityData) => {
  const colRef = collection(db, FACILITY_COLL);
  const docRef = await addDoc(colRef, {
    ...facilityData,
    status: facilityData.status || 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateFacility = async (id, facilityData) => {
  const docRef = doc(db, FACILITY_COLL, id);
  await updateDoc(docRef, {
    ...facilityData,
    updatedAt: serverTimestamp()
  });
};

export const deleteFacility = async (id) => {
  // We perform soft delete by setting status to 'deleted'
  const docRef = doc(db, FACILITY_COLL, id);
  await updateDoc(docRef, {
    status: 'deleted',
    updatedAt: serverTimestamp()
  });
};

export const restoreFacility = async (id) => {
  const docRef = doc(db, FACILITY_COLL, id);
  await updateDoc(docRef, {
    status: 'active',
    updatedAt: serverTimestamp()
  });
};

// ==========================================
// USER FEEDBACK SERVICES
// ==========================================
const FEEDBACK_COLL = 'userFeedback';

export const fetchAllFeedback = async () => {
  const colRef = collection(db, FEEDBACK_COLL);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const feedback = [];
  snapshot.forEach((doc) => {
    feedback.push({
      id: doc.id,
      ...doc.data()
    });
  });
  return feedback;
};

export const updateFeedbackStatus = async (id, reviewed) => {
  const docRef = doc(db, FEEDBACK_COLL, id);
  await updateDoc(docRef, {
    reviewed: reviewed,
    status: reviewed ? 'Reviewed' : 'New'
  });
};

export const deleteFeedback = async (id) => {
  const docRef = doc(db, FEEDBACK_COLL, id);
  await deleteDoc(docRef);
};
