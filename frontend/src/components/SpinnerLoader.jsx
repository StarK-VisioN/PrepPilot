import React from 'react';

const SpinnerLoader = ({ size = 'md', color = 'white' }) => {
  // Size variants
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  // Color variants with light and dark versions (reversed ratio)
  const colorClasses = {
    white: { light: '#ffffff', dark: 'rgba(255, 255, 255, 0.3)' },
    blue: { light: '#2563eb', dark: 'rgba(37, 99, 235, 0.3)' },
    gray: { light: '#4b5563', dark: 'rgba(75, 85, 99, 0.3)' },
    green: { light: '#059669', dark: 'rgba(5, 150, 105, 0.3)' },
    red: { light: '#dc2626', dark: 'rgba(220, 38, 38, 0.3)' },
    purple: { light: '#7c3aed', dark: 'rgba(124, 58, 237, 0.3)' }
  };

  const colors = colorClasses[color];

  return (
    <div role="status" className="inline-block mr-2">
      <svg
        aria-hidden="true"
        className={`${sizeClasses[size]} animate-spin`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={colors.dark}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 2 A10 10 0 1 1 4.93 19.07"
          stroke={colors.light}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default SpinnerLoader;