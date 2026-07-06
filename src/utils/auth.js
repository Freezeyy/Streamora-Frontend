const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = "user`s Id";

function getTokenPayload(token) {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const json = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
};

export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  const payload = getTokenPayload(token);
  if (payload?.exp) {
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowSec) {
      clearAuthSession();
      return false;
    }
  }

  return true;
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const redirectToLogin = () => {
  if (!window.location.pathname.match(/^\/(login|signup)(\/|$)/)) {
    window.location.replace('/login');
  }
};

export const handleUnauthorized = () => {
  if (!getAuthToken()) return;
  clearAuthSession();
  redirectToLogin();
};
