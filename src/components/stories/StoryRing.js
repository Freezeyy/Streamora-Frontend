import React, { useId } from 'react';

const RING_SIZE = 72;
const STROKE = 3;
const GAP_DEG = 6;

const polar = (cx, cy, r, deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const start = polar(cx, cy, r, endDeg);
  const end = polar(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};

const StoryRing = ({ count = 0, children, className = '' }) => {
  const gradientId = `story-ring-${useId().replace(/:/g, '')}`;
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  const radius = RING_SIZE / 2 - STROKE / 2;

  if (!count || count < 1) {
    return (
      <div className={`story-ring story-ring--plain ${className}`}>
        <div className="story-ring-inner">{children}</div>
      </div>
    );
  }

  if (count === 1) {
    return (
      <div className={`story-ring story-ring--segmented ${className}`}>
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="story-ring-svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE}
          />
        </svg>
        <div className="story-ring-inner">{children}</div>
      </div>
    );
  }

  const segmentDeg = (360 - GAP_DEG * count) / count;

  return (
    <div className={`story-ring story-ring--segmented ${className}`}>
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="story-ring-svg"
        aria-hidden="true"
      >
        {Array.from({ length: count }).map((_, i) => {
          const start = -90 + i * (segmentDeg + GAP_DEG);
          const end = start + segmentDeg;
          return (
            <path
              key={i}
              d={arcPath(cx, cy, radius, start, end)}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
          );
        })}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="story-ring-inner">{children}</div>
    </div>
  );
};

export default StoryRing;
