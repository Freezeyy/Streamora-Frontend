import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaEllipsisH } from 'react-icons/fa';
import './css/MentionText.css';

const PostMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = 140;
    const padding = 12;
    let left = rect.right - width;

    if (left < padding) left = padding;
    if (left + width > window.innerWidth - padding) {
      left = window.innerWidth - width - padding;
    }

    setPosition({
      top: rect.bottom + 6,
      left,
    });
  };

  useEffect(() => {
    if (!open) return undefined;

    updatePosition();

    const handleReposition = () => updatePosition();
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      if (dropdownRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleEdit = () => {
    setOpen(false);
    onEdit?.();
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete?.();
  };

  const toggleMenu = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className={`post-menu${open ? ' post-menu--open' : ''}`} ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        className="post-menu-trigger"
        onClick={toggleMenu}
        aria-label="Post options"
        aria-expanded={open}
      >
        <FaEllipsisH />
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="post-menu-dropdown post-menu-dropdown--portal mention-surface"
          style={{ top: position.top, left: position.left }}
        >
          {onEdit && (
            <button type="button" className="post-menu-item" onClick={handleEdit}>
              Edit
            </button>
          )}
          {onDelete && (
            <button type="button" className="post-menu-item post-menu-item--danger" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
};

export default PostMenu;
