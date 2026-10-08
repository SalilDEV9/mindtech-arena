# MindTech Arena

A responsive, buildless event website for MindQuest at IIIT Kottayam.

## Edit confirmed event details

Update `dist/event-config.js`. Dates, registration URL, venues and prizes are confirmed. The registration fee is ₹20; whether it is per person or per team is not specified. Team size remains unset. Visitors are directed to MakeMyPass for registration terms. Round 3 is Vision Arena; the organiser contact is 9572349620. The countdown remains hidden until a valid start date is configured. Use an ISO 8601 timestamp including the Asia/Kolkata offset (+05:30). Only HTTPS registration URLs are accepted.

The website includes keyboard-accessible round tabs, native FAQ disclosures, a mobile navigation menu, reduced-motion support, local fonts and a native-share/clipboard fallback. It does not collect registrations or payments itself; the configured CTA opens the official registration provider.

## Source

- `dist/index.html`: content and page structure
- `dist/style.css`: responsive styling
- `dist/app.js`: interactions
- `dist/event-config.js`: organiser settings
- `dist/assets/`: self-hosted fonts, favicon and hero artwork

No package installation or build step is required. Serve `dist` as the website root.

## Run locally

```bash
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. The live site is https://mindtech-arena.bronzepixie.chatgpt.site.

This repository is a source snapshot; pushing here does not automatically update the existing hosted site.

## Design and artwork

The event information hierarchy was informed by https://techashy.iiitkottayam.ac.in/. Copy, CSS and artwork are original to this site; the reference site's event dates, prizes and sponsor claims are not reused.

Hero artwork: generated with the built-in image generation tool; asset `dist/assets/knight.webp`. Prompt: A premium editorial 3D crimson lacquer and translucent-glass chess knight sculpture, facing left in three-quarter profile, on a near-black studio background with a subtle red disc, dramatic restrained lighting, no text or logos. The original PNG was encoded as WebP for delivery.

The header uses the original organiser-supplied MindQuest logo. The supplied poster is displayed unchanged, with an adjacent correction noting that Round 1 is in BC301 (the poster says BC302).

## Verification

JavaScript syntax, internal link destinations, unique HTML IDs, local asset paths and script DOM targets were checked. Browser-based visual and interaction QA was unavailable in this environment. Review on desktop and mobile before opening registration publicly.
