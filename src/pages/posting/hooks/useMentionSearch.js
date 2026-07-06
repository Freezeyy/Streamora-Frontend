import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { sortMentionResults } from '../mentionUtils';

const API_BASE = 'http://localhost:3000';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const useMentionSearch = (query, { enabled = true, scope = 'all' } = {}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (keyword) => {
    if (!enabled) return;

    const trimmed = keyword.trim();
    if (!trimmed && scope !== 'following') return;

    try {
      setLoading(true);
      setError(null);
      const params = { mention: '1' };
      if (trimmed) {
        params.keyword = trimmed;
      } else {
        params.scope = 'following';
      }

      const response = await axios.get(`${API_BASE}/api/users/search`, {
        params,
        headers: getAuthHeaders(),
      });
      setResults(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, scope]);

  useEffect(() => {
    if (!enabled) {
      setResults([]);
      return undefined;
    }

    const timer = setTimeout(() => {
      fetchUsers(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, enabled, fetchUsers]);

  const sortedResults = useMemo(
    () => sortMentionResults(results, query),
    [results, query],
  );

  return { results: sortedResults, loading, error };
};

export default useMentionSearch;
