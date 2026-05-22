"use client";

import { motion } from "framer-motion";

export function HaloDivider() {
  return (
    <div
      className="relative w-full pointer-events-none z-20 -mt-16 md:-mt-28"
      style={{ border: "none", outline: "none", boxShadow: "none", background: "transparent" }}
    >
      <svg
        viewBox="0 0 1440 180"
        className="w-full h-[90px] md:h-[150px] overflow-visible"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", border: "none", outline: "none" }}
      >
        <defs>
          <linearGradient id="halo-stroke-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="10%"  stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="30%"  stopColor="var(--primary)" stopOpacity="0.7" />
            <stop offset="50%"  stopColor="#e0e7ff"        stopOpacity="1" />
            <stop offset="70%"  stopColor="var(--primary)" stopOpacity="0.7" />
            <stop offset="90%"  stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="halo-atm-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="20%"  stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="50%"  stopColor="#818cf8"        stopOpacity="0.6" />
            <stop offset="80%"  stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="halo-bloom" cx="50%" cy="0%" r="60%" fx="50%" fy="0%">
            <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.55" />
            <stop offset="40%"  stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="80%"  stopColor="var(--primary)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent"    stopOpacity="0" />
          </radialGradient>


          <filter id="glow-heavy" x="-40%" y="-80%" width="180%" height="260%">
            <feGaussianBlur stdDeviation="20" />
          </filter>

          <filter id="glow-medium" x="-25%" y="-60%" width="150%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>

          <filter id="glow-crisp" x="-15%" y="-40%" width="130%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M0,120 Q720,0 1440,120 L1440,180 L0,180 Z"
          fill="url(#halo-bloom)"
        />

        <motion.path
          d="M0,120 Q720,0 1440,120"
          stroke="url(#halo-atm-grad)"
          strokeWidth="22"
          filter="url(#glow-heavy)"
          style={{ opacity: 0.55 }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.55 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />

        <motion.path
          d="M0,120 Q720,0 1440,120"
          stroke="url(#halo-stroke-grad)"
          strokeWidth="8"
          filter="url(#glow-medium)"
          style={{ opacity: 0.9 }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{ duration: 2.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />

        <motion.path
          d="M0,120 Q720,0 1440,120"
          stroke="url(#halo-stroke-grad)"
          strokeWidth="2"
          filter="url(#glow-crisp)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </div>
  );
}

