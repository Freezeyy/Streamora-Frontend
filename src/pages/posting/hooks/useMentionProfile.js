import { useCallback, useState } from 'react';
import axios from 'axios';
import {
  cacheMentionProfile,
  getCachedMentionProfile,
  invalidateMentionProfile,
} from '../mentionProfileCache';

const API_BASE = 'http://localhost:3000';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const useMentionProfile = () => {
  const [loadingUser, setLoadingUser] = useState(null);

  const fetchProfile = useCallback(async (username, { force = false } = {}) => {
    const key = (username || '').trim().toLowerCase();
    if (!key) return null;

    if (!force) {
      const cached = getCachedMentionProfile(key);
      if (cached !== undefined) return cached;
    }

    try {
      setLoadingUser(key);
      const response = await axios.get(
        `${API_BASE}/api/users/by-username/${encodeURIComponent(username)}`,
        { headers: getAuthHeaders() },
      );
      const user = response.data.data || null;
      cacheMentionProfile(username, user);
      return user;
    } catch {
      cacheMentionProfile(username, null);
      return null;
    } finally {
      setLoadingUser(null);
    }
  }, []);

  return { fetchProfile, loadingUser, invalidateMentionProfile };
};

export default useMentionProfile;
