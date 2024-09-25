import React from 'react';
import useSignup from '../hooks/useSignup';
import '../css/Signup.css';

const Signup = () => {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    handleSignup,
  } = useSignup();

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

      {/* Signup Form */}
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full z-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Welcome to Snow</h1>
        <p className="text-gray-500 text-center mb-8">Create an account and join the coolest community</p>

        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {success && <div className="text-green-500 mb-4 text-center">Signup successful! You can now log in.</div>}

        <form className="space-y-6" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition">
            Create Account
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <a href="/login" className="text-blue-500">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
