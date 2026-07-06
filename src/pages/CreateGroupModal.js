import React, { useState } from 'react';
import './css/CreateGroupModal.css';

const CreateGroupModal = ({ isOpen, onClose, onCreate, saving, error }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const result = await onCreate({
      name: name.trim(),
      description: description.trim(),
      is_private: isPrivate,
    });
    if (result) {
      setName('');
      setDescription('');
      setIsPrivate(false);
      onClose();
    }
  };

  return (
    <div className="create-group-backdrop" onClick={onClose} role="presentation">
      <div className="create-group-modal ice-card" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2 className="create-group-title">Create a group</h2>
        <p className="create-group-desc">
          You&apos;ll be the group creator. Members&apos; posts need admin approval before they appear.
        </p>

        {error && <p className="create-group-error">{error}</p>}

        <form onSubmit={handleSubmit} className="create-group-form">
          <label className="create-group-label">
            Group name
            <input
              className="glass-input create-group-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anime Club"
              maxLength={120}
              required
            />
          </label>

          <label className="create-group-label">
            Description
            <textarea
              className="glass-input create-group-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={3}
            />
          </label>

          <label className="create-group-checkbox">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <span>Private group — users must request to join and be approved</span>
          </label>

          <div className="create-group-actions">
            <button type="button" className="create-group-btn create-group-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-group-btn create-group-btn--primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
