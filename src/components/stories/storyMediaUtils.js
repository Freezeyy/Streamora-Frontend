export const MAX_STORY_VIDEO_SECONDS = 60;

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const VIDEO_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/3gpp',
  'video/3gpp2',
  'video/x-m4v',
]);

export const STORY_FILE_ACCEPT = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/3gpp',
].join(',');

export const isStoryImage = (file) => IMAGE_TYPES.has(file?.type);

export const isStoryVideo = (file) => VIDEO_TYPES.has(file?.type);

export const getVideoDuration = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';

  video.onloadedmetadata = () => {
    URL.revokeObjectURL(url);
    resolve(video.duration);
  };

  video.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('Could not read video file'));
  };

  video.src = url;
});

export const validateStoryFile = async (file) => {
  if (!file) {
    return { ok: false, error: 'No file selected' };
  }

  if (!isStoryImage(file) && !isStoryVideo(file)) {
    return {
      ok: false,
      error: 'Stories only support photos and videos (no documents or other files)',
    };
  }

  if (isStoryVideo(file)) {
    try {
      const duration = await getVideoDuration(file);
      if (!Number.isFinite(duration) || duration <= 0) {
        return { ok: false, error: 'Could not read video duration' };
      }
      if (duration > MAX_STORY_VIDEO_SECONDS) {
        return {
          ok: false,
          error: `Videos must be ${MAX_STORY_VIDEO_SECONDS} seconds or shorter`,
        };
      }
    } catch {
      return { ok: false, error: 'Could not read video file' };
    }
  }

  return { ok: true };
};
