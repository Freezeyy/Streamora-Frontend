import React, {
  useEffect, useCallback, useState, useRef,
} from 'react';
import { createPortal } from 'react-dom';
import StoryTextOverlays from './StoryTextOverlays';
import { getMediaTransform } from './storyOverlays';
import './StoryViewer.css';

import { API_BASE } from '../../config/api';
const STORY_DURATION_MS = 7000;
const REPLAY_THRESHOLD = 15;
const HOLD_THRESHOLD_MS = 200;

const getAvatarSrc = (user, getInitials) => {
  if (user?.image) return user.image;
  if (user?.name) {
    return `https://ui-avatars.com/api/?name=${getInitials(user.name)}&background=random&color=random&size=128`;
  }
  return null;
};

const StoryViewer = ({
  groups,
  groupIndex,
  storyIndex,
  onClose,
  onNavigate,
}) => {
  const [progress, setProgress] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const group = groups[groupIndex];
  const story = group?.stories?.[storyIndex];

  const videoRef = useRef(null);
  const progressRef = useRef(0);
  const pointerDownAt = useRef(0);
  const isHoldingRef = useRef(false);
  const timerRefs = useRef({
    interval: null,
    timeout: null,
    remaining: STORY_DURATION_MS,
    startedAt: null,
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const clearPlaybackTimers = useCallback(() => {
    if (timerRefs.current.interval) clearInterval(timerRefs.current.interval);
    if (timerRefs.current.timeout) clearTimeout(timerRefs.current.timeout);
    timerRefs.current.interval = null;
    timerRefs.current.timeout = null;
    timerRefs.current.startedAt = null;
  }, []);

  const goNext = useCallback(() => {
    if (!group) return;

    if (storyIndex < group.stories.length - 1) {
      onNavigate(groupIndex, storyIndex + 1);
      return;
    }

    if (groupIndex < groups.length - 1) {
      onNavigate(groupIndex + 1, 0);
      return;
    }

    onClose();
  }, [group, groupIndex, storyIndex, groups.length, onNavigate, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      onNavigate(groupIndex, storyIndex - 1);
      return;
    }

    if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      onNavigate(groupIndex - 1, prevGroup.stories.length - 1);
    }
  }, [groupIndex, storyIndex, groups, onNavigate]);

  const replayCurrent = useCallback(() => {
    setReplayKey((key) => key + 1);
  }, []);

  const handleLeftAction = useCallback(() => {
    if (progressRef.current >= REPLAY_THRESHOLD) {
      replayCurrent();
    } else {
      goPrev();
    }
  }, [goPrev, replayCurrent]);

  const startPlayback = useCallback((fromRemaining = STORY_DURATION_MS) => {
    clearPlaybackTimers();

    const consumed = STORY_DURATION_MS - fromRemaining;
    setProgress((consumed / STORY_DURATION_MS) * 100);
    setIsPaused(false);

    timerRefs.current.remaining = fromRemaining;
    timerRefs.current.startedAt = Date.now();

    timerRefs.current.interval = setInterval(() => {
      const elapsed = Date.now() - timerRefs.current.startedAt;
      const total = consumed + elapsed;
      setProgress(Math.min((total / STORY_DURATION_MS) * 100, 100));
    }, 50);

    timerRefs.current.timeout = setTimeout(goNext, fromRemaining);

    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [goNext, clearPlaybackTimers]);

  const pausePlayback = useCallback(() => {
    if (!timerRefs.current.startedAt) return;

    const elapsed = Date.now() - timerRefs.current.startedAt;
    timerRefs.current.remaining = Math.max(0, timerRefs.current.remaining - elapsed);
    clearPlaybackTimers();
    setIsPaused(true);

    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [clearPlaybackTimers]);

  const resumePlayback = useCallback(() => {
    if (timerRefs.current.remaining <= 0) return;
    startPlayback(timerRefs.current.remaining);
  }, [startPlayback]);

  useEffect(() => {
    startPlayback(STORY_DURATION_MS);
    return clearPlaybackTimers;
  }, [groupIndex, storyIndex, replayKey, startPlayback, clearPlaybackTimers]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') handleLeftAction();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, goNext, handleLeftAction]);

  if (!group || !story) return null;

  const mediaUrl = `${API_BASE}${story.media_path}`;
  const avatarSrc = getAvatarSrc(group.user, getInitials);
  const mediaTransform = getMediaTransform(story.overlays);
  const mediaStyle = {
    transform: `translate(${mediaTransform.x}%, ${mediaTransform.y}%) scale(${mediaTransform.scale})`,
  };

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    pointerDownAt.current = Date.now();
    isHoldingRef.current = true;
    pausePlayback();
  };

  const handlePointerUp = () => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    resumePlayback();
  };

  const handleStageClick = (e) => {
    const heldFor = Date.now() - pointerDownAt.current;
    if (heldFor >= HOLD_THRESHOLD_MS) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < rect.width * 0.3) {
      handleLeftAction();
    } else {
      goNext();
    }
  };

  return createPortal(
    <div className="story-viewer-backdrop" role="dialog" aria-modal="true">
      <div className="story-viewer">
        <div className="story-viewer-progress-row">
          {group.stories.map((s, i) => (
            <div key={s.id} className="story-viewer-progress-track">
              <div
                className="story-viewer-progress-fill"
                style={{
                  width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%',
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
              />
            </div>
          ))}
        </div>

        <div className="story-viewer-header">
          {avatarSrc && (
            <img src={avatarSrc} alt="" className="story-viewer-header-avatar" />
          )}
          <span className="story-viewer-header-name">{group.user.name}</span>
          <button type="button" className="story-viewer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div
          className={`story-stage story-viewer-stage ${isPaused ? 'story-viewer-stage--paused' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleStageClick}
        >
          {story.media_type === 'video' ? (
            <video
              ref={videoRef}
              key={`${story.id}-${replayKey}`}
              src={mediaUrl}
              className="story-stage-media"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <div className="story-stage-media-layer">
              <div className="story-stage-media-transform" style={mediaStyle}>
                <img
                  key={`${story.id}-${replayKey}`}
                  src={mediaUrl}
                  alt={`${group.user.name} story`}
                  className="story-stage-media"
                />
              </div>
            </div>
          )}
          <StoryTextOverlays overlays={story.overlays} />
        </div>

        <p className="story-viewer-hint">
          Hold to pause · Tap left to go back/replay · Tap right for next · Esc to close
        </p>
      </div>
    </div>,
    document.body,
  );
};

export default StoryViewer;
