import React from 'react';
import './css/Snowfall.css';

const FLAKE_COUNT = { default: 18, subtle: 18 };

const Snowfall = ({ variant = 'default', fixed = false, className = '' }) => {
  const count = FLAKE_COUNT[variant] ?? FLAKE_COUNT.default;
  const rootClass = [
    'snowflakes',
    `snowflakes--${variant}`,
    fixed ? 'snowfall-layer' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="snowflake" />
      ))}
    </div>
  );
};

export default Snowfall;
