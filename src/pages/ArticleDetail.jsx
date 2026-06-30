import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import '../styles/education.css';

const ArticleDetail = () => {
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('id');

  const [article, setArticle] = useState(null);
  const [nextArticle, setNextArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const loadArticleData = async () => {
      if (!articleId) return;
      setLoading(true);
      setFeedbackSubmitted(false);
      try {
        // Load active article from educationalArticles collection
        const docRef = doc(db, 'educationalArticles', articleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().status === 'Published') {
          const activeData = { id: docSnap.id, ...docSnap.data() };
          setArticle(activeData);

          // Fetch all published articles to find "Next Up" article dynamically
          const colRef = collection(db, 'educationalArticles');
          const q = query(colRef, where('status', '==', 'Published'));
          const snapshot = await getDocs(q);
          const list = [];
          snapshot.forEach(d => {
            list.push({ id: d.id, ...d.data() });
          });

          // Sort list locally
          list.sort((a, b) => {
            const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 
                          a.createdAt?.toDate?.() ? a.createdAt.toDate().getTime() : 
                          new Date(a.createdAt || 0).getTime();
            const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 
                          b.createdAt?.toDate?.() ? b.createdAt.toDate().getTime() : 
                          new Date(b.createdAt || 0).getTime();
            return (timeB || 0) - (timeA || 0);
          });

          // Find current index
          const currIdx = list.findIndex(item => item.id === articleId);
          if (list.length > 1 && currIdx !== -1) {
            const nextIdx = (currIdx + 1) % list.length;
            setNextArticle(list[nextIdx]);
          } else {
            setNextArticle(null);
          }
        }
      } catch (err) {
        console.error("Error loading article detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadArticleData();
  }, [articleId]);

  const handleFeedbackSubmit = async (isHelpful) => {
    if (!article) return;
    try {
      await addDoc(collection(db, 'userFeedback'), {
        tag: 'Article feedback',
        comment: `User marked article "${article.title}" as ${isHelpful ? 'helpful' : 'not helpful'}.`,
        meta: `Helpful: ${isHelpful ? 'Yes' : 'No'}`,
        status: 'New',
        reviewed: false,
        createdAt: new Date().toISOString()
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Error saving user feedback:", err);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>Loading article content...</div>;
  }

  if (!article) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Article not found</h3>
        <p>The requested educational topic does not exist or is unpublished.</p>
        <Link to="/education" className="edu-article-back">Back to topics</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Back to Topics */}
      <Link to="/education" className="edu-article-back">
        Back to topics
      </Link>

      {/* Article Header info */}
      <div>
        <span className="edu-article-tag">{article.category}</span>
        <h1 className="edu-article-title">
          {article.title}
        </h1>
        <p className="edu-article-meta">
          {article.readTime || '4 minute read'} · Available offline
        </p>
      </div>

      <div className="edu-article-ic-hero">?</div>

      {/* Article Body */}
      {article.articleBody && (
        <article 
          className="edu-article-body" 
          dangerouslySetInnerHTML={{ __html: article.articleBody }}
        />
      )}

      {/* Short Description banner */}
      <div style={{ border: '1px solid var(--line)', background: 'var(--paper-deep)', padding: '20px', margin: '20px 0', fontSize: '14.5px', lineStyle: 'italic' }}>
        <strong>Summary:</strong>
        <p style={{ margin: '6px 0 0', opacity: 0.8 }}>{article.shortDescription}</p>
      </div>

      {/* Learn More Button */}
      {article.articleLink && (
        <div style={{ margin: '24px 0' }}>
          <a 
            href={article.articleLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Learn More
          </a>
        </div>
      )}

      {/* Health Note Banner */}
      <div className="edu-article-notice">
        <b>Health note</b>
        This content is for breast health awareness and education only. It does not diagnose breast cancer or replace professional medical advice. Please visit a qualified healthcare provider if you notice unusual changes or need medical support.
      </div>

      {/* Feedback section */}
      <div className="edu-article-feedback">
        {feedbackSubmitted ? (
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Thank you for your feedback!</p>
        ) : (
          <>
            <p>Was this article helpful?</p>
            <div className="btns">
              <button aria-label="Helpful" onClick={() => handleFeedbackSubmit(true)}>👍</button>
              <button aria-label="Not helpful" onClick={() => handleFeedbackSubmit(false)}>👎</button>
            </div>
          </>
        )}
      </div>

      {/* Next Up Card */}
      {nextArticle && (
        <div className="edu-article-next-up">
          <span className="corner" />
          <p className="label">Next article</p>
          <h4>{nextArticle.title}</h4>
          <Link to={`/education/article?id=${nextArticle.id}`}>Continue reading →</Link>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;
