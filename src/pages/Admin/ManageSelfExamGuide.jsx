import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin.css';

const ManageSelfExamGuide = () => {
  const [steps, setSteps] = useState([
    { id: 1, stepNumber: 1, title: 'Look in the mirror', description: 'Inspect breasts with arms at sides, then raised overhead.' },
    { id: 2, stepNumber: 2, title: 'Feel while standing', description: 'Use flat fingers to feel for thickening, lumps, or pain.' },
    { id: 3, stepNumber: 3, title: 'Feel while lying down', description: 'Place a pillow under your shoulder and search in circles.' }
  ]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepNumber, setStepNumber] = useState(4);
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    if (editingId) {
      setSteps(steps.map(s => 
        s.id === editingId ? { ...s, title, description, stepNumber: parseInt(stepNumber, 10) } : s
      ));
      setEditingId(null);
    } else {
      const newStep = {
        id: Date.now(),
        stepNumber: parseInt(stepNumber, 10),
        title,
        description
      };
      setSteps([...steps, newStep].sort((a, b) => a.stepNumber - b.stepNumber));
    }

    setTitle('');
    setDescription('');
    setStepNumber(steps.length + 2);
  };

  const handleEdit = (step) => {
    setEditingId(step.id);
    setTitle(step.title);
    setDescription(step.description);
    setStepNumber(step.stepNumber);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this guided step?")) {
      const remaining = steps.filter(s => s.id !== id);
      setSteps(remaining);
      setStepNumber(remaining.length + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Admin Tool</p>
        <h2 className="h1">Manage <em>Self-Exam Guide</em></h2>
        <p className="dek">Update tutorial steps, media attachments, and instructions for guided checks.</p>
      </div>

      <div className="layout">
        
        {/* Form panel */}
        <div>
          <div className="section-head">
            <h3>{editingId ? 'Edit' : 'New'}</h3>
            <div className="rule"></div>
            <span className="tag">{editingId ? 'Modify step' : 'Add step'}</span>
          </div>

          <div className="form-card">
            <p className="form-title">{editingId ? 'Edit Step Info' : 'Create Step'}</p>
            <p className="form-sub">Define instructions and vertical progression order.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Step Number</label>
                <input 
                  type="number" 
                  value={stepNumber} 
                  onChange={(e) => setStepNumber(e.target.value)} 
                  required 
                />
              </div>

              <div className="field">
                <label>Step Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Circular palpation search" 
                  required 
                />
              </div>

              <div className="field">
                <label>Instructions Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe step instructions clearly..." 
                  required 
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Step</button>
                {editingId && (
                  <button type="button" className="btn-ghost" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); }}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List panel */}
        <div>
          <div className="section-head">
            <h3>Self-check steps</h3>
            <div className="rule"></div>
            <span className="tag">{steps.length} total</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Step #</th>
                  <th>Title & details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step) => (
                  <tr key={step.id}>
                    <td>
                      <span className="status-pill">{step.stepNumber}</span>
                    </td>
                    <td>
                      <strong>{step.title}</strong>
                      <br />
                      <span style={{ fontSize: '12.5px', opacity: 0.7 }}>{step.description}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-mini" onClick={() => handleEdit(step)}>Edit</button>
                        <button className="btn-mini danger" onClick={() => handleDelete(step.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="btn-row">
        <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Back to Admin
        </Link>
      </div>

    </div>
  );
};

export default ManageSelfExamGuide;
