---
name: elight-design-principles
description: Elight visual design principles (identity, hierarchy, rhythm, consistency, motion). Use before creating or reviewing any screen, page, prototype, editor UI or HUD.
---

# Elight design principles

Elight is an engine built around local AI. The look should convey three things: **lightness** (the name), **precision** (it is a working tool) and **AI transparency** (the user always sees what the model is doing).

## Identity

- Dark, neutral base with **one** accent color (light). Light is the visual motif: soft glow, emissive gradients, never heavy neon.
- Flat surfaces separated by luminance contrast, not thick borders or heavy shadows.
- AI states have their own consistent language: thinking (slow pulse), generating (progress), ready (static), error (semantic color + text).

## Hierarchy

1. One focus per screen. The eye should know where to start in under a second.
2. Size, weight and contrast, in that order, create emphasis. Do not rely on color alone.
3. Group by proximity before reaching for boxes. Whitespace separates better than lines.
4. At most 3 text levels per screen (title, body, secondary).

## Rhythm and consistency

- 4 px grid; spacing only from the token scale (see `elight-design-tokens`).
- Same component, same look, everywhere. Look for an existing one before creating a new one.
- Align to a shared grid; nothing "almost aligned".

## Motion

- Motion explains state changes; it does not decorate. 120-200 ms for micro-interactions, 250-400 ms for panel transitions.
- Ease-out (`cubic-bezier(0.2, 0, 0, 1)`) when entering, ease-in when leaving.
- Respect `prefers-reduced-motion`: swap animation for a fade or a cut.

## Accessibility (non-negotiable)

- Text contrast >= 4.5:1 (3:1 for large text and icons).
- Visible focus on everything interactive; full keyboard navigation.
- No information by color alone. Touch targets >= 44 px in game/touch UI.

## Checklist before delivering

- [ ] One clear focus per screen
- [ ] Tokens only, no magic color/spacing values
- [ ] Dark and light themes checked
- [ ] States: default, hover, focus, active, disabled, loading, empty, error
- [ ] Tested at narrow (360 px) and wide (1920 px) widths
- [ ] Contrast and keyboard verified
