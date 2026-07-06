import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const useFollowRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/follow/requests`, {
        headers: getAuthHeaders(),
      });
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const acceptRequest = async (followerId) => {
    setActionId(followerId);
    try {
      await axios.post(
        `${API_BASE}/api/follow/accept`,
        { followerId },
        { headers: getAuthHeaders() },
      );
      setRequests((prev) => prev.filter((r) => r.follower_id !== followerId));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setActionId(null);
    }
  };

  const rejectRequest = async (followerId) => {
    setActionId(followerId);
    try {
      await axios.post(
        `${API_BASE}/api/follow/reject`,
        { followerId },
        { headers: getAuthHeaders() },
      );
      setRequests((prev) => prev.filter((r) => r.follower_id !== followerId));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setActionId(null);
    }
  };

  return {
    requests,
    loading,
    error,
    actionId,
    acceptRequest,
    rejectRequest,
    refetch: fetchRequests,
  };
};

export default useFollowRequests;
