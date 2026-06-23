import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin.css';

const UserFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([
    { id: 1, user: 'Mary O.', message: 'The Guided self-examination timeline really helped me understand the steps. It is very simple to follow!', rating: '⭐⭐⭐⭐⭐', date: '2026-06-12' },
    { id: 2, user: 'Faith K.', message: 'Can you add clinic telephone details for Mombasa County hospitals? The list is very helpful.', rating: '⭐⭐⭐⭐', date: '2026-06-10' },
    { id: 3, user: 'Aisha J.', message: 'Excellent zine-style visual layout. It feels premium and is very respectful.', rating: '⭐⭐⭐⭐⭐', date: '2026-06-08' }
  ]);

  const handleDelete = (id) => {
    if (confirm("Remove this feedback item?")) {
      setFeedbackList(feedbackList.filter(item => item.id !== id));
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
        <span className="tag">{feedbackList.length} reviews</span>
      </div>

      {/* Feedback list */}
      <div className="feedback-list">
        {feedbackList.map((feed, idx) => (
          <div key={feed.id} className="feedback-item">
            <span className="corner"></span>
            <div className="feedback-top">
              <h4 className="feedback-user">{feed.user}</h4>
              <span className="rating">{feed.rating}</span>
            </div>
            <p className="feedback-msg">"{feed.message}"</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="feedback-meta">Submitted on {feed.date}</span>
              <button className="btn-mini danger" onClick={() => handleDelete(feed.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="btn-row">
        <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Back to Admin
        </Link>
      </div>

    </div>
  );
};

export default UserFeedback;
