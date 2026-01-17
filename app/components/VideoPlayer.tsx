'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { VideoClip, PlayerRef } from './types';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  clips: VideoClip[];
  isPlaying: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

// Basic HTML5 Video Player - can be swapped with VideoContext version later
const VideoPlayer = forwardRef<PlayerRef, VideoPlayerProps>(
  ({ clips, isPlaying, onTimeUpdate, onPlayStateChange }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentClipIndex, setCurrentClipIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const currentClip = clips[currentClipIndex];

    // Calculate total duration considering trims
    const getTotalDuration = () => {
      return clips.reduce((total, clip) => {
        return total + (clip.duration - clip.trimStart - clip.trimEnd);
      }, 0);
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      play: () => {
        videoRef.current?.play();
        onPlayStateChange?.(true);
      },
      pause: () => {
        videoRef.current?.pause();
        onPlayStateChange?.(false);
      },
      seek: (time: number) => {
        // TODO: Implement seeking across clips
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      getCurrentTime: () => currentTime,
      getTotalDuration,
    }));

    // Handle play/pause state
    useEffect(() => {
      if (!videoRef.current) return;

      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }, [isPlaying]);

    // Set initial time when clip changes and continue playing if was playing
    useEffect(() => {
      if (videoRef.current && currentClip) {
        videoRef.current.currentTime = currentClip.trimStart;
        // Continue playing if isPlaying is true (auto-advance)
        if (isPlaying) {
          videoRef.current.play().catch(console.error);
        }
      }
    }, [currentClipIndex, currentClip, isPlaying]);

    // Calculate global time from video time
    const calculateGlobalTime = (videoTime: number) => {
      let globalTime = 0;
      for (let i = 0; i < currentClipIndex; i++) {
        globalTime += clips[i].duration - clips[i].trimStart - clips[i].trimEnd;
      }
      globalTime += videoTime - (currentClip?.trimStart || 0);
      return globalTime;
    };

    // Use requestAnimationFrame for smooth playhead updates
    useEffect(() => {
      if (!isPlaying) return;

      let animationId: number;

      const updateTime = () => {
        if (!videoRef.current || !currentClip) return;

        const videoTime = videoRef.current.currentTime;
        const clipEndTime = currentClip.duration - currentClip.trimEnd;

        // Check if we need to switch to next clip
        if (videoTime >= clipEndTime) {
          if (currentClipIndex < clips.length - 1) {
            setCurrentClipIndex(currentClipIndex + 1);
          } else {
            // End of all clips - reset to beginning
            videoRef.current.pause();
            setCurrentClipIndex(0);
            setCurrentTime(0);
            onTimeUpdate?.(0);
            onPlayStateChange?.(false);
            return;
          }
        }

        const globalTime = calculateGlobalTime(videoTime);
        setCurrentTime(globalTime);
        onTimeUpdate?.(globalTime);

        animationId = requestAnimationFrame(updateTime);
      };

      animationId = requestAnimationFrame(updateTime);

      return () => {
        cancelAnimationFrame(animationId);
      };
    }, [isPlaying, currentClipIndex, currentClip, clips, onTimeUpdate, onPlayStateChange]);

    // Handle video ended event (fallback)
    const handleTimeUpdate = () => {
      // Keep as fallback for when not playing (e.g., seeking)
      if (isPlaying) return;

      if (!videoRef.current || !currentClip) return;
      const videoTime = videoRef.current.currentTime;
      const globalTime = calculateGlobalTime(videoTime);
      setCurrentTime(globalTime);
      onTimeUpdate?.(globalTime);
    };

    const handleEnded = () => {
      if (currentClipIndex < clips.length - 1) {
        setCurrentClipIndex(currentClipIndex + 1);
      } else {
        // Reset to beginning
        setCurrentClipIndex(0);
        setCurrentTime(0);
        onTimeUpdate?.(0);
        onPlayStateChange?.(false);
      }
    };

    if (!currentClip) {
      return <div className={styles.player}>No clips loaded</div>;
    }

    return (
      <div className={styles.player}>
        <video
          ref={videoRef}
          className={styles.video}
          src={currentClip.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          playsInline
          preload="auto"
        />
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
