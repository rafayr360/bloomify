// src/pages/VerifyEmail.jsx
import React, { useState } from 'react';
import { auth, resendVerificationLink } from '../firebase';

export default function VerifyEmail({ email, navigateTo, onVerifiedSuccess }) {
  const [checking, setChecking] = useState(false);
  const [resent, setResent] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheckVerification = async () => {
    setChecking(true);
    setMessage('');

    try {
      // Reload the Firebase user to get latest emailVerified status
      await auth.currentUser?.reload();
      const user = auth.currentUser;

      if (user?.emailVerified) {
        onVerifiedSuccess();
        navigateTo('library');
      } else {
        setMessage('Email not verified yet. Please click the link in your inbox first.');
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setMessage('');
    try {
      await resendVerificationLink();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      setMessage('Failed to resend. Please try again.');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card verify-card glass-card">
        <div className="verify-icon-wrapper">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00f5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11"/>
            <polyline points="22,6 12,13 2,6"/>
            <polyline points="16 19 18 21 22 17"/>
          </svg>
        </div>

        <h2 className="auth-title">Verify Your Email</h2>
        <p className="auth-subtitle">
          We sent a verification link to <strong className="highlight-email">{email || 'your email address'}</strong>. Please click the link to activate your account.
        </p>

        {message && <div className="auth-error-banner">{message}</div>}
        {resent && <div className="auth-success-banner">Verification link resent! Check your inbox.</div>}

        <div className="verify-actions">
          <button 
            type="button" 
            className="btn btn-auth-primary" 
            onClick={handleCheckVerification}
            disabled={checking}
          >
            {checking ? <span className="spinner"></span> : "I've Verified My Email"}
          </button>

          <button 
            type="button" 
            className="btn btn-secondary resend-btn"
            onClick={handleResend}
          >
            Resend Verification Link
          </button>
        </div>

        <div className="auth-footer">
          <button 
            type="button" 
            className="auth-link-btn"
            onClick={() => navigateTo('login')}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
