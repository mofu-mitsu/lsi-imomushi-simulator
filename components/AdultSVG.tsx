import React from 'react';

export default function AdultSVG({ variant = 'butterfly', size = 68 }: { variant?: string; size?: number }) {
  const getVariantStyles = () => {
    switch (variant) {
case 'morpho':
        return {
          primary: '#1d4ed8',
          secondary: '#3b82f6',
          accent: '#93c5fd',
          body: '#1e3a8a',
          dropShadow: 'drop-shadow(0 0 8px rgba(59,130,246,0.8))'
        };
      case 'cabbage':
        return {
          primary: '#f8fafc',
          secondary: '#f1f5f9',
          accent: '#0f172a', // dots
          body: '#64748b',
          dropShadow: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        };
      case 'moth':
        return {
          primary: '#78716c',
          secondary: '#a8a29e',
          accent: '#44403c',
          body: '#292524',
          dropShadow: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
        };
      case 'steel':
        return {
          primary: '#7f1d1d', // dark red
          secondary: '#b91c1c',
          accent: '#fca5a5',
          body: '#450a0a',
          dropShadow: 'drop-shadow(0 0 6px rgba(220,38,38,0.5))'
        };
      case 'cyber':
        return {
          primary: '#064e3b', // dark green
          secondary: '#059669',
          accent: '#6ee7b7',
          body: '#022c22',
          dropShadow: 'drop-shadow(0 0 8px rgba(16,185,129,0.7))'
        };
      case 'crystal':
        return {
          primary: '#0891b2', // cyan
          secondary: '#22d3ee',
          accent: '#cffafe',
          body: '#164e63',
          dropShadow: 'drop-shadow(0 0 8px rgba(6,182,212,0.6))'
        };
      case 'gold':
        return {
          primary: '#b45309', // gold/amber
          secondary: '#f59e0b',
          accent: '#fde68a',
          body: '#78350f',
          dropShadow: 'drop-shadow(0 0 8px rgba(245,158,11,0.6))'
        };
      case 'butterfly':
      default:
        return {
          primary: '#8b5cf6', // purple logic butterfly
          secondary: '#c4b5fd',
          accent: '#4c1d95',
          body: '#2e1065',
          dropShadow: 'drop-shadow(0 0 6px rgba(139,92,246,0.6))'
        };
    }
  };

  const st = getVariantStyles();

  if (variant === 'moth') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: st.dropShadow }}>
        {/* Moth Antennae - Thick and fuzzy */}
        <path d="M 45 35 Q 30 15 20 20" fill="none" stroke={st.accent} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 2"/>
        <path d="M 55 35 Q 70 15 80 20" fill="none" stroke={st.accent} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 2"/>
        
        {/* Top Wings (Fuzzy/Wide) */}
        <path d="M 45 40 Q 10 20 15 60 Q 30 70 45 50" fill={st.primary} stroke={st.accent} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M 55 40 Q 90 20 85 60 Q 70 70 55 50" fill={st.primary} stroke={st.accent} strokeWidth="2" strokeLinejoin="round"/>
        
        {/* Bottom Wings */}
        <path d="M 45 50 Q 20 70 35 90 Q 45 80 48 65" fill={st.secondary} stroke={st.accent} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M 55 50 Q 80 70 65 90 Q 55 80 52 65" fill={st.secondary} stroke={st.accent} strokeWidth="1.5" strokeLinejoin="round"/>

        {/* Fluffy Body */}
        <ellipse cx="50" cy="50" rx="8" ry="18" fill={st.body} />
        <ellipse cx="50" cy="40" rx="6" ry="6" fill={st.accent} />
        {/* Fuzz */}
        <path d="M 44 45 L 56 45 M 43 50 L 57 50 M 44 55 L 56 55" stroke={st.secondary} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }

  // Butterfly / Morpho / Cabbage
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: st.dropShadow }}>
      {/* Antennae */}
      <path d="M 48 30 Q 40 10 35 15" fill="none" stroke={st.body} strokeWidth="2" strokeLinecap="round"/>
      <path d="M 52 30 Q 60 10 65 15" fill="none" stroke={st.body} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="35" cy="15" r="1.5" fill={st.body}/>
      <circle cx="65" cy="15" r="1.5" fill={st.body}/>

      {/* Top Wings */}
      <path d="M 48 40 Q 15 10 5 45 Q 25 70 48 55" fill={st.primary} stroke={variant === 'cabbage' ? '#cbd5e1' : st.accent} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M 52 40 Q 85 10 95 45 Q 75 70 52 55" fill={st.primary} stroke={variant === 'cabbage' ? '#cbd5e1' : st.accent} strokeWidth="1.5" strokeLinejoin="round"/>
      
      {/* Wing Patterns */}
      {variant === 'cabbage' ? (
        <>
          <circle cx="25" cy="40" r="3" fill={st.accent} />
          <circle cx="75" cy="40" r="3" fill={st.accent} />
        </>
      ) : (
        <>
          <path d="M 42 45 Q 20 30 15 45 Q 30 55 42 48" fill={st.secondary} opacity="0.6"/>
          <path d="M 58 45 Q 80 30 85 45 Q 70 55 58 48" fill={st.secondary} opacity="0.6"/>
        </>
      )}

      {/* Bottom Wings */}
      <path d="M 48 50 Q 20 85 35 95 Q 45 80 50 65" fill={st.secondary} stroke={variant === 'cabbage' ? '#cbd5e1' : st.accent} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M 52 50 Q 80 85 65 95 Q 55 80 50 65" fill={st.secondary} stroke={variant === 'cabbage' ? '#cbd5e1' : st.accent} strokeWidth="1.5" strokeLinejoin="round"/>

      {/* Body */}
      <ellipse cx="50" cy="50" rx="4" ry="16" fill={st.body} />
      <circle cx="50" cy="32" r="4" fill={st.body} />
    </svg>
  );
}
