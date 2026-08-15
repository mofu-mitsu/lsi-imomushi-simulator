'use client';

import { motion } from 'motion/react';

interface ChrysalisProps {
  variant?: 'crystal' | 'steel' | 'cyber' | 'gold' | string;
  className?: string;
  size?: number;
}

export default function ChrysalisSVG({ variant = 'crystal', className = '', size = 80 }: ChrysalisProps) {
  // 1. 立方体クリスタルさなぎ (Crystal Cube Chrysalis - Ti論理結晶)
  if (variant === 'crystal' || variant.includes('crystal') || variant.includes('クリスタル')) {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        {/* Glowing aura */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute inset-0 bg-cyan-400/30 rounded-2xl blur-md"
        />

        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
          <defs>
            <linearGradient id="crystalTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="crystalLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="crystalRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>
            <filter id="crystalGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Isometric Cube Chrysalis Body */}
          <g filter="url(#crystalGlow)">
            {/* Top Face */}
            <polygon points="50,15 85,32 50,49 15,32" fill="url(#crystalTop)" stroke="#e0f2fe" strokeWidth="1.5" strokeLinejoin="round" />
            
            {/* Left Face */}
            <polygon points="15,32 50,49 50,85 15,68" fill="url(#crystalLeft)" stroke="#bae6fd" strokeWidth="1.5" strokeLinejoin="round" />
            
            {/* Right Face */}
            <polygon points="50,49 85,32 85,68 50,85" fill="url(#crystalRight)" stroke="#7dd3fc" strokeWidth="1.5" strokeLinejoin="round" />

            {/* Internal Logic Matrix Grid */}
            <line x1="50" y1="15" x2="50" y2="49" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
            <line x1="15" y1="32" x2="85" y2="32" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.6" />
            <line x1="32" y1="41" x2="32" y2="76" stroke="#bae6fd" strokeWidth="1" opacity="0.7" />
            <line x1="68" y1="41" x2="68" y2="76" stroke="#e0f2fe" strokeWidth="1" opacity="0.7" />

            {/* Inner Core Pulse */}
            <circle cx="50" cy="50" r="7" fill="#ffffff" opacity="0.9">
              <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Floating Orbiting Data Particles */}
          <circle cx="20" cy="20" r="1.5" fill="#38bdf8">
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="80" r="2" fill="#a5f3fc">
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    );
  }

  // 2. 鋼鉄要塞シェルターさなぎ (Steel Bunker Chrysalis - Se物理装甲)
  if (variant === 'steel' || variant.includes('steel') || variant.includes('鋼鉄') || variant.includes('要塞')) {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
          <defs>
            <linearGradient id="steelArmor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="shieldBeam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Outer Bunker Shield Capsule */}
          <path 
            d="M 50,10 L 82,28 L 82,72 L 50,90 L 18,72 L 18,28 Z" 
            fill="url(#steelArmor)" 
            stroke="#94a3b8" 
            strokeWidth="3" 
            strokeLinejoin="round" 
          />

          {/* Armor Plates & Rivets */}
          <line x1="18" y1="50" x2="82" y2="50" stroke="#334155" strokeWidth="2.5" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="#334155" strokeWidth="2.5" />

          {/* Rivets */}
          <circle cx="26" cy="34" r="2" fill="#cbd5e1" />
          <circle cx="74" cy="34" r="2" fill="#cbd5e1" />
          <circle cx="26" cy="66" r="2" fill="#cbd5e1" />
          <circle cx="74" cy="66" r="2" fill="#cbd5e1" />
          <circle cx="50" cy="22" r="2" fill="#cbd5e1" />
          <circle cx="50" cy="78" r="2" fill="#cbd5e1" />

          {/* Central Hazard / Se Core Light */}
          <polygon points="50,38 60,50 50,62 40,50" fill="url(#shieldBeam)" stroke="#fbbf24" strokeWidth="1.5">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </polygon>
          <line x1="45" y1="50" x2="55" y2="50" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // 3. 生体サイバー蛹 (Cyber Net Chrysalis - Ne直感/電脳回路)
  if (variant === 'cyber' || variant.includes('cyber') || variant.includes('サイバー') || variant.includes('電脳')) {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg"
        />

        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
          <defs>
            <linearGradient id="cyberBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
          </defs>

          {/* Egg/Chrysalis Capsule */}
          <path 
            d="M 50,12 C 72,12 80,45 80,68 C 80,85 66,92 50,92 C 34,92 20,85 20,68 C 20,45 28,12 50,12 Z" 
            fill="url(#cyberBody)" 
            stroke="#10b981" 
            strokeWidth="2.5" 
          />

          {/* Neon PCB Circuit Lines */}
          <path d="M 50,18 L 50,40 L 68,52 L 68,70" fill="none" stroke="#34d399" strokeWidth="1.5" />
          <path d="M 50,40 L 32,52 L 32,70" fill="none" stroke="#34d399" strokeWidth="1.5" />
          <circle cx="68" cy="70" r="2.5" fill="#a7f3d0" />
          <circle cx="32" cy="70" r="2.5" fill="#a7f3d0" />

          {/* Central AI Data Matrix Core */}
          <rect x="42" y="44" width="16" height="16" rx="3" fill="#047857" stroke="#6ee7b7" strokeWidth="1.5" />
          <text x="50" y="56" fill="#ecfdf5" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="monospace">
            Ti
          </text>
        </svg>
      </div>
    );
  }

  // 4. 黄金幾何学蛹 (Golden Pyramid Chrysalis - 黄金調和/Fe中和)
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute inset-0 bg-amber-400/30 rounded-2xl blur-md"
      />
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
        <defs>
          <linearGradient id="goldFace1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="goldFace2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>

        <polygon points="50,10 85,75 50,90" fill="url(#goldFace1)" stroke="#fef3c7" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="50,10 15,75 50,90" fill="url(#goldFace2)" stroke="#fef3c7" strokeWidth="1.5" strokeLinejoin="round" />
        
        {/* Golden Ratio Rings */}
        <circle cx="50" cy="50" r="12" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
        <circle cx="50" cy="50" r="4" fill="#ffffff" />
      </svg>
    </div>
  );
}
