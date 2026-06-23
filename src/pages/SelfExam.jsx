import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import '../styles/self_examination.css';

const SelfExam = () => {
  const navigate = useNavigate();

  // State Management for the Self-Check Form
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [completed, setCompleted] = useState('Yes');
  const [sideChecked, setSideChecked] = useState('Both');
  const [feltNormal, setFeltNormal] = useState('Yes');
  const [notes, setNotes] = useState('');
  const [setReminderState, setSetReminderState] = useState('Yes');

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

  const scrollFormIntoView = () => {
    const element = document.getElementById('save-record-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* 1. Introduction / Tutorial Section */}
      <p className="edu-eyebrow">Section 03</p>
      <h2 className="edu-h1">Guided self-<em>examination</em></h2>
      <p className="edu-dek">
        Breast self-examination helps you learn what is normal for your body, so that you can notice changes early. This guide is for awareness only and does not diagnose breast cancer. Do it once a month, in private, whenever feels comfortable.
      </p>

      {/* Health Note Notice */}
      <div className="edu-banner">
        <b>Before you begin</b>
        EmpowerHer does not provide medical diagnosis. If you notice a lump, nipple discharge, unusual pain, skin changes, swelling, or any change that worries you, please visit a qualified healthcare provider.
      </div>

      {/* 2. Step-by-Step Guide Section */}
      <div className="edu-section-head">
        <h3>The steps</h3>
        <div className="rule" />
        <span className="tag">Seven steps</span>
      </div>

      <div className="self-progress-wrap">
        <p className="self-progress-label">Step-by-step progress</p>
        <div className="self-progress-track">
          <div className="self-progress-fill" style={{ width: '100%' }}></div>
        </div>
      </div>

      <div className="self-timeline">
        {/* Step 1 */}
        <div className="self-step">
          <div className="self-no-circle">1</div>
          <div className="self-step-card">
            <span className="corner"></span>
            <p className="tag-small">Prepare</p>
            <h4>Find a quiet, private moment</h4>
            <p>Find a private, comfortable place. Stand in front of a mirror and relax your shoulders.</p>
            <div className="icon-ph">Illustration placeholder</div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="self-step">
          <div className="self-no-circle">2</div>
          <div className="self-step-card alt">
            <span className="corner"></span>
            <p className="tag-small">Look</p>
            <h4>Look in the mirror</h4>
            <p>Look at the size, shape, and appearance of both breasts. Notice any swelling, dimpling, or changes in the skin.</p>
            <div className="icon-ph">Illustration placeholder</div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="self-step">
          <div className="self-no-circle">3</div>
          <div className="self-step-card alt2">
            <span className="corner"></span>
            <p className="tag-small">Look again</p>
            <h4>Raise your arms</h4>
            <p>Raise both arms and look again for changes in shape, skin, or nipple position.</p>
            <div className="icon-ph">Illustration placeholder</div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="self-step">
          <div className="self-no-circle">4</div>
          <div className="self-step-card">
            <span className="corner"></span>
            <p className="tag-small">Feel — standing</p>
            <h4>Check while standing or in the shower</h4>
            <p>Use the pads of your fingers to gently feel each breast in small circular movements.</p>
            <div className="icon-ph">Illustration placeholder</div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="self-step">
          <div className="self-no-circle">5</div>
          <div className="self-step-card alt">
            <span className="corner"></span>
            <p className="tag-small">Feel — lying down</p>
            <h4>Check while lying down</h4>
            <p>Lie down and repeat the same circular movement, covering the whole breast area.</p>
            <div className="icon-ph">Illustration placeholder</div>
          </div>
        </div>

        {/* Step 6 */}
        <div className="self-step">
          <div className="self-no-circle">6</div>
          <div className="self-step-card alt2">
            <span className="corner"></span>
            <p className="tag-small">Underarm</p>
            <h4>Check the underarm area</h4>
            <p>Gently feel around the armpit and upper chest area for any unusual swelling or lumps.</p>
            <div className="icon-ph">Illustration placeholder</div>
          </div>
        </div>

        {/* Step 7 */}
        <div className="self-step">
          <div className="self-no-circle">7</div>
          <div className="self-step-card">
            <span className="corner"></span>
            <p className="tag-small">Record</p>
            <h4>Record what you noticed</h4>
            <p>Write down whether everything felt normal or whether you noticed any changes. You'll do this just below.</p>
            <div className="icon-ph">Illustration placeholder</div>
          </div>
        </div>
      </div>

      <div className="self-guide-cta">
        <Button variant="primary" onClick={scrollFormIntoView}>
          I've finished the guide
        </Button>
      </div>

      {/* 3. Self-Check Form Section */}
      <div id="save-record-section" className="edu-section-head" style={{ marginTop: '54px' }}>
        <h3>Save your record</h3>
        <div className="rule" />
        <span className="tag">Step 7 continued</span>
      </div>

      <div className="self-flow-note">
        <span className="arrow">→</span> This record will be saved to your private History Log.
      </div>

      <div className="self-form-card">
        <h4 className="self-form-title">Save your self-check record</h4>
        <p className="self-form-sub">Takes under a minute. Only you can see this.</p>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Date Picker */}
          <div className="self-field">
            <label htmlFor="date">Date of self-check</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Completion state */}
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
                />{' '}
                Yes
              </label>
              <label className={`self-choice ${completed === 'No' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="completed"
                  value="No"
                  checked={completed === 'No'}
                  onChange={() => setCompleted('No')}
                />{' '}
                No
              </label>
            </div>
          </div>

          {/* Side checked */}
          <div className="self-field">
            <label>Which side did you check?</label>
            <div className="self-choice-row">
              <label className={`self-choice ${sideChecked === 'Left breast' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="side"
                  value="Left breast"
                  checked={sideChecked === 'Left breast'}
                  onChange={() => setSideChecked('Left breast')}
                />{' '}
                Left breast
              </label>
              <label className={`self-choice ${sideChecked === 'Right breast' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="side"
                  value="Right breast"
                  checked={sideChecked === 'Right breast'}
                  onChange={() => setSideChecked('Right breast')}
                />{' '}
                Right breast
              </label>
              <label className={`self-choice ${sideChecked === 'Both' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="side"
                  value="Both"
                  checked={sideChecked === 'Both'}
                  onChange={() => setSideChecked('Both')}
                />{' '}
                Both
              </label>
            </div>
          </div>

          {/* Normal state */}
          <div className="self-field">
            <label>Did everything feel normal for you?</label>
            <div className="self-choice-row">
              <label className={`self-choice ${feltNormal === 'Yes' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="normal"
                  value="Yes"
                  checked={feltNormal === 'Yes'}
                  onChange={() => setFeltNormal('Yes')}
                />{' '}
                Yes
              </label>
              <label className={`self-choice ${feltNormal === 'No' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="normal"
                  value="No"
                  checked={feltNormal === 'No'}
                  onChange={() => setFeltNormal('No')}
                />{' '}
                No
              </label>
              <label className={`self-choice ${feltNormal === 'Not sure' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="normal"
                  value="Not sure"
                  checked={feltNormal === 'Not sure'}
                  onChange={() => setFeltNormal('Not sure')}
                />{' '}
                Not sure
              </label>
            </div>
          </div>

          {/* Notice changes checklist */}
          <div className="self-field">
            <label>Did you notice any changes? Select all that apply</label>
            <div className="self-checklist">
              <label>
                <input
                  type="checkbox"
                  checked={selectedChanges.none}
                  onChange={() => handleCheckboxChange('none')}
                />{' '}
                No unusual change noticed
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedChanges.lump}
                  onChange={() => handleCheckboxChange('lump')}
                />{' '}
                Lump or thickened area
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedChanges.pain}
                  onChange={() => handleCheckboxChange('pain')}
                />{' '}
                Breast pain
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedChanges.discharge}
                  onChange={() => handleCheckboxChange('discharge')}
                />{' '}
                Nipple discharge
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedChanges.nipple}
                  onChange={() => handleCheckboxChange('nipple')}
                />{' '}
                Nipple position change
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedChanges.skin}
                  onChange={() => handleCheckboxChange('skin')}
                />{' '}
                Skin dimpling or redness
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedChanges.swelling}
                  onChange={() => handleCheckboxChange('swelling')}
                />{' '}
                Swelling
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedChanges.shape}
                  onChange={() => handleCheckboxChange('shape')}
                />{' '}
                Change in breast shape or size
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedChanges.other}
                  onChange={() => handleCheckboxChange('other')}
                />{' '}
                Other
              </label>
            </div>

            {/* Supportive warning message if changes are checked */}
            <div className={`self-support-msg ${hasChangesNoticed ? 'show' : ''}`}>
              Some changes are not cancer, but it is important to have unusual changes checked by a healthcare provider.
            </div>
          </div>

          {/* Notes */}
          <div className="self-field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write anything you noticed or want to remember..."
            />
          </div>

          {/* Reminders selection */}
          <div className="self-field">
            <label>Would you like to set a reminder for next month?</label>
            <div className="self-choice-row">
              <label className={`self-choice ${setReminderState === 'Yes' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="reminder"
                  value="Yes"
                  checked={setReminderState === 'Yes'}
                  onChange={() => setSetReminderState('Yes')}
                />{' '}
                Yes
              </label>
              <label className={`self-choice ${setReminderState === 'No' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="reminder"
                  value="No"
                  checked={setReminderState === 'No'}
                  onChange={() => setSetReminderState('No')}
                />{' '}
                No
              </label>
            </div>
          </div>

          {/* Form action buttons */}
          <div className="self-form-actions">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                alert("This record will later appear in the History Log page. (Placeholder saving)");
                navigate('/records');
              }}
            >
              Save to History Log
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/clinics')}
            >
              Find a Clinic
            </Button>
          </div>
          <div style={{ textAlign: 'center', paddingBottom: '16px' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate('/dashboard')}
            >
              Cancel — back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelfExam;
