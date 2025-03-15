import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const usePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const didFetch = useRef(false);

  // Create a new post
  const createPost = async (text, files) => {
    console.log("Text content before sending:", text); 
    const formData = new FormData();
    formData.append('content', text);

    files.forEach((file) => {
      formData.append('media', file);
    });

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/api/posts', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all posts, memoized with useCallback to prevent infinite re-renders
  const fetchPosts = useCallback(async () => {
    if (didFetch.current) return; // Prevent duplicate calls
    didFetch.current = true; // Mark fetch as completed

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/posts?with[]=likes&with[]=comments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPosts(response.data);
    } catch (err) {
      setError(err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPost, fetchPosts, loading, error, posts };
};

export default usePost;
