'use client';

import { VideoClip } from './types';
import ClipStrip from './ClipStrip';
import styles from './Timeline.module.css';

interface TimelineProps {
  clips: VideoClip[];
  selectedClipId: string | null;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onClipSelect: (clipId: string) => void;
  onTrimChange: (clipId: string, trimStart: number, trimEnd: number) => void;
  onPlayPause: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

export default function Timeline({
  clips,
  selectedClipId,
  currentTime,
  totalDuration,
  isPlaying,
  onClipSelect,
  onTrimChange,
  onPlayPause,
}: TimelineProps) {
  return (
    <div className={styles.timeline}>
      {/* Controls bar */}
      <div className={styles.controls}>
        <div className={styles.leftControls}>
          <button className={styles.timingButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
            </svg>
            Show timing
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        </div>

        <div className={styles.centerControls}>
          <button className={styles.playButton} onClick={onPlayPause}>
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <span className={styles.timeDisplay}>
            <span className={styles.currentTime}>{formatTime(currentTime)}</span>
            <span className={styles.timeSeparator}> / </span>
            <span className={styles.totalTime}>{formatTime(totalDuration)}</span>
          </span>
        </div>

        <div className={styles.rightControls}>
          <input
            type="range"
            min="50"
            max="200"
            defaultValue="100"
            className={styles.zoomSlider}
          />
          <span className={styles.zoomLabel}>100%</span>
        </div>
      </div>

      {/* Clip strips */}
      <div className={styles.clipsContainer}>
        <div className={styles.clips}>
          {clips.map((clip) => (
            <ClipStrip
              key={clip.id}
              clip={clip}
              isSelected={clip.id === selectedClipId}
              onClick={() => onClipSelect(clip.id)}
              onTrimChange={(trimStart, trimEnd) =>
                onTrimChange(clip.id, trimStart, trimEnd)
              }
            />
          ))}
        </div>
        <button className={styles.addButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
