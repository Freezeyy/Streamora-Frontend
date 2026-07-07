import { useState } from 'react';

import { API_BASE } from '../../../config/api';

const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const login = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user`s Id', data.userId);
        return { success: true };
      }

      setErrorMessage(data.details || data.message || data.error || 'Login failed.');
      return { success: false };
    } catch {
      setErrorMessage('Failed to connect to the server.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    errorMessage,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    login,
  };
};

export default useLogin;
