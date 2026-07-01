import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { kenyaCounties } from '../constants/kenyaCounties';
import { geocodeLocation, fetchNearbyClinics, getCurrentUserLocation } from '../services/clinicApi';
import '../styles/clinics.css';

const Directory = () => {
  const navigate = useNavigate();

  // Firestore Live Facilities State
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // API Facilities State
  const [apiResults, setApiResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [locationError, setLocationError] = useState('');

  // Views: 'list' | 'detail'
  const [view, setView] = useState('list');
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All counties');
  const [selectedServices, setSelectedServices] = useState(['Breast screening']); 

  const serviceOptions = [
    'Breast screening',
    'Consultation',
    'Oncology referral',
    'General clinic',
    'Public facility',
    'Private facility'
  ];

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
          name: data.facilityName || '',
          county: data.county || '',
          type: data.facilityType || '',
          location: data.fullAddress || '',
          phone: data.phoneNumber || '',
          services: data.servicesOffered || '',
          openingHours: data.openingHours || '',
          notes: data.notesBeforeVisiting || '',
          mapLink: data.mapLink || ''
        });
      });

      // Sort locally by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      setFacilities(list);
      setLoading(false);
    }, (err) => {
      console.error("Firestore clinicFacilities sync error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Filter facilities logic (for Firestore Admin facilities)
  const getFilteredFacilities = () => {
    return facilities.filter(fac => {
      const matchesSearch = searchQuery === '' || 
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.services.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCounty = selectedCounty === 'All counties' || fac.county === selectedCounty;
      
      const matchesServices = selectedServices.length === 0 || selectedServices.every(service => {
        if (service === 'Public facility') return fac.type.toLowerCase().includes('public');
        if (service === 'Private facility') return fac.type.toLowerCase().includes('private');
        return fac.services.toLowerCase().includes(service.toLowerCase());
      });

      return matchesSearch && matchesCounty && matchesServices;
    });
  };

  const filteredFacilities = getFilteredFacilities();

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCounty('All counties');
    setSelectedServices([]);
  };

  const handleViewDetails = (facility) => {
    setSelectedFacility(facility);
    setView('detail');
  };

  // API LOCATION SEARCH LOGIC
  const handleManualLocationSearch = async () => {
    if (!locationInput.trim()) return;
    
    setIsSearching(true);
    setLocationError('');
    setApiResults([]);
    
    try {
      const coords = await geocodeLocation(locationInput);
      const clinics = await fetchNearbyClinics(coords);
      setApiResults(clinics);
      if (clinics.length === 0) {
        setLocationError("No nearby facilities found. Try searching a nearby town, county, or a wider area.");
      }
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
        setLocationError("Google Maps API key is missing. Please add it to your environment variables.");
      } else if (err.message === 'LOCATION_NOT_FOUND' || err.message === 'ZERO_RESULTS') {
        setLocationError("Could not find that location. Please try a town, area, or county name.");
      } else if (err.message === 'REQUEST_DENIED') {
        setLocationError("Google Maps request was denied. Please check API key restrictions and enabled APIs.");
      } else if (err.message === 'OVER_QUERY_LIMIT') {
        setLocationError("Google Maps query limit reached. Please try again later.");
      } else if (err.message === 'INVALID_REQUEST' || err.message === 'UNKNOWN_ERROR') {
        setLocationError("Google Maps is temporarily unavailable. Please try again.");
      } else {
        setLocationError("Unable to load nearby facilities. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocationSearch = async () => {
    setIsSearching(true);
    setLocationError('');
    setApiResults([]);
    
    try {
      const coords = await getCurrentUserLocation();
      const clinics = await fetchNearbyClinics(coords);
      setApiResults(clinics);
      if (clinics.length === 0) {
        setLocationError("No nearby facilities found. Try searching a nearby town, county, or a wider area.");
      }
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
        setLocationError("Google Maps API key is missing. Please add it to your environment variables.");
      } else if (err.message === 'UNSUPPORTED') {
        setLocationError("Your browser does not support location access. Please type your location manually.");
      } else if (err.message === 'PERMISSION_DENIED') {
        setLocationError("Location permission was denied. You can type your location instead.");
      } else if (err.message === 'REQUEST_DENIED') {
        setLocationError("Google Maps request was denied. Please check API key restrictions and enabled APIs.");
      } else if (err.message === 'OVER_QUERY_LIMIT') {
        setLocationError("Google Maps query limit reached. Please try again later.");
      } else if (err.message === 'INVALID_REQUEST' || err.message === 'UNKNOWN_ERROR') {
        setLocationError("Google Maps is temporarily unavailable. Please try again.");
      } else {
        setLocationError("Unable to load nearby facilities. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Render Facility Card Component to keep code dry
  const FacilityCard = ({ fac, idx }) => (
    <div key={fac.id} className={`fac-card ${idx % 3 === 1 ? 'alt' : idx % 3 === 2 ? 'alt2' : ''}`}>
      <span className="corner"></span>
      <div className="fac-top">
        <p className="fac-name">{fac.name}</p>
        <span className="type-pill">{fac.type}</span>
      </div>
      <p className="fac-loc">{fac.location ? `${fac.location}, ` : ''}{fac.county}</p>
      <p className="fac-services">{fac.services}</p>
      <p className="fac-meta">
        {fac.phone || 'Phone not available'} &middot; {fac.openingHours || 'Hours not available'}
        {fac.rating && ` · ⭐ ${fac.rating}`}
      </p>
      <div className="fac-actions">
        <button className="btn-mini primary" onClick={() => handleViewDetails(fac)}>View details</button>
        <a 
          href={fac.phone ? `tel:${fac.phone}` : '#'} 
          className="btn-mini" 
          style={{ 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            pointerEvents: fac.phone ? 'auto' : 'none',
            opacity: fac.phone ? 1 : 0.5
          }}
        >
          Call clinic
        </a>
        <a 
          href={fac.mapLink || '#'} 
          target={fac.mapLink ? "_blank" : undefined}
          rel={fac.mapLink ? "noopener noreferrer" : undefined}
          className="btn-mini"
          style={{ 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center',
            pointerEvents: fac.mapLink ? 'auto' : 'none',
            opacity: fac.mapLink ? 1 : 0.5
          }}
        >
          View on map
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <p className="eyebrow">Section 06</p>
        <h2 className="h1">Find a Health <em>Facility</em></h2>
        <p className="dek">Find clinics and health centres where you can seek screening, consultation, or professional support.</p>
      </div>

      <div className="notice">
        <b>Before you visit</b>
        EmpowerHer does not provide diagnosis. If you notice unusual breast changes or feel worried, please visit a qualified healthcare provider.
      </div>

      {view === 'list' ? (
        <div className="view show" id="view-list">
          
          {/* LOCATION SEARCH PANEL */}
          <div className="search-card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--coral)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Location Search</h4>
            <div className="search-row">
              <input 
                type="text" 
                placeholder="Enter your town, area, or county"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualLocationSearch()}
              />
              <button 
                className="btn-primary" 
                onClick={handleManualLocationSearch}
                disabled={isSearching}
                style={{ whiteSpace: 'nowrap' }}
              >
                Search nearby clinics
              </button>
              <button 
                className="btn-secondary" 
                onClick={handleCurrentLocationSearch}
                disabled={isSearching}
                style={{ whiteSpace: 'nowrap' }}
              >
                Use my current location
              </button>
            </div>
            {isSearching && (
              <p style={{ margin: '10px 0 0', fontSize: '13px', opacity: 0.7 }}>
                {locationInput ? 'Searching nearby facilities...' : 'Getting your location...'}
              </p>
            )}
            {locationError && (
              <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#ef4444' }}>
                {locationError}
              </p>
            )}
          </div>

          {/* NEARBY FACILITIES (API RESULTS) */}
          {(apiResults.length > 0 || isSearching) && (
            <>
              <div className="section-head" style={{ marginTop: '30px' }}>
                <h3>Nearby facilities</h3>
                <div className="rule"></div>
                <span className="tag" style={{ color: 'var(--coral)', borderColor: 'var(--coral)' }}>{apiResults.length} found</span>
              </div>
              <div className="grid">
                {apiResults.map((fac, idx) => <FacilityCard key={fac.id} fac={fac} idx={idx} />)}
              </div>
              {apiResults.length === 0 && !isSearching && locationError === '' && (
                <div className="empty">
                  <h3>No nearby facilities found</h3>
                  <p>Try searching a nearby town, county, or a wider area.</p>
                </div>
              )}
            </>
          )}

          {/* EMPOWERHER FILTER PANEL */}
          <div className="search-card" style={{ marginTop: '40px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Filter EmpowerHer listed facilities</h4>
            <div className="search-row">
              <input 
                type="text" 
                placeholder="Filter listed clinics by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)}>
                <option value="All counties">All counties</option>
                {kenyaCounties.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="service-row">
              {serviceOptions.map(service => (
                <label key={service}>
                  <input 
                    type="checkbox" 
                    checked={selectedServices.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                  /> 
                  {service}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(searchQuery || selectedCounty !== 'All counties' || selectedServices.length > 0) && (
                <button className="btn-ghost" onClick={handleClearFilters}>Clear filters</button>
              )}
            </div>
          </div>

          {/* EMPOWERHER LISTED FACILITIES (FIRESTORE) */}
          <div className="section-head" style={{ marginTop: '30px' }}>
            <h3>EmpowerHer listed facilities</h3>
            <div className="rule"></div>
            <span className="tag">{filteredFacilities.length} results</span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>Loading facilities...</div>
          ) : filteredFacilities.length === 0 ? (
            <div className="empty">
              <h3>No EmpowerHer listed facilities are available yet.</h3>
              <p>Try clearing your filters or use the location search above to find nearby clinics.</p>
              <button className="btn-primary" onClick={handleClearFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="grid">
              {filteredFacilities.map((fac, idx) => <FacilityCard key={fac.id} fac={fac} idx={idx} />)}
            </div>
          )}
        </div>
      ) : (
        selectedFacility && (
          <div className="view show" id="view-detail">
            <div className="section-head">
              <h3>Facility details</h3>
              <div className="rule"></div>
              <span className="tag">{selectedFacility.type}</span>
            </div>
            
            <div className="detail-card">
              <div className="detail-row"><span className="k">Facility name</span><span className="v">{selectedFacility.name}</span></div>
              <div className="detail-row"><span className="k">Address</span><span className="v">{selectedFacility.location || '-'}</span></div>
              <div className="detail-row"><span className="k">County</span><span className="v">{selectedFacility.county || '-'}</span></div>
              <div className="detail-row"><span className="k">Phone</span><span className="v">{selectedFacility.phone || 'Phone not available'}</span></div>
              {selectedFacility.rating && <div className="detail-row"><span className="k">Rating</span><span className="v">⭐ {selectedFacility.rating}</span></div>}
              <div className="detail-row"><span className="k">Services</span><span className="v">{selectedFacility.services || '-'}</span></div>
              <div className="detail-row"><span className="k">Opening hours</span><span className="v">{selectedFacility.openingHours || '-'}</span></div>
              <div className="detail-row"><span className="k">Facility type</span><span className="v">{selectedFacility.type || '-'}</span></div>

              {selectedFacility.notes && (
                <div className="note-card">
                  <strong>Notes before visiting:</strong><br />
                  {selectedFacility.notes}
                </div>
              )}

              {!selectedFacility.mapLink && (
                <div className="map-ph">Map preview will appear here when location services are connected.</div>
              )}

              <div className="detail-actions">
                <a 
                  href={selectedFacility.phone ? `tel:${selectedFacility.phone}` : '#'} 
                  className="btn-primary" 
                  style={{ 
                    textDecoration: 'none', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    pointerEvents: selectedFacility.phone ? 'auto' : 'none',
                    opacity: selectedFacility.phone ? 1 : 0.5
                  }}
                >
                  Call clinic
                </a>
                
                <a 
                  href={selectedFacility.mapLink || '#'} 
                  target={selectedFacility.mapLink ? "_blank" : undefined}
                  rel={selectedFacility.mapLink ? "noopener noreferrer" : undefined}
                  className="btn-secondary"
                  style={{ 
                    textDecoration: 'none', 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    pointerEvents: selectedFacility.mapLink ? 'auto' : 'none',
                    opacity: selectedFacility.mapLink ? 1 : 0.5
                  }}
                >
                  View on map
                </a>
              </div>
              <div className="detail-actions" style={{ marginTop: '10px' }}>
                <button className="btn-secondary" onClick={() => navigate('/reminders')}>Set appointment reminder</button>
                <button className="btn-ghost" onClick={() => setView('list')}>Back to facilities</button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Directory;
