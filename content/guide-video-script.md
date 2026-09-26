# "How this guide works" video

The pain guide offers a short video in the top-right corner of the body, on
the first step after Start (src/components/GuideVideo.jsx). The button only
appears once the video file is in place, so nothing shows until it is added.

## Files

Put these in `public/videos/` (create the folder):

| File | What it is | Needed? |
| --- | --- | --- |
| `guide-intro.mp4` | The video: H.264 MP4, landscape 16:9 (1280×720 is plenty), under 10 MB | Yes |
| `guide-intro.jpg` | A still shown before it plays (the same size as the video) | Recommended |
| `guide-intro.vtt` | Captions (WebVTT), on by default: many people watch without sound | Recommended |

Keep it to 40 to 60 seconds. The button shows the length ("How this guide works · 45 s").
It never plays by itself: it starts when the visitor taps the button, and they can close
it at any time. "×" hides the offer on that device.

## Script (about 45 seconds)

Plain and warm, looking at the camera, or as a voice-over on a screen recording of the
guide. Show each step on screen as it is described.

> Hello, I'm Chandra, a registered physiotherapist. This short guide helps you describe
> your pain before we meet. It takes about two to five minutes.
>
> First, turn the body so you can see the sore area. Then draw on every area that hurts;
> you can draw a line if the pain travels.
>
> Next come a few safety questions. If anything needs a doctor first, the guide will tell
> you straight away.
>
> Then answer a few short questions about your pain. Careful answers give the most useful
> results.
>
> At the end, you'll see what your answers can be associated with, some general advice,
> and the option to book an assessment with me.
>
> This guide gives general information. It isn't a diagnosis, and it doesn't replace an
> assessment in person. Let's get started.

## Captions (`guide-intro.vtt`) starting point

```
WEBVTT

00:00.000 --> 00:06.000
Hello, I'm Chandra, a registered physiotherapist.

00:06.000 --> 00:12.000
This short guide helps you describe your pain before we meet. It takes about two to five minutes.
```

Add one cue per sentence, timed to the recording.
