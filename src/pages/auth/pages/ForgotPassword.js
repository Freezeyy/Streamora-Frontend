import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Snowfall from '../../../components/Snowfall';
import { useForgotPassword } from '../hooks/useForgotPassword';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { forgotPassword } = useForgotPassword(setMessage);

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPassword(email);
  };

  return (
    <div className="auth-page">
      <Snowfall variant="subtle" fixed />

      <div className="auth-card ice-card">
        <h1 className="auth-title">Forgot password?</h1>
        <p className="auth-subtitle">Enter your email to receive a password reset link</p>

        {message && <p className="auth-success">{message}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="auth-input glass-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <button type="submit" className="auth-btn">
            Send reset link
          </button>
        </form>

        <p className="auth-footer">
          Remembered your password? <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
