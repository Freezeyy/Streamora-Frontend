import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import './css/LikesModal.css';

const API_BASE = 'http://localhost:3000';

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

const LikesModal = ({ postId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !postId) return undefined;

    const fetchLikers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/posts/${postId}/likes`);
        setLikers(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLikers();
    return () => {
      setLikers([]);
      setError(null);
    };
  }, [isOpen, postId]);

  if (!isOpen) return null;

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  return createPortal(
    <div className="likes-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="likes-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="likes-modal-title"
      >
        <div className="likes-modal-header">
          <h2 id="likes-modal-title">Likes</h2>
          <button type="button" className="likes-modal-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="likes-modal-body">
          {loading && <p className="likes-modal-status">Loading...</p>}
          {error && <p className="likes-modal-status likes-modal-error">{error}</p>}

          {!loading && !error && likers.length === 0 && (
            <p className="likes-modal-status">No likes yet</p>
          )}

          {!loading && !error && likers.length > 0 && (
            <ul className="likes-modal-list">
              {likers.map((like) => {
                const user = like.user;
                if (!user) return null;

                return (
                  <li key={like.id}>
                    <button
                      type="button"
                      className="likes-modal-user"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <img
                        src={getAvatarSrc(user)}
                        alt={user.name}
                        className="likes-modal-avatar"
                      />
                      <span className="likes-modal-name">{user.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LikesModal;
