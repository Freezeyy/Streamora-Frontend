const profileCache = new Map();

export const getCachedMentionProfile = (username) => {
  const key = (username || '').trim().toLowerCase();
  if (!key || !profileCache.has(key)) return undefined;
  return profileCache.get(key);
};

export const setCachedMentionProfile = (user) => {
  const key = (user?.username || '').trim().toLowerCase();
  if (!key) return;
  profileCache.set(key, user);
};

export const invalidateMentionProfile = (username) => {
  const key = (username || '').trim().toLowerCase();
  if (key) profileCache.delete(key);
};

export const cacheMentionProfile = (username, user) => {
  const key = (username || '').trim().toLowerCase();
  if (!key) return;
  profileCache.set(key, user);
};

export default profileCache;
