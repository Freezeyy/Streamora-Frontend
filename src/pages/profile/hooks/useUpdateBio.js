import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const useUpdateBio = (userId) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const updateBio = useCallback(async (bio) => {
    if (!userId) return false;

    setSaving(true);
    setError(null);

    try {
      await axios.post(
        `${API_BASE}/api/user/${userId}`,
        { bio },
        { headers: getAuthHeaders() },
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId]);

  return { updateBio, saving, error };
};

export default useUpdateBio;
