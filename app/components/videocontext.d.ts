declare module 'videocontext' {
  interface VideoNode {
    startAt(time: number): void;
    stopAt(time: number): void;
    sourceStartAt(time: number): void;
    sourceEndAt(time: number): void;
    connect(destination: unknown): void;
  }

  class VideoContext {
    constructor(canvas: HTMLCanvasElement);
    currentTime: number;
    duration: number;
    destination: unknown;
    video(url: string): VideoNode;
    play(): void;
    pause(): void;
    reset(): void;
  }

  export default VideoContext;
}
