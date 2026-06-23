import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createSelfCheckRecord } from '../services/selfCheckService';
import Button from '../components/common/Button';
import '../styles/self_examination.css';

const SelfExam = () => {
  const navigate = useRef(useNavigate()).current;
  const { user } = useAuth();

  // Flow State
  const [activeStep, setActiveStep] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Field States
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [completed, setCompleted] = useState('Yes');
  const [sideChecked, setSideChecked] = useState('Both');
  const [feltNormal, setFeltNormal] = useState('Yes');
  const [notes, setNotes] = useState('');
  const [setReminderState, setSetReminderState] = useState('Yes');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  const [selectedChanges, setSelectedChanges] = useState({
    none: true,
    lump: false,
    pain: false,
    discharge: false,
    nipple: false,
    skin: false,
    swelling: false,
    shape: false,
    other: false
  });

  const guideSteps = [
    {
      no: '01',
      tag: 'Prepare',
      title: 'Find a quiet, private moment',
      desc: 'Find a private, comfortable place. Stand in front of a mirror and relax your shoulders.',
      illustration: 'Step 1: Relaxing posture in front of mirror'
    },
    {
      no: '02',
      tag: 'Look',
      title: 'Look in the mirror',
      desc: 'Look at the size, shape, and appearance of both breasts. Notice any swelling, dimpling, or changes in the skin.',
      illustration: 'Step 2: Visually inspecting breasts'
    },
    {
      no: '03',
      tag: 'Look again',
      title: 'Raise your arms',
      desc: 'Raise both arms and look again for changes in shape, skin, or nipple position.',
      illustration: 'Step 3: Hands raised, visual checklist'
    },
    {
      no: '04',
      tag: 'Feel — standing',
      title: 'Check while standing or in the shower',
      desc: 'Use the pads of your middle fingers to gently feel each breast in small circular movements. Wet, soapy skin can make it easier to feel changes.',
      illustration: 'Step 4: Standing physical feel'
    },
    {
      no: '05',
      tag: 'Feel — lying down',
      title: 'Check while lying down',
      desc: 'Lie down on your back with a pillow under your right shoulder. Repeat the same circular feel on your right breast, then switch sides.',
      illustration: 'Step 5: Lying down physical feel'
    },
    {
      no: '06',
      tag: 'Underarm',
      title: 'Check the underarm area',
      desc: 'Gently feel around the armpit and upper chest area for any unusual swelling, thickening, or lumps.',
      illustration: 'Step 6: Underarm/armpit checklist'
    },
    {
      no: '07',
      tag: 'Record',
      title: 'Record what you noticed',
      desc: 'Take note of whether everything felt normal or whether you noticed any changes. You will write down your check on the next screen.',
      illustration: 'Step 7: Final observation prep'
    }
  ];

  const handleCheckboxChange = (key) => {
    setSelectedChanges((prev) => {
      const updated = { ...prev };
      if (key === 'none') {
        // If "None" is checked, turn off all others
        Object.keys(updated).forEach((k) => {
          updated[k] = k === 'none';
        });
      } else {
        // If any other is checked, toggle it, and turn off "None"
        updated[key] = !prev[key];
        updated.none = false;

        // If nothing is checked anymore, default back to "None"
        const anyChecked = Object.keys(updated).some((k) => k !== 'none' && updated[k]);
        if (!anyChecked) {
          updated.none = true;
        }
      }
      return updated;
    });
  };

  // Check if any change other than "none" is selected
  const hasChangesNoticed = Object.keys(selectedChanges).some(
    (k) => k !== 'none' && selectedChanges[k]
  );

  const startGuide = () => {
    setShowForm(false);
    setActiveStep(1);
    const element = document.getElementById('guided-examination-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextStep = () => {
    if (activeStep < 7) {
      setActiveStep((prev) => prev + 1);
    } else {
      setShowForm(true);
      setTimeout(() => {
        const element = document.getElementById('save-record-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const getChangesArray = () => {
    if (selectedChanges.none) return ['No unusual change noticed'];
    const list = [];
    if (selectedChanges.lump) list.push('Lump or thickened area');
    if (selectedChanges.pain) list.push('Breast pain');
    if (selectedChanges.discharge) list.push('Nipple discharge');
    if (selectedChanges.nipple) list.push('Nipple position change');
    if (selectedChanges.skin) list.push('Skin dimpling or redness');
    if (selectedChanges.swelling) list.push('Swelling');
    if (selectedChanges.shape) list.push('Change in breast shape or size');
    if (selectedChanges.other) list.push('Other');
    return list.length > 0 ? list : ['No unusual change noticed'];
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
      const recordData = {
        date,
        completedGuide: completed,
        sideChecked,
        feltNormal,
        changesNoticed: getChangesArray(),
        notes,
        reminderRequested: setReminderState
      };
      
      await createSelfCheckRecord(user.uid, recordData);
      setSaveSuccess(true);
    } catch (err) {
      console.error("Error saving self check record:", err);
      setErrorMsg("Failed to save your self-check record. Please try again.");
    } finally {
      setLoadingState(false);
    }
  };

  // Determine current active flow status
  const getFlowClass = (index) => {
    if (saveSuccess) return 'flow-indicator-step completed';
    if (showForm && index === 3) return 'flow-indicator-step active';
    if (showForm && index < 3) return 'flow-indicator-step completed';
    if (!showForm && index === 2) return 'flow-indicator-step active';
    if (!showForm && index === 1) return 'flow-indicator-step completed';
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
          <p>Your self-check observation has been recorded and linked to your private profile dashboard.</p>
          <div className="self-flow-note" style={{ justifyContent: 'center' }}>
            <span className="arrow">→</span> After saving, this record appears in your Self-Check History page.
          </div>
          <Button variant="primary" onClick={() => navigate('/records')}>
            View History Log
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentStepData = guideSteps[activeStep - 1];

  return (
    <div>
      {/* Page Header */}
      <p className="edu-eyebrow">Section 03</p>
      <h2 className="edu-h1">Guided Self-<em>Examination</em></h2>
      <p className="edu-dek">
        Watch the tutorial, follow each step, then save your self-check record.
      </p>

      {/* Health Note Warning Banner */}
      <div className="edu-banner">
        <b>Important Health Note:</b> EmpowerHer provides educational breast health support only. This guide does not diagnose breast cancer. If you notice a lump, nipple discharge, unusual pain, skin changes, swelling, or any change that worries you, please visit a qualified healthcare provider.
      </div>

      {/* Flow Indicator Timeline */}
      <div className="flow-indicators">
        <div className={getFlowClass(1)}>
          <span>1. Watch Video</span>
        </div>
        <span className="flow-indicator-sep">➔</span>
        <div className={getFlowClass(2)}>
          <span>2. Follow Steps</span>
        </div>
        <span className="flow-indicator-sep">➔</span>
        <div className={getFlowClass(3)}>
          <span>3. Save Record</span>
        </div>
      </div>

      {/* 1. Video Tutorial Section */}
      <div className="edu-section-head">
        <h3>Watch the guided tutorial</h3>
        <div className="rule" />
        <span className="tag">Awareness video</span>
      </div>
      
      <p className="edu-dek" style={{ fontSize: '14px', marginBottom: '20px' }}>
        Watch this short guide before starting the step-by-step self-examination. The video helps you understand the process before you begin.
      </p>

      <div className="video-tutorial-container">
        {/* Left Column: Embed Video Card */}
        <div className="video-tutorial-card">
          <span className="self-progress-label">Video Demonstration</span>
          <div className="video-embed-wrapper">
            <video className="self-check-video" controls preload="metadata">
              <source src="/videos/self-check-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <span className="video-note">Note: Video demonstration is for breast health awareness and education only.</span>
        </div>

        {/* Right Column: Before You Begin Card */}
        <div className="before-you-begin-card">
          <div>
            <h4>Before you begin</h4>
            <p>Find a private, comfortable place. Take your time and follow the guide gently. This self-check helps you learn what is normal for your body, but it cannot diagnose breast cancer.</p>
          </div>
          <Button variant="primary" onClick={startGuide}>
            Start step-by-step guide
          </Button>
        </div>
      </div>

      {/* 2. Step-by-Step Card Section */}
      <div id="guided-examination-section" className="edu-section-head">
        <h3>Guided Steps</h3>
        <div className="rule" />
        <span className="tag">Interactive</span>
      </div>

      {/* Progress Track */}
      <div className="self-progress-wrap">
        <div className="self-progress-label">
          <span>Step-by-step progress</span>
          <span>Step {activeStep} of 7</span>
        </div>
        <div className="self-progress-track">
          <div className="self-progress-fill" style={{ width: `${(activeStep / 7) * 100}%` }}></div>
        </div>
      </div>

      {/* Interactive Step Card */}
      <div className={`guided-steps-card ${activeStep % 3 === 1 ? 'alt' : activeStep % 3 === 2 ? 'alt2' : ''}`}>
        <span className="corner"></span>
        <span className="self-progress-label" style={{ color: 'var(--coral)', marginBottom: 0 }}>Step {currentStepData.no}</span>
        
        <h4>{currentStepData.title}</h4>
        
        {/* Illustration Placeholder */}
        <div className="step-illustration-box">
          {currentStepData.illustration}
        </div>

        <p className="step-desc">{currentStepData.desc}</p>

        {/* Navigation buttons inside card */}
        <div className="step-navigation">
          <button 
            type="button" 
            className="btn-ghost" 
            onClick={handlePrevStep} 
            disabled={activeStep === 1}
            style={{ opacity: activeStep === 1 ? 0.4 : 1, cursor: activeStep === 1 ? 'default' : 'pointer' }}
          >
            ← Previous Step
          </button>
          
          <Button variant="primary" onClick={handleNextStep}>
            {activeStep === 7 ? 'Continue to self-check form' : 'Next Step →'}
          </Button>
        </div>

        <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '11px', fontStyle: 'italic', marginTop: '10px' }}>
          Need help? Remember this guide is educational only.
        </div>
      </div>

      {/* 3. Self-Check Form Section */}
      {showForm && (
        <div id="save-record-section" className="self-form-card">
          <h3 className="self-form-title">Save your self-check record</h3>
          <p className="self-form-sub">Use this form to record what you noticed. Your record will be saved in your History Log for future reference.</p>

          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--oxblood)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '15px',
              textAlign: 'left'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            {/* Date Field */}
            <div className="self-field">
              <label htmlFor="form-date">Date of self-check</label>
              <input 
                id="form-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Guided Examination completion */}
            <div className="self-field">
              <label>Did you complete the guided self-examination?</label>
              <div className="self-choice-row">
                <label className={`self-choice ${completed === 'Yes' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="completed" 
                    value="Yes" 
                    checked={completed === 'Yes'}
                    onChange={() => setCompleted('Yes')}
                  /> Yes
                </label>
                <label className={`self-choice ${completed === 'No' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="completed" 
                    value="No" 
                    checked={completed === 'No'}
                    onChange={() => setCompleted('No')}
                  /> No
                </label>
              </div>
            </div>

            {/* Check Side */}
            <div className="self-field">
              <label>Which side did you check?</label>
              <div className="self-choice-row">
                <label className={`self-choice ${sideChecked === 'Left breast' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="sideChecked" 
                    value="Left breast" 
                    checked={sideChecked === 'Left breast'}
                    onChange={() => setSideChecked('Left breast')}
                  /> Left breast
                </label>
                <label className={`self-choice ${sideChecked === 'Right breast' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="sideChecked" 
                    value="Right breast" 
                    checked={sideChecked === 'Right breast'}
                    onChange={() => setSideChecked('Right breast')}
                  /> Right breast
                </label>
                <label className={`self-choice ${sideChecked === 'Both' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="sideChecked" 
                    value="Both" 
                    checked={sideChecked === 'Both'}
                    onChange={() => setSideChecked('Both')}
                  /> Both
                </label>
              </div>
            </div>

            {/* Normal status */}
            <div className="self-field">
              <label>Did everything feel normal for you?</label>
              <div className="self-choice-row">
                <label className={`self-choice ${feltNormal === 'Yes' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="feltNormal" 
                    value="Yes" 
                    checked={feltNormal === 'Yes'}
                    onChange={() => setFeltNormal('Yes')}
                  /> Yes
                </label>
                <label className={`self-choice ${feltNormal === 'No' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="feltNormal" 
                    value="No" 
                    checked={feltNormal === 'No'}
                    onChange={() => setFeltNormal('No')}
                  /> No
                </label>
                <label className={`self-choice ${feltNormal === 'Not sure' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="feltNormal" 
                    value="Not sure" 
                    checked={feltNormal === 'Not sure'}
                    onChange={() => setFeltNormal('Not sure')}
                  /> Not sure
                </label>
              </div>
            </div>

            {/* Changes checklist */}
            <div className="self-field">
              <label>Did you notice any changes? Select all that apply</label>
              <div className="self-checklist">
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedChanges.none} 
                    onChange={() => handleCheckboxChange('none')}
                  /> No unusual change noticed
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedChanges.lump} 
                    onChange={() => handleCheckboxChange('lump')}
                  /> Lump or thickened area
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedChanges.pain} 
                    onChange={() => handleCheckboxChange('pain')}
                  /> Breast pain
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedChanges.discharge} 
                    onChange={() => handleCheckboxChange('discharge')}
                  /> Nipple discharge
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedChanges.nipple} 
                    onChange={() => handleCheckboxChange('nipple')}
                  /> Nipple position change
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedChanges.skin} 
                    onChange={() => handleCheckboxChange('skin')}
                  /> Skin dimpling or redness
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedChanges.swelling} 
                    onChange={() => handleCheckboxChange('swelling')}
                  /> Swelling
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedChanges.shape} 
                    onChange={() => handleCheckboxChange('shape')}
                  /> Change in breast shape or size
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedChanges.other} 
                    onChange={() => handleCheckboxChange('other')}
                  /> Other
                </label>
              </div>

              {/* Dynamic Warning Message */}
              <div className={`self-support-msg ${hasChangesNoticed ? 'show' : ''}`}>
                Some changes are not cancer, but it is important to have unusual changes checked by a healthcare provider.
              </div>
            </div>

            {/* Notes */}
            <div className="self-field">
              <label htmlFor="notes-area">Notes</label>
              <textarea 
                id="notes-area"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write anything you noticed or want to remember."
              />
            </div>

            {/* Next Month Reminder */}
            <div className="self-field">
              <label>Would you like to set a reminder for next month?</label>
              <div className="self-choice-row">
                <label className={`self-choice ${setReminderState === 'Yes' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="reminderState" 
                    value="Yes" 
                    checked={setReminderState === 'Yes'}
                    onChange={() => setSetReminderState('Yes')}
                  /> Yes
                </label>
                <label className={`self-choice ${setReminderState === 'No' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="reminderState" 
                    value="No" 
                    checked={setReminderState === 'No'}
                    onChange={() => setSetReminderState('No')}
                  /> No
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="self-form-actions">
              <Button type="submit" variant="primary" disabled={loadingState}>
                {loadingState ? 'Saving...' : 'Save to History Log'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/clinics')}>
                Find a Clinic
              </Button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')}>
                Cancel — back to Dashboard
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SelfExam;
