export const jidsMatch = (a, b) => {
  if (!a || !b) return false;
  return String(a).trim() === String(b).trim();
};

export const isOwnEvent = (item, viewerWhatsappJid) => {
  if (item.source === 'snow') return true;
  return jidsMatch(item.createdByJid, viewerWhatsappJid);
};

export const formatEventCreator = (item, viewerWhatsappJid) => {
  if (isOwnEvent(item, viewerWhatsappJid)) return 'You';
  return item.createdBy;
};

export const shouldShowEventCreator = (item, viewerWhatsappJid) => (
  isOwnEvent(item, viewerWhatsappJid) || Boolean(item.createdBy)
);
