'use client';

import { useRef, useEffect, useState } from 'react';
import { VideoClip } from './types';
import styles from './ClipStrip.module.css';

interface ClipStripProps {
  clip: VideoClip;
  isSelected: boolean;
  onClick: () => void;
  onTrimChange: (trimStart: number, trimEnd: number) => void;
}

export default function ClipStrip({
  clip,
  isSelected,
  onClick,
  onTrimChange,
}: ClipStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

  // Generate thumbnails from video
  useEffect(() => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = clip.url;
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const thumbCount = 8;
      const newThumbnails: string[] = [];

      canvas.width = 80;
      canvas.height = 60;

      let currentThumb = 0;

      const captureFrame = () => {
        if (currentThumb >= thumbCount) {
          setThumbnails(newThumbnails);
          return;
        }

        video.currentTime = (duration / thumbCount) * currentThumb;
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          newThumbnails.push(canvas.toDataURL('image/jpeg', 0.5));
        }
        currentThumb++;
        captureFrame();
      };

      captureFrame();
    };

    return () => {
      video.src = '';
    };
  }, [clip.url]);

  // Calculate trim percentages
  const trimStartPercent = (clip.trimStart / clip.duration) * 100;
  const trimEndPercent = (clip.trimEnd / clip.duration) * 100;

  const handleMouseDown = (e: React.MouseEvent, handle: 'start' | 'end') => {
    e.stopPropagation();
    setIsDragging(handle);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!stripRef.current) return;

      const rect = stripRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const time = (percent / 100) * clip.duration;

      if (isDragging === 'start') {
        const maxTrimStart = clip.duration - clip.trimEnd - 0.5;
        onTrimChange(Math.min(time, maxTrimStart), clip.trimEnd);
      } else {
        const maxTrimEnd = clip.duration - clip.trimStart - 0.5;
        const trimEndValue = clip.duration - time;
        onTrimChange(clip.trimStart, Math.max(0, Math.min(trimEndValue, maxTrimEnd)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, clip, onTrimChange]);

  return (
    <div
      ref={stripRef}
      className={`${styles.strip} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      {/* Thumbnail strip */}
      <div className={styles.thumbnails}>
        {thumbnails.length > 0 ? (
          thumbnails.map((thumb, i) => (
            <img key={i} src={thumb} alt="" className={styles.thumbnail} />
          ))
        ) : (
          <div className={styles.loading}>Loading...</div>
        )}
      </div>

      {/* Trim overlay - start */}
      <div
        className={styles.trimOverlayStart}
        style={{ width: `${trimStartPercent}%` }}
      />

      {/* Trim overlay - end */}
      <div
        className={styles.trimOverlayEnd}
        style={{ width: `${trimEndPercent}%` }}
      />

      {/* Trim handles */}
      <div
        className={`${styles.trimHandle} ${styles.trimHandleStart}`}
        style={{ left: `${trimStartPercent}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'start')}
      />
      <div
        className={`${styles.trimHandle} ${styles.trimHandleEnd}`}
        style={{ right: `${trimEndPercent}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'end')}
      />
    </div>
  );
}
