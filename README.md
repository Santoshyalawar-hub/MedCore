# MedCore HMS – Multi-tenant SaaS Hospital Management Platform (v3.0)

Read `docs/ARCHITECTURE.md` first (full product + frontend architecture).

## Run

- Node 18+: `npm install` then `npm run dev`
- No Node: double-click `standalone/index.html`

## What this is — and is not

A complete **front-end with a simulated backend** (rules enforced in `src/mocks/service.js` and `src/mocks/adapter.js`, data in browser localStorage). Great for demos and for defining the real API. **It is not a secure production system**: there is no real server, database, e-mail, payment or real authentication yet (see docs/API.md).

## Start here

1. `docs/DEMO_FLOW.md` – step-by-step flow check (8 demos)
2. `docs/ASSESSMENT_AND_PLAN.md` – assessment, plan, status
3. `docs/API.md` – contract for the real backend
4. `docs/ARCHITECTURE.md` – folder structure and standards

## Run

## Adding Real Videos and Photos (Media Pack)

All media is configured in `src/config/media.js` and self-hosted in `public/videos` and `public/images` (see `public/videos/README.txt` for the exact file names). The site works with none of these files: anything missing falls back to its poster, then to a navy-to-teal gradient. After adding files, rebuild; for `standalone/index.html`, keep the `videos` and `images` folders next to it.

Compress each clip (10-15 s, 1280x720, no audio, under 3 MB), then make a poster and a photo:

```
ffmpeg -i in.mp4 -t 12 -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24" -an -c:v libx264 -preset veryfast -crf 28 -movflags +faststart -pix_fmt yuv420p out.mp4
ffmpeg -i in.mp4 -t 12 -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24" -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 out.webm
ffmpeg -ss 1 -i in.mp4 -frames:v 1 -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" -q:v 5 poster.jpg
ffmpeg -i photo.jpg -vf "scale=1280:-2" -c:v libwebp -quality 72 photo.webp
```

For a seamless loop pick a clip that starts and ends on a similar frame. Check sizes with `ls -l` and raise `-crf` if a file is over its limit.
