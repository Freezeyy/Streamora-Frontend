import { useState } from 'react';
import { API_BASE } from '../../../config/api';

const useResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handlePasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const handleTokenChange = (token) => {
    setResetToken(token);
  };

  const resetPassword = async () => {
    console.log('Resetting password...'); // Debug log

    const response = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetToken, newPassword }),
    });

    // const data = await response.json();
    return response;
  };

  return {
    newPassword,
    resetToken,
    handlePasswordChange,
    handleTokenChange,
    resetPassword,
  };
};

export default useResetPassword;
