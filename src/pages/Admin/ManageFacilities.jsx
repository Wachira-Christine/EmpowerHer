import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin.css';

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([
    { id: 1, name: 'Kenyatta National Hospital', county: 'Nairobi', phone: '020 272 6300', services: 'Breast screening, consultation, oncology referral' },
    { id: 2, name: "Nairobi Women's Hospital", county: 'Nairobi', phone: '0730 600000', services: "Consultation, screening referral, women's health services" },
    { id: 3, name: 'County Referral Hospital', county: 'Kiambu', phone: 'Phone on file', services: 'General consultation, breast health referral' }
  ]);

  const [name, setName] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [phone, setPhone] = useState('');
  const [services, setServices] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      setFacilities(facilities.map(fac => 
        fac.id === editingId ? { ...fac, name, county, phone, services } : fac
      ));
      setEditingId(null);
    } else {
      const newFac = {
        id: Date.now(),
        name,
        county,
        phone: phone || 'Phone on file',
        services: services || 'Breast screening'
      };
      setFacilities([...facilities, newFac]);
    }

    setName('');
    setPhone('');
    setServices('');
  };

  const handleEdit = (fac) => {
    setEditingId(fac.id);
    setName(fac.name);
    setCounty(fac.county);
    setPhone(fac.phone === 'Phone on file' ? '' : fac.phone);
    setServices(fac.services);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this facility registry?")) {
      setFacilities(facilities.filter(fac => fac.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Admin Tool</p>
        <h2 className="h1">Manage <em>Clinic Directory</em></h2>
        <p className="dek">Register new healthcare screening clinics and update contact numbers.</p>
      </div>

      <div className="layout">
        
        {/* Form panel */}
        <div>
          <div className="section-head">
            <h3>{editingId ? 'Edit' : 'New'}</h3>
            <div className="rule"></div>
            <span className="tag">{editingId ? 'Modify facility' : 'Register facility'}</span>
          </div>

          <div className="form-card">
            <p className="form-title">{editingId ? 'Edit Facility' : 'Register Clinic Hub'}</p>
            <p className="form-sub">Define name, location, and screening options.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Clinic Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Kakamega County Hospital" 
                  required 
                />
              </div>

              <div className="field">
                <label>County</label>
                <select value={county} onChange={(e) => setCounty(e.target.value)}>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Kiambu">Kiambu</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="e.g. 020 272 6300" 
                />
              </div>

              <div className="field">
                <label>Services Offered</label>
                <input 
                  type="text" 
                  value={services} 
                  onChange={(e) => setServices(e.target.value)} 
                  placeholder="e.g. Breast screening, consultation" 
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Facility</button>
                {editingId && (
                  <button type="button" className="btn-ghost" onClick={() => { setEditingId(null); setName(''); setPhone(''); setServices(''); }}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List panel */}
        <div>
          <div className="section-head">
            <h3>Registered facilities</h3>
            <div className="rule"></div>
            <span className="tag">{facilities.length} clinics</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Clinic Name</th>
                  <th>County</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((fac) => (
                  <tr key={fac.id}>
                    <td>
                      <strong>{fac.name}</strong>
                      <br />
                      <span style={{ fontSize: '11px', opacity: 0.6 }}>Tel: {fac.phone}</span>
                      <br />
                      <span style={{ fontSize: '11px', opacity: 0.5 }}>{fac.services}</span>
                    </td>
                    <td>{fac.county}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-mini" onClick={() => handleEdit(fac)}>Edit</button>
                        <button className="btn-mini danger" onClick={() => handleDelete(fac.id)}>Delete</button>
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

export default ManageFacilities;
