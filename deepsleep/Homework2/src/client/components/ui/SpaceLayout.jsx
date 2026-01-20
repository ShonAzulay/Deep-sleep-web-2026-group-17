import React from 'react';

/**
 * SpaceLayout - Wraps the page in the Galactic Drift theme.
 * Includes the radial gradient background and the animated stars.
 */
import ThemeToggle from '../ThemeToggle';

/**
 * SpaceLayout - Wraps the page in the Galactic Drift theme.
 * Includes the radial gradient background and the animated stars.
 */
export default function SpaceLayout({ children, className = "", backgroundChildren = null }) {
  return (
    <div dir="rtl" className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans transition-colors duration-500 ${className}`}>

      {/* Theme Toggle (Top Left) */}
      <div className="absolute top-4 left-4 z-50">
        <ThemeToggle />
      </div>

      {/* Stars Animation (Background handled by body/CSS variables) */}
      <div className="stars-bg z-0 pointer-events-none"></div>

      {/* Custom Background Elements (e.g. Moon, Shooting Stars) */}
      {backgroundChildren}

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
