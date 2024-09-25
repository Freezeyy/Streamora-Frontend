// src/pages/ResetPassword.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
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
  const navigate = useNavigate(); // Initialize navigate for navigation

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    handleTokenChange(token); // Set the reset token

    // Log the extracted token for verification
    console.log('Extracted Token:', token);
  }, [handleTokenChange]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords don't match");
        return;
    }

    console.log('Submitting form...'); // Debug log

    const result = await resetPassword();
    console.log('API Response:', result); // Log the API response

    // Check for 204 status code
    if (result.status === 200) { 
        setSuccessMessage('Your password has been reset successfully!'); // Fixed success message
        setErrorMessage(''); // Clear any previous error messages
        setConfirmPassword(''); // Clear the confirm password field

        // Redirect to login after 3 seconds
        setTimeout(() => {
            navigate('/login'); // Redirect to login page
        }, 3000);
    } else {
        setErrorMessage(result.message || 'Failed to reset password.'); // Show error if any
        setSuccessMessage(''); // Clear success message
    }
};



  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Reset Your Password</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="hidden"
            id="resetToken"
            value={resetToken}
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            value={newPassword}
            onChange={handlePasswordChange}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Reset Password
          </button>
        </form>

        {/* Custom Popup for Success Message */}
        {successMessage && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-100 border border-green-500 text-green-700 px-4 py-2 rounded shadow-lg z-50">
            {successMessage}
          </div>
        )}
        
        {/* Custom Popup for Error Message */}
        {errorMessage && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-100 border border-red-500 text-red-700 px-4 py-2 rounded shadow-lg z-50">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
