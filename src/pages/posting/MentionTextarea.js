import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaAt } from 'react-icons/fa';
import MentionPickerList from './MentionPickerList';
import useMentionSearch from './hooks/useMentionSearch';
import { getMentionToken, getTextareaCaretPosition } from './mentionUtils';
import './css/InputPost.css';
import './css/MentionTextarea.css';

const MentionTextarea = ({
  value,
  onChange,
  placeholder = '',
  rows = 3,
  className = '',
  disabled = false,
  showMentionPanel = true,
  onKeyDown,
  onMentionUiChange,
}) => {
  const [inlineMentionQuery, setInlineMentionQuery] = useState('');
  const [inlineMentionStart, setInlineMentionStart] = useState(null);
  const [inlineMentionOpen, setInlineMentionOpen] = useState(false);
  const [panelMentionOpen, setPanelMentionOpen] = useState(false);
  const [panelMentionQuery, setPanelMentionQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [inlineDropdownPos, setInlineDropdownPos] = useState({ top: 0, left: 0 });

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
  const mentionUiOpen = inlineMentionOpen || panelMentionOpen;

  useEffect(() => {
    onMentionUiChange?.(mentionUiOpen);
  }, [mentionUiOpen, onMentionUiChange]);

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
  }, [inlineMentionOpen, value, inlineMentionQuery, inlineMentionStart, updateInlineDropdownPosition]);

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

    let nextText = value;
    let cursorPos = textarea.selectionStart;

    if (inlineMentionOpen && inlineMentionStart !== null) {
      const end = textarea.selectionStart;
      nextText = value.slice(0, inlineMentionStart) + token + value.slice(end);
      cursorPos = inlineMentionStart + token.length;
    } else {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      nextText = value.slice(0, start) + token + value.slice(end);
      cursorPos = start + token.length;
    }

    onChange(nextText);
    closeMentionUi();

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const detectInlineMention = (text, cursor) => {
    const beforeCursor = text.slice(0, cursor);
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
    const { value: nextValue, selectionStart } = e.target;
    onChange(nextValue);
    detectInlineMention(nextValue, selectionStart);
  };

  const handleTextKeyDown = (e) => {
    const mentionOpen = inlineMentionOpen || panelMentionOpen;

    if (mentionOpen && activeResults.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % activeResults.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + activeResults.length) % activeResults.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(activeResults[highlightedIndex]);
        return;
      }
    }

    if (e.key === 'Escape' && mentionOpen) {
      e.preventDefault();
      closeMentionUi();
      return;
    }

    onKeyDown?.(e);
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

  return (
    <div
      className={`mention-textarea-root${mentionUiOpen ? ' mention-ui-open' : ''}${panelMentionOpen ? ' mention-panel-open' : ''}`}
    >
      <div className="mention-textarea-row">
        <div className="mention-anchor mention-textarea-anchor" ref={mentionAnchorRef}>
          <div className="mention-textarea-wrap">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextChange}
              onKeyDown={handleTextKeyDown}
              onClick={(e) => detectInlineMention(e.target.value, e.target.selectionStart)}
              onSelect={updateInlineDropdownPosition}
              onScroll={updateInlineDropdownPosition}
              placeholder={placeholder}
              rows={rows}
              className={className}
              disabled={disabled}
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

        {showMentionPanel && (
          <div className="mention-icon-wrap mention-textarea-icon" ref={mentionPanelRef}>
            <button
              type="button"
              className={`mention-textarea-at${panelMentionOpen ? ' mention-textarea-at--active' : ''}`}
              onClick={toggleMentionPanel}
              title="Mention someone"
              disabled={disabled}
            >
              <FaAt />
            </button>

            {panelMentionOpen && (
              <div className="mention-panel mention-surface mention-textarea-panel">
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
        )}
      </div>
    </div>
  );
};

export default MentionTextarea;
