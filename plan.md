# Video Clip Editor - Implementation Plan

## Current Status

### Completed
- [x] Next.js project setup with TypeScript
- [x] Mock UI matching Google Vids reference screenshot
- [x] Basic HTML5 VideoPlayer component (swappable)
- [x] Timeline component with clip strips
- [x] ClipStrip component with thumbnail generation
- [x] Draggable trim handles (UI functional)
- [x] Play/pause controls and time display
- [x] Hard-coded test video clips

### Not Yet Implemented
- [ ] Canvas-based VideoPlayer (VideoContext)
- [ ] Smooth gapless playback between clips
- [ ] Trim changes reflected in playback
- [ ] Seek functionality on master timeline
- [ ] Transitions between clips

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      page.tsx                           │
│  - State: clips[], selectedClipId, isPlaying, time      │
│  - Coordinates VideoPlayer and Timeline                 │
└─────────────────────────────────────────────────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────┐      ┌─────────────────────────────┐
│    VideoPlayer      │      │         Timeline            │
│  (SWAPPABLE)        │      │  - Controls (play, zoom)    │
│                     │      │  - ClipStrip[] list         │
│  Current: HTML5     │      └─────────────────────────────┘
│  Planned: Canvas    │                   │
└─────────────────────┘                   ▼
                              ┌─────────────────────────────┐
                              │        ClipStrip            │
                              │  - Thumbnails               │
                              │  - Trim handles (draggable) │
                              └─────────────────────────────┘
```

---

## Phase 1: Canvas Player Implementation (Next Priority)

### Goal
Replace HTML5 `<video>` with BBC VideoContext for smooth gapless playback.

### Tasks
1. Install VideoContext: `npm install videocontext`
2. Create `VideoPlayerCanvas.tsx` with same interface as `VideoPlayer.tsx`
3. Implement:
   - Canvas element as render target
   - VideoContext instance management
   - VideoNode per clip with `sourceStartAt()` / `sourceEndAt()` for trimming
   - Sequential clip scheduling on timeline
   - Play/pause/seek controls

### VideoContext Key APIs
```typescript
import VideoContext from "videocontext";

const canvas = document.getElementById("canvas");
const ctx = new VideoContext(canvas);

// Add clip with trim
const node = ctx.video(clipUrl);
node.startAt(timelineStart);      // When to start on master timeline
node.stopAt(timelineEnd);         // When to stop on master timeline
node.sourceStartAt(trimStart);    // Trim: skip this many seconds from source start
node.sourceEndAt(sourceEnd);      // Trim: stop at this point in source
node.connect(ctx.destination);

ctx.play();
```

### Success Criteria
- Clips play back-to-back without visible gap or loading
- Trim changes update playback correctly
- Time display stays in sync with actual playback

---

## Phase 2: Timeline Sync & Seeking

### Tasks
1. Implement master timeline seek bar
2. Click-to-seek on timeline
3. Playhead indicator that moves during playback
4. Clicking a clip seeks to that clip's start

---

## Phase 3: Polish & UX

### Tasks
1. Loading states while videos buffer
2. Error handling for failed video loads
3. Keyboard shortcuts (space = play/pause)
4. Visual feedback during trim drag
5. Undo/redo for trim changes (optional)

---

## Phase 4: Export Configuration (Future)

### Goal
Output a JSON config that a backend can use to actually render the final video.

```json
{
  "clips": [
    {
      "url": "https://...",
      "trimStart": 1.5,
      "trimEnd": 0.8
    }
  ],
  "transitions": [],
  "totalDuration": 12.3
}
```

---

## Technical Notes

### Why VideoContext over other approaches?

| Approach | Pros | Cons |
|----------|------|------|
| HTML5 `<video>` swap | Simple | Gaps during switch |
| Media Source Extensions | True gapless | Complex, codec issues |
| Canvas frame-by-frame | Full control | CPU heavy, may drop frames |
| **VideoContext** | Purpose-built, WebGL | Extra dependency |

VideoContext is chosen because:
1. Designed specifically for video composition
2. WebGL rendering = GPU accelerated
3. Built-in timeline with precise timing control
4. Handles preloading/buffering internally

### Video Sources (Test Clips)
```
https://storage.googleapis.com/shorts-scenes/ee81b606-8a1c-477c-82db-7e601e4cf28d/clips/f1c58387-e910-49e1-b3ce-2f1633106068.mp4
https://storage.googleapis.com/shorts-scenes/d064d343-e54f-4616-b140-b166fca6a4e4/clips/e5679acc-d22a-4d1a-a475-894d6b3ebefb.mp4
```

### Key Files
- `app/components/VideoPlayer.tsx` - Current HTML5 player (to be replaced/swapped)
- `app/components/types.ts` - Shared interfaces (`VideoClip`, `PlayerRef`)
- `docs/context.md` - Full technical research

---

## References

- [BBC VideoContext GitHub](https://github.com/bbc/VideoContext)
- [Google Vids Analysis](docs/google-vids-analysis.md)
- [Technical Research](docs/context.md)
