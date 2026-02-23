// components/ai/StoryboardPlayer.tsx — Animated storyboard viewer with playback controls

import React, { useState, useEffect, useRef, useCallback } from 'react';
import StoryboardFrame from './StoryboardFrame';
import type { Indicator } from './StoryboardOverlays';

// ─── Types ───

interface DogPose {
  body: { x: number; y: number; rotation: number };
  head: { x: number; y: number; rotation: number };
  tail: { x: number; y: number; rotation: number };
  frontLeg: { hip: { x: number; y: number }; knee: { x: number; y: number }; paw: { x: number; y: number } };
  hindLeg: { hip: { x: number; y: number }; knee: { x: number; y: number }; paw: { x: number; y: number } };
  spine: Array<{ x: number; y: number }>;
}

interface AnimationKeyframe {
  frameNumber: number;
  title: string;
  description: string;
  dogAction?: string;
  handlerAction?: string;
  clinicalCues?: string;
  safetyNotes?: string;
  status?: string;
  startTime: number;
  duration: number;
  endTime: number;
  pose: DogPose;
  poseType: string;
  indicators: Indicator[];
}

interface OverlayGroup {
  label: string;
  default_visible: boolean;
  color: string;
}

interface AnimationData {
  exerciseCode?: string;
  exerciseName?: string;
  clinicalPurpose?: string;
  totalFrames: number;
  totalDuration: number;
  keyframes: AnimationKeyframe[];
  overlayGroups: Record<string, OverlayGroup>;
  clientScript?: { duration_range: string; text: string; key_phrases: string[] } | null;
  clinicianScript?: { duration_range: string; text: string; key_phrases: string[] } | null;
  timeline: Array<{ frameNumber: number; title: string; startTime: number; endTime: number; duration: number }>;
}

interface StoryboardPlayerProps {
  animationData: AnimationData;
  onClose?: () => void;
}

// ─── Component ───

