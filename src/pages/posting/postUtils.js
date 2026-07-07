export { API_BASE } from '../../config/api';

export const DOCUMENT_FILE_ACCEPT = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.txt', '.rtf',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'text/plain',
].join(',');

export const getExtension = (pathOrName = '') => {
  const base = String(pathOrName).split('/').pop() || String(pathOrName);
  const dot = base.lastIndexOf('.');
  if (dot === -1) return '';
  return base.slice(dot + 1).toLowerCase();
};

export const getMediaType = (mediaPath) => {
  if (!mediaPath) return null;
  const extension = getExtension(mediaPath);
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(extension)) return 'image';
  if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) return 'video';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt', 'rtf', 'zip', 'rar', '7z'].includes(extension)) {
    return 'file';
  }
  return 'file';
};

export const getMediaCategory = (mediaPath) => {
  const type = getMediaType(mediaPath);
  if (type === 'image' || type === 'video') return type;
  if (type === 'file') return 'file';
  return null;
};

export const getFileNameFromPath = (mediaPath) => {
  if (!mediaPath) return 'Attachment';
  return mediaPath.split('/').pop() || 'Attachment';
};

export const getMediaFileName = (media) => {
  if (media?.file_name) return media.file_name;
  return getFileNameFromPath(media?.media_path);
};

export const getDocumentKind = (pathOrName) => {
  const ext = getExtension(pathOrName);
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
  if (['txt', 'rtf'].includes(ext)) return 'text';
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
  return 'generic';
};

export const getFileLabel = (file) => {
  if (file.type?.startsWith('image/')) return 'Image';
  if (file.type?.startsWith('video/')) return 'Video';
  const kind = getDocumentKind(file.name);
  if (kind === 'pdf') return 'PDF';
  if (kind === 'word') return 'Word';
  if (kind === 'excel') return 'Excel';
  if (kind === 'powerpoint') return 'PowerPoint';
  return 'File';
};
