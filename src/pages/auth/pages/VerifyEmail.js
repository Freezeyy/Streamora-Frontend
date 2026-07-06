import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Snowfall from '../../../components/Snowfall';

const API_BASE = 'http://localhost:3000';

const VerifyEmail = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');

    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    fetch(`${API_BASE}/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email successfully verified!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Invalid or expired verification link.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Failed to connect to the server.');
      });
  }, []);

  return (
    <div className="auth-page">
      <Snowfall variant="default" />

      <div className="auth-card ice-card">
        <h1 className="auth-title">Email verification</h1>

        {status === 'loading' && (
          <p className="auth-subtitle">Verifying your email…</p>
        )}

        {status === 'success' && (
          <>
            <p className="auth-success">{message}</p>
            <p className="auth-subtitle">You can now log in to your account.</p>
            <Link to="/login" className="auth-btn auth-btn-link">Go to login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="auth-error">{message}</p>
            <Link to="/signup" className="auth-link">Create a new account</Link>
            {' · '}
            <Link to="/login" className="auth-link">Log in</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
