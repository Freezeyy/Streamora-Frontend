import React from 'react';
import { getAvatarSrc } from './mentionUtils';

const MentionPickerList = ({
  users,
  loading,
  emptyMessage = 'No users found',
  onSelect,
  highlightedIndex = -1,
}) => {
  if (loading) {
    return <p className="mention-picker-status">Searching…</p>;
  }

  if (!users.length) {
    return <p className="mention-picker-status">{emptyMessage}</p>;
  }

  return (
    <ul className="mention-picker-list">
      {users.map((user, index) => (
        <li key={user.id}>
          <button
            type="button"
            className={`mention-picker-item${index === highlightedIndex ? ' mention-picker-item--active' : ''}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(user)}
          >
            <img
              src={getAvatarSrc(user)}
              alt={user.name}
              className="mention-picker-avatar"
            />
            <div className="mention-picker-info">
              <span className="mention-picker-name">{user.name}</span>
              {user.username && (
                <span className="mention-picker-username">@{user.username}</span>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default MentionPickerList;
