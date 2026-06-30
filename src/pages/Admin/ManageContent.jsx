import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { 
  fetchArticles, 
  addArticle, 
  updateArticle, 
  deleteArticle 
} from '../../services/adminService';
import '../../styles/admin.css';

const ManageContent = () => {
  const { user } = useAuth();

  // Articles state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // View state: 'list' | 'form' | 'empty'
  const [view, setView] = useState('list');

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [selectedStatus, setSelectedStatus] = useState('All statuses');

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('What is breast cancer?');
  const [formReadTime, setFormReadTime] = useState('4 minute read');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formArticleBody, setFormArticleBody] = useState('');
  const [formArticleLink, setFormArticleLink] = useState('');
  const [formStatus, setFormStatus] = useState('Draft');
  const [formAuthorName, setFormAuthorName] = useState('');

  // Modals state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [adminSettings, setAdminSettings] = useState(null);

  // Category list
  const categories = [
    'What is breast cancer?',
    'Risk factors',
    'Common symptoms',
    'Myths and facts',
    'Prevention and healthy habits',
    'Why early detection matters'
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadArticlesData = async () => {
    setLoading(true);
    try {
      const data = await fetchArticles();
      setArticles(data);
      if (data.length === 0) {
        setView('empty');
      } else {
        setView('list');
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load educational content.");
      showToast("Failed to load articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticlesData();
  }, []);

  // Sync author info and preferences
  useEffect(() => {
    if (user && !formAuthorName) {
      setFormAuthorName(user.email || 'Admin');
    }
  }, [user, formAuthorName]);

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
            // Default article status applied on creation
            if (!editingId && data.adminSettings.defaultArticleStatus) {
              setFormStatus(data.adminSettings.defaultArticleStatus);
            }
          }
        }
      } catch (err) {
        console.error("Error loading admin settings in ManageContent:", err);
      }
    };
    fetchAdminSettings();
  }, [user, editingId]);

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
    if (!formTitle.trim()) return;

    if (formArticleLink && !validateUrl(formArticleLink)) {
      showToast("Please enter a valid article link.", "error");
      return;
    }

    const payload = {
      title: formTitle,
      category: formCategory,
      readTime: formReadTime,
      shortDescription: formShortDescription,
      articleBody: formArticleBody,
      articleLink: formArticleLink,
      status: formStatus,
      authorId: user?.uid || 'admin-user',
      authorName: formAuthorName || user?.email || 'Admin'
    };

    try {
      if (editingId) {
        await updateArticle(editingId, payload);
        showToast("Article updated successfully!");
      } else {
        await addArticle(payload);
        showToast("Article saved successfully!");
      }
      resetForm();
      await loadArticlesData();
    } catch (err) {
      console.error(err);
      showToast("Failed to save article", "error");
    }
  };

  const handleEditClick = (article) => {
    setEditingId(article.id);
    setFormTitle(article.title || '');
    setFormCategory(article.category || 'What is breast cancer?');
    setFormReadTime(article.readTime || '4 minute read');
    setFormShortDescription(article.shortDescription || '');
    setFormArticleBody(article.articleBody || '');
    setFormArticleLink(article.articleLink || '');
    setFormStatus(article.status || 'Draft');
    setFormAuthorName(article.authorName || '');
    setView('form');
  };

  const handleDeleteTrigger = async (id) => {
    if (adminSettings?.confirmBeforeDeletingContent === false) {
      try {
        await deleteArticle(id);
        showToast("Article deleted successfully!");
        await loadArticlesData();
      } catch (err) {
        console.error(err);
        showToast("Failed to delete article", "error");
      }
    } else {
      setDeleteTargetId(id);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      try {
        await deleteArticle(deleteTargetId);
        showToast("Article deleted successfully!");
        setIsDeleteModalOpen(false);
        setDeleteTargetId(null);
        await loadArticlesData();
      } catch (err) {
        console.error(err);
        showToast("Failed to delete article", "error");
      }
    }
  };

  const handleViewTrigger = (article) => {
    setSelectedArticle(article);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('What is breast cancer?');
    setFormReadTime('4 minute read');
    setFormShortDescription('');
    setFormArticleBody('');
    setFormArticleLink('');
    setFormStatus('Draft');
    setFormAuthorName(user?.email || 'Admin');
  };

  // Filters logic
  const getFilteredArticles = () => {
    return articles.filter(article => {
      const matchesSearch = searchQuery === '' || 
        (article.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All categories' || article.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All statuses' || article.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const filteredArticles = getFilteredArticles();

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
        <p className="eyebrow">Admin / A2</p>
        <h2 className="h1">Manage Educational <em>Content</em></h2>
        <p className="dek">Create and update breast health awareness articles shown to users.</p>
      </div>

      <div className="demo-switch">
        <button className={view === 'list' ? 'on' : ''} onClick={() => { setView('list'); resetForm(); }}>Article list</button>
        <button className={view === 'form' ? 'on' : ''} onClick={() => setView('form')}>Add / edit article</button>
        <button className={view === 'empty' ? 'on' : ''} onClick={() => setView('empty')}>Empty state</button>
      </div>

      {view === 'list' && (
        <div>
          <div className="toolbar">
            <div className="filters">
              <input 
                type="text" 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="All categories">All categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="All statuses">All statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <button className="btn-primary" onClick={() => { resetForm(); setView('form'); }}>Add new article</button>
          </div>

          <div className="table-wrap">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading articles...</div>
            ) : filteredArticles.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>No matching articles found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Last updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr key={article.id}>
                      <td style={{ fontWeight: '600' }}>{article.title}</td>
                      <td>{article.category}</td>
                      <td>
                        <span className={`pill ${article.status === 'Published' ? 'pub' : 'draft'}`}>
                          {article.status}
                        </span>
                      </td>
                      <td>
                        {article.updatedAt?.toDate?.() 
                          ? article.updatedAt.toDate().toLocaleDateString() 
                          : article.updatedAt 
                            ? new Date(article.updatedAt).toLocaleDateString() 
                            : 'N/A'}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => handleViewTrigger(article)}>View</button>
                          <button onClick={() => handleEditClick(article)}>Edit</button>
                          <button className="danger" onClick={() => handleDeleteTrigger(article.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="table-foot">
            <button className="btn-primary" onClick={() => { resetForm(); setView('form'); }}>Add new article</button>
          </div>
        </div>
      )}

      {view === 'form' && (
        <div className="form-card">
          <p className="form-title">{editingId ? 'Edit Article' : 'Create Article'}</p>
          <p className="form-sub">Configure educational details, descriptions, and optional external links.</p>

          <form onSubmit={handleSave}>
            <div className="field">
              <label>Article title</label>
              <input 
                type="text" 
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Risk Factors"
                required
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Category</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Read time</label>
                <input 
                  type="text" 
                  value={formReadTime}
                  onChange={(e) => setFormReadTime(e.target.value)}
                  placeholder="e.g. 4 minute read"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Short description</label>
              <input 
                type="text" 
                value={formShortDescription}
                onChange={(e) => setFormShortDescription(e.target.value)}
                placeholder="Short summary shown on the cards..."
                required
              />
            </div>

            <div className="field">
              <label>Article body (optional)</label>
              <textarea 
                value={formArticleBody}
                onChange={(e) => setFormArticleBody(e.target.value)}
                placeholder="Write full HTML or plain paragraphs here..."
              />
            </div>

            <div className="field">
              <label>Article link</label>
              <input 
                type="text" 
                value={formArticleLink}
                onChange={(e) => setFormArticleLink(e.target.value)}
                placeholder="https://example.com/article"
              />
            </div>

            <div className="field">
              <label>Status</label>
              <div className="choice-row">
                <label className="choice">
                  <input 
                    type="radio" 
                    name="formStatus"
                    value="Published"
                    checked={formStatus === 'Published'}
                    onChange={() => setFormStatus('Published')}
                  /> Published
                </label>
                <label className="choice">
                  <input 
                    type="radio" 
                    name="formStatus"
                    value="Draft"
                    checked={formStatus === 'Draft'}
                    onChange={() => setFormStatus('Draft')}
                  /> Draft
                </label>
              </div>
            </div>

            <div className="field">
              <label>Author / Admin</label>
              <input 
                type="text" 
                value={formAuthorName}
                onChange={(e) => setFormAuthorName(e.target.value)}
                disabled
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Article</button>
              <button type="button" className="btn-ghost" onClick={() => { resetForm(); setView('list'); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {view === 'empty' && (
        <div className="empty">
          <h3>No articles yet</h3>
          <p>Add your first educational article so it appears on the Learn page.</p>
          <button className="btn-primary" onClick={() => setView('form')}>Add new article</button>
        </div>
      )}

      {/* ============ VIEW DETAIL MODAL ============ */}
      {isViewModalOpen && selectedArticle && (
        <div className="modal-overlay show" onClick={() => setIsViewModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '640px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '18px' }}>
              <span className="pill pub">{selectedArticle.category}</span>
              <button className="btn-ghost" style={{ textDecoration: 'none' }} onClick={() => setIsViewModalOpen(false)}>✕ Close</button>
            </div>
            
            <h3 className="form-title" style={{ fontSize: '24px' }}>{selectedArticle.title}</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.5 }}>
              {selectedArticle.readTime} • Author: {selectedArticle.authorName} • Status: {selectedArticle.status}
            </p>

            <div style={{ border: '1px solid var(--line)', background: 'var(--paper-deep)', padding: '12px', margin: '14px 0', fontSize: '13.5px' }}>
              <strong>Short Description:</strong>
              <p style={{ margin: '6px 0 0', opacity: 0.8 }}>{selectedArticle.shortDescription}</p>
            </div>

            {selectedArticle.articleBody && (
              <div style={{ maxHeight: '200px', overflowY: 'auto', borderBottom: '1px solid var(--line)', paddingBottom: '14px', marginBottom: '18px', fontSize: '14px', lineHeight: 1.6 }} 
                   dangerouslySetInnerHTML={{ __html: selectedArticle.articleBody }} />
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
              {selectedArticle.articleLink && (
                <a 
                  href={selectedArticle.articleLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Learn More
                </a>
              )}
              <button className="btn-secondary" style={{ minHeight: '44px' }} onClick={() => { setIsViewModalOpen(false); handleEditClick(selectedArticle); }}>Edit Article</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      {isDeleteModalOpen && (
        <div className="modal-overlay show">
          <div className="modal">
            <h4>Delete this article?</h4>
            <p>This will remove the article from the Learn page. This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: 'var(--oxblood)', color: '#fff' }} onClick={confirmDelete}>Delete article</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageContent;
