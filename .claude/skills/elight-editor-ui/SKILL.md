---
name: elight-editor-ui
description: Elight editor interface patterns (panel layout, viewport, scene hierarchy, inspector, AI console, shortcuts, density). Use when designing or implementing any part of the editor.
---

# Editor UI

The editor is a tool for long, intensive use. Priorities: **readable density, speed, predictability**.

## Default layout

```
┌──────────────────────────────────────────────────────┐
│ Menu bar / commands (Ctrl+K)                         │
├────────┬─────────────────────────────┬───────────────┤
│Scene   │                             │  Inspector    │
│hier-   │        Viewport             │  (properties  │
│archy   │                             │   of the      │
│        │                             │   selection)  │
├────────┴─────────────────────────────┴───────────────┤
│ Assets │ Console │ AI (models, queue, VRAM usage)    │
└──────────────────────────────────────────────────────┘
```

- Panels are resizable, dockable and persist their state. The viewport takes all remaining space.
- Minimum side panel width: 240 px. Collapse to icons below 1100 px window width.

## Components

- **Hierarchy:** tree with keyboard expand/collapse (arrows), drag to reparent, per-type icon, eye (visibility) and lock, rename with F2.
- **Inspector:** collapsible section per component; label on the left, field on the right; draggable numeric fields (drag the label to adjust), Shift = 10x, Alt = 0.1x; per-property reset button when changed.
- **Viewport:** gizmos (move/rotate/scale) on W/E/R, grid fading with distance, axes indicator in the corner, hideable stats (FPS, draw calls).
- **Command palette (Ctrl+K):** every editor action must be reachable from here.
- **Toasts:** only for confirmation and recoverable errors; build/AI errors go to the console with full detail.

## Local AI in the editor

Users need to see what the model does and what it costs:

- The AI panel shows: loaded model, quantization, VRAM/RAM in use, inference queue, tokens/s.
- Every generation has **cancel**, **progress** and **undo** (it is a single operation on the undo stack).
- AI-generated content carries a subtle badge until the user accepts it.
- Never block the UI waiting for the model; inference is asynchronous and the editor stays responsive.
- Missing model state: explain what is missing and offer a download/select button, not just an error.

## Interaction

- Undo/redo for everything that changes the scene. Selection is undoable too.
- Shortcuts follow 3D editor conventions (W/E/R, F to focus, Delete, Ctrl+D duplicate, Ctrl+Z/Y).
- Drag and drop assets onto the viewport and hierarchy, with a preview of the target.
- Empty states teach: say what the area is and give the primary action.

## Density

- Default row height 24 px; compact 20 px; comfortable 32 px (configurable).
- `--fs-sm` (12 px) for most of the inspector; `--fs-md` for main content.
- 16 px icons with a consistent stroke; always add a text label when the icon is ambiguous.

Colors and spacing: see `elight-design-tokens`.
