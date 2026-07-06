import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/OutputPost.css';
import { FaRegThumbsUp, FaThumbsUp, FaComment } from 'react-icons/fa';
import LikesModal from './LikesModal';
import CommentsModal from './CommentsModal';
import MentionText from './MentionText';
import PostMenu from './PostMenu';
import EditPostModal from './EditPostModal';
import GroupPostMeta from './GroupPostMeta';
import FileAttachmentCard from './FileAttachmentCard';
import { API_BASE, getMediaCategory } from './postUtils';

const CURRENT_USER_ID = () => Number(localStorage.getItem("user`s Id"));

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const OutputPost = ({
  loggedInUserId,
  posts,
  loading,
  error,
  fetchPosts,
  toggleLike,
  addComment,
  updatePost,
  deletePost,
  name,
  canModerateGroup = false,
}) => {
  const navigate = useNavigate();
  const [likesModalPostId, setLikesModalPostId] = useState(null);
  const [commentsModalPost, setCommentsModalPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    if (fetchPosts) fetchPosts();
  }, [fetchPosts]);

  if (loading && posts.length === 0) {
    return <div className="posts-status ice-card">Loading posts...</div>;
  }

  if (error && posts.length === 0) {
    return <div className="posts-status posts-error ice-card">Error: {typeof error === 'string' ? error : 'Failed to load posts'}</div>;
  }

  const filteredPosts = loggedInUserId
    ? posts.filter((post) => Number(post.user_id) === Number(loggedInUserId))
    : posts;

  const currentUserId = CURRENT_USER_ID();

  const goToProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  const handleEditSave = async (postId, payload) => {
    setEditSaving(true);
    setEditError(null);
    const result = await updatePost(postId, payload);
    setEditSaving(false);
    if (!result) {
      setEditError('Failed to update post');
      return false;
    }
    return true;
  };

  const handleDeletePost = async (post) => {
    const isModeratorDelete = post.viewer_can_moderate
      && Number(post.user_id) !== Number(currentUserId);
    const confirmed = window.confirm(
      isModeratorDelete
        ? 'Remove this post from the group? This cannot be undone.'
        : 'Delete this post? This cannot be undone.',
    );
    if (!confirmed) return;

    const success = await deletePost(post.id);
    if (!success) {
      window.alert('Failed to delete post. Please try again.');
    }
  };

  const closeEditModal = () => {
    setEditingPost(null);
    setEditError(null);
  };

  return (
    <>
      <div className="posts-list">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const hasText = Boolean(post.content?.trim());
            const mediaItems = Array.isArray(post.media) ? post.media : [];
            const visualItems = mediaItems.filter((file) => getMediaCategory(file.media_path) !== 'file');
            const fileItems = mediaItems.filter((file) => getMediaCategory(file.media_path) === 'file');
            const userName = name || post.user?.name || 'Unknown user';
            const authorId = post.user?.id || post.user_id;
            const avatarSrc = post.user?.image
              ? post.user.image
              : `https://ui-avatars.com/api/?name=${getInitials(userName)}&background=random&color=random&size=128`;
            const likes = Array.isArray(post.likes) ? post.likes : [];
            const likeCount = likes.length;
            const comments = Array.isArray(post.comments) ? post.comments : [];
            const commentCount = comments.length;
            const isLiked = currentUserId
              ? likes.some((like) => Number(like.user_id) === currentUserId)
              : false;

            const isOwnPost = currentUserId
              && Number(authorId) === currentUserId;
            const canModeratePost = Boolean(
              post.viewer_can_moderate || (canModerateGroup && post.group_id),
            );
            const showPostMenu = (isOwnPost || canModeratePost) && deletePost;
            const canEditPost = isOwnPost && updatePost;

            return (
              <article key={post.id} className="post ice-card">
                <header className="post-header">
                  <button
                    type="button"
                    className="post-header-link"
                    onClick={() => goToProfile(authorId)}
                    disabled={!authorId}
                  >
                    <img src={avatarSrc} alt={userName} className="post-avatar" />
                    <span className="post-author">{userName}</span>
                  </button>

                  {showPostMenu && (
                    <PostMenu
                      onEdit={canEditPost ? () => setEditingPost(post) : undefined}
                      onDelete={() => handleDeletePost(post)}
                    />
                  )}
                </header>

                {post.group && <GroupPostMeta post={post} />}

                {hasText && (
                  <MentionText
                    text={post.content}
                    className="post-text"
                    onMentionClick={goToProfile}
                  />
                )}

                {visualItems.length > 0 && (
                  <div className={`post-media-grid glass-inset ${visualItems.length === 1 ? 'single' : 'multi'}`}>
                    {visualItems.map((file, index) => {
                      const mediaType = getMediaCategory(file.media_path);
                      const mediaUrl = `${API_BASE}${file.media_path}`;

                      return (
                        <div key={file.id || index} className="media-item">
                          {mediaType === 'image' && (
                            <img src={mediaUrl} alt="Post attachment" className="media-image" loading="lazy" />
                          )}
                          {mediaType === 'video' && (
                            <video src={mediaUrl} controls className="media-video" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {fileItems.length > 0 && (
                  <div className="post-file-list glass-inset">
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

                {likeCount > 0 && (
                  <button
                    type="button"
                    className="post-like-count"
                    onClick={() => setLikesModalPostId(post.id)}
                  >
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                  </button>
                )}

                {commentCount > 0 && (
                  <button
                    type="button"
                    className="post-comment-count"
                    onClick={() => setCommentsModalPost(post)}
                  >
                    {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                  </button>
                )}

                <footer className="post-actions">
                  <button
                    type="button"
                    className={`action-button${isLiked ? ' liked' : ''}`}
                    onClick={() => toggleLike(post.id)}
                  >
                    {isLiked ? (
                      <FaThumbsUp className="action-icon" />
                    ) : (
                      <FaRegThumbsUp className="action-icon" />
                    )}
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setCommentsModalPost(post)}
                  >
                    <FaComment className="action-icon" />
                    Comment{commentCount > 0 ? ` (${commentCount})` : ''}
                  </button>
                </footer>
              </article>
            );
          })
        ) : (
          <div className="posts-status ice-card">No posts yet. Be the first to share something!</div>
        )}
      </div>

      <LikesModal
        postId={likesModalPostId}
        isOpen={Boolean(likesModalPostId)}
        onClose={() => setLikesModalPostId(null)}
      />

      <CommentsModal
        name={name}
        post={commentsModalPost}
        isOpen={Boolean(commentsModalPost)}
        onClose={() => setCommentsModalPost(null)}
        addComment={addComment}
      />

      <EditPostModal
        post={editingPost}
        isOpen={Boolean(editingPost)}
        onClose={closeEditModal}
        onSave={handleEditSave}
        saving={editSaving}
        error={editError}
      />
    </>
  );
};

export default OutputPost;
