import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { buildOverlaysPayload } from './storyOverlays';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const MIN_SCALE = 1;
const MAX_SCALE = 3;

const DraggableText = ({
  overlay,
  isActive,
  onSelect,
  onChange,
  onRemove,
  containerRef,
}) => {
  const dragState = useRef(null);
  const elementRef = useRef(null);

  const endDrag = useCallback((pointerId) => {
    if (!dragState.current || dragState.current.pointerId !== pointerId) return;

    dragState.current = null;

    if (elementRef.current) {
      try {
        elementRef.current.releasePointerCapture(pointerId);
      } catch {
        // ignore
      }
    }
  }, []);

  const handlePointerDown = (event) => {
    if (event.target.closest('.story-composer-text-input, .story-composer-text-delete')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onSelect(overlay.id);

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOverlayX: overlay.x,
      startOverlayY: overlay.y,
    };

    if (elementRef.current) {
      elementRef.current.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((event.clientX - dragState.current.startX) / rect.width) * 100;
    const dy = ((event.clientY - dragState.current.startY) / rect.height) * 100;

    onChange(overlay.id, {
      x: clamp(dragState.current.startOverlayX + dx, 5, 95),
      y: clamp(dragState.current.startOverlayY + dy, 5, 95),
    });
  };

  const handlePointerUp = (event) => {
    endDrag(event.pointerId);
  };

  return (
    <div
      ref={elementRef}
      className={`story-composer-text ${isActive ? 'active' : ''}`}
      style={{ left: `${overlay.x}%`, top: `${overlay.y}%` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {isActive ? (
        <input
          type="text"
          value={overlay.text}
          onChange={(e) => onChange(overlay.id, { text: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="story-composer-text-input"
          placeholder="Type something..."
          autoFocus
        />
      ) : (
        <span>{overlay.text || 'Tap to edit'}</span>
      )}
      {isActive && (
        <button
          type="button"
          className="story-composer-text-delete"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(overlay.id);
          }}
          aria-label="Remove text"
        >
          <FaTrash size={10} />
        </button>
      )}
    </div>
  );
};

const StoryComposer = ({ file, onClose, onSubmit, submitting }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [overlays, setOverlays] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [mediaTransform, setMediaTransform] = useState({ scale: 1, x: 0, y: 0 });
  const canvasRef = useRef(null);
  const panState = useRef(null);
  const pinchState = useRef(null);

  const isVideo = file?.type?.startsWith('video/');

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMediaTransform({ scale: 1, x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const updateTransform = useCallback((updates) => {
    setMediaTransform((prev) => {
      const next = { ...prev, ...updates };
      next.scale = clamp(next.scale, MIN_SCALE, MAX_SCALE);
      const panLimit = (next.scale - 1) * 50;
      next.x = clamp(next.x, -panLimit, panLimit);
      next.y = clamp(next.y, -panLimit, panLimit);
      return next;
    });
  }, []);

  const handleAddText = () => {
    const id = `text-${Date.now()}`;
    setOverlays((prev) => [
      ...prev,
      { id, text: '', x: 50, y: 50 },
    ]);
    setActiveId(id);
  };

  const handleOverlayChange = useCallback((id, updates) => {
    setOverlays((prev) => prev.map((item) => (
      item.id === id ? { ...item, ...updates } : item
    )));
  }, []);

  const handleRemoveOverlay = (id) => {
    setOverlays((prev) => prev.filter((item) => item.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const handleSubmit = () => {
    const payload = buildOverlaysPayload(overlays, mediaTransform, isVideo);
    onSubmit(file, payload);
  };

  const handleWheel = (event) => {
    if (isVideo) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    setMediaTransform((prev) => {
      const next = {
        ...prev,
        scale: clamp(prev.scale + delta, MIN_SCALE, MAX_SCALE),
      };
      const panLimit = (next.scale - 1) * 50;
      next.x = clamp(next.x, -panLimit, panLimit);
      next.y = clamp(next.y, -panLimit, panLimit);
      return next;
    });
  };

  const handleMediaPointerDown = (event) => {
    if (isVideo || event.button !== 0) return;
    event.stopPropagation();

    if (event.pointerType === 'touch' && event.isPrimary === false) return;

    panState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTransformX: mediaTransform.x,
      startTransformY: mediaTransform.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleMediaPointerMove = (event) => {
    if (!panState.current || panState.current.pointerId !== event.pointerId) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((event.clientX - panState.current.startX) / rect.width) * 100;
    const dy = ((event.clientY - panState.current.startY) / rect.height) * 100;

    updateTransform({
      x: panState.current.startTransformX + dx,
      y: panState.current.startTransformY + dy,
    });
  };

  const handleMediaPointerUp = (event) => {
    if (!panState.current || panState.current.pointerId !== event.pointerId) return;
    panState.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  const handleTouchStart = (event) => {
    if (isVideo || event.touches.length !== 2) return;
    const [t1, t2] = event.touches;
    const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    pinchState.current = { distance, scale: mediaTransform.scale };
  };

  const handleTouchMove = (event) => {
    if (isVideo || !pinchState.current || event.touches.length !== 2) return;
    event.preventDefault();
    const [t1, t2] = event.touches;
    const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const ratio = distance / pinchState.current.distance;
    updateTransform({ scale: pinchState.current.scale * ratio });
  };

  const handleTouchEnd = () => {
    pinchState.current = null;
  };

  if (!file) return null;

  const mediaStyle = {
    transform: `translate(${mediaTransform.x}%, ${mediaTransform.y}%) scale(${mediaTransform.scale})`,
  };

  return createPortal(
    <div className="story-composer-backdrop">
      <div className="story-phone-frame story-composer-frame">
        <div className="story-composer-header">
          <h2>Create story</h2>
          <button type="button" className="story-composer-icon-btn" onClick={onClose} aria-label="Cancel">
            <FaTimes />
          </button>
        </div>

        <div
          ref={canvasRef}
          className="story-stage story-composer-stage"
          onClick={() => setActiveId(null)}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {previewUrl && !isVideo && (
            <div
              className="story-stage-media-layer story-stage-media-layer--interactive"
              onPointerDown={handleMediaPointerDown}
              onPointerMove={handleMediaPointerMove}
              onPointerUp={handleMediaPointerUp}
              onPointerCancel={handleMediaPointerUp}
            >
              <div className="story-stage-media-transform" style={mediaStyle}>
                <img src={previewUrl} alt="Story preview" className="story-stage-media" draggable={false} />
              </div>
            </div>
          )}

          {previewUrl && isVideo && (
            <video src={previewUrl} className="story-stage-media" muted playsInline controls />
          )}

          {overlays.map((overlay) => (
            <DraggableText
              key={overlay.id}
              overlay={overlay}
              isActive={activeId === overlay.id}
              onSelect={setActiveId}
              onChange={handleOverlayChange}
              onRemove={handleRemoveOverlay}
              containerRef={canvasRef}
            />
          ))}
        </div>

        <div className="story-composer-controls">
          {!isVideo && (
            <div className="story-composer-zoom">
              <span className="story-composer-zoom-label">Zoom</span>
              <input
                type="range"
                min={MIN_SCALE}
                max={MAX_SCALE}
                step={0.01}
                value={mediaTransform.scale}
                onChange={(e) => updateTransform({ scale: Number(e.target.value) })}
                className="story-composer-zoom-slider"
                aria-label="Zoom image"
              />
              <span className="story-composer-zoom-hint">Drag image to reposition</span>
            </div>
          )}

          <div className="story-composer-controls-row">
            <button type="button" className="story-composer-add-text" onClick={handleAddText}>
              <FaPlus />
              Text
            </button>
            <button
              type="button"
              className="story-composer-share"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Sharing...' : 'Share to story'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default StoryComposer;
