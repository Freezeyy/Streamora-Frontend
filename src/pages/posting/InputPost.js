import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaImage, FaVideo, FaFileAlt, FaTimes, FaAt } from 'react-icons/fa';
import MentionPickerList from './MentionPickerList';
import useMentionSearch from './hooks/useMentionSearch';
import { getMentionToken, getTextareaCaretPosition } from './mentionUtils';
import { getFileLabel, DOCUMENT_FILE_ACCEPT } from './postUtils';
import FileAttachmentCard from './FileAttachmentCard';
import './css/InputPost.css';

const InputPost = ({ createPost, creating, error, composerLabel }) => {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [inlineMentionQuery, setInlineMentionQuery] = useState('');
  const [inlineMentionStart, setInlineMentionStart] = useState(null);
  const [inlineMentionOpen, setInlineMentionOpen] = useState(false);
  const [panelMentionOpen, setPanelMentionOpen] = useState(false);
  const [panelMentionQuery, setPanelMentionQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [inlineDropdownPos, setInlineDropdownPos] = useState({ top: 0, left: 0 });

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mentionAnchorRef = useRef(null);
  const mentionPanelRef = useRef(null);

  const inlineSearchEnabled = inlineMentionOpen && inlineMentionQuery.trim().length > 0;
  const panelSearchEnabled = panelMentionOpen;
  const panelMentionScope = panelMentionQuery.trim().length > 0 ? 'all' : 'following';

  const { results: inlineResults, loading: inlineLoading } = useMentionSearch(
    inlineMentionQuery,
    { enabled: inlineSearchEnabled },
  );
  const { results: panelResults, loading: panelLoading } = useMentionSearch(
    panelMentionQuery,
    { enabled: panelSearchEnabled, scope: panelMentionScope },
  );

  const activeResults = panelMentionOpen ? panelResults : inlineResults;

  useEffect(() => {
    const urls = selectedFiles.map((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [selectedFiles]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [inlineMentionQuery, panelMentionQuery, panelMentionOpen, inlineMentionOpen]);

  const updateInlineDropdownPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !inlineMentionOpen) return;

    const caret = getTextareaCaretPosition(textarea, textarea.selectionStart);
    setInlineDropdownPos({
      top: caret.top + caret.height + 4,
      left: caret.left,
    });
  }, [inlineMentionOpen]);

  useEffect(() => {
    if (!inlineMentionOpen) return undefined;

    updateInlineDropdownPosition();

    const textarea = textareaRef.current;
    if (!textarea) return undefined;

    const handleReposition = () => updateInlineDropdownPosition();
    textarea.addEventListener('scroll', handleReposition);
    window.addEventListener('resize', handleReposition);

    return () => {
      textarea.removeEventListener('scroll', handleReposition);
      window.removeEventListener('resize', handleReposition);
    };
  }, [inlineMentionOpen, text, inlineMentionQuery, inlineMentionStart, updateInlineDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mentionAnchorRef.current?.contains(event.target)) return;
      if (mentionPanelRef.current?.contains(event.target)) return;
      setPanelMentionOpen(false);
      setInlineMentionOpen(false);
      setInlineMentionStart(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMentionUi = () => {
    setInlineMentionOpen(false);
    setInlineMentionStart(null);
    setInlineMentionQuery('');
    setPanelMentionOpen(false);
    setPanelMentionQuery('');
    setHighlightedIndex(0);
  };

  const insertMention = (user) => {
    const token = `${getMentionToken(user)} `;
    const textarea = textareaRef.current;
    if (!textarea) return;

    let nextText = text;
    let cursorPos = textarea.selectionStart;

    if (inlineMentionOpen && inlineMentionStart !== null) {
      const end = textarea.selectionStart;
      nextText = text.slice(0, inlineMentionStart) + token + text.slice(end);
      cursorPos = inlineMentionStart + token.length;
    } else {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      nextText = text.slice(0, start) + token + text.slice(end);
      cursorPos = start + token.length;
    }

    setText(nextText);
    closeMentionUi();

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const detectInlineMention = (value, cursor) => {
    const beforeCursor = value.slice(0, cursor);
    const match = beforeCursor.match(/@([\w.]*)$/);

    if (match) {
      setInlineMentionOpen(true);
      setInlineMentionStart(cursor - match[0].length);
      setInlineMentionQuery(match[1]);
      setPanelMentionOpen(false);
      return;
    }

    setInlineMentionOpen(false);
    setInlineMentionStart(null);
    setInlineMentionQuery('');
  };

  const handleTextChange = (e) => {
    const { value, selectionStart } = e.target;
    setText(value);
    detectInlineMention(value, selectionStart);
  };

  const handleTextKeyDown = (e) => {
    const mentionOpen = inlineMentionOpen || panelMentionOpen;
    if (!mentionOpen || !activeResults.length) {
      if (e.key === 'Escape') closeMentionUi();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % activeResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + activeResults.length) % activeResults.length);
    } else if (e.key === 'Enter' && (inlineMentionOpen || panelMentionOpen)) {
      e.preventDefault();
      insertMention(activeResults[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeMentionUi();
    }
  };

  const toggleMentionPanel = () => {
    setPanelMentionOpen((prev) => !prev);
    setInlineMentionOpen(false);
    setInlineMentionStart(null);
    setInlineMentionQuery('');
    if (!panelMentionOpen) {
      setPanelMentionQuery('');
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    closeMentionUi();

    if (!text.trim() && selectedFiles.length === 0) {
      alert('Please enter some text or upload at least one file to post.');
      return;
    }

    const result = await createPost(text, selectedFiles);

    if (result) {
      setText('');
      setSelectedFiles([]);
    }
  };

  const renderErrorMessage = (err) => {
    if (!err) return null;
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    return 'An unknown error occurred';
  };

  const mentionUiOpen = inlineMentionOpen || panelMentionOpen;

  return (
    <form
      onSubmit={handleSubmit}
      className={`post-form ice-card${mentionUiOpen ? ' mention-ui-open' : ''}${panelMentionOpen ? ' mention-panel-open' : ''}`}
    >
      <div className="form-group mention-anchor" ref={mentionAnchorRef}>
        <div className="mention-textarea-wrap">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleTextKeyDown}
            onClick={(e) => detectInlineMention(e.target.value, e.target.selectionStart)}
            onSelect={updateInlineDropdownPosition}
            onScroll={updateInlineDropdownPosition}
            placeholder="What's on your mind?"
            rows="4"
            className="form-control glass-input text-area"
          />

          {inlineMentionOpen && (
            <div
              className="mention-dropdown mention-surface"
              style={{ top: inlineDropdownPos.top, left: inlineDropdownPos.left }}
            >
              <div className="mention-picker-scroll">
                <MentionPickerList
                  users={inlineResults}
                  loading={inlineLoading}
                  highlightedIndex={highlightedIndex}
                  emptyMessage={inlineMentionQuery ? 'No users found' : 'Type a name to search'}
                  onSelect={insertMention}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="icon-buttons">
        <FaImage className="upload-icon" onClick={() => imageInputRef.current.click()} title="Add image" />
        <FaVideo className="upload-icon" onClick={() => videoInputRef.current.click()} title="Add video" />
        <FaFileAlt className="upload-icon" onClick={() => fileInputRef.current.click()} title="Add file" />

        <div className="mention-icon-wrap" ref={mentionPanelRef}>
          <FaAt
            className={`upload-icon${panelMentionOpen ? ' upload-icon--active' : ''}`}
            onClick={toggleMentionPanel}
            title="Mention someone"
          />

          {panelMentionOpen && (
            <div className="mention-panel mention-surface">
              <input
                type="text"
                className="mention-search glass-input"
                placeholder="Search people…"
                value={panelMentionQuery}
                onChange={(e) => setPanelMentionQuery(e.target.value)}
                onKeyDown={handleTextKeyDown}
                autoFocus
              />
              <div className="mention-picker-scroll">
                <MentionPickerList
                  users={panelResults}
                  loading={panelLoading}
                  highlightedIndex={highlightedIndex}
                  emptyMessage={
                    panelMentionQuery
                      ? 'No users found'
                      : "You're not following anyone yet"
                  }
                  onSelect={insertMention}
                />
              </div>
            </div>
          )}
        </div>

        <input type="file" accept="image/*" multiple ref={imageInputRef} onChange={handleFileChange} className="hidden-input" />
        <input type="file" accept="video/*" multiple ref={videoInputRef} onChange={handleFileChange} className="hidden-input" />
        <input type="file" accept={DOCUMENT_FILE_ACCEPT} multiple ref={fileInputRef} onChange={handleFileChange} className="hidden-input" />
      </div>

      {selectedFiles.length > 0 && (
        <div className="file-preview-container glass-inset">
          <p className="preview-label">Attachments ({selectedFiles.length})</p>
          <div className="file-preview-grid">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="file-preview-item">
                <div className="preview-media-wrap">
                  {file.type.startsWith('image/') && previewUrls[index] && (
                    <img src={previewUrls[index]} alt="" className="preview-thumbnail" />
                  )}
                  {file.type.startsWith('video/') && previewUrls[index] && (
                    <video src={previewUrls[index]} className="preview-thumbnail" muted />
                  )}
                  {!file.type.startsWith('image/') && !file.type.startsWith('video/') && (
                    <FileAttachmentCard fileName={file.name} className="file-attachment-card--preview" />
                  )}
                </div>
                <div className="preview-meta">
                  <span className="preview-type">{getFileLabel(file)}</span>
                  <button type="button" className="remove-btn" onClick={() => handleRemoveFile(index)} aria-label="Remove file">
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button type="submit" className="submit-btn" disabled={creating}>
        {creating ? 'Posting...' : 'Post'}
      </button>

      {composerLabel && (
        <p className="composer-hint">{composerLabel}</p>
      )}

      {error && <div className="error-message">{renderErrorMessage(error)}</div>}
    </form>
  );
};

export default InputPost;
