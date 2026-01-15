# Video Clip Editor Prototype

A browser-based video editing preview tool built with Next.js. Users can combine multiple short video clips, trim them, and preview the result seamlessly without actual video generation.

## Project Purpose

This is a **prototype/preview portal** - it does NOT generate or export final videos. It allows users to:
- Load a list of video clips (MP4 from GCS public URLs)
- Trim clips (cut from head and/or tail)
- Preview all clips playing continuously without loading gaps

## Tech Stack

- **Next.js** with TypeScript and App Router
- **BBC VideoContext** - WebGL-based video composition library for seamless playback

## Key Files

- `video_links` - List of source video URLs
- `docs/context.md` - Technical research and implementation details

## References

- [BBC VideoContext GitHub](https://github.com/bbc/VideoContext)
- [VideoContext Documentation](https://github.com/bbc/VideoContext#readme)
