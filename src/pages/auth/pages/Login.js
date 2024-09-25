// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../hooks/useLogin';
import '../css/Signup.css'; // Reuse the Signup CSS for snowflakes

const Login = () => {
  const {
    email,
    password,
    errorMessage,
    handleEmailChange,
    handlePasswordChange,
    login,
  } = useLogin();
  const navigate = useNavigate(); 
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login();

    if (result.success) {
      setSuccessMessage('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-100 to-blue-300 relative">
      {/* Snowflake background */}
      <div className="snowflakes" aria-hidden="true">
        <div className="snowflake"></div>
        <div className="snowflake"></div>
        <div className="snowflake"></div>
        <div className="snowflake"></div>
        <div className="snowflake"></div>
        <div className="snowflake"></div>
        <div className="snowflake"></div>
        <div className="snowflake"></div>
        <div className="snowflake"></div>
      </div>

      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full z-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Login</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            value={email}
            onChange={handleEmailChange}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>

        {errorMessage && <div className="mt-4 text-red-600 text-center">{errorMessage}</div>}
        {successMessage && <div className="mt-4 text-green-600 text-center">{successMessage}</div>}

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
