import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createSelfCheckRecord } from '../services/selfCheckService';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Button from '../components/common/Button';
import '../styles/self_examination.css';

const SelfExam = () => {
  const navigate = useRef(useNavigate()).current;
  const { user } = useAuth();

  // Wizard Flow State
  // 0 = Intro/Video, 1..N = Steps, N+1 = Summary
  const [activeStep, setActiveStep] = useState(0); 
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Data State
  const [stepResponses, setStepResponses] = useState({});
  const [generalNotes, setGeneralNotes] = useState('');
  const [reminderRequested, setReminderRequested] = useState('Yes');
  const [clinicDirectoryRequested, setClinicDirectoryRequested] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  // Firestore Data
  const [healthNote, setHealthNote] = useState('');
  const [guideSteps, setGuideSteps] = useState([]);
  const [loadingSteps, setLoadingSteps] = useState(true);

  // Default fallback
  const defaultHealthNote = "EmpowerHer does not provide medical diagnosis. If you notice a lump, nipple discharge, unusual pain, skin changes, swelling, or any change that worries you, please visit a qualified healthcare provider.";

  const defaultSteps = [
    { no: '01', title: "Prepare", desc: "Find a private, comfortable place. Stand in front of a mirror and relax your shoulders.", question: "Are you ready to begin the self-check in a private and comfortable place?", answerOptions: ["Yes, I am ready", "Not yet"] },
    { no: '02', title: "Look in the mirror", desc: "Look at the size, shape, and appearance of both breasts.", question: "Do you see any change in breast size, shape, skin texture, swelling, or nipple position?", answerOptions: ["No visible change noticed", "Yes, I noticed a visible change", "Not sure"] },
    { no: '03', title: "Raise your arms", desc: "Raise both arms and look again for changes in shape, skin, or nipple position.", question: "When you raise your arms, do you notice any pulling, dimpling, swelling, or change in shape?", answerOptions: ["No change noticed", "Yes, I noticed a change", "Not sure"] },
    { no: '04', title: "Check the nipple area", desc: "Look at the nipple area and gently notice whether there are changes such as unusual discharge, inversion, rash, or soreness.", question: "Do you notice any nipple discharge, inward turning, rash, soreness, or unusual nipple change?", answerOptions: ["No nipple change noticed", "Yes, I noticed a nipple change", "Not sure"] },
    { no: '05', title: "Check while standing or in the shower", desc: "Use the pads of your fingers in small circular movements.", question: "While checking with your fingers, did you feel any lump, thick area, unusual firmness, or painful spot?", answerOptions: ["No unusual area felt", "Yes, I felt an unusual area", "Not sure"] },
    { no: '06', title: "Check while lying down", desc: "Repeat the same circular movement, covering the whole breast area.", question: "While lying down, did any area feel different from the rest of the breast?", answerOptions: ["No difference felt", "Yes, one area felt different", "Not sure"] },
    { no: '07', title: "Check the underarm area", desc: "Gently feel around the armpit and upper chest for unusual swelling.", question: "Did you feel any swelling, lump, tenderness, or unusual change in the underarm area?", answerOptions: ["No underarm change noticed", "Yes, I noticed an underarm change", "Not sure"] }
  ];

  useEffect(() => {
    // 1. Listen to settings for healthNote
    const settingsRef = doc(db, 'selfExamGuide', 'settings');
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setHealthNote(docSnap.data().healthNote || defaultHealthNote);
      } else {
        setHealthNote(defaultHealthNote);
      }
    }, (err) => {
      console.error("HealthNote sync error:", err);
    });

    // 2. Listen to active steps
    const stepsRef = collection(db, 'selfExamGuide', 'steps', 'steps');
    const q = query(stepsRef, where('status', '==', 'Active'));

    const unsubscribeSteps = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          tag: data.title || 'Step',
          title: data.title || '',
          desc: data.description || '',
          illustration: data.imageUrl || 'Step Illustration',
          imageUrl: data.imageUrl || '',
          question: data.question || 'Would you like to record anything about this step?',
          answerOptions: data.answerOptions && data.answerOptions.length > 0 ? data.answerOptions : ["No change noticed", "Yes, I noticed a change", "Not sure"],
          ...data
        });
      });

      // Sort locally
      list.sort((a, b) => {
        const numA = parseInt(a.stepNumber, 10);
        const numB = parseInt(b.stepNumber, 10);
        return (isNaN(numA) ? 999 : numA) - (isNaN(numB) ? 999 : numB);
      });

      // Format index sequentially
      const formattedList = list.map((item, idx) => ({
        ...item,
        no: (idx + 1).toString().padStart(2, '0')
      }));

      if (formattedList.length > 0) {
        setGuideSteps(formattedList);
      } else {
        setGuideSteps(defaultSteps);
      }
      setLoadingSteps(false);
    }, (err) => {
      console.error("SelfExam guides sync error:", err);
      setGuideSteps(defaultSteps);
      setLoadingSteps(false);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeSteps();
    };
  }, []);

  const handleNextStep = () => {
    setActiveStep(prev => prev + 1);
    setTimeout(() => {
      const element = document.getElementById('guided-examination-section');
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      setTimeout(() => {
        const element = document.getElementById('guided-examination-section');
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  const handleResponseChange = (stepIndex, field, value) => {
    setStepResponses(prev => ({
      ...prev,
      [stepIndex]: {
        ...prev[stepIndex],
        [field]: value
      }
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("You must be logged in to save records.");
      return;
    }
    setErrorMsg('');
    setLoadingState(true);

    try {
      const formattedResponses = guideSteps.map((step, index) => {
        const response = stepResponses[index] || {};
        return {
          stepNumber: step.no || (index + 1).toString(),
          stepTitle: step.title,
          question: step.question || 'Did you notice any changes?',
          answer: response.answer || step.answerOptions[0] || 'No change noticed',
          note: response.note || ''
        };
      });

      const today = new Date().toISOString().split('T')[0];

      const recordData = {
        date: today,
        completedGuide: 'Yes',
        stepResponses: formattedResponses,
        generalNotes,
        reminderRequested,
        clinicDirectoryRequested
      };
      
      await createSelfCheckRecord(user.uid, recordData);
      setSaveSuccess(true);
      
      if (clinicDirectoryRequested) {
        setTimeout(() => {
          navigate('/clinics');
        }, 3000);
      }
    } catch (err) {
      console.error("Error saving self check record:", err);
      setErrorMsg("Failed to save your self-check record. Please try again.");
    } finally {
      setLoadingState(false);
    }
  };

  // Determine flow status
  const getFlowClass = (index) => {
    if (saveSuccess) return 'flow-indicator-step completed';
    if (activeStep === guideSteps.length + 1 && index === 3) return 'flow-indicator-step active';
    if (activeStep === guideSteps.length + 1 && index < 3) return 'flow-indicator-step completed';
    if (activeStep > 0 && activeStep <= guideSteps.length && index === 2) return 'flow-indicator-step active';
    if (activeStep > 0 && activeStep <= guideSteps.length && index === 1) return 'flow-indicator-step completed';
    if (activeStep === 0 && index === 1) return 'flow-indicator-step active';
    return 'flow-indicator-step';
  };

  if (saveSuccess) {
    return (
      <div>
        <p className="edu-eyebrow">Self-Examination</p>
        <h2 className="edu-h1">Check <em>Complete</em></h2>
        
        <div className="self-success-card">
          <div style={{ fontSize: '48px', color: 'var(--coral)' }}>✓</div>
          <h3>Record Saved Successfully</h3>
          <p>Your self-check observation has been recorded in your History Log.</p>
          {clinicDirectoryRequested && (
            <div style={{ margin: '20px 0', padding: '12px', background: 'var(--coral)', color: '#fff', borderRadius: '8px' }}>
              Redirecting you to the clinic directory...
            </div>
          )}
          <div className="self-flow-note" style={{ justifyContent: 'center' }}>
            <span className="arrow">→</span> Remember, EmpowerHer does not provide medical diagnosis. Always consult a healthcare provider for any concerns.
          </div>
          {!clinicDirectoryRequested && reminderRequested === 'Yes' && (
            <Button variant="primary" onClick={() => navigate('/reminders', { 
              state: { prefill: true, title: 'Monthly self-check', type: 'Monthly self-check', repeat: 'Monthly', status: 'Active', method: 'In-app' } 
            })}>
              Set Reminder
            </Button>
          )}
          {!clinicDirectoryRequested && (
            <Button variant={reminderRequested === 'Yes' ? 'secondary' : 'primary'} onClick={() => navigate('/records')}>
              View History Log
            </Button>
          )}
          {!clinicDirectoryRequested && (
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="edu-eyebrow">Section 03</p>
      <h2 className="edu-h1">Guided Self-<em>Examination</em></h2>
      <p className="edu-dek">
        Watch the tutorial, follow each step interactively, then save your self-check record.
      </p>

      {/* Health Note Banner */}
      <div className="edu-banner" style={{ background: 'var(--paper)', color: 'var(--ink)', borderLeft: '4px solid var(--oxblood)', borderTop: 'none', borderRight: 'none', borderBottom: 'none', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px' }}>
        <b style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em', color: 'var(--oxblood-deep)', display: 'block', marginBottom: '8px' }}>Important health note</b>
        {healthNote || defaultHealthNote}
      </div>

      {/* Flow Indicator Timeline */}
      <div className="flow-indicators">
        <button 
          className={getFlowClass(1)}
          onClick={() => { document.getElementById('self-check-video')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
        >
          <span>1. Watch Video</span>
        </button>
        <span className="flow-indicator-sep">➔</span>
        <div className={getFlowClass(2)}><span>2. Follow Steps</span></div>
        <span className="flow-indicator-sep">➔</span>
        <div className={getFlowClass(3)}><span>3. Save Record</span></div>
      </div>

      {/* ================= INTRO & VIDEO ================= */}
      <div id="self-check-video" className="video-tutorial-container" style={{ marginTop: '30px', display: activeStep === 0 ? 'grid' : 'block' }}>
        <div className="video-tutorial-card" style={{ marginBottom: activeStep > 0 ? '40px' : '0' }}>
          <span className="self-progress-label">Video Demonstration</span>
          <div className="video-embed-wrapper">
            <video className="self-check-video" controls preload="metadata">
              <source src="/videos/self-check-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <span className="video-note">Note: Video demonstration is for breast health awareness and education only.</span>
        </div>

        {activeStep === 0 && (
          <div className="before-you-begin-card">
            <div>
              <h4>Before you begin</h4>
              <p>Find a private, comfortable place. Take your time and follow the interactive guide gently. This self-check helps you learn what is normal for your body, but it cannot diagnose breast cancer.</p>
            </div>
            <Button variant="primary" onClick={handleNextStep}>
              Start step-by-step guide
            </Button>
          </div>
        )}
      </div>

      {/* ================= STEPS 1..N: INTERACTIVE WIZARD ================= */}
      {activeStep > 0 && activeStep <= guideSteps.length && (
        <div id="guided-examination-section" style={{ marginTop: '30px' }}>
          <div className="self-progress-wrap">
            <div className="self-progress-label">
              <span>Step-by-step progress</span>
              <span>Step {activeStep} of {guideSteps.length}</span>
            </div>
            <div className="self-progress-track">
              <div className="self-progress-fill" style={{ width: `${(activeStep / guideSteps.length) * 100}%` }}></div>
            </div>
          </div>

          <div className={`guided-steps-card ${activeStep % 3 === 1 ? 'alt' : activeStep % 3 === 2 ? 'alt2' : ''}`}>
            <span className="corner"></span>
            
            {(() => {
              const stepIndex = activeStep - 1;
              const currentStepData = guideSteps[stepIndex];
              const response = stepResponses[stepIndex] || {};
              const currentAnswer = response.answer || '';
              const isStepOne = stepIndex === 0;
              const isStepOneNotReady = isStepOne && currentAnswer === 'Not yet';
              
              const showNoteField = !isStepOne && (currentAnswer.toLowerCase().includes('yes') || currentAnswer.toLowerCase().includes('not sure'));

              return (
                <>
                  <span className="self-progress-label" style={{ color: 'var(--coral)', marginBottom: 0 }}>
                    Step {currentStepData.no}
                  </span>
                  <h4>{currentStepData.title}</h4>
                  
                  {/* Media Row: Image & Instruction */}
                  <div className={`step-media-row ${currentStepData.imageUrl ? 'has-image' : 'no-image'}`}>
                    {currentStepData.imageUrl && (
                      <div className="step-image-wrap">
                        <img 
                          src={currentStepData.imageUrl} 
                          alt={currentStepData.title} 
                          className="step-image"
                        />
                      </div>
                    )}
                    <p className={`step-instruction ${!currentStepData.imageUrl ? 'full-width' : ''}`}>{currentStepData.desc}</p>
                  </div>
                  
                  <div className="step-question-card">
                    <p className="step-question">
                      {currentStepData.question}
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {currentStepData.answerOptions.map((opt, i) => (
                        <label key={i} className="answer-option" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: currentAnswer === opt ? '#fff' : 'transparent', borderRadius: '8px', border: currentAnswer === opt ? '1.5px solid var(--coral)' : '1px solid var(--line)' }}>
                          <input 
                            type="radio" 
                            name={`step-${stepIndex}`} 
                            value={opt} 
                            checked={currentAnswer === opt}
                            onChange={() => handleResponseChange(stepIndex, 'answer', opt)}
                            style={{ accentColor: 'var(--coral)' }}
                          />
                          <span style={{ fontSize: '15px' }}>{opt}</span>
                        </label>
                      ))}
                    </div>

                    {showNoteField && (
                      <div style={{ marginTop: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-light)' }}>
                          Optional note about this step:
                        </label>
                        <textarea 
                          value={response.note || ''}
                          onChange={(e) => handleResponseChange(stepIndex, 'note', e.target.value)}
                          placeholder="Describe what you noticed..."
                          style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', fontFamily: 'inherit' }}
                        />
                      </div>
                    )}
                  </div>

                  {isStepOneNotReady && (
                    <div style={{ marginTop: '20px', padding: '16px', background: 'var(--paper-deep)', borderLeft: '4px solid var(--mustard)', borderRadius: '8px', fontSize: '14px', lineHeight: '1.5' }}>
                      Take your time. Find a private and comfortable place before continuing. You can begin the self-check when you feel ready.
                    </div>
                  )}

                  <div className="step-actions">
                    <button type="button" className="btn-ghost" onClick={handlePrevStep}>
                      ← Back
                    </button>
                    {isStepOneNotReady ? (
                      <Button variant="primary" onClick={() => {
                        handleResponseChange(stepIndex, 'answer', 'Yes, I am ready');
                        handleNextStep();
                      }}>
                        I am ready now
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={handleNextStep}>
                        {activeStep === guideSteps.length ? 'Review & Save' : 'Next Step'}
                      </Button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================= FINAL STEP: REVIEW & SAVE ================= */}
      {activeStep === guideSteps.length + 1 && (
        <div id="save-record-section" className="self-form-card" style={{ marginTop: '30px' }}>
          <h3 className="self-form-title">Review your self-check record</h3>
          <p className="self-form-sub">Please review your responses before saving. This record will be stored in your History Log.</p>

          {errorMsg && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--oxblood)', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            
            {/* Step Summary */}
            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--oxblood-deep)' }}>Summary of your check</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {guideSteps.map((step, index) => {
                  const response = stepResponses[index] || {};
                  return (
                    <div key={index} style={{ borderBottom: index < guideSteps.length - 1 ? '1px solid var(--line)' : 'none', paddingBottom: index < guideSteps.length - 1 ? '16px' : '0' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: 'var(--coral)' }}>Step {step.no}: {step.title}</p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>{step.question || 'Did you notice any changes?'}</p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-light)' }}>Answer: <b>{response.answer || 'Not answered'}</b></p>
                      {response.note && <p style={{ margin: '0', fontSize: '13px', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px dashed var(--line)' }}>Note: {response.note}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General Notes */}
            <div className="self-field">
              <label htmlFor="general-notes">Would you like to add any general notes?</label>
              <textarea 
                id="general-notes"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Write anything else you noticed or want to remember overall."
                style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '14px', fontFamily: 'inherit' }}
              />
            </div>

            {/* Next Month Reminder */}
            <div className="self-field">
              <label>Would you like to set a reminder for next month?</label>
              <div className="self-choice-row">
                <label className={`self-choice ${reminderRequested === 'Yes' ? 'active' : ''}`}>
                  <input type="radio" value="Yes" checked={reminderRequested === 'Yes'} onChange={() => setReminderRequested('Yes')} /> Yes
                </label>
                <label className={`self-choice ${reminderRequested === 'No' ? 'active' : ''}`}>
                  <input type="radio" value="No" checked={reminderRequested === 'No'} onChange={() => setReminderRequested('No')} /> No
                </label>
              </div>
            </div>

            {/* Clinic Request */}
            <div className="self-field">
              <label>Would you like to find a nearby health facility?</label>
              <div className="self-choice-row">
                <label className={`self-choice ${clinicDirectoryRequested === true ? 'active' : ''}`}>
                  <input type="radio" checked={clinicDirectoryRequested === true} onChange={() => setClinicDirectoryRequested(true)} /> Yes, take me to directory
                </label>
                <label className={`self-choice ${clinicDirectoryRequested === false ? 'active' : ''}`}>
                  <input type="radio" checked={clinicDirectoryRequested === false} onChange={() => setClinicDirectoryRequested(false)} /> No thanks
                </label>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'var(--paper-deep)', borderLeft: '4px solid var(--oxblood)', fontSize: '13px', lineHeight: '1.5', marginTop: '30px', borderRadius: '0 8px 8px 0' }}>
              <b>EmpowerHer does not provide diagnosis.</b> If you notice a lump, nipple discharge, unusual pain, swelling, skin changes, or any change that worries you, please visit a qualified healthcare provider.
            </div>

            {/* Action buttons */}
            <div className="self-form-actions" style={{ marginTop: '24px' }}>
              <button type="button" className="btn-ghost" onClick={handlePrevStep} disabled={loadingState}>
                ← Back
              </button>
              <Button type="submit" variant="primary" disabled={loadingState}>
                {loadingState ? 'Saving...' : 'Save to History Log'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SelfExam;
