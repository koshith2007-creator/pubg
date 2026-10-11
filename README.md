# PUBG: BATTLEGROUNDS & FRAGZEB ARENA

An ultra-smooth 60FPS scroll-driven cinematic animation and official **FRAGZEB ARENA Championship Series** portal.

---

## ⚡ Highlights & Features

1. **Cinematic 60FPS Scrollytelling Engine**:
   - 300 HD frames (`1280x720`) rendered on an HTML5 `<canvas>` using high-DPI scaling and `cover` geometry.
   - Smooth **lerp interpolation** damping for fluid momentum on scroll wheels, trackpads, and mobile touch.

2. **Tactical Heads-Up Display (HUD)**:
   - **Persistent Top Cockpit**: PUBG brand insignia, real-time 360° Azimuth compass telemetry, live frame counter (`001 / 300`), audio FX switch, auto-tour playback, and fullscreen toggle.
   - **Interactive Story Briefings**: 4 narrative chapters tracking key visual milestones:
     - `01 // DAWN PATROL` (Frames 001–066)
     - `02 // CHRONO MATRIX` (Frames 067–175)
     - `03 // BLUE ZONE` (Frames 176–240)
     - `04 // AIRDROP VICTORY` (Frames 241–300)
   - **Side Chapter Nav**: Quick-jump indicators (`01`, `02`, `03`, `04`).
   - **Synthesized Web Audio FX**: Mechanical clicks and chapter chimes generated live via native Web Audio API (zero audio file downloads required).

3. **FRAGZEB ARENA Championship Series Landing Page**:
   - Clean seamless transition below the scroll animation.
   - Hero banner with cinematic imagery.
   - 3-Day Timetable & Protocol with interactive day switching tabs (Friday, Saturday, Sunday).
   - Tournament mechanics, scoring matrix, rules & anti-cheat framework.
   - Squad enrollment roadmap and Google Form CTA.
   - Complimentary culinary hospitality banner.
   - Sedona Valley Arena Pavilion showcase and Google Maps integration.
   - Visual Archives / Gallery masonry grid.
   - Interactive FAQ accordion.

---

## 🚀 Deployment to Vercel

This repository is optimized for **1-click deployment on Vercel**:

1. Fork or import this repository: [`https://github.com/koshith2007-creator/pubg.git`](https://github.com/koshith2007-creator/pubg.git).
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Select your `pubg` repository and click **Deploy**.
4. That's it! `vercel.json` automatically configures caching and routing for all 300 sequence frames and static assets.

---

## 💻 Local Development

Clone the repository and run:

```bash
# Using Node.js
node server.js
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.
