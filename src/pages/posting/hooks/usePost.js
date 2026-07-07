import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../../../config/api';

const usePost = (skipInitialFetch = false) => {
  const [loading, setLoading] = useState(!skipInitialFetch);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchPosts = useCallback(async () => {
    if (skipInitialFetch) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE}/api/feed?with[]=likes&with[]=comments`,
        { headers: getAuthHeaders() },
      );
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [skipInitialFetch]);

  const toggleLike = useCallback(async (postId) => {
    const userId = Number(localStorage.getItem("user`s Id"));
    if (!userId) return;

    setPosts((prev) => prev.map((post) => {
      if (Number(post.id) !== Number(postId)) return post;

      const likes = Array.isArray(post.likes) ? post.likes : [];
      const alreadyLiked = likes.some((like) => Number(like.user_id) === userId);

      return {
        ...post,
        likes: alreadyLiked
          ? likes.filter((like) => Number(like.user_id) !== userId)
          : [...likes, { user_id: userId }],
      };
    }));

    try {
      setError(null);
      await axios.post(`${API_BASE}/api/posts/${postId}/like`, {}, {
        headers: getAuthHeaders(),
      });
    } catch (err) {
      await fetchPosts();
      setError(err.response?.data?.error || err.response?.data?.message || err.message);
    }
  }, [fetchPosts]);

  const addComment = useCallback(async (postId, text) => {
    const response = await axios.post(
      `${API_BASE}/api/posts/${postId}/comments`,
      { comment: text },
      { headers: getAuthHeaders() },
    );

    setPosts((prev) => prev.map((post) => {
      if (Number(post.id) !== Number(postId)) return post;

      const comments = Array.isArray(post.comments) ? post.comments : [];
      return { ...post, comments: [...comments, response.data] };
    }));

    return response.data;
  }, []);

  const createPost = useCallback(async (text, files) => {
    const formData = new FormData();
    formData.append('content', text.trim());

    files.forEach((file) => {
      formData.append('media', file);
    });

    try {
      setCreating(true);
      setError(null);
      const response = await axios.post(`${API_BASE}/api/posts`, formData, {
        headers: getAuthHeaders(),
      });

      setPosts((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || err.message;
      setError(message);
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const updatePost = useCallback(async (postId, { content, newFiles = [], removeMediaIds = [] }) => {
    const formData = new FormData();
    formData.append('content', content.trim());

    if (removeMediaIds.length > 0) {
      formData.append('removeMediaIds', JSON.stringify(removeMediaIds));
    }

    newFiles.forEach((file) => {
      formData.append('media', file);
    });

    try {
      setError(null);
      const response = await axios.put(`${API_BASE}/api/posts/${postId}`, formData, {
        headers: getAuthHeaders(),
      });

      setPosts((prev) => prev.map((post) => {
        if (Number(post.id) !== Number(postId)) return post;
        return {
          ...post,
          ...response.data,
          likes: post.likes,
          comments: post.comments,
          user: response.data.user || post.user,
          media: response.data.media ?? post.media,
        };
      }));

      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(message);
      return null;
    }
  }, []);

  const deletePost = useCallback(async (postId) => {
    try {
      setError(null);
      await axios.delete(`${API_BASE}/api/posts/${postId}`, {
        headers: getAuthHeaders(),
      });

      setPosts((prev) => prev.filter((post) => Number(post.id) !== Number(postId)));
      return true;
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(message);
      return false;
    }
  }, []);

  return {
    createPost,
    updatePost,
    deletePost,
    fetchPosts,
    toggleLike,
    addComment,
    loading,
    creating,
    error,
    posts,
    setPosts,
  };
};

export default usePost;
