import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaFileAlt, FaImage, FaTimes, FaVideo } from 'react-icons/fa';
import { API_BASE, getFileLabel, getMediaCategory, DOCUMENT_FILE_ACCEPT } from './postUtils';
import FileAttachmentCard from './FileAttachmentCard';
import './css/MentionText.css';
import './css/EditPostModal.css';

const EditPostModal = ({
  post,
  isOpen,
  onClose,
  onSave,
  saving,
  error,
}) => {
  const [text, setText] = useState('');
  const [keptMedia, setKeptMedia] = useState([]);
  const [removedMediaIds, setRemovedMediaIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState([]);

  const imageInputRef = React.useRef(null);
  const videoInputRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (isOpen && post) {
      setText(post.content || '');
      setKeptMedia(Array.isArray(post.media) ? post.media : []);
      setRemovedMediaIds([]);
      setNewFiles([]);
    }
  }, [isOpen, post]);

  useEffect(() => {
    const urls = newFiles.map((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setNewPreviewUrls(urls);

    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [newFiles]);

  if (!isOpen || !post) return null;

  const handleRemoveExisting = (mediaId) => {
    setRemovedMediaIds((prev) => [...prev, mediaId]);
    setKeptMedia((prev) => prev.filter((item) => item.id !== mediaId));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewFiles((prev) => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSave = text.trim() || keptMedia.length > 0 || newFiles.length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSave) return;

    const success = await onSave(post.id, {
      content: text,
      newFiles,
      removeMediaIds: removedMediaIds,
    });
    if (success) onClose();
  };

  return createPortal(
    <div className="edit-post-backdrop" onClick={onClose} role="presentation">
      <div
        className="edit-post-modal mention-surface"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-post-title"
      >
        <div className="edit-post-header">
          <h2 id="edit-post-title">Edit post</h2>
          <button type="button" className="edit-post-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            className="edit-post-input glass-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="What's on your mind?"
            disabled={saving}
          />

          {(keptMedia.length > 0 || newFiles.length > 0) && (
            <div className="edit-post-media glass-inset">
              <p className="edit-post-media-label">Attachments</p>
              <div className="edit-post-media-grid">
                {keptMedia.map((file) => {
                  const mediaType = getMediaCategory(file.media_path);
                  const mediaUrl = `${API_BASE}${file.media_path}`;

                  return (
                    <div key={`existing-${file.id}`} className="edit-post-media-item">
                      <div className="edit-post-media-preview">
                        {mediaType === 'image' && (
                          <img src={mediaUrl} alt="" className="edit-post-media-thumb" />
                        )}
                        {mediaType === 'video' && (
                          <video src={mediaUrl} className="edit-post-media-thumb" muted />
                        )}
                        {mediaType === 'file' && (
                          <FileAttachmentCard
                            mediaPath={file.media_path}
                            fileName={file.file_name}
                            className="file-attachment-card--preview"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        className="edit-post-media-remove"
                        onClick={() => handleRemoveExisting(file.id)}
                        aria-label="Remove attachment"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  );
                })}

                {newFiles.map((file, index) => (
                  <div key={`new-${file.name}-${index}`} className="edit-post-media-item">
                    <div className="edit-post-media-preview">
                      {file.type.startsWith('image/') && newPreviewUrls[index] && (
                        <img src={newPreviewUrls[index]} alt="" className="edit-post-media-thumb" />
                      )}
                      {file.type.startsWith('video/') && newPreviewUrls[index] && (
                        <video src={newPreviewUrls[index]} className="edit-post-media-thumb" muted />
                      )}
                      {!file.type.startsWith('image/') && !file.type.startsWith('video/') && (
                        <FileAttachmentCard fileName={file.name} className="file-attachment-card--preview" />
                      )}
                    </div>
                    <button
                      type="button"
                      className="edit-post-media-remove"
                      onClick={() => handleRemoveNewFile(index)}
                      aria-label="Remove new attachment"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="edit-post-uploads">
            <button type="button" className="edit-post-upload-btn" onClick={() => imageInputRef.current?.click()}>
              <FaImage /> Image
            </button>
            <button type="button" className="edit-post-upload-btn" onClick={() => videoInputRef.current?.click()}>
              <FaVideo /> Video
            </button>
            <button type="button" className="edit-post-upload-btn" onClick={() => fileInputRef.current?.click()}>
              <FaFileAlt /> File
            </button>
            <input type="file" accept="image/*" multiple ref={imageInputRef} onChange={handleFileChange} hidden />
            <input type="file" accept="video/*" multiple ref={videoInputRef} onChange={handleFileChange} hidden />
            <input type="file" accept={DOCUMENT_FILE_ACCEPT} multiple ref={fileInputRef} onChange={handleFileChange} hidden />
          </div>

          {error && <p className="edit-post-error">{error}</p>}

          <div className="edit-post-actions">
            <button type="button" className="edit-post-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              className="edit-post-save"
              disabled={saving || !canSave}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default EditPostModal;
