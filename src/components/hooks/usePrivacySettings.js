import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const usePrivacySettings = () => {
  const userId = localStorage.getItem("user`s Id");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrivacy = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/user/${userId}`, {
        headers: getAuthHeaders(),
      });
      setIsPrivate(Boolean(response.data.is_private));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPrivacy();
  }, [fetchPrivacy]);

  const updatePrivacy = async (nextValue) => {
    if (!userId) return false;

    setSaving(true);
    setError(null);

    try {
      await axios.post(
        `${API_BASE}/api/user/${userId}`,
        { is_private: nextValue },
        { headers: getAuthHeaders() },
      );
      setIsPrivate(nextValue);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    isPrivate,
    loading,
    saving,
    error,
    updatePrivacy,
    refetch: fetchPrivacy,
  };
};

export default usePrivacySettings;
