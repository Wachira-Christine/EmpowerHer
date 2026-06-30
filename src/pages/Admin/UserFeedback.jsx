import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { updateFeedbackStatus, deleteFeedback } from '../../services/adminService';
import '../../styles/admin.css';

const UserFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore Sync
  useEffect(() => {
    const q = query(collection(db, 'userFeedback'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        list.push({ 
          id: doc.id, 
          ...data,
          date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'
        });
      });
      setFeedbackList(list);
      setLoading(false);
    }, (err) => {
      console.error("Feedback subscription error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Remove this feedback item?")) {
      try {
        await deleteFeedback(id);
      } catch (err) {
        console.error("Error deleting feedback:", err);
      }
    }
  };

  const handleMarkReviewed = async (id, currentReviewed) => {
    try {
      await updateFeedbackStatus(id, !currentReviewed);
    } catch (err) {
      console.error("Error updating feedback status:", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Admin Tool</p>
        <h2 className="h1">User <em>Feedback</em></h2>
        <p className="dek">Review feedback, ratings, and questions submitted by the community.</p>
      </div>

      <div className="notice">
        <b>Feedback Guidelines</b>
        Feedback is submitted anonymously or with initials. Use this information to improve local facility data and educational guide articles.
      </div>

      <div className="section-head">
        <h3>Community Reviews</h3>
        <div className="rule"></div>
        <span className="tag">{loading ? '...' : `${feedbackList.length} reviews`}</span>
      </div>

      {/* Feedback list */}
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading reviews...</div>
      ) : feedbackList.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>No feedback submissions found.</div>
      ) : (
        <div className="feedback-list">
          {feedbackList.map((feed) => (
            <div key={feed.id} className="feedback-item">
              <span className={`corner ${feed.reviewed ? 'alt' : ''}`}></span>
              <div className="feedback-top">
                <h4 className="feedback-user">{feed.tag || 'User Feedback'}</h4>
                <span className="status-pill" style={{ 
                  fontSize: '9px',
                  backgroundColor: feed.reviewed ? 'var(--success-bg)' : 'var(--amber-bg)',
                  color: feed.reviewed ? 'var(--success)' : 'var(--amber)'
                }}>
                  {feed.status || (feed.reviewed ? 'Reviewed' : 'New')}
                </span>
              </div>
              <p className="feedback-msg">{feed.comment || `"${feed.message}"`}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span className="feedback-meta">
                  {feed.meta} • Submitted on {feed.date}
                </span>
                <div className="row-actions">
                  <button onClick={() => handleMarkReviewed(feed.id, feed.reviewed)}>
                    {feed.reviewed ? 'Mark New' : 'Mark Reviewed'}
                  </button>
                  <button className="btn-mini danger" onClick={() => handleDelete(feed.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="btn-row">
        <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Back to Admin
        </Link>
      </div>

    </div>
  );
};

export default UserFeedback;
