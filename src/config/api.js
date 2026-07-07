const raw = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

/** Backend origin without trailing slash, e.g. http://localhost:3000 */
export const API_BASE = raw.replace(/\/$/, '');
