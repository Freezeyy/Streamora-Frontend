import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useLogin from '../hooks/useLogin';
import Snowfall from '../../../components/Snowfall';

const Login = () => {
  const {
    email,
    password,
    errorMessage,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    login,
  } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login();
    if (result.success) {
      navigate('/feed');
    }
  };

  return (
    <div className="auth-page">
      <Snowfall variant="subtle" fixed />

      <div className="auth-card ice-card">
        <h1 className="auth-title">Login</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="auth-input glass-input"
            value={email}
            onChange={handleEmailChange}
            autoComplete="username"
            disabled={isLoading}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="auth-input glass-input"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
            disabled={isLoading}
            required
          />
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        {errorMessage && <div className="auth-error">{errorMessage}</div>}

        <p className="auth-footer">
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </p>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