export default function StoryboardPlayer({ animationData, onClose }: StoryboardPlayerProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showScript, setShowScript] = useState<'client' | 'clinician' | null>(null);
  const [visibleGroups, setVisibleGroups] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { keyframes, overlayGroups, totalFrames, totalDuration } = animationData;
  const currentFrame = keyframes[currentFrameIndex] || keyframes[0];

  // Initialize overlay visibility from defaults
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    for (const [key, group] of Object.entries(overlayGroups)) {
      initial[key] = group.default_visible;
    }
    setVisibleGroups(initial);
  }, [overlayGroups]);

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      const frameDuration = (currentFrame?.duration || 4) * 1000 / playbackSpeed;
      intervalRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => {
          if (prev >= keyframes.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, frameDuration);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentFrameIndex, playbackSpeed, keyframes.length, currentFrame?.duration]);

  const play = useCallback(() => {
    if (currentFrameIndex >= keyframes.length - 1) setCurrentFrameIndex(0);
    setIsPlaying(true);
  }, [currentFrameIndex, keyframes.length]);

  const pause = () => setIsPlaying(false);
  const stepForward = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => Math.min(prev + 1, keyframes.length - 1));
  };
  const stepBackward = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => Math.max(prev - 1, 0));
  };

  const toggleOverlay = (key: string) => {
    setVisibleGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeScript = showScript === 'client' ? animationData.clientScript
    : showScript === 'clinician' ? animationData.clinicianScript
    : null;

  return (
    <div className="sb-player">
      {/* Header */}
      <div className="sb-player__header">
        <div className="sb-player__header-left">
          {animationData.exerciseCode && (
            <span className="sb-player__code">{animationData.exerciseCode}</span>
          )}
          <span className="sb-player__name">{animationData.exerciseName || 'Storyboard'}</span>
        </div>
        <div className="sb-player__header-right">
          <span className="sb-player__frame-counter">
            Frame {currentFrameIndex + 1} / {totalFrames}
          </span>
          {onClose && (
            <button className="sb-player__close" onClick={onClose} title="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Frame display */}
      <div className="sb-player__viewport">
        {currentFrame && (
          <StoryboardFrame
            pose={currentFrame.pose}
            indicators={currentFrame.indicators}
            visibleGroups={visibleGroups}
            title={currentFrame.title}
          />
        )}
      </div>

      {/* Frame info */}
      <div className="sb-player__info">
        <div className="sb-player__info-title">{currentFrame?.title}</div>
        <div className="sb-player__info-desc">{currentFrame?.description}</div>
        {currentFrame?.dogAction && (
          <div className="sb-player__info-action">
            <strong>Dog:</strong> {currentFrame.dogAction}
          </div>
        )}
        {currentFrame?.handlerAction && (
          <div className="sb-player__info-action">
            <strong>Handler:</strong> {currentFrame.handlerAction}
          </div>
        )}
        {currentFrame?.safetyNotes && (
          <div className="sb-player__info-safety">
            {currentFrame.safetyNotes}
          </div>
        )}
      </div>

      {/* Timeline scrubber */}
      <div className="sb-player__timeline">
        {animationData.timeline.map((marker, i) => (
          <button
            key={i}
            className={`sb-player__timeline-marker ${i === currentFrameIndex ? 'sb-player__timeline-marker--active' : ''}`}
            onClick={() => { setIsPlaying(false); setCurrentFrameIndex(i); }}
            title={marker.title}
            style={{ flex: marker.duration }}
          >
            <span className="sb-player__timeline-num">{marker.frameNumber}</span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="sb-player__controls">
        <div className="sb-player__controls-left">
          {/* Step backward */}
          <button className="sb-player__btn" onClick={stepBackward} disabled={currentFrameIndex === 0} title="Previous frame">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="5" width="3" height="14" rx="1" />
              <polygon points="20 5 20 19 9 12" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button className="sb-player__btn sb-player__btn--primary" onClick={isPlaying ? pause : play} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21" />
              </svg>
            )}
          </button>

          {/* Step forward */}
          <button className="sb-player__btn" onClick={stepForward} disabled={currentFrameIndex >= keyframes.length - 1} title="Next frame">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="4 5 4 19 15 12" />
              <rect x="17" y="5" width="3" height="14" rx="1" />
            </svg>
          </button>
        </div>

        <div className="sb-player__controls-center">
          {/* Speed control */}
          <div className="sb-player__speed">
            {[0.5, 1, 1.5].map(speed => (
              <button
                key={speed}
                className={`sb-player__speed-btn ${playbackSpeed === speed ? 'sb-player__speed-btn--active' : ''}`}
                onClick={() => setPlaybackSpeed(speed)}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div className="sb-player__controls-right">
          {/* Script toggle */}
          {animationData.clientScript && (
            <button
              className={`sb-player__btn ${showScript === 'client' ? 'sb-player__btn--active' : ''}`}
              onClick={() => setShowScript(showScript === 'client' ? null : 'client')}
              title="Client script"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          )}
          {animationData.clinicianScript && (
            <button
              className={`sb-player__btn ${showScript === 'clinician' ? 'sb-player__btn--active' : ''}`}
              onClick={() => setShowScript(showScript === 'clinician' ? null : 'clinician')}
              title="Clinician script"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Script panel */}
      {activeScript && (
        <div className="sb-player__script">
          <div className="sb-player__script-header">
            {showScript === 'client' ? 'Client Instructions' : 'Clinician Notes'}
            <span className="sb-player__script-duration">{activeScript.duration_range}</span>
          </div>
          <p className="sb-player__script-text">{activeScript.text}</p>
          {activeScript.key_phrases && activeScript.key_phrases.length > 0 && (
            <div className="sb-player__script-phrases">
              {activeScript.key_phrases.map((phrase, i) => (
                <span key={i} className="sb-player__script-phrase">{phrase}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overlay toggles */}
      <div className="sb-player__overlays">
        <span className="sb-player__overlays-label">Overlays:</span>
        {Object.entries(overlayGroups).map(([key, group]) => (
          <button
            key={key}
            className={`sb-player__overlay-btn ${visibleGroups[key] ? 'sb-player__overlay-btn--active' : ''}`}
            onClick={() => toggleOverlay(key)}
            style={{ borderColor: visibleGroups[key] ? group.color : undefined }}
          >
            <span className="sb-player__overlay-dot" style={{ background: group.color }} />
            {group.label}
          </button>
        ))}
      </div>
    </div>
  );
}
