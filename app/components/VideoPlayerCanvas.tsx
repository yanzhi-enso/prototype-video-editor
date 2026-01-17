'use client';

import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { VideoClip, PlayerRef } from './types';
import styles from './VideoPlayer.module.css';

// VideoContext type (dynamically imported to avoid SSR issues)
type VideoContextInstance = {
  currentTime: number;
  duration: number;
  destination: unknown;
  video: (url: string) => {
    startAt: (time: number) => void;
    stopAt: (time: number) => void;
    sourceStartAt: (time: number) => void;
    sourceEndAt: (time: number) => void;
    connect: (destination: unknown) => void;
  };
  play: () => void;
  pause: () => void;
  reset: () => void;
};

interface VideoPlayerProps {
  clips: VideoClip[];
  isPlaying: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const VideoPlayerCanvas = forwardRef<PlayerRef, VideoPlayerProps>(
  ({ clips, isPlaying, onTimeUpdate, onPlayStateChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<VideoContextInstance | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Calculate total duration considering trims
    const getTotalDuration = useCallback(() => {
      return clips.reduce((total, clip) => {
        return total + (clip.duration - clip.trimStart - clip.trimEnd);
      }, 0);
    }, [clips]);

    // Build video node graph from clips
    const buildGraph = useCallback(() => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      // Clear existing nodes by resetting the context
      // VideoContext doesn't have a clear method, so we need to reset
      ctx.reset();

      let timelinePosition = 0;

      clips.forEach((clip) => {
        if (clip.duration === 0) return; // Skip clips that haven't loaded yet

        const effectiveDuration = clip.duration - clip.trimStart - clip.trimEnd;
        if (effectiveDuration <= 0) return;

        const node = ctx.video(clip.url);
        node.startAt(timelinePosition);
        node.stopAt(timelinePosition + effectiveDuration);

        // Set source trim points
        if (clip.trimStart > 0) {
          node.sourceStartAt(clip.trimStart);
        }
        if (clip.trimEnd > 0) {
          node.sourceEndAt(clip.duration - clip.trimEnd);
        }

        node.connect(ctx.destination);

        timelinePosition += effectiveDuration;
      });
    }, [clips]);

    // Initialize VideoContext (dynamic import to avoid SSR issues)
    useEffect(() => {
      if (!canvasRef.current) return;

      let ctx: VideoContextInstance | null = null;

      // Dynamic import to avoid SSR window reference
      import('videocontext').then((module) => {
        if (!canvasRef.current) return;
        const VideoContext = module.default;
        ctx = new VideoContext(canvasRef.current) as VideoContextInstance;
        ctxRef.current = ctx;
        setIsReady(true);
      });

      return () => {
        if (ctx) {
          ctx.reset();
        }
        ctxRef.current = null;
      };
    }, []);

    // Rebuild graph when clips change
    useEffect(() => {
      if (!isReady) return;
      buildGraph();
    }, [isReady, buildGraph]);

    // Handle play/pause state
    useEffect(() => {
      const ctx = ctxRef.current;
      if (!ctx || !isReady) return;

      if (isPlaying) {
        ctx.play();
      } else {
        ctx.pause();
      }
    }, [isPlaying, isReady]);

    // Smooth time updates using requestAnimationFrame
    useEffect(() => {
      if (!isPlaying || !isReady) return;

      const ctx = ctxRef.current;
      if (!ctx) return;

      let animationId: number;
      const totalDuration = getTotalDuration();

      const updateTime = () => {
        if (!ctx) return;

        const currentTime = ctx.currentTime;

        // Check if we've reached the end
        if (currentTime >= totalDuration) {
          ctx.pause();
          ctx.currentTime = 0;
          onTimeUpdate?.(0);
          onPlayStateChange?.(false);
          return;
        }

        onTimeUpdate?.(currentTime);
        animationId = requestAnimationFrame(updateTime);
      };

      animationId = requestAnimationFrame(updateTime);

      return () => {
        cancelAnimationFrame(animationId);
      };
    }, [isPlaying, isReady, getTotalDuration, onTimeUpdate, onPlayStateChange]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          ctxRef.current?.play();
          onPlayStateChange?.(true);
        },
        pause: () => {
          ctxRef.current?.pause();
          onPlayStateChange?.(false);
        },
        seek: (time: number) => {
          if (ctxRef.current) {
            ctxRef.current.currentTime = time;
            onTimeUpdate?.(time);
          }
        },
        getCurrentTime: () => ctxRef.current?.currentTime ?? 0,
        getTotalDuration,
      }),
      [getTotalDuration, onTimeUpdate, onPlayStateChange]
    );

    return (
      <div className={styles.player}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={1080}
          height={1620}
        />
      </div>
    );
  }
);

VideoPlayerCanvas.displayName = 'VideoPlayerCanvas';

export default VideoPlayerCanvas;
