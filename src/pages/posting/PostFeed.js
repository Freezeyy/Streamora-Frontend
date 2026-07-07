import React, { useEffect } from 'react';
import usePost from './hooks/usePost';
import InputPost from './InputPost';
import OutputPost from './OutputPost';

const PostFeed = ({
  loggedInUserId,
  showComposer = true,
  profilePosts,
  name,
  onPostsMutated,
  groupId,
  groupPosts,
  postsLoading,
  createGroupPost,
  onPostsRefresh,
  canModerateGroup = false,
}) => {
  const isProfileMode = profilePosts != null;
  const isGroupMode = Boolean(groupId);
  const {
    setPosts,
    deletePost,
    updatePost,
    createPost,
    loading: feedLoading,
    creating,
    error,
    posts,
    fetchPosts,
    toggleLike,
    addComment,
  } = usePost(isProfileMode || isGroupMode);

  useEffect(() => {
    if (isProfileMode) {
      setPosts(profilePosts ?? []);
    } else if (isGroupMode) {
      setPosts(groupPosts ?? []);
    }
  }, [isProfileMode, isGroupMode, profilePosts, groupPosts, setPosts]);

  const handleDeletePost = async (postId) => {
    const success = await deletePost(postId);
    if (success) {
      if (isProfileMode) onPostsMutated?.();
      if (isGroupMode) onPostsRefresh?.();
    }
    return success;
  };

  const handleUpdatePost = async (postId, payload) => {
    const result = await updatePost(postId, payload);
    if (result) {
      if (isProfileMode) onPostsMutated?.();
      if (isGroupMode) onPostsRefresh?.();
    }
    return result;
  };

  const handleCreate = async (text, files) => {
    if (isGroupMode && createGroupPost) {
      return createGroupPost(text, files);
    }
    return createPost(text, files);
  };

  const loading = isGroupMode ? postsLoading : (isProfileMode ? false : feedLoading);

  return (
    <>
      {showComposer && (
        <InputPost
          createPost={handleCreate}
          creating={creating}
          error={error}
          composerLabel={isGroupMode ? 'Post to group (requires admin approval)' : undefined}
        />
      )}
      <OutputPost
        name={name}
        loggedInUserId={isProfileMode ? null : loggedInUserId}
        posts={posts}
        loading={loading}
        error={error}
        fetchPosts={isGroupMode ? undefined : fetchPosts}
        toggleLike={toggleLike}
        addComment={addComment}
        updatePost={handleUpdatePost}
        deletePost={handleDeletePost}
        canModerateGroup={canModerateGroup}
        setPosts={setPosts}
      />
    </>
  );
};

export default PostFeed;
