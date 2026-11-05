MedCore media drop-folder. Real, live-action footage only (no animation, no AI). Self-hosted: never link to a CDN.
The app works with NONE of these files: missing media falls back to a navy-to-teal gradient. Add them one at a time.

videos/hero.mp4 + .webm                      (images/posters/hero.jpg)
videos/journey/01-find-hospital ... 09-follow-up   .mp4 + .webm   (images/posters/<same-name>.jpg)
videos/workspace/front-desk | clinical-team | administration  .mp4 + .webm   (images/posters/<same-name>.jpg)
images/pages/hospitals|doctors|services|how-it-works|about|contact.webp
images/hospitals/exterior-1..4.webp   images/about-team.webp   images/contact-reception.webp
images/timeline-patient|hospital|platform.webp   images/empty-appointments.webp

Spec: 10-15 s, 1280x720, no audio, loopable, <3 MB per clip, posters .jpg <150 KB, photos .webp <200 KB.
Keep file names lowercase. If a licence needs attribution, set `credit` in src/config/media.js.
