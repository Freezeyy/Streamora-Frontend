import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../../../config/api';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const useStories = () => {
  const [storyGroups, setStoryGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchStoryFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/stories/feed`, {
        headers: getAuthHeaders(),
      });
      setStoryGroups(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createStory = useCallback(async (file, overlays = []) => {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('overlays', JSON.stringify(overlays));

    try {
      setCreating(true);
      setError(null);
      const response = await axios.post(`${API_BASE}/api/stories`, formData, {
        headers: getAuthHeaders(),
      });

      await fetchStoryFeed();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setError(message);
      return null;
    } finally {
      setCreating(false);
    }
  }, [fetchStoryFeed]);

  const deleteStory = useCallback(async (storyId) => {
    try {
      setDeleting(true);
      setError(null);
      await axios.delete(`${API_BASE}/api/stories/${storyId}`, {
        headers: getAuthHeaders(),
      });
      const groups = await fetchStoryFeed();
      return { ok: true, groups: groups || [] };
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return { ok: false, groups: null };
    } finally {
      setDeleting(false);
    }
  }, [fetchStoryFeed]);

  return {
    storyGroups,
    loading,
    creating,
    deleting,
    error,
    fetchStoryFeed,
    createStory,
    deleteStory,
  };
};

export default useStories;
