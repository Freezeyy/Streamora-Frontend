// src/pages/Dashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogout from './hooks/useLogout'; // Import the logout hook

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useLogout(); // Get the logout function from the hook

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-green-100 to-green-300">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to the Dashboard</h1>
        <p className="mt-4">You are logged in!</p>
        <button
          onClick={logout} // Logout when button is clicked
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
