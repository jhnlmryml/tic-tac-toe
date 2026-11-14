"use client";

import Image from "next/image";
import { motion } from "motion/react";

type LoadingScreenProps = {
  ready: boolean;
  exiting: boolean;
  onExitTransitionEnd: () => void;
  onAudioUnlock: () => void;
};

export function LoadingScreen({ ready, exiting, onExitTransitionEnd, onAudioUnlock }: LoadingScreenProps) {
  return (
    <section
      className={`intro-screen ${ready ? "intro-ready" : ""} ${exiting ? "intro-exit" : ""}`}
      aria-label="Loading Grand Line Arcade"
      role="status"
      aria-live="polite"
      aria-busy={!ready}
      aria-hidden={exiting}
      inert={exiting}
      tabIndex={0}
      onPointerDown={onAudioUnlock}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onAudioUnlock();
      }}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && exiting) onExitTransitionEnd();
      }}
    >
      <motion.div
        className="intro-content"
        initial={{ opacity: 0, y: 22, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src="/assets/logo.svg"
          alt="Straw Hat crew emblem"
          width={754}
          height={754}
          preload
          unoptimized
        />
        <p className="eyebrow intro-eyebrow"><span className="eyebrow-dot" /> GRAND LINE ARCADE</p>
        <h1>Set sail, <span>Nakama!</span></h1>
        <p className="intro-copy">A little friendly rivalry on the open sea.</p>
        <div className="loading-track" aria-hidden="true"><span /></div>
        <p className="loading-label">{ready ? "The crew is ready. Hoist the colors!" : "Gathering the crew..."}</p>
        
      </motion.div>
      <p className="intro-credit">Jhon Almar Yumul</p>
    </section>
  );
}
