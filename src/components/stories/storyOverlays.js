export const MEDIA_TRANSFORM_ID = '__media__';

export const parseOverlays = (overlays) => {
  if (!overlays) return [];
  if (Array.isArray(overlays)) return overlays;
  if (typeof overlays === 'string') {
    try {
      const parsed = JSON.parse(overlays);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const getTextOverlays = (overlays) => (
  parseOverlays(overlays).filter(
    (item) => item.type !== 'mediaTransform' && item.text,
  )
);

export const getMediaTransform = (overlays) => {
  const found = parseOverlays(overlays).find(
    (item) => item.type === 'mediaTransform',
  );

  return {
    scale: found?.scale ?? 1,
    x: found?.x ?? 0,
    y: found?.y ?? 0,
  };
};

export const buildOverlaysPayload = (textOverlays, mediaTransform, isVideo) => {
  const cleaned = textOverlays
    .map(({ id, text, x, y }) => ({ id, text: text.trim(), x, y }))
    .filter((item) => item.text.length > 0);

  if (!isVideo) {
    cleaned.push({
      id: MEDIA_TRANSFORM_ID,
      type: 'mediaTransform',
      scale: mediaTransform.scale,
      x: mediaTransform.x,
      y: mediaTransform.y,
    });
  }

  return cleaned;
};
