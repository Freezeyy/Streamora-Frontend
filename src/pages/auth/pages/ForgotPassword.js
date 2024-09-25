import React, { useState } from 'react';
import { useForgotPassword } from '../hooks/useForgotPassword'; // Ensure you have this hook created


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { forgotPassword } = useForgotPassword(setMessage);

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPassword(email);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-100 to-blue-300 relative">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full z-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Forgot Password?</h1>
        <p className="text-gray-500 text-center mb-8">Enter your email to receive a password reset link</p>
        
        {message && <p className="text-green-500 text-center">{message}</p>}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition">Send Reset Link</button>
        </form>
        
        <p className="mt-4 text-center text-gray-600">Remembered your password? <a href="/login" className="text-blue-500">Log in</a></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
