import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const useFollow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const follow = useCallback(async (followingId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${API_BASE}/api/follow`,
        { followingId },
        { headers: getAuthHeaders() },
      );
      return { success: true, status: response.data.status || 'accepted' };
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const unfollow = useCallback(async (followingId) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(
        `${API_BASE}/api/unfollow`,
        { followingId },
        { headers: getAuthHeaders() },
      );
      return { success: true, status: 'none' };
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  return { follow, unfollow, loading, error };
};

export default useFollow;
