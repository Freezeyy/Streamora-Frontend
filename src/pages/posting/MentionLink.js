import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getAvatarSrc } from './mentionUtils';
import useMentionProfile from './hooks/useMentionProfile';
import './css/MentionText.css';

const HIDE_DELAY_MS = 120;

const MentionLink = ({ username, label, onNavigate }) => {
  const anchorRef = useRef(null);
  const hideTimerRef = useRef(null);
  const { fetchProfile, loadingUser } = useMentionProfile();

  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [resolved, setResolved] = useState(false);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setOpen(false), HIDE_DELAY_MS);
  };

  const updatePosition = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cardWidth = 280;
    const padding = 12;
    let left = rect.left;
    const top = rect.bottom + 8;

    if (left + cardWidth > window.innerWidth - padding) {
      left = window.innerWidth - cardWidth - padding;
    }
    if (left < padding) left = padding;

    setPosition({ top, left });
  };

  const handleOpen = async () => {
    clearHideTimer();
    setOpen(true);
    updatePosition();

    const user = await fetchProfile(username);
    setProfile(user);
    setResolved(true);
  };

  const handleNavigate = async () => {
    let user = profile;
    if (!user) {
      user = await fetchProfile(username);
      setProfile(user);
      setResolved(true);
    }
    if (!user?.id) return;
    onNavigate?.(user.id);
  };

  useEffect(() => () => clearHideTimer(), []);

  useEffect(() => {
    if (!open) return undefined;

    const handleReposition = () => updatePosition();
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open]);

  const isLoading = open && loadingUser === username.toLowerCase();
  const bio = profile?.bio?.trim() || 'No bio yet.';

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className="mention-link"
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleHide}
        onFocus={handleOpen}
        onBlur={scheduleHide}
        onClick={handleNavigate}
      >
        {label}
      </button>

      {open && createPortal(
        <div
          className={`mention-hover-card${profile ? '' : ' mention-hover-card--static'}`}
          style={{ top: position.top, left: position.left }}
          onMouseEnter={clearHideTimer}
          onMouseLeave={scheduleHide}
          onClick={profile ? handleNavigate : undefined}
          role="presentation"
        >
          {isLoading && <p className="mention-hover-card__status">Loading…</p>}

          {!isLoading && resolved && !profile && (
            <p className="mention-hover-card__status">User not found</p>
          )}

          {!isLoading && profile && (
            <>
              <div className="mention-hover-card__header">
                <img
                  src={getAvatarSrc(profile)}
                  alt={profile.name}
                  className="mention-hover-card__avatar"
                />
                <div className="mention-hover-card__meta">
                  <span className="mention-hover-card__name">{profile.name}</span>
                  {profile.username && (
                    <span className="mention-hover-card__username">@{profile.username}</span>
                  )}
                </div>
              </div>
              <p className="mention-hover-card__bio">{bio}</p>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
};

export default MentionLink;
