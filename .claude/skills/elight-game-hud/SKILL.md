---
name: elight-game-hud
description: In-game HUD and UI design (legibility, safe areas, scaling, feedback, local-AI NPC dialogue, model loading states). Use when creating game screens, menus, HUD or dialogue interfaces.
---

# HUD and game UI

Game UI is read in motion, at a distance and under pressure. Fewer elements, more contrast, immediate feedback.

## Legibility

- Minimum text: 16 px at 1080p (scale with resolution). Outline or soft shadow over variable scenes, or a translucent panel behind the text.
- Contrast >= 4.5:1 against the **worst** possible background in the scene, not the average one.
- Never rely on color alone: add an icon, shape or text.
- Accessibility options: UI scale, colorblind modes, always-available subtitles, reduced motion.

## Layout

- **Safe area:** 5% margin at the edges on TV; respect notches and system bars on mobile.
- Critical information in the corners and near the center only when essential (crosshair, interaction).
- Anchor to corners/edges and scale by DPI; test at 16:9, 21:9, 4:3 and portrait.
- Show only what is relevant now; hide the HUD during calm exploration and reveal it on state change.

## Feedback

- Every player action gets a response in < 100 ms (sound, color, scale, particle).
- Value changes (health, ammo) animate for 150-300 ms and highlight the delta.
- Menu focus is always visible; gamepad, keyboard and mouse navigation are equivalent.

## NPC dialogue with local AI

- **Latency is part of the design.** A local model can take hundreds of ms to seconds: show a "thinking" indicator on the NPC (gesture, animated ellipsis) and **stream** tokens instead of waiting for the full reply.
- Text appears at a readable pace (configurable typewriter, skip with one button).
- Player input: suggested options + free text field; always offer a quick exit.
- Failure or missing model: the NPC has a fallback line ("...") and the game continues; never freeze the scene.
- Limits and safety: max response length, content filter and context reset, all configurable.
- Accessible history (conversation log) and a clear speaker indication (name, portrait, bubble color).

## Loading and model state

- Load the model in the background with a bar/steps ("loading model... allocating VRAM..."), keeping the game playable earlier if possible.
- Show minimum requirements and a warning if the machine cannot cope; automatically offer a smaller model.

Tokens and motion: see `elight-design-tokens`. General principles: `elight-design-principles`.
