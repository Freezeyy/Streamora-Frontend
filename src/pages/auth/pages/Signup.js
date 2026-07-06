import React from 'react';
import { Link } from 'react-router-dom';
import useSignup from '../hooks/useSignup';
import Snowfall from '../../../components/Snowfall';

const Signup = () => {
  const {
    fullName,
    setFullName,
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    isLoading,
    handleSignup,
  } = useSignup();

  return (
    <div className="auth-page">
      <Snowfall variant="subtle" fixed />

      <div className="auth-card ice-card">
        <h1 className="auth-title">Welcome to Snow</h1>
        <p className="auth-subtitle">Create an account and join the coolest community</p>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div className="auth-success">
            Account created! Check your email for a verification link before logging in.
          </div>
        )}

        {!success && (
          <form className="auth-form" onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="auth-input glass-input"
              disabled={isLoading}
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input glass-input"
              autoComplete="username"
              disabled={isLoading}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input glass-input"
              autoComplete="email"
              disabled={isLoading}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input glass-input"
              autoComplete="new-password"
              disabled={isLoading}
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input glass-input"
              autoComplete="new-password"
              disabled={isLoading}
              required
            />
            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          {success ? (
            <Link to="/login" className="auth-link">Back to login</Link>
          ) : (
            <>
              Already have an account? <Link to="/login" className="auth-link">Log in</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Signup;
