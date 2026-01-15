# Project Context & Technical Research

## Problem Statement

Build a browser-based video editing preview tool where:
- Multiple short video clips are loaded from URLs
- Each clip can be trimmed (cut head/tail)
- All clips play continuously in a main player **without loading gaps**

## The Core Challenge: Smooth Playback

Playing multiple video clips seamlessly in a browser is non-trivial. Standard `<video>` element switching causes micro-gaps even with preloading.

---

## Research Findings

### Analysis of Google Vids (Reference Implementation)

From browser analysis of Google Vids editor:

1. **Scene-Based Architecture**
   - Content organized into "scenes" not one continuous video
   - Individual timing per scene (e.g., 6.3s, 8.2s)
   - Explicit transitions between scenes

2. **Unified Timeline Management**
   - Master playhead spanning all scenes
   - Centralized timing display (e.g., "6 seconds out of 14 seconds total")
   - Timeline zoom controls for precise editing

3. **Rendering Strategy**
   - Canvas-based rendering for smooth animations
   - WebGL for GPU acceleration
   - Layer-based composition system

4. **Preview Behavior**
   - Single "Preview" button plays entire project seamlessly
   - Real-time playhead sync across all scenes

---

## Technical Approaches Evaluated

### Option 1: Multiple Video Elements with Pre-buffering
- Create hidden `<video>` elements for each clip
- Preload all clips, swap visibility on switch
- **Pros**: Simple to implement
- **Cons**: May have tiny gaps; memory grows with clip count

### Option 2: Media Source Extensions (MSE)
- Programmatic control over video buffer
- Can achieve true gapless playback
- **Pros**: Smoothest possible
- **Cons**: Complex; codec/container handling required

### Option 3: Canvas Frame Rendering
- Render video frames to canvas manually
- **Pros**: Full control
- **Cons**: CPU intensive, may drop frames

### Option 4: BBC VideoContext (Chosen)
- HTML5 & WebGL video composition API
- Node-based: VideoNode, TransitionNode, EffectNode
- Built-in timeline management
- **Pros**: Designed for this exact use case, GPU accelerated
- **Cons**: Additional dependency

---

## Chosen Solution: BBC VideoContext

GitHub: https://github.com/bbc/VideoContext

### Why VideoContext?

1. **Purpose-built** - Designed for video composition in browser
2. **WebGL rendering** - GPU accelerated, smooth playback
3. **Timeline control** - Precise start/end times per clip (perfect for trimming)
4. **Seamless transitions** - Built-in support
5. **Open source** - BBC maintained

### How It Works

```javascript
import VideoContext from "videocontext";

// Create context with canvas
const canvas = document.getElementById("canvas");
const ctx = new VideoContext(canvas);

// Add video nodes with timing
const video1 = ctx.video("/clip1.mp4");
video1.startAt(0);        // Start at timeline 0s
video1.stopAt(5);         // Stop at timeline 5s
video1.sourceStartAt(2);  // Trim: start from 2s into source
video1.sourceEndAt(7);    // Trim: end at 7s into source
video1.connect(ctx.destination);

// Add second clip
const video2 = ctx.video("/clip2.mp4");
video2.startAt(5);        // Starts when video1 ends
video2.stopAt(12);
video2.connect(ctx.destination);

// Play
ctx.play();
```

### Key VideoContext Features for Our Use Case

| Feature | Our Use |
|---------|---------|
| `sourceStartAt()` | Trim head of clip |
| `sourceEndAt()` | Trim tail of clip |
| `startAt()` / `stopAt()` | Position on master timeline |
| `playbackRate` | Speed adjustment (future) |
| TransitionNode | Smooth transitions between clips |

---

## Implementation Tasks

### Phase 1: Basic Playback
- [ ] Set up VideoContext in Next.js
- [ ] Load video URLs from config
- [ ] Create basic canvas player
- [ ] Implement sequential clip playback

### Phase 2: Timeline UI
- [ ] Build clip list component below player
- [ ] Add visual representation of each clip
- [ ] Show clip duration and position

### Phase 3: Trim Controls
- [ ] Add draggable trim handles to each clip
- [ ] Update VideoContext sourceStartAt/sourceEndAt on drag
- [ ] Real-time preview of trim changes

### Phase 4: Polish
- [ ] Play/pause controls
- [ ] Seek bar for master timeline
- [ ] Loading states and error handling

---

## Video Sources

Test clips stored in `video_links`:
```
https://storage.googleapis.com/shorts-scenes/ee81b606-8a1c-477c-82db-7e601e4cf28d/clips/f1c58387-e910-49e1-b3ce-2f1633106068.mp4
https://storage.googleapis.com/shorts-scenes/d064d343-e54f-4616-b140-b166fca6a4e4/clips/e5679acc-d22a-4d1a-a475-894d6b3ebefb.mp4
```

---

## References

- [BBC VideoContext GitHub](https://github.com/bbc/VideoContext)
- [THEOplayer Seamless Transitions](https://docs.theoplayer.com/getting-started/01-sdks/01-web/04-how-to-implement-seamless-transition.md)
- [HTML5 Canvas + Video](http://html5doctor.com/video-canvas-magic/)
- [W3C Non-linear Video Editor Workshop](https://www.w3.org/2021/03/media-production-workshop/talks/junyue-cao-non-linear-video-editor.html)
- [MDN Video Manipulation](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_manipulation)
