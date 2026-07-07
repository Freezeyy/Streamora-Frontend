import axios from 'axios';
import { getAuthToken, handleUnauthorized } from './auth';
import { API_BASE } from '../config/api';

function isProtectedApiRequest(url) {
  const value = String(url || '');
  return value.includes(`${API_BASE}/api/`) || value.startsWith('/api/');
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getAuthToken()) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  },
);

const originalFetch = window.fetch.bind(window);

window.fetch = async (input, init = {}) => {
  const response = await originalFetch(input, init);
  const url = typeof input === 'string' ? input : input.url;

  if (response.status === 401 && getAuthToken() && isProtectedApiRequest(url)) {
    handleUnauthorized();
  }

  return response;
};
