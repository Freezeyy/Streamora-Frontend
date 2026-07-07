import React, { useEffect, useState, useMemo, useCallback } from 'react';

import useStories from './hooks/useStories';
import CreateStory from './CreateStory';
import StoryViewer from './StoryViewer';
import StoryRing from './StoryRing';
import './StoriesBar.css';
import './StoryViewer.css';

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const getAvatarSrc = (user) => {
  if (user?.image) return user.image;
  if (user?.name) {
    return `https://ui-avatars.com/api/?name=${getInitials(user.name)}&background=random&color=random&size=128`;
  }
  return null;
};

const StoriesBar = () => {
  const {
    storyGroups,
    loading,
    creating,
    deleting,
    error,
    fetchStoryFeed,
    createStory,
    deleteStory,
  } = useStories();

  const [viewer, setViewer] = useState(null);
  const [localError, setLocalError] = useState(null);
  const loggedInUserId = localStorage.getItem("user`s Id");

  const { ownStoryGroup, otherStoryGroups } = useMemo(() => {
    const own = storyGroups.find(
      (group) => String(group.user.id) === String(loggedInUserId),
    );
    const others = storyGroups.filter(
      (group) => String(group.user.id) !== String(loggedInUserId),
    );
    return { ownStoryGroup: own, otherStoryGroups: others };
  }, [storyGroups, loggedInUserId]);

  useEffect(() => {
    fetchStoryFeed();
  }, [fetchStoryFeed]);

  const openOwnStories = () => {
    if (!ownStoryGroup) return;
    setViewer({
      groups: [ownStoryGroup],
      groupIndex: 0,
      storyIndex: 0,
      isOwn: true,
    });
  };

  const openOtherStory = (groupIndex) => {
    setViewer({
      groups: otherStoryGroups,
      groupIndex,
      storyIndex: 0,
      isOwn: false,
    });
  };

  const handleDeleteStory = useCallback(async (storyId) => {
    const currentViewer = viewer;
    if (!currentViewer?.isOwn) return false;

    const result = await deleteStory(storyId);
    if (!result.ok) return false;

    const updatedOwnGroup = (result.groups || []).find(
      (group) => String(group.user.id) === String(loggedInUserId),
    );

    if (!updatedOwnGroup?.stories?.length) {
      setViewer(null);
      return true;
    }

    const nextIndex = Math.min(
      currentViewer.storyIndex,
      updatedOwnGroup.stories.length - 1,
    );

    setViewer({
      groups: [updatedOwnGroup],
      groupIndex: 0,
      storyIndex: nextIndex,
      isOwn: true,
    });

    return true;
  }, [viewer, deleteStory, loggedInUserId]);

  const hasOtherStories = otherStoryGroups.length > 0;

  return (
    <section className="stories-section ice-card">
      <h2 className="stories-section-title">Stories</h2>
      <div className="stories-row">
        <div className="stories-row-own">
          <CreateStory
            onCreate={createStory}
            creating={creating}
            ownStoryCount={ownStoryGroup?.stories?.length || 0}
            onViewOwnStories={openOwnStories}
            onValidationError={setLocalError}
          />
        </div>

        {loading && !hasOtherStories && !ownStoryGroup && (
          <p className="stories-status">Loading stories...</p>
        )}

        {hasOtherStories && (
          <div className="story-rings-scroll">
            <div className="story-rings-row">
              {otherStoryGroups.map((group, groupIndex) => {
              const avatarSrc = getAvatarSrc(group.user);
              const storyCount = group.stories?.length || 0;

              return (
                <button
                  key={group.user.id}
                  type="button"
                  className="story-ring-button"
                  onClick={() => openOtherStory(groupIndex)}
                >
                  <StoryRing count={storyCount}>
                    {avatarSrc && (
                      <img
                        src={avatarSrc}
                        alt={group.user.name}
                        className="story-avatar"
                      />
                    )}
                  </StoryRing>
                  <span className="story-ring-label">{group.user.name}</span>
                </button>
              );
            })}
            </div>
          </div>
        )}
      </div>

      {viewer && (
        <StoryViewer
          groups={viewer.groups}
          groupIndex={viewer.groupIndex}
          storyIndex={viewer.storyIndex}
          canDelete={viewer.isOwn}
          deleting={deleting}
          onDelete={handleDeleteStory}
          onClose={() => setViewer(null)}
          onNavigate={(groupIndex, storyIndex) => (
            setViewer((prev) => ({ ...prev, groupIndex, storyIndex }))
          )}
        />
      )}

      {error && <p className="stories-error">{error}</p>}
      {localError && <p className="stories-error">{localError}</p>}
      {!loading && !hasOtherStories && (
        <p className="stories-hint">
          Follow people to see their stories here. Stories expire after 24 hours.
        </p>
      )}
    </section>
  );
};

export default StoriesBar;
