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
  const postState = usePost(isProfileMode || isGroupMode);

  useEffect(() => {
    if (isProfileMode) {
      postState.setPosts(profilePosts ?? []);
    } else if (isGroupMode) {
      postState.setPosts(groupPosts ?? []);
    }
  }, [isProfileMode, isGroupMode, profilePosts, groupPosts, postState.setPosts]);

  const handleDeletePost = async (postId) => {
    const success = await postState.deletePost(postId);
    if (success) {
      if (isProfileMode) onPostsMutated?.();
      if (isGroupMode) onPostsRefresh?.();
    }
    return success;
  };

  const handleUpdatePost = async (postId, payload) => {
    const result = await postState.updatePost(postId, payload);
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
    return postState.createPost(text, files);
  };

  const loading = isGroupMode ? postsLoading : (isProfileMode ? false : postState.loading);

  return (
    <>
      {showComposer && (
        <InputPost
          createPost={handleCreate}
          creating={postState.creating}
          error={postState.error}
          composerLabel={isGroupMode ? 'Post to group (requires admin approval)' : undefined}
        />
      )}
      <OutputPost
        name={name}
        loggedInUserId={isProfileMode ? null : loggedInUserId}
        posts={postState.posts}
        loading={loading}
        error={postState.error}
        fetchPosts={isGroupMode ? undefined : postState.fetchPosts}
        toggleLike={postState.toggleLike}
        addComment={postState.addComment}
        updatePost={handleUpdatePost}
        deletePost={handleDeletePost}
        canModerateGroup={canModerateGroup}
        setPosts={postState.setPosts}
      />
    </>
  );
};

export default PostFeed;
