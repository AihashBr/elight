# Elight Skills

Claude Code project skills. Each folder has a `SKILL.md` with `name` and `description` in the frontmatter; Claude loads a skill when the task matches its description.

## Design

| Skill | When to use |
|---|---|
| [elight-design-principles](elight-design-principles/SKILL.md) | Visual identity, hierarchy, rhythm, consistency. Read before any visual work. |
| [elight-design-tokens](elight-design-tokens/SKILL.md) | Colors, typography, spacing, radii, shadows and light/dark themes as tokens. |
| [elight-editor-ui](elight-editor-ui/SKILL.md) | Editor UI: panels, inspector, scene hierarchy, viewport, shortcuts. |
| [elight-game-hud](elight-game-hud/SKILL.md) | In-game HUD and UI: legibility, safe areas, AI NPC dialogue. |

## Three.js

| Skill | When to use |
|---|---|
| [threejs-scene-setup](threejs-scene-setup/SKILL.md) | Renderer, camera, loop, resize, color/tone mapping, resource disposal. |
| [threejs-materials-lighting](threejs-materials-lighting/SKILL.md) | PBR, lights, shadows, HDRI, textures. |
| [threejs-shaders-postprocessing](threejs-shaders-postprocessing/SKILL.md) | ShaderMaterial, GLSL/TSL, bloom and other effects. |
| [threejs-performance](threejs-performance/SKILL.md) | Draw calls, instancing, LOD, profiling, memory. |
| [threejs-design-prototyping](threejs-design-prototyping/SKILL.md) | Visual prototypes and Elight showcase pages in Three.js. |

## Conventions

- One skill = one subject. If it grows past ~150 lines, split it.
- The description starts with what the skill does and ends with when to use it.
- All project content (code, docs, skills, commits) is written in English.
- Three.js target version: r170+ (`three@0.170` or newer). Check the official docs if an API differs.
