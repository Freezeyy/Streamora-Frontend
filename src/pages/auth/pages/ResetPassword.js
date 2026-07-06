import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Snowfall from '../../../components/Snowfall';
import useResetPassword from '../hooks/useResetPassword';

const ResetPassword = () => {
  const {
    newPassword,
    resetToken,
    handlePasswordChange,
    handleTokenChange,
    resetPassword,
  } = useResetPassword();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    handleTokenChange(token);
  }, [handleTokenChange]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      setSuccessMessage('');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const result = await resetPassword();

    if (result.status === 200) {
      setSuccessMessage('Your password has been reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setErrorMessage(result.message || 'Failed to reset password.');
    }

    setSubmitting(false);
  };

  return (
    <div className="auth-page">
      <Snowfall variant="subtle" fixed />

      <div className="auth-card ice-card">
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">Choose a new password for your account</p>

        {successMessage && <p className="auth-success">{successMessage}</p>}
        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        {!successMessage && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <input type="hidden" value={resetToken} readOnly />
            <input
              type="password"
              placeholder="New password"
              className="auth-input glass-input"
              value={newPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              disabled={submitting}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="auth-input glass-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={submitting}
              required
            />
            <button type="submit" className="auth-btn" disabled={submitting}>
              {submitting ? 'Saving…' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login" className="auth-link">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
