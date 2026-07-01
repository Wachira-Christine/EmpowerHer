import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase';
import '../../styles/admin.css';

const ManageSelfExamGuide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Settings & Steps State
  const [healthNote, setHealthNote] = useState('');
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // View state: 'steps' | 'edit' | 'note'
  const [view, setView] = useState('steps');

  // Selected step state for editing or viewing
  const [editingStep, setEditingStep] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingStep, setViewingStep] = useState(null);

  // Form states for step editing
  const [formStepNumber, setFormStepNumber] = useState(1);
  const [formStatus, setFormStatus] = useState('Active');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Form states for health note editing
  const [noteText, setNoteText] = useState('');

  const defaultHealthNote = "EmpowerHer does not provide medical diagnosis. If you notice a lump, nipple discharge, unusual pain, skin changes, swelling, or any change that worries you, please visit a qualified healthcare provider.";

  const defaultSteps = [
    { stepNumber: 1, title: "Prepare", description: "Find a private, comfortable place. Stand in front of a mirror and relax your shoulders.", status: "Active", imageUrl: "" },
    { stepNumber: 2, title: "Look in the mirror", description: "Look at the size, shape, and appearance of both breasts.", status: "Active", imageUrl: "" },
    { stepNumber: 3, title: "Raise your arms", description: "Raise both arms and look again for changes in shape, skin, or nipple position.", status: "Active", imageUrl: "" },
    { stepNumber: 4, title: "Check while standing or in the shower", description: "Use the pads of your fingers in small circular movements.", status: "Active", imageUrl: "" },
    { stepNumber: 5, title: "Check while lying down", description: "Repeat the same circular movement, covering the whole breast area.", status: "Active", imageUrl: "" },
    { stepNumber: 6, title: "Check the underarm area", description: "Gently feel around the armpit and upper chest for unusual swelling.", status: "Active", imageUrl: "" },
    { stepNumber: 7, title: "Record what you noticed", description: "Write down whether everything felt normal or you noticed any changes.", status: "Active", imageUrl: "" }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Seed default data if collections are empty (Idempotent using deterministic IDs)
  const seedDefaultData = async () => {
    try {
      // Seed settings
      const settingsRef = doc(db, 'selfExamGuide', 'settings');
      await setDoc(settingsRef, {
        healthNote: defaultHealthNote,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || 'System'
      });

      // Seed steps
      for (const step of defaultSteps) {
        const stepRef = doc(db, 'selfExamGuide', 'steps', 'steps', `step_${step.stepNumber}`);
        await setDoc(stepRef, {
          ...step,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || 'System'
        });
      }
    } catch (err) {
      console.error("Error seeding guide database:", err);
    }
  };

  // Clean up duplicate steps from Firestore
  const cleanupDuplicates = async (docsList) => {
    const groups = {};
    docsList.forEach(docSnap => {
      const data = docSnap.data();
      const stepNum = data.stepNumber;
      if (stepNum !== undefined) {
        if (!groups[stepNum]) {
          groups[stepNum] = [];
        }
        groups[stepNum].push(docSnap);
      }
    });

    for (const stepNum in groups) {
      const groupDocs = groups[stepNum];
      if (groupDocs.length > 1) {
        // Keep step_X deterministic doc ID if present, otherwise keep the first one
        let keepDoc = groupDocs.find(d => d.id === `step_${stepNum}`);
        if (!keepDoc) keepDoc = groupDocs[0];

        for (const docSnap of groupDocs) {
          if (docSnap.id !== keepDoc.id) {
            console.log(`Auto-cleaning duplicate document: selfExamGuide/steps/steps/${docSnap.id}`);
            try {
              await deleteDoc(doc(db, 'selfExamGuide', 'steps', 'steps', docSnap.id));
            } catch (err) {
              console.error(`Failed to delete duplicate doc ${docSnap.id}:`, err);
            }
          }
        }
      }
    }
  };

  const loadGuideData = async () => {
    setLoading(true);
    try {
      // 1. Fetch settings
      const settingsRef = doc(db, 'selfExamGuide', 'settings');
      const settingsSnap = await getDoc(settingsRef);
      let currentNote = '';
      if (settingsSnap.exists()) {
        currentNote = settingsSnap.data().healthNote || '';
        setHealthNote(currentNote);
        setNoteText(currentNote);
      } else {
        currentNote = defaultHealthNote;
        setHealthNote(currentNote);
        setNoteText(currentNote);
      }

      // 2. Fetch steps
      const stepsRef = collection(db, 'selfExamGuide', 'steps', 'steps');
      const q = query(stepsRef, orderBy('stepNumber', 'asc'));
      const stepsSnap = await getDocs(q);

      let stepsList = [];
      stepsSnap.forEach(docSnap => {
        stepsList.push({ id: docSnap.id, ...docSnap.data() });
      });

      // If database is blank, seed default steps and reload
      if (stepsList.length === 0 && !settingsSnap.exists()) {
        await seedDefaultData();
        // Reload
        const reloadSettingsSnap = await getDoc(settingsRef);
        if (reloadSettingsSnap.exists()) {
          setHealthNote(reloadSettingsSnap.data().healthNote || '');
          setNoteText(reloadSettingsSnap.data().healthNote || '');
        }
        const reloadStepsSnap = await getDocs(q);
        stepsList = [];
        reloadStepsSnap.forEach(docSnap => {
          stepsList.push({ id: docSnap.id, ...docSnap.data() });
        });
      }

      // Trigger automatic duplicates cleanup in backend Firestore
      if (stepsSnap.docs.length > 0) {
        await cleanupDuplicates(stepsSnap.docs);
      }

      // Deduplicate steps List in-memory by stepNumber to enforce exactly one row per step
      const uniqueStepsMap = {};
      stepsList.forEach(step => {
        const stepNum = parseInt(step.stepNumber, 10);
        if (!isNaN(stepNum)) {
          // If deterministic doc ID step_X exists, prefer it over random doc IDs
          if (!uniqueStepsMap[stepNum] || step.id === `step_${stepNum}`) {
            uniqueStepsMap[stepNum] = step;
          }
        }
      });

      const uniqueSortedSteps = Object.values(uniqueStepsMap).sort(
        (a, b) => (parseInt(a.stepNumber, 10) || 0) - (parseInt(b.stepNumber, 10) || 0)
      );

      setSteps(uniqueSortedSteps);
      setError(null);
    } catch (err) {
      console.error("Error loading guide configuration:", err);
      setError("Failed to load guide details.");
      showToast("Failed to load guide steps", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuideData();
  }, []);

  const handleUpdateHealthNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      const settingsRef = doc(db, 'selfExamGuide', 'settings');
      await setDoc(settingsRef, {
        healthNote: noteText,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || 'Admin'
      });
      setHealthNote(noteText);
      showToast("Health note updated successfully.");
      setView('steps');
    } catch (err) {
      console.error(err);
      showToast("Failed to update health note", "error");
    }
  };

  const handleEditClick = (step) => {
    setEditingStep(step);
    setFormStepNumber(step.stepNumber || 1);
    setFormStatus(step.status || 'Active');
    setFormTitle(step.title || '');
    setFormDescription(step.description || '');
    setFormImageUrl(step.imageUrl || '');
    setImageFile(null);
    setImagePreview('');
    setView('edit');
  };

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      showToast("Please upload a valid image file.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image is too large. Please upload an image under 5MB.", "error");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveStep = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    
    setIsUploading(true);

    try {
      let finalImageUrl = formImageUrl;
      if (imageFile) {
        const fileRef = ref(storage, `selfExamGuideImages/${user.uid}/${Date.now()}-${imageFile.name}`);
        const snapshot = await uploadBytes(fileRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const stepRef = doc(db, 'selfExamGuide', 'steps', 'steps', editingStep.id);
      await updateDoc(stepRef, {
        stepNumber: parseInt(formStepNumber, 10) || editingStep.stepNumber,
        status: formStatus,
        title: formTitle,
        description: formDescription,
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || 'Admin'
      });
      showToast("Guide step updated successfully.");
      setView('steps');
      await loadGuideData();
    } catch (err) {
      console.error(err);
      showToast("Failed to update guide step", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewClick = (step) => {
    setViewingStep(step);
    setIsViewModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast Alert */}
      {toast && (
        <div className={`toast-notification ${toast.type === 'error' ? 'error' : ''}`} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2000,
          background: toast.type === 'error' ? 'var(--oxblood-deep)' : 'var(--success-bg)',
          color: toast.type === 'error' ? '#fff' : 'var(--success)',
          padding: '12px 20px',
          border: '1.5px solid currentColor',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px'
        }}>
          {toast.message}
        </div>
      )}

      {/* Heading & Intro */}
      <div>
        <p className="eyebrow">Admin / A3</p>
        <h2 className="h1">Manage Self-Examination <em>Guide</em></h2>
        <p className="dek">Update the step-by-step guidance, safety notes, and supportive messages used in the self-examination page.</p>
      </div>

      <div className="demo-switch">
        <button className={view === 'steps' ? 'on' : ''} onClick={() => setView('steps')}>Guide steps</button>
        <button className={view === 'note' ? 'on' : ''} onClick={() => setView('note')}>Edit health note</button>
      </div>

      {view === 'steps' && (
        <div>
          {/* Health Note Section */}
          <div className="section-head">
            <h3>Health note</h3>
            <div className="rule" />
            <span className="tag">Shown before the guide</span>
          </div>

          <div className="health-note-box">
            {loading ? "Loading health note..." : healthNote || "No health note set."}
          </div>

          <div style={{ marginBottom: '36px' }}>
            <button className="btn-secondary" onClick={() => setView('note')}>Update health note</button>
          </div>

          {/* Steps List */}
          <div className="section-head">
            <h3>Guide steps</h3>
            <div className="rule" />
            <span className="tag">{loading ? '...' : `${steps.length} steps`}</span>
          </div>

          <div className="step-list">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading steps...</div>
            ) : error ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--oxblood)' }}>{error}</div>
            ) : steps.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>No guide steps configured.</div>
            ) : (
              steps.map((step) => (
                <div key={step.id} className="step-row">
                  <div className="no-circle">{step.stepNumber}</div>
                  <div className="info">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                  <span className={`status-pill ${step.status === 'Hidden' ? 'hidden' : ''}`}>
                    {step.status}
                  </span>
                  <div className="row-actions">
                    <button onClick={() => handleViewClick(step)}>View</button>
                    <button onClick={() => handleEditClick(step)}>Edit</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '24px' }}>
            <button className="btn-secondary" onClick={() => navigate('/self-examination')}>Preview guide</button>
          </div>
        </div>
      )}

      {view === 'note' && (
        <div className="form-card">
          <p className="form-title">Update Health Note</p>
          <p className="form-sub">Provide support warning notes. EmpowerHer does not serve as medical diagnoses.</p>
          
          <form onSubmit={handleUpdateHealthNote}>
            <div className="field">
              <label>Health note content</label>
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write medical safety warnings here..."
                required
                style={{ minHeight: '120px' }}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save changes</button>
              <button type="button" className="btn-ghost" onClick={() => setView('steps')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {view === 'edit' && editingStep && (
        <div>
          <div className="section-head">
            <h3>Edit step</h3>
            <div className="rule" />
            <span className="tag">Step {formStepNumber} of {steps.length}</span>
          </div>

          <div className="form-card">
            <p className="form-title">{formTitle || "Edit Step"}</p>
            <p className="form-sub">Changes here update what users see on the Self-Examination page.</p>

            <form onSubmit={handleSaveStep}>
              <div className="field-row">
                <div className="field">
                  <label>Step number</label>
                  <input 
                    type="number" 
                    value={formStepNumber}
                    disabled 
                    style={{ opacity: 0.5 }}
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <div className="choice-row">
                    <label className="choice">
                      <input 
                        type="radio" 
                        name="stepStatus" 
                        value="Active"
                        checked={formStatus === 'Active'}
                        onChange={() => setFormStatus('Active')}
                      /> Active
                    </label>
                    <label className="choice">
                      <input 
                        type="radio" 
                        name="stepStatus" 
                        value="Hidden"
                        checked={formStatus === 'Hidden'}
                        onChange={() => setFormStatus('Hidden')}
                      /> Hidden
                    </label>
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Step title</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Look in the mirror"
                  required
                />
              </div>

              <div className="field">
                <label>Step description</label>
                <textarea 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide step details..."
                  required
                />
              </div>

              <div className="field">
                <label>Icon / Image</label>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.webp" 
                  onChange={handleImageSelection}
                  style={{ marginBottom: '10px' }}
                />
                <label style={{ fontSize: '13px', opacity: 0.7, fontWeight: 'normal', margin: '5px 0' }}>Or paste image URL</label>
                <input 
                  type="text" 
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://example.com/illustration.png"
                />
                <div className="icon-ph" style={{ marginTop: '10px', height: 'auto', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', border: '1px dashed var(--line)' }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ maxHeight: '150px', maxWidth: '100%' }} />
                  ) : formImageUrl ? (
                    <img src={formImageUrl} alt="Preview" style={{ maxHeight: '150px', maxWidth: '100%' }} />
                  ) : (
                    "Illustration placeholder — upload image"
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={isUploading}>
                  {isUploading ? 'Saving...' : 'Save changes'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setView('steps')} disabled={isUploading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ VIEW DETAIL MODAL ============ */}
      {isViewModalOpen && viewingStep && (
        <div className="modal-overlay show" onClick={() => setIsViewModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '18px' }}>
              <span className="pill pub">Step {viewingStep.stepNumber}</span>
              <button className="btn-ghost" style={{ textDecoration: 'none' }} onClick={() => setIsViewModalOpen(false)}>✕ Close</button>
            </div>
            
            <h3 className="form-title" style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="no-circle" style={{ width: '28px', height: '28px', fontSize: '12px' }}>{viewingStep.stepNumber}</span>
              {viewingStep.title}
            </h3>
            
            <p style={{ margin: '14px 0', fontSize: '14px', lineHeight: 1.6, opacity: 0.85 }}>
              {viewingStep.description}
            </p>

            <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', opacity: 0.6 }}>Status:</span>
              <span className={`status-pill ${viewingStep.status === 'Hidden' ? 'hidden' : ''}`}>
                {viewingStep.status}
              </span>
            </div>

            <div className="icon-ph" style={{ height: 'auto', minHeight: '80px', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {viewingStep.imageUrl ? (
                <img src={viewingStep.imageUrl} alt="Preview" style={{ maxHeight: '150px', maxWidth: '100%' }} />
              ) : (
                "Illustration placeholder — asset not set"
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setIsViewModalOpen(false); handleEditClick(viewingStep); }}>Edit Step</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageSelfExamGuide;
