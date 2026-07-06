import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import MentionText from './MentionText';
import MentionTextarea from './MentionTextarea';
import FileAttachmentCard from './FileAttachmentCard';
import { API_BASE, getMediaCategory } from './postUtils';
import './css/CommentsModal.css';

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const getAvatarSrc = (user, name) => {
  if (user?.image) return user.image;
  if (user?.name) {
    return `https://ui-avatars.com/api/?name=${getInitials(user.name)}&background=random&color=random&size=128`;
  }
  return `https://ui-avatars.com/api/?name=${getInitials(name)}&background=random&color=random&size=128`;
};

const PostMediaPane = ({ mediaItems }) => {
  const visualItems = mediaItems.filter((file) => getMediaCategory(file.media_path) !== 'file');
  const fileItems = mediaItems.filter((file) => getMediaCategory(file.media_path) === 'file');

  return (
    <div className="comments-modal-media">
      {visualItems.map((file, index) => {
        const mediaType = getMediaCategory(file.media_path);
        const mediaUrl = `${API_BASE}${file.media_path}`;

        return (
          <div key={file.id || index} className="comments-modal-media-item">
            {mediaType === 'image' && (
              <img src={mediaUrl} alt="Post attachment" className="comments-modal-media-image" />
            )}
            {mediaType === 'video' && (
              <video src={mediaUrl} controls className="comments-modal-media-video" />
            )}
          </div>
        );
      })}

      {fileItems.length > 0 && (
        <div className="comments-modal-file-list">
          {fileItems.map((file, index) => (
            <FileAttachmentCard
              key={file.id || index}
              href={`${API_BASE}${file.media_path}`}
              mediaPath={file.media_path}
              fileName={file.file_name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentsModal = ({ post, isOpen, onClose, addComment, name }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [mentionOpen, setMentionOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !post?.id) return undefined;

    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/posts/${post.id}/comments`);
        setComments(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
    return () => {
      setComments([]);
      setError(null);
      setDraft('');
      setSubmitError(null);
    };
  }, [isOpen, post?.id]);

  if (!isOpen || !post) return null;

  const mediaItems = Array.isArray(post.media) ? post.media : [];
  const hasMedia = mediaItems.length > 0;
  const userName = post.user?.name || name;
  const postAuthorId = post.user?.id || post.user_id;
  const hasText = Boolean(post.content?.trim());

  const formatCommentTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const goToProfile = (userId) => {
    if (!userId) return;
    onClose();
    navigate(`/profile/${userId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const newComment = await addComment(post.id, text);
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
        setDraft('');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.error || err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComposerKeyDown = (event) => {
    if (event.defaultPrevented) return;
    if (event.key === 'Enter' && !event.shiftKey && !mentionOpen) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return createPortal(
    <div className="comments-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`comments-modal ice-card${hasMedia ? ' comments-modal--with-media' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comments-modal-title"
      >
        <button type="button" className="comments-modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        {hasMedia && <PostMediaPane mediaItems={mediaItems} />}

        <div className="comments-modal-panel">
          <header className="comments-modal-post">
            <button
              type="button"
              className="comments-modal-user-link"
              onClick={() => goToProfile(postAuthorId)}
              disabled={!postAuthorId}
            >
              <div className="comments-modal-post-header">
                <img
                  src={getAvatarSrc(post.user, name)}
                  alt={userName}
                  className="comments-modal-avatar"
                />
                <span className="comments-modal-author" id="comments-modal-title">{userName}</span>
              </div>
            </button>
            {hasText && (
              <MentionText
                text={post.content}
                className="comments-modal-post-text"
                onMentionClick={goToProfile}
              />
            )}
          </header>

          <div className="comments-modal-list-wrap">
            {loading && <p className="comments-modal-status">Loading comments…</p>}
            {error && <p className="comments-modal-status comments-modal-error">{error}</p>}

            {!loading && !error && comments.length === 0 && (
              <p className="comments-modal-status">No comments yet. Start the conversation!</p>
            )}

            {!loading && !error && comments.length > 0 && (
              <ul className="comments-modal-list">
                {comments.map((item) => (
                  <li key={item.id} className="comments-modal-comment">
                    <button
                      type="button"
                      className="comments-modal-user-link comments-modal-user-link--comment"
                      onClick={() => goToProfile(item.user?.id || item.user_id)}
                      disabled={!item.user?.id && !item.user_id}
                    >
                      <img
                        src={getAvatarSrc(item.user)}
                        alt={item.user?.name || 'User'}
                        className="comments-modal-avatar"
                      />
                    </button>
                    <div className="comments-modal-comment-body">
                      <div className="comments-modal-comment-meta">
                        <button
                          type="button"
                          className="comments-modal-comment-author-btn"
                          onClick={() => goToProfile(item.user?.id || item.user_id)}
                          disabled={!item.user?.id && !item.user_id}
                        >
                          {item.user?.name || 'Unknown user'}
                        </button>
                        <time className="comments-modal-comment-time" dateTime={item.createdAt}>
                          {formatCommentTime(item.createdAt)}
                        </time>
                      </div>
                      <MentionText
                        text={item.comment}
                        className="comments-modal-comment-text"
                        onMentionClick={goToProfile}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form className="comments-modal-compose" onSubmit={handleSubmit}>
            <MentionTextarea
              value={draft}
              onChange={setDraft}
              placeholder="Write a comment… (@ to mention)"
              rows={3}
              className="comments-modal-input glass-input"
              disabled={submitting}
              showMentionPanel={false}
              onKeyDown={handleComposerKeyDown}
              onMentionUiChange={setMentionOpen}
            />
            <div className="comments-modal-compose-actions">
              <span className="comments-modal-compose-hint">
                Enter to post · Shift+Enter for new line
              </span>
              <button
                type="submit"
                className="comments-modal-submit"
                disabled={submitting || !draft.trim()}
              >
                {submitting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </form>

          {submitError && (
            <p className="comments-modal-status comments-modal-error">{submitError}</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CommentsModal;
