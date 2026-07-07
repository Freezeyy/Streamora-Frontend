import { useState } from 'react';

import { API_BASE } from '../../../config/api';
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

const useSignup = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = () => {
    if (error) setError(null);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    const normalizedUsername = username.trim().toLowerCase();

    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      setError('Username must be 3–30 characters: lowercase letters, numbers, underscore');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          username: normalizedUsername,
          email,
          password,
          redirect_url: window.location.origin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || data.error || 'Something went wrong, please try again.');
      }
    } catch {
      setError('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fullName,
    setFullName: (value) => { clearError(); setFullName(value); },
    username,
    setUsername: (value) => { clearError(); setUsername(value); },
    email,
    setEmail: (value) => { clearError(); setEmail(value); },
    password,
    setPassword: (value) => { clearError(); setPassword(value); },
    confirmPassword,
    setConfirmPassword: (value) => { clearError(); setConfirmPassword(value); },
    error,
    success,
    isLoading,
    handleSignup,
  };
};

export default useSignup;
