// src/hooks/useLogin.js
import { useState } from 'react';

const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const login = async () => {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Assuming you handle tokens in local storage or state management
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return { success: true };
    } else {
      setErrorMessage(data.message || 'Login failed.'); // Display error message if any
      return { success: false };
    }
  };

  return {
    email,
    password,
    errorMessage,
    handleEmailChange,
    handlePasswordChange,
    login,
  };
};

export default useLogin;
