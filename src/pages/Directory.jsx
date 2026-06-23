import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/clinics.css';

const Directory = () => {
  const navigate = useNavigate();

  // Hardcoded facilities matching templates
  const initialFacilities = [
    {
      id: 1,
      name: 'Kenyatta National Hospital',
      location: 'Hospital Rd, Nairobi',
      county: 'Nairobi',
      phone: '020 272 6300',
      services: 'Breast screening, consultation, oncology referral',
      openingHours: 'Mon–Fri, 8:00 AM–5:00 PM',
      type: 'Public hospital',
      typeShort: 'Public',
      notes: 'Notes before visiting: bring a national ID if available. Walk-in consultations may involve a waiting period — arriving early in the day is recommended.'
    },
    {
      id: 2,
      name: "Nairobi Women's Hospital",
      location: 'Nairobi',
      county: 'Nairobi',
      phone: '0730 600000',
      services: "Consultation, screening referral, women's health services",
      openingHours: 'Mon–Sat, 8:00 AM–5:00 PM',
      type: 'Private hospital',
      typeShort: 'Private',
      notes: "Notes before visiting: Scheduled appointments are prioritized. Contact the clinic in advance to verify screening package pricing."
    },
    {
      id: 3,
      name: 'County Referral Hospital',
      location: 'County on file',
      county: 'Kiambu',
      phone: 'Phone on file',
      services: 'General consultation, breast health referral',
      openingHours: 'Mon–Fri, 8:00 AM–4:00 PM',
      type: 'Public facility',
      typeShort: 'Public',
      notes: 'Notes before visiting: Referrals from local dispensaries are processed at the oncology outpatient clinic on select mornings.'
    },
    {
      id: 4,
      name: 'Community Health Centre',
      location: 'County on file',
      county: 'Mombasa',
      phone: 'Phone on file',
      services: 'Breast screening, awareness outreach',
      openingHours: 'Mon–Sat, 9:00 AM–4:00 PM',
      type: 'NGO facility',
      typeShort: 'NGO',
      notes: 'Notes before visiting: Offers free monthly awareness sessions and basic screening camps. Arrive early.'
    }
  ];

  // Views: 'list' | 'detail' | 'empty'
  const [view, setView] = useState('list');
  const [selectedFacility, setSelectedFacility] = useState(initialFacilities[0]);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All counties');
  const [checkedServices, setCheckedServices] = useState({
    'Breast screening': true,
    'Consultation': false,
    'Oncology referral': false,
    'General clinic': false,
    'Public facility': false,
    'Private facility': false
  });

  // Services checkbox handler
  const handleCheckboxChange = (serviceName) => {
    setCheckedServices(prev => ({
      ...prev,
      [serviceName]: !prev[serviceName]
    }));
  };

  // Filter facilities logic
  const getFilteredFacilities = () => {
    return initialFacilities.filter(fac => {
      // Search query check
      const matchesSearch = searchQuery === '' || 
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.services.toLowerCase().includes(searchQuery.toLowerCase());

      // County check
      const matchesCounty = selectedCounty === 'All counties' || fac.county === selectedCounty;

      // Service types check (if any checked, must match at least one attribute)
      // Since this is a mockup search, we'll implement simple matching
      let matchesServices = true;
      const activeFilters = Object.keys(checkedServices).filter(k => checkedServices[k]);
      if (activeFilters.length > 0) {
        matchesServices = activeFilters.some(filter => {
          if (filter === 'Public facility') return fac.typeShort === 'Public';
          if (filter === 'Private facility') return fac.typeShort === 'Private';
          return fac.services.toLowerCase().includes(filter.toLowerCase());
        });
      }

      return matchesSearch && matchesCounty && matchesServices;
    });
  };

  const filteredFacilities = getFilteredFacilities();

  // Detail switcher helper
  const handleViewDetails = (facility) => {
    setSelectedFacility(facility);
    setView('detail');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCounty('All counties');
    setCheckedServices({
      'Breast screening': false,
      'Consultation': false,
      'Oncology referral': false,
      'General clinic': false,
      'Public facility': false,
      'Private facility': false
    });
    setView('list');
  };

  const handleCallClinic = (phone) => {
    alert(`Calling ${phone}... (Calling functionality is currently a placeholder)`);
  };

  const handleViewMap = (facName) => {
    alert(`Opening map view for ${facName}...`);
  };

  const handleSetReminder = (fac) => {
    navigate('/reminders');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <p className="eyebrow">Section 06</p>
        <h2 className="h1">Find a Health <em>Facility</em></h2>
        <p className="dek">Find nearby clinics and health centres where you can seek screening, consultation, or professional support.</p>
      </div>

      <div className="notice">
        <b>Before you visit</b>
        EmpowerHer does not provide diagnosis. If you notice unusual breast changes or feel worried, please visit a qualified healthcare provider.
      </div>

      {/* Demo Switcher */}
      <div className="demo-switch">
        <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>Search & results</button>
        <button className={view === 'detail' ? 'on' : ''} onClick={() => { if (initialFacilities.length > 0) { setSelectedFacility(initialFacilities[0]); setView('detail'); } }}>Facility details</button>
        <button className={view === 'empty' ? 'on' : ''} onClick={() => setView('empty')}>No results</button>
      </div>

      {/* ============ LIST VIEW ============ */}
      {view === 'list' && (
        <div className="view show">
          
          {/* Search Card */}
          <div className="search-card">
            <div className="search-row">
              <input 
                type="text" 
                placeholder="Search by clinic name, town, or county" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)}>
                <option value="All counties">All counties</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Kiambu">Kiambu</option>
                <option value="Mombasa">Mombasa</option>
              </select>
            </div>
            
            <div className="service-row">
              {Object.keys(checkedServices).map(service => (
                <label key={service}>
                  <input 
                    type="checkbox" 
                    checked={checkedServices[service]} 
                    onChange={() => handleCheckboxChange(service)} 
                  /> {service}
                </label>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setView('list')}>Search facilities</button>
          </div>

          {/* Summary Row */}
          <div className="summary-row">
            <div className="sum-card">
              <span className="corner"></span>
              <p className="label">Listed facilities</p>
              <p className="value">{initialFacilities.length}</p>
            </div>
            <div className="sum-card alt">
              <span className="corner"></span>
              <p className="label">Screening available</p>
              <p className="value">4</p>
            </div>
            <div className="sum-card alt2">
              <span className="corner"></span>
              <p className="label">Open today</p>
              <p className="value">3</p>
            </div>
            <div className="sum-card">
              <span className="corner"></span>
              <p className="label">Nearest facility</p>
              <p className="value" style={{ fontSize: '14px' }}>Kenyatta Nat. Hosp.</p>
            </div>
          </div>

          <div className="section-head">
            <h3>Facilities</h3>
            <div className="rule"></div>
            <span className="tag">{filteredFacilities.length} results</span>
          </div>

          {/* Grid List */}
          {filteredFacilities.length === 0 ? (
            <div className="empty">
              <h3>No facilities found</h3>
              <p>Try changing your location or service filter.</p>
              <button className="btn-primary" onClick={handleClearFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="grid">
              {filteredFacilities.map((fac, idx) => {
                const cornerClass = idx % 3 === 1 ? 'alt' : idx % 3 === 2 ? 'alt2' : '';
                return (
                  <div key={fac.id} className={`fac-card ${cornerClass}`} style={{ cursor: 'pointer' }} onClick={() => handleViewDetails(fac)}>
                    <span className="corner"></span>
                    <div className="fac-top">
                      <p className="fac-name">{fac.name}</p>
                      <span className="type-pill">{fac.typeShort}</span>
                    </div>
                    <p className="fac-loc">{fac.location}</p>
                    <p className="fac-services">{fac.services}</p>
                    <p className="fac-meta">{fac.phone} · {fac.openingHours}</p>
                    
                    <div className="fac-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-mini primary" onClick={() => handleViewDetails(fac)}>View details</button>
                      <button className="btn-mini" onClick={() => handleCallClinic(fac.phone)}>Call clinic</button>
                      <button className="btn-mini" onClick={() => handleViewMap(fac.name)}>View on map</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ============ DETAIL VIEW ============ */}
      {view === 'detail' && selectedFacility && (
        <div className="view show">
          <div className="section-head">
            <h3>Facility details</h3>
            <div className="rule"></div>
            <span className="tag">{selectedFacility.type}</span>
          </div>

          <div className="detail-card">
            <div className="detail-row">
              <span className="k">Facility name</span>
              <span className="v">{selectedFacility.name}</span>
            </div>
            <div className="detail-row">
              <span className="k">Address</span>
              <span className="v">{selectedFacility.location}</span>
            </div>
            <div className="detail-row">
              <span className="k">County</span>
              <span className="v">{selectedFacility.county}</span>
            </div>
            <div className="detail-row">
              <span className="k">Phone</span>
              <span className="v">{selectedFacility.phone}</span>
            </div>
            <div className="detail-row">
              <span className="k">Services</span>
              <span className="v">{selectedFacility.services}</span>
            </div>
            <div className="detail-row">
              <span className="k">Opening hours</span>
              <span className="v">{selectedFacility.openingHours}</span>
            </div>
            <div className="detail-row">
              <span className="k">Facility type</span>
              <span className="v">{selectedFacility.type}</span>
            </div>

            <div className="note-card">{selectedFacility.notes}</div>

            <div className="map-ph">Map preview will appear here when location services are connected.</div>

            <div className="detail-actions">
              <button className="btn-primary" onClick={() => handleCallClinic(selectedFacility.phone)}>Call clinic</button>
              <button className="btn-secondary" onClick={() => handleViewMap(selectedFacility.name)}>View on map</button>
            </div>
            <div className="detail-actions">
              <button className="btn-secondary" onClick={() => handleSetReminder(selectedFacility)}>Set appointment reminder</button>
              <button className="btn-ghost" onClick={() => setView('list')}>Back to facilities</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EMPTY VIEW ============ */}
      {view === 'empty' && (
        <div className="view show">
          <div className="empty">
            <h3>No facilities found</h3>
            <p>Try changing your location or service filter.</p>
            <button className="btn-primary" onClick={handleClearFilters}>Clear filters</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Directory;
