---
name: elight-design-tokens
description: Elight design tokens (colors, typography, spacing, radii, shadows, motion, light/dark themes) with starting CSS values. Use when defining or consuming any visual value in web UI, the editor or prototypes.
---

# Design tokens

Single source of truth for visual values. Code and prototypes consume **tokens**, never literal values. The values below are a starting point; adjust here and propagate.

## Base file (`tokens.css`)

```css
:root {
  /* color: surfaces (back to front) */
  --bg:        #0e1014;
  --surface-1: #151821;
  --surface-2: #1c202b;
  --surface-3: #252a38;
  --border:    #2d3344;

  /* color: text */
  --text:        #e8eaf0;
  --text-muted:  #9aa1b5;
  --text-faint:  #6b7288;

  /* color: accent (the "light") */
  --accent:      #ffd166;
  --accent-ink:  #1a1400;   /* text on the accent */
  --accent-glow: color-mix(in srgb, var(--accent) 35%, transparent);

  /* color: semantic */
  --ok: #5ad19a;  --warn: #f2a65a;  --danger: #f0647a;  --info: #6cb4ff;

  /* typography */
  --font-ui:   "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --fs-xs: 11px; --fs-sm: 12px; --fs-md: 14px; --fs-lg: 18px; --fs-xl: 24px; --fs-2xl: 36px;
  --lh-tight: 1.2; --lh-body: 1.5;

  /* spacing (4 px grid) */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-6: 24px; --sp-8: 32px; --sp-12: 48px;

  /* shape */
  --r-sm: 4px; --r-md: 8px; --r-lg: 12px; --r-full: 999px;
  --shadow-1: 0 1px 2px rgb(0 0 0 / .4);
  --shadow-2: 0 8px 24px rgb(0 0 0 / .45);

  /* motion */
  --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 350ms;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --ease-in:  cubic-bezier(0.4, 0, 1, 1);
}

:root[data-theme="light"] {
  --bg: #f6f7fa; --surface-1: #ffffff; --surface-2: #f0f2f7; --surface-3: #e6e9f1;
  --border: #d3d8e4;
  --text: #14171f; --text-muted: #4a5166; --text-faint: #7a8197;
  --accent: #b87900; --accent-ink: #ffffff;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) { /* repeat the [data-theme="light"] values */ }
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; }
}
```

## Rules

- Token names describe **function** (`--surface-2`, `--text-muted`), not appearance (`--gray-800`).
- Do not use the accent on more than ~10% of the screen area. It guides the eye; if it is everywhere, it guides nothing.
- Text on the accent uses `--accent-ink`. Check the contrast of text/background pairs whenever a value changes.
- Typography: at most two families (UI and mono). Mono for code, inspector numeric values and logs.
- Inspector and HUD numbers use `font-variant-numeric: tabular-nums`.
- In Three.js, convert color tokens to `THREE.Color` from the hex value, keeping sRGB (see `threejs-scene-setup`).
