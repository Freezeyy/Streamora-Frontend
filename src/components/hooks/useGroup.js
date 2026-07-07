import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../../config/api';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const useGroup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const listGroups = useCallback(async ({ mine, discover } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (mine) params.set('mine', '1');
      if (discover) params.set('discover', '1');
      const qs = params.toString();
      const response = await axios.get(
        `${API_BASE}/api/groups${qs ? `?${qs}` : ''}`,
        { headers: authHeaders() },
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (payload) => {
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/api/groups`, payload, {
        headers: authHeaders(),
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    }
  }, []);

  const getGroupBySlug = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/api/groups/slug/${slug}`, {
        headers: authHeaders(),
      });
      return response.data;
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 403 && data?.group) {
        return { locked: true, ...data.group, membership: data.group.membership };
      }
      setError(data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinGroup = useCallback(async (groupId) => {
    const response = await axios.post(`${API_BASE}/api/groups/${groupId}/join`, {}, {
      headers: authHeaders(),
    });
    return response.data;
  }, []);

  const leaveGroup = useCallback(async (groupId) => {
    const response = await axios.post(`${API_BASE}/api/groups/${groupId}/leave`, {}, {
      headers: authHeaders(),
    });
    return response.data;
  }, []);

  const deleteGroup = useCallback(async (groupId) => {
    await axios.delete(`${API_BASE}/api/groups/${groupId}`, { headers: authHeaders() });
  }, []);

  const fetchGroupPosts = useCallback(async (groupId) => {
    const response = await axios.get(
      `${API_BASE}/api/groups/${groupId}/posts?with[]=likes&with[]=comments`,
      { headers: authHeaders() },
    );
    return response.data;
  }, []);

  const fetchPendingPosts = useCallback(async (groupId) => {
    const response = await axios.get(
      `${API_BASE}/api/groups/${groupId}/posts/pending?with[]=likes&with[]=comments`,
      { headers: authHeaders() },
    );
    return response.data;
  }, []);

  const createGroupPost = useCallback(async (groupId, text, files) => {
    const formData = new FormData();
    formData.append('content', text.trim());
    files.forEach((file) => formData.append('media', file));

    const response = await axios.post(
      `${API_BASE}/api/groups/${groupId}/posts`,
      formData,
      { headers: authHeaders() },
    );
    return response.data;
  }, []);

  const approvePost = useCallback(async (groupId, postId) => {
    await axios.post(
      `${API_BASE}/api/groups/${groupId}/posts/${postId}/approve`,
      {},
      { headers: authHeaders() },
    );
  }, []);

  const rejectPost = useCallback(async (groupId, postId) => {
    await axios.post(
      `${API_BASE}/api/groups/${groupId}/posts/${postId}/reject`,
      {},
      { headers: authHeaders() },
    );
  }, []);

  const fetchJoinRequests = useCallback(async (groupId) => {
    const response = await axios.get(
      `${API_BASE}/api/groups/${groupId}/join-requests`,
      { headers: authHeaders() },
    );
    return response.data;
  }, []);

  const acceptJoinRequest = useCallback(async (groupId, userId) => {
    await axios.post(
      `${API_BASE}/api/groups/${groupId}/join-requests/${userId}/accept`,
      {},
      { headers: authHeaders() },
    );
  }, []);

  const rejectJoinRequest = useCallback(async (groupId, userId) => {
    await axios.post(
      `${API_BASE}/api/groups/${groupId}/join-requests/${userId}/reject`,
      {},
      { headers: authHeaders() },
    );
  }, []);

  const fetchMembers = useCallback(async (groupId) => {
    const response = await axios.get(
      `${API_BASE}/api/groups/${groupId}/members`,
      { headers: authHeaders() },
    );
    return response.data;
  }, []);

  const promoteToAdmin = useCallback(async (groupId, userId) => {
    await axios.post(
      `${API_BASE}/api/groups/${groupId}/members/${userId}/promote-admin`,
      {},
      { headers: authHeaders() },
    );
  }, []);

  const promoteToCreator = useCallback(async (groupId, userId) => {
    await axios.post(
      `${API_BASE}/api/groups/${groupId}/members/${userId}/promote-creator`,
      {},
      { headers: authHeaders() },
    );
  }, []);

  const removeMember = useCallback(async (groupId, userId) => {
    await axios.delete(
      `${API_BASE}/api/groups/${groupId}/members/${userId}`,
      { headers: authHeaders() },
    );
  }, []);

  return {
    loading,
    error,
    listGroups,
    createGroup,
    getGroupBySlug,
    joinGroup,
    leaveGroup,
    deleteGroup,
    fetchGroupPosts,
    fetchPendingPosts,
    createGroupPost,
    approvePost,
    rejectPost,
    fetchJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
    fetchMembers,
    promoteToAdmin,
    promoteToCreator,
    removeMember,
  };
};

export default useGroup;
