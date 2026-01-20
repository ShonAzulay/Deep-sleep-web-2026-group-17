import React from 'react';

/**
 * GlassCard - A translucent card container with neon glow effects.
 * 
 * @param {React.ReactNode} children
 * @param {string} className - Additional classes
 * @param {boolean} animateFloat - Whether to add the floating animation
 * @param {string} glowColor - 'cyan' | 'emerald' | 'indigo' | 'rose' (for shadow color)
 */
export default function GlassCard({ children, className = "", animateFloat = false, glowColor = 'indigo' }) {
  
  // Map glow colors to shadow classes
  const shadowColors = {
    cyan: 'shadow-cyan-500/20',
    emerald: 'shadow-emerald-500/20',
    indigo: 'shadow-indigo-500/20',
    rose: 'shadow-rose-500/20',
    purple: 'shadow-purple-500/20'
  };

  const shadowClass = shadowColors[glowColor] || shadowColors.indigo;
  const floatClass = animateFloat ? 'animate-float' : '';

  return (
    <div className={`glass-panel p-6 sm:p-10 relative z-20 shadow-2xl ${shadowClass} ${floatClass} ${className}`}>
      {children}
    </div>
  );
}
