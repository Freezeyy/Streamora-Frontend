import React from 'react';
import './css/Snowfall.css';

const FLAKE_COUNT = { default: 9, subtle: 18 };

const Snowfall = ({ variant = 'default', className = '' }) => {
  const count = FLAKE_COUNT[variant] ?? FLAKE_COUNT.default;

  return (
    <div className={`snowflakes snowflakes--${variant} ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="snowflake" />
      ))}
    </div>
  );
};

export default Snowfall;
