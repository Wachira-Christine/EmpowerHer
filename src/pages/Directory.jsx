import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import '../styles/clinics.css';

const Directory = () => {
  const navigate = useNavigate();

  // Firestore Live Facilities State
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Views: 'list' | 'detail'
  const [view, setView] = useState('list');
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All counties');
  const [selectedType, setSelectedType] = useState('All types');

  // Real-time Firestore sync (exclude Hidden/Deleted)
  useEffect(() => {
    const colRef = collection(db, 'clinicFacilities');
    const q = query(colRef, where('status', '==', 'Active'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.facilityName,
          county: data.county || 'Nairobi',
          type: data.facilityType || 'Public',
          location: data.fullAddress || 'Address on file',
          phone: data.phoneNumber || 'Phone on file',
          services: data.servicesOffered || 'Screening, Consultation',
          openingHours: data.openingHours || 'Mon–Fri, 8:00 AM–5:00 PM',
          notes: data.notesBeforeVisiting || 'Please contact the clinic before visiting.',
          mapLink: data.mapLink || ''
        });
      });

      // Sort locally by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      setFacilities(list);
      
      // Initial details view state
      if (list.length > 0) {
        setSelectedFacility(list[0]);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore clinicFacilities sync error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Filter facilities logic
  const getFilteredFacilities = () => {
    return facilities.filter(fac => {
      const matchesSearch = searchQuery === '' || 
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.services.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCounty = selectedCounty === 'All counties' || fac.county === selectedCounty;
      const matchesType = selectedType === 'All types' || fac.type === selectedType;

      return matchesSearch && matchesCounty && matchesType;
    });
  };

  const filteredFacilities = getFilteredFacilities();

  // Unique counties list compiled from live data
  const countiesList = ['All counties', ...new Set(facilities.map(f => f.county).filter(Boolean))];
  const typesList = ['All types', 'Public', 'Private', 'NGO', 'Community health centre'];

  const handleViewDetails = (facility) => {
    setSelectedFacility(facility);
    setView('detail');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCounty('All counties');
    setSelectedType('All types');
    setView('list');
  };

  const handleCallClinic = (phone) => {
    alert(`Calling ${phone}...`);
  };

  const handleSetReminder = () => {
    navigate('/reminders');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <p className="eyebrow">Section 04</p>
        <h2 className="h1">Find breast health <em>facilities</em></h2>
        <p className="dek">Locate screening packages, consultation centers, and supportive care clinics in Kenya.</p>
      </div>

      <div className="notice">
        <b>Clinic Guidance</b>
        We verify these listings periodically, but schedules change. We recommend calling before you visit to verify screen package costs and diagnostic queues.
      </div>

      {/* Main Layout Split */}
      <div className="clinics-split">
        
        {/* Left Column: Filter panel */}
        <div className="filter-panel">
          <div className="section-head" style={{ marginTop: 0 }}>
            <h3>Filters</h3>
            <div className="rule" />
            <span className="tag">Find clinic</span>
          </div>

          <div className="filter-card">
            {/* Search Input */}
            <div className="field">
              <label>Search name or services</label>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Mammography, Kenyatta"
              />
            </div>

            {/* County Select */}
            <div className="field">
              <label>County</label>
              <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)}>
                {countiesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Type Select */}
            <div className="field">
              <label>Facility type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                {typesList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn-mini primary" onClick={handleClearFilters}>Clear all</button>
            </div>
          </div>
        </div>

        {/* Right Column: View list / detail panel */}
        <div className="content-panel">
          {view === 'list' ? (
            <>
              <div className="section-head" style={{ marginTop: 0 }}>
                <h3>Directories</h3>
                <div className="rule" />
                <span className="tag">{filteredFacilities.length} found</span>
              </div>

              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading facilities...</div>
              ) : filteredFacilities.length === 0 ? (
                <div className="empty" style={{ padding: '40px 20px', textAlign: 'center', border: '1.5px dashed var(--line)' }}>
                  <h3>No clinics match your filters</h3>
                  <p>Try widening your search text or removing checkbox services.</p>
                  <button className="btn-primary" onClick={handleClearFilters}>Reset Filters</button>
                </div>
              ) : (
                <div className="clinic-list">
                  {filteredFacilities.map((fac, idx) => (
                    <div key={fac.id} className={`clinic-card ${idx % 2 === 1 ? 'alt' : ''}`}>
                      <span className="corner"></span>
                      <div className="clinic-top">
                        <h4 className="clinic-title">{fac.name}</h4>
                        <span className="type-badge" style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          background: 'var(--paper-deep)',
                          padding: '4px 8px',
                          borderRadius: '3px'
                        }}>{fac.type}</span>
                      </div>
                      <p className="clinic-loc">{fac.location}, {fac.county} County</p>
                      <p className="clinic-services"><strong>Services:</strong> {fac.services}</p>
                      <div className="clinic-actions">
                        <button className="btn-mini primary" onClick={() => handleViewDetails(fac)}>View details</button>
                        <button className="btn-mini" onClick={() => handleCallClinic(fac.phone)}>Call</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // DETAIL VIEW
            selectedFacility && (
              <>
                <div className="section-head" style={{ marginTop: 0 }}>
                  <h3>Clinic detail</h3>
                  <div className="rule" />
                  <span className="tag">Info</span>
                </div>

                <div className="detail-card">
                  <span className="corner"></span>
                  <button className="back-link-btn" onClick={() => setView('list')}>← Back to list</button>

                  <h3 className="detail-title">{selectedFacility.name}</h3>
                  <p className="detail-type" style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    opacity: 0.7,
                    marginBottom: '15px'
                  }}>{selectedFacility.type}</p>

                  <div className="detail-info-group">
                    <p><strong>📍 Location:</strong> {selectedFacility.location}, {selectedFacility.county} County</p>
                    <p><strong>📞 Contact Phone:</strong> {selectedFacility.phone}</p>
                    <p><strong>🕒 Opening Hours:</strong> {selectedFacility.openingHours}</p>
                    <p><strong>🔬 Services Offered:</strong> {selectedFacility.services}</p>
                  </div>

                  <hr className="detail-divider" />

                  <div className="detail-notes">
                    <strong>Before you visit:</strong>
                    <p>{selectedFacility.notes}</p>
                  </div>

                  <div className="detail-actions">
                    <button className="btn-primary" onClick={() => handleCallClinic(selectedFacility.phone)}>Call Clinic</button>
                    {selectedFacility.mapLink && (
                      <a 
                        href={selectedFacility.mapLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-secondary"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        Open Map
                      </a>
                    )}
                    <button className="btn-ghost" onClick={handleSetReminder}>Schedule visit reminder</button>
                  </div>
                </div>
              </>
            )
          )}
        </div>

      </div>

    </div>
  );
};

export default Directory;
