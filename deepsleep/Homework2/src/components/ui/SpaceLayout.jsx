import React from 'react';

/**
 * SpaceLayout - Wraps the page in the Galactic Drift theme.
 * Includes the radial gradient background and the animated stars.
 */
export default function SpaceLayout({ children, className = "", backgroundChildren = null }) {
  return (
    <div dir="rtl" className={`relative min-h-screen flex items-center justify-center p-4 bg-slate-900 overflow-hidden font-sans ${className}`}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a40_0%,_#050510_100%)] z-0"></div>
      
      {/* Stars Animation */}
      <div className="stars-bg z-0 opacity-80 pointer-events-none"></div>

      {/* Custom Background Elements (e.g. Moon, Shooting Stars) */}
      {backgroundChildren}

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
