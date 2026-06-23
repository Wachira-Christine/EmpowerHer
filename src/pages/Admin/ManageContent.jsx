import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin.css';

const ManageContent = () => {
  const [articles, setArticles] = useState([
    { id: 1, title: 'What is breast cancer?', category: 'Symptoms', author: 'Dr. Jane' },
    { id: 2, title: 'Breast self-exam steps', category: 'Self-Exam', author: 'Staff Nurse' },
    { id: 3, title: 'Common myths & facts', category: 'Myths', author: 'Admin' }
  ]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Symptoms');
  const [author, setAuthor] = useState('Dr. Jane');
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      setArticles(articles.map(art => 
        art.id === editingId ? { ...art, title, category, author } : art
      ));
      setEditingId(null);
    } else {
      const newArticle = {
        id: Date.now(),
        title,
        category,
        author
      };
      setArticles([...articles, newArticle]);
    }
    setTitle('');
  };

  const handleEdit = (art) => {
    setEditingId(art.id);
    setTitle(art.title);
    setCategory(art.category);
    setAuthor(art.author);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this article draft?")) {
      setArticles(articles.filter(art => art.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Admin Tool</p>
        <h2 className="h1">Manage <em>Educational Content</em></h2>
        <p className="dek">Publish new educational articles or revise screening guides.</p>
      </div>

      <div className="layout">
        
        {/* Form panel */}
        <div>
          <div className="section-head">
            <h3>{editingId ? 'Edit' : 'New'}</h3>
            <div className="rule"></div>
            <span className="tag">{editingId ? 'Modify draft' : 'Add draft'}</span>
          </div>

          <div className="form-card">
            <p className="form-title">{editingId ? 'Edit Article' : 'Create Article Draft'}</p>
            <p className="form-sub">Write and categorize support information.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Article Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Symptoms to watch out for" 
                  required 
                />
              </div>

              <div className="field">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Symptoms">Symptoms</option>
                  <option value="Self-Exam">Self-Exam</option>
                  <option value="Myths">Myths & Facts</option>
                  <option value="Clinics">Clinics</option>
                </select>
              </div>

              <div className="field">
                <label>Author / Reviewer</label>
                <input 
                  type="text" 
                  value={author} 
                  onChange={(e) => setAuthor(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Draft</button>
                {editingId && (
                  <button type="button" className="btn-ghost" onClick={() => { setEditingId(null); setTitle(''); }}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List panel */}
        <div>
          <div className="section-head">
            <h3>Draft articles</h3>
            <div className="rule"></div>
            <span className="tag">{articles.length} posts</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Article info</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art) => (
                  <tr key={art.id}>
                    <td>
                      <strong>{art.title}</strong>
                      <br />
                      <span style={{ fontSize: '11px', opacity: 0.6 }}>By {art.author}</span>
                    </td>
                    <td>{art.category}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-mini" onClick={() => handleEdit(art)}>Edit</button>
                        <button className="btn-mini danger" onClick={() => handleDelete(art.id)}>Delete</button>
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

export default ManageContent;
