import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import '../../styles/admin.css';

const ManageFacilities = () => {
  const { user } = useAuth();

  // Facilities states
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Active View Tab State: 'list' | 'form' | 'empty'
  const [view, setView] = useState('list');

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All counties');
  const [selectedType, setSelectedType] = useState('All types');

  // Form States
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCounty, setFormCounty] = useState('Mombasa');
  const [formType, setFormType] = useState('Public');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formOpeningHours, setFormOpeningHours] = useState('Mon–Fri, 8:00 AM–5:00 PM');
  const [formServices, setFormServices] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formMapLink, setFormMapLink] = useState('');
  const [formStatus, setFormStatus] = useState('Active');

  // Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingFacility, setViewingFacility] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [adminSettings, setAdminSettings] = useState(null);

  // List of Kenya's 47 Counties
  const countiesList = [
    "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir", "Mandera", 
    "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", 
    "Nyeri", "Kirinyaga", "Murang’a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", 
    "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", 
    "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", 
    "Migori", "Kisii", "Nyamira", "Nairobi"
  ];

  const typesList = ["Public", "Private", "NGO", "Community health centre"];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadFacilitiesData = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, 'clinicFacilities');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });

      setFacilities(list);
      if (list.length === 0) {
        setView('empty');
      } else {
        setView('list');
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load facilities directory.");
      showToast("Failed to load facilities", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilitiesData();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchAdminSettings = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.adminSettings) {
            setAdminSettings(data.adminSettings);
          }
        }
      } catch (err) {
        console.error("Error loading admin settings in ManageFacilities:", err);
      }
    };
    fetchAdminSettings();
  }, [user]);

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formCounty || !formType || !formServices.trim()) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (formMapLink && !validateUrl(formMapLink)) {
      showToast("Invalid map link. Please enter a valid URL.", "error");
      return;
    }

    const payload = {
      facilityName: formName,
      county: formCounty,
      facilityType: formType,
      fullAddress: formAddress,
      phoneNumber: formPhone,
      openingHours: formOpeningHours,
      servicesOffered: formServices,
      notesBeforeVisiting: formNotes,
      mapLink: formMapLink,
      status: formStatus,
      updatedBy: user?.email || user?.uid || 'Admin'
    };

    try {
      if (editingId) {
        const docRef = doc(db, 'clinicFacilities', editingId);
        await updateDoc(docRef, {
          ...payload,
          updatedAt: serverTimestamp()
        });
        showToast("Facility updated successfully!");
      } else {
        const colRef = collection(db, 'clinicFacilities');
        await addDoc(colRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        showToast("Facility saved successfully!");
      }
      resetForm();
      await loadFacilitiesData();
    } catch (err) {
      console.error(err);
      showToast("Failed to save facility", "error");
    }
  };

  const handleEditClick = (fac) => {
    setEditingId(fac.id);
    setFormName(fac.facilityName || '');
    setFormCounty(fac.county || 'Mombasa');
    setFormType(fac.facilityType || 'Public');
    setFormAddress(fac.fullAddress || '');
    setFormPhone(fac.phoneNumber || '');
    setFormOpeningHours(fac.openingHours || 'Mon–Fri, 8:00 AM–5:00 PM');
    setFormServices(fac.servicesOffered || '');
    setFormNotes(fac.notesBeforeVisiting || '');
    setFormMapLink(fac.mapLink || '');
    setFormStatus(fac.status || 'Active');
    setView('form');
  };

  const handleDeleteTrigger = async (id) => {
    if (adminSettings?.confirmBeforeDeletingFacilities === false) {
      try {
        await deleteDoc(doc(db, 'clinicFacilities', id));
        showToast("Facility deleted successfully!");
        await loadFacilitiesData();
      } catch (err) {
        console.error(err);
        showToast("Failed to delete facility", "error");
      }
    } else {
      setDeleteTargetId(id);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      try {
        await deleteDoc(doc(db, 'clinicFacilities', deleteTargetId));
        showToast("Facility deleted successfully!");
        setIsDeleteModalOpen(false);
        setDeleteTargetId(null);
        await loadFacilitiesData();
      } catch (err) {
        console.error(err);
        showToast("Failed to delete facility", "error");
      }
    }
  };

  const handleViewTrigger = (fac) => {
    setViewingFacility(fac);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormCounty('Mombasa');
    setFormType('Public');
    setFormAddress('');
    setFormPhone('');
    setFormOpeningHours('Mon–Fri, 8:00 AM–5:00 PM');
    setFormServices('');
    setFormNotes('');
    setFormMapLink('');
    setFormStatus('Active');
  };

  const getFilteredFacilities = () => {
    return facilities.filter(fac => {
      const matchesSearch = searchQuery === '' || 
        (fac.facilityName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fac.fullAddress || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fac.servicesOffered || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCounty = selectedCounty === 'All counties' || fac.county === selectedCounty;
      const matchesType = selectedType === 'All types' || fac.facilityType === selectedType;

      return matchesSearch && matchesCounty && matchesType;
    });
  };

  const filteredFacilities = getFilteredFacilities();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast alert */}
      {toast && (
        <div className={`toast-notification ${toast.type === 'error' ? 'error' : 'success'}`} style={{
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

      {/* Header */}
      <div>
        <p className="eyebrow">Admin / A4</p>
        <h2 className="h1">Manage Clinic <em>Directory</em></h2>
        <p className="dek">Add and update health facilities where users can seek screening, consultation, or professional support.</p>
      </div>

      <div className="demo-switch">
        <button className={view === 'list' ? 'on' : ''} onClick={() => { setView('list'); resetForm(); }}>Facility list</button>
        <button className={view === 'form' ? 'on' : ''} onClick={() => setView('form')}>Add / edit facility</button>
        <button className={view === 'empty' ? 'on' : ''} onClick={() => setView('empty')}>Empty state</button>
      </div>

      {view === 'list' && (
        <div>
          <div className="toolbar">
            <div className="filters">
              <input 
                type="text" 
                placeholder="Search facilities..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)}>
                <option value="All counties">All counties</option>
                {countiesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="All types">All types</option>
                {typesList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button className="btn-primary" onClick={() => { resetForm(); setView('form'); }}>Add new facility</button>
          </div>

          <div className="table-wrap">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading facilities...</div>
            ) : filteredFacilities.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>No matching clinics found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Facility name</th>
                    <th>County</th>
                    <th>Services</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFacilities.map((fac) => (
                    <tr key={fac.id}>
                      <td style={{ fontWeight: '600' }}>{fac.facilityName}</td>
                      <td>{fac.county}</td>
                      <td>{fac.servicesOffered}</td>
                      <td>{fac.phoneNumber || 'On file'}</td>
                      <td>
                        <span className={`pill ${fac.status === 'Active' ? 'pub' : 'draft'}`}>
                          {fac.status}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => handleViewTrigger(fac)}>View</button>
                          <button onClick={() => handleEditClick(fac)}>Edit</button>
                          <button className="danger" onClick={() => handleDeleteTrigger(fac.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {view === 'form' && (
        <div className="form-card">
          <p className="form-title">{editingId ? 'Edit Facility' : 'Add Facility'}</p>
          <p className="form-sub">Fields shown here match what appears on the Find a Health Facility page.</p>

          <form onSubmit={handleSave}>
            <div className="field">
              <label>Facility name</label>
              <input 
                type="text" 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Kenyatta National Hospital"
                required
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>County / location</label>
                <select value={formCounty} onChange={(e) => setFormCounty(e.target.value)}>
                  {countiesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Facility type</label>
                <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                  {typesList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Full address</label>
              <input 
                type="text" 
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="e.g. Hospital Rd, Nairobi"
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Phone number</label>
                <input 
                  type="text" 
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. 020 272 6300"
                />
              </div>
              <div className="field">
                <label>Opening hours</label>
                <input 
                  type="text" 
                  value={formOpeningHours}
                  onChange={(e) => setFormOpeningHours(e.target.value)}
                  placeholder="e.g. Mon–Fri, 8:00 AM–5:00 PM"
                />
              </div>
            </div>

            <div className="field">
              <label>Services offered</label>
              <input 
                type="text" 
                value={formServices}
                onChange={(e) => setFormServices(e.target.value)}
                placeholder="e.g. Breast screening, consultation, oncology referral"
                required
              />
            </div>

            <div className="field">
              <label>Notes before visiting</label>
              <textarea 
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. bring a national ID if available"
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Map link</label>
                <input 
                  type="text" 
                  value={formMapLink}
                  onChange={(e) => setFormMapLink(e.target.value)}
                  placeholder="https://maps.google.com/?q=hospital"
                />
              </div>
              <div className="field">
                <label>Status</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="formStatus"
                      value="Active"
                      checked={formStatus === 'Active'}
                      onChange={() => setFormStatus('Active')}
                    /> Active
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="formStatus"
                      value="Hidden"
                      checked={formStatus === 'Hidden'}
                      onChange={() => setFormStatus('Hidden')}
                    /> Hidden
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Save facility</button>
              <button type="button" className="btn-ghost" onClick={() => { resetForm(); setView('list'); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {view === 'empty' && (
        <div className="empty">
          <h3>No facilities yet</h3>
          <p>Add your first health facility so users can find it on the directory page.</p>
          <button className="btn-primary" onClick={() => setView('form')}>Add new facility</button>
        </div>
      )}

      {/* ============ VIEW DETAIL MODAL ============ */}
      {isViewModalOpen && viewingFacility && (
        <div className="modal-overlay show" onClick={() => setIsViewModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '600px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '18px' }}>
              <span className="pill pub">{viewingFacility.facilityType}</span>
              <button className="btn-ghost" style={{ textDecoration: 'none' }} onClick={() => setIsViewModalOpen(false)}>✕ Close</button>
            </div>

            <h3 className="form-title" style={{ fontSize: '24px' }}>{viewingFacility.facilityName}</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.5 }}>
              County: {viewingFacility.county} • Status: {viewingFacility.status}
            </p>

            <div style={{ border: '1px solid var(--line)', background: 'var(--paper-deep)', padding: '12px', margin: '14px 0', fontSize: '13.5px' }}>
              <p style={{ margin: '0 0 6px' }}><strong>Physical Address:</strong> {viewingFacility.fullAddress || 'N/A'}</p>
              <p style={{ margin: '0 0 6px' }}><strong>Phone Number:</strong> {viewingFacility.phoneNumber || 'N/A'}</p>
              <p style={{ margin: '0 0 6px' }}><strong>Opening Hours:</strong> {viewingFacility.openingHours || 'N/A'}</p>
              <p style={{ margin: '0' }}><strong>Services Offered:</strong> {viewingFacility.servicesOffered}</p>
            </div>

            {viewingFacility.notesBeforeVisiting && (
              <div style={{ padding: '10px 0', borderBottom: '1px solid var(--line)', marginBottom: '18px', fontSize: '13.5px', lineHeight: 1.6 }}>
                <strong>Before you visit:</strong>
                <p style={{ margin: '4px 0 0', opacity: 0.8 }}>{viewingFacility.notesBeforeVisiting}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
              {viewingFacility.mapLink && (
                <a 
                  href={viewingFacility.mapLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Open Map
                </a>
              )}
              <button className="btn-secondary" style={{ minHeight: '44px' }} onClick={() => { setIsViewModalOpen(false); handleEditClick(viewingFacility); }}>Edit Facility</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      {isDeleteModalOpen && (
        <div className="modal-overlay show">
          <div className="modal">
            <h4>Delete this facility?</h4>
            <p>This will remove the facility from the directory. This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: 'var(--oxblood)', color: '#fff' }} onClick={confirmDelete}>Delete facility</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageFacilities;
