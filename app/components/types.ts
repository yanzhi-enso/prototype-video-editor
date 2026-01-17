export interface VideoClip {
  id: string;
  url: string;
  duration: number; // in seconds
  trimStart: number; // trim from beginning (seconds)
  trimEnd: number; // trim from end (seconds)
}

export interface PlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getTotalDuration: () => number;
}
