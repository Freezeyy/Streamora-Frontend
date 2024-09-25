// src/hooks/useLogout.js
import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Clear any tokens or user data from local storage or state
    localStorage.removeItem('token'); // Adjust as needed based on your storage method
    localStorage.removeItem('refreshToken'); // Clear refresh token if used

    // Navigate to the login page
    navigate('/login');
  };

  return { logout };
};

export default useLogout;
