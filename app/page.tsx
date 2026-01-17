'use client';

import { useState, useRef, useEffect } from 'react';
import VideoPlayerCanvas from './components/VideoPlayerCanvas';
import Timeline from './components/Timeline';
import { VideoClip, PlayerRef } from './components/types';
import styles from './page.module.css';

// Hard-coded video clips from video_links
const INITIAL_CLIPS: VideoClip[] = [
  {
    id: 'clip-1',
    url: 'https://storage.googleapis.com/shorts-scenes/ee81b606-8a1c-477c-82db-7e601e4cf28d/clips/f1c58387-e910-49e1-b3ce-2f1633106068.mp4',
    duration: 0, // Will be set when video loads
    trimStart: 0,
    trimEnd: 0,
  },
  {
    id: 'clip-2',
    url: 'https://storage.googleapis.com/shorts-scenes/d064d343-e54f-4616-b140-b166fca6a4e4/clips/e5679acc-d22a-4d1a-a475-894d6b3ebefb.mp4',
    duration: 0,
    trimStart: 0,
    trimEnd: 0,
  },
];

export default function Home() {
  const [clips, setClips] = useState<VideoClip[]>(INITIAL_CLIPS);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<PlayerRef>(null);

  // Load video durations on mount
  useEffect(() => {
    clips.forEach((clip, index) => {
      if (clip.duration === 0) {
        const video = document.createElement('video');
        video.src = clip.url;
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setClips((prev) =>
            prev.map((c, i) =>
              i === index ? { ...c, duration: video.duration } : c
            )
          );
        };
      }
    });
  }, []);

  const totalDuration = clips.reduce(
    (total, clip) => total + (clip.duration - clip.trimStart - clip.trimEnd),
    0
  );

  const handlePlayPause = () => {
    if (isPlaying) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrimChange = (
    clipId: string,
    trimStart: number,
    trimEnd: number
  ) => {
    setClips((prev) =>
      prev.map((clip) =>
        clip.id === clipId ? { ...clip, trimStart, trimEnd } : clip
      )
    );
  };

  return (
    <div className={styles.page}>
      {/* Main player area */}
      <main className={styles.main}>
        <div className={styles.playerContainer}>
          <VideoPlayerCanvas
            ref={playerRef}
            clips={clips}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onPlayStateChange={setIsPlaying}
          />
        </div>

        {/* Resize handle indicator */}
        <div className={styles.resizeHandle} />
      </main>

      {/* Timeline */}
      <Timeline
        clips={clips}
        selectedClipId={selectedClipId}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        onClipSelect={setSelectedClipId}
        onTrimChange={handleTrimChange}
        onPlayPause={handlePlayPause}
      />
    </div>
  );
}
