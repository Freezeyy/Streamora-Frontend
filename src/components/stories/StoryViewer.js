import React, {
  useEffect, useCallback, useState, useRef,
} from 'react';
import { createPortal } from 'react-dom';
import StoryTextOverlays from './StoryTextOverlays';
import { getMediaTransform } from './storyOverlays';
import { MAX_STORY_VIDEO_SECONDS } from './storyMediaUtils';
import './StoryViewer.css';

import { API_BASE } from '../../config/api';

const IMAGE_DURATION_MS = 7000;
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
  const [mediaReady, setMediaReady] = useState(false);
  const [durationMs, setDurationMs] = useState(IMAGE_DURATION_MS);

  const group = groups[groupIndex];
  const story = group?.stories?.[storyIndex];
  const isVideo = story?.media_type === 'video';

  const videoRef = useRef(null);
  const progressRef = useRef(0);
  const pointerDownAt = useRef(0);
  const isHoldingRef = useRef(false);
  const durationMsRef = useRef(IMAGE_DURATION_MS);
  const mediaReadyRef = useRef(false);
  const timerRefs = useRef({
    interval: null,
    timeout: null,
    remaining: IMAGE_DURATION_MS,
    startedAt: null,
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    durationMsRef.current = durationMs;
  }, [durationMs]);

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
    setProgress(0);
    clearPlaybackTimers();

    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!isHoldingRef.current) {
        videoRef.current.play().catch(() => {});
      }
      return;
    }

    setReplayKey((key) => key + 1);
  }, [isVideo, clearPlaybackTimers]);

  const handleLeftAction = useCallback(() => {
    if (progressRef.current >= REPLAY_THRESHOLD) {
      replayCurrent();
    } else {
      goPrev();
    }
  }, [goPrev, replayCurrent]);

  const startImagePlayback = useCallback((fromRemaining = durationMsRef.current) => {
    clearPlaybackTimers();

    const totalDuration = durationMsRef.current;
    const consumed = totalDuration - fromRemaining;
    setProgress((consumed / totalDuration) * 100);
    setIsPaused(false);

    timerRefs.current.remaining = fromRemaining;
    timerRefs.current.startedAt = Date.now();

    timerRefs.current.interval = setInterval(() => {
      const elapsed = Date.now() - timerRefs.current.startedAt;
      const total = consumed + elapsed;
      setProgress(Math.min((total / totalDuration) * 100, 100));
    }, 50);

    timerRefs.current.timeout = setTimeout(goNext, fromRemaining);
  }, [goNext, clearPlaybackTimers]);

  const pausePlayback = useCallback(() => {
    if (isVideo) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPaused(true);
      return;
    }

    if (!timerRefs.current.startedAt) return;

    const elapsed = Date.now() - timerRefs.current.startedAt;
    timerRefs.current.remaining = Math.max(0, timerRefs.current.remaining - elapsed);
    clearPlaybackTimers();
    setIsPaused(true);
  }, [isVideo, clearPlaybackTimers]);

  const resumePlayback = useCallback(() => {
    if (isVideo) {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      setIsPaused(false);
      return;
    }

    if (timerRefs.current.remaining <= 0) return;
    startImagePlayback(timerRefs.current.remaining);
  }, [isVideo, startImagePlayback]);

  useEffect(() => {
    setProgress(0);
    setMediaReady(false);
    mediaReadyRef.current = false;
    setIsPaused(false);
    setDurationMs(IMAGE_DURATION_MS);
    timerRefs.current.remaining = IMAGE_DURATION_MS;
    clearPlaybackTimers();
  }, [groupIndex, storyIndex, replayKey, clearPlaybackTimers]);

  useEffect(() => {
    if (!mediaReady || isPaused || isVideo) return undefined;
    startImagePlayback(durationMs);
    return clearPlaybackTimers;
  }, [mediaReady, isPaused, isVideo, durationMs, startImagePlayback, clearPlaybackTimers]);

  useEffect(() => {
    if (!mediaReady || isPaused || !isVideo || !videoRef.current) return undefined;

    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});

    return undefined;
  }, [mediaReady, isPaused, isVideo, groupIndex, storyIndex, replayKey]);

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

  const handleImageLoad = () => {
    if (mediaReadyRef.current) return;
    mediaReadyRef.current = true;
    setDurationMs(IMAGE_DURATION_MS);
    setMediaReady(true);
  };

  const handleVideoLoaded = (event) => {
    if (mediaReadyRef.current) return;

    const video = event.currentTarget;
    const rawSeconds = Number.isFinite(video.duration) ? video.duration : MAX_STORY_VIDEO_SECONDS;
    const seconds = Math.min(Math.max(rawSeconds, 0.1), MAX_STORY_VIDEO_SECONDS);
    mediaReadyRef.current = true;
    setDurationMs(seconds * 1000);
    setMediaReady(true);
  };

  const handleVideoTimeUpdate = () => {
    if (!mediaReadyRef.current || isPaused || !videoRef.current) return;

    const totalSeconds = durationMsRef.current / 1000;
    if (!totalSeconds) return;

    if (videoRef.current.currentTime >= totalSeconds) {
      goNext();
      return;
    }

    setProgress(Math.min((videoRef.current.currentTime / totalSeconds) * 100, 100));
  };

  const handleVideoEnded = () => {
    if (!isPaused) {
      goNext();
    }
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('.story-viewer-header, .story-viewer-close')) return;
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
    if (e.target.closest('.story-viewer-header, .story-viewer-close')) return;
    if (!mediaReady) return;

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
        <div
          className={`story-stage story-viewer-stage ${isPaused ? 'story-viewer-stage--paused' : ''} ${!mediaReady ? 'story-viewer-stage--loading' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleStageClick}
        >
          <div className="story-viewer-chrome">
            <div className="story-viewer-progress-row">
              {group.stories.map((s, i) => (
                <div key={s.id} className="story-viewer-progress-track">
                  <div
                    className="story-viewer-progress-fill"
                    style={{
                      width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%',
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
              <button
                type="button"
                className="story-viewer-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          {!mediaReady && (
            <div className="story-viewer-loading" aria-hidden="true">
              <span className="story-viewer-loading-spinner" />
            </div>
          )}

          {story.media_type === 'video' ? (
            <video
              ref={videoRef}
              key={`${story.id}-${replayKey}`}
              src={mediaUrl}
              className="story-stage-media"
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={handleVideoLoaded}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
            />
          ) : (
            <div className="story-stage-media-layer">
              <div className="story-stage-media-transform" style={mediaStyle}>
                <img
                  key={`${story.id}-${replayKey}`}
                  src={mediaUrl}
                  alt={`${group.user.name} story`}
                  className="story-stage-media"
                  onLoad={handleImageLoad}
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
