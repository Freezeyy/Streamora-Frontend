import axios from 'axios';
import { API_BASE } from '../../../config/api';

export const useForgotPassword = (setMessage) => {
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_BASE}/request-password-reset`, { email });
      setMessage(response.data.message); // Assuming the response has a message
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred. Please try again.'); // Handle error messages
    }
  };

  return { forgotPassword };
};
