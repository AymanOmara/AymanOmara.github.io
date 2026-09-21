# Ayman Omara — Portfolio

Personal portfolio for Ayman Omara, Senior Mobile Engineer.

A cinematic dark portfolio with vivid cyan, violet, and pink accents, an original interactive particle sculpture, filtered project cards, and a curated GitHub repository selection. The opening scene stays pinned as you scroll, progressively enlarging and rotating the sculpture before releasing into the page.

## Local preview

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No dependencies or build step required.

## Files

- `index.html`: content, project descriptions, links, and semantic page structure.
- `styles.css`: design system, artwork, animation, and responsive layouts.
- `script.js`: mobile navigation, project filters, evidence links, scroll reveals, copy email, and Cairo local time.
- `assets/`: downloadable CV, local SVG favicon, and a 1200×630 social preview image.
- `universe.js`: lightweight Canvas 2D particle sculpture with drag and arrow-key rotation, a pause control, and rendering suspended when offscreen or the browser tab is hidden.

Reduced-motion preferences are respected, including changes while the page is open. The sculpture starts paused when reduced motion is enabled, and the extended pinned scroll sequence is disabled. Content remains readable with JavaScript disabled. Fonts and the portrait use external resources; system fonts provide a fallback.

Hosted on GitHub Pages. Push the files to the configured publishing branch to deploy.
