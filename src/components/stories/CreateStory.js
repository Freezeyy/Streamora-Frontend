import React, { useState, useRef } from 'react';
import { FaPlus } from 'react-icons/fa';
import useUserProfile from '../hooks/useUserProfile';
import StoryComposer from './StoryComposer';
import StoryRing from './StoryRing';

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const CreateStory = ({
  onCreate,
  creating,
  ownStoryCount = 0,
  onViewOwnStories,
}) => {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const userId = localStorage.getItem("user`s Id");
  const { profile } = useUserProfile(userId);

  const avatarSrc = profile?.image || profile?.imageUrl
    || (profile?.name
      ? `https://ui-avatars.com/api/?name=${getInitials(profile.name)}&background=random&color=random&size=128`
      : null);

  const hasOwnStories = ownStoryCount > 0;

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleAvatarClick = () => {
    if (hasOwnStories) {
      onViewOwnStories();
    } else {
      openFilePicker();
    }
  };

  const handlePlusClick = (e) => {
    e.stopPropagation();
    openFilePicker();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    e.target.value = '';
  };

  const handleComposerClose = () => {
    setSelectedFile(null);
  };

  const handleComposerSubmit = async (file, overlays) => {
    const result = await onCreate(file, overlays);
    if (result) {
      setSelectedFile(null);
    }
  };

  return (
    <>
      <div className="create-story">
        <div className="create-story-button">
          <div className="create-story-avatar-wrap">
            <button
              type="button"
              className="create-story-avatar-btn"
              onClick={handleAvatarClick}
              disabled={creating}
              aria-label={hasOwnStories ? 'View your stories' : 'Add story'}
            >
              <StoryRing count={hasOwnStories ? ownStoryCount : 0}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Your story" className="create-story-avatar" />
                ) : (
                  <div className="create-story-avatar placeholder" />
                )}
              </StoryRing>
            </button>
            <button
              type="button"
              className="create-story-plus"
              onClick={handlePlusClick}
              aria-label="Add story"
              disabled={creating}
            >
              <FaPlus />
            </button>
          </div>
          <span className="create-story-label">
            {creating ? 'Uploading...' : hasOwnStories ? 'Your story' : 'Add story'}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {selectedFile && (
        <StoryComposer
          file={selectedFile}
          onClose={handleComposerClose}
          onSubmit={handleComposerSubmit}
          submitting={creating}
        />
      )}
    </>
  );
};

export default CreateStory;
