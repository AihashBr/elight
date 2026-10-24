# Skills do Elight

Skills de projeto do Claude Code. Cada pasta tem um `SKILL.md` com `name` e `description` no frontmatter; o Claude carrega a skill quando a tarefa bate com a descrição.

## Design

| Skill | Quando usar |
|---|---|
| [elight-design-principles](elight-design-principles/SKILL.md) | Identidade visual, hierarquia, ritmo, consistência. Ler antes de qualquer trabalho visual. |
| [elight-design-tokens](elight-design-tokens/SKILL.md) | Cores, tipografia, espaçamento, raios, sombras e tema claro/escuro como tokens. |
| [elight-editor-ui](elight-editor-ui/SKILL.md) | UI do editor: painéis, inspetor, hierarquia de cena, viewport, atalhos. |
| [elight-game-hud](elight-game-hud/SKILL.md) | HUD e UI dentro do jogo: legibilidade, safe areas, diálogo de NPC com IA. |

## Three.js

| Skill | Quando usar |
|---|---|
| [threejs-scene-setup](threejs-scene-setup/SKILL.md) | Renderer, câmera, loop, resize, cor/tone mapping, descarte de recursos. |
| [threejs-materials-lighting](threejs-materials-lighting/SKILL.md) | PBR, luzes, sombras, HDRI, texturas. |
| [threejs-shaders-postprocessing](threejs-shaders-postprocessing/SKILL.md) | ShaderMaterial, GLSL/TSL, bloom e outros efeitos. |
| [threejs-performance](threejs-performance/SKILL.md) | Draw calls, instancing, LOD, medição, memória. |
| [threejs-design-prototyping](threejs-design-prototyping/SKILL.md) | Protótipos visuais e páginas de apresentação da Elight em Three.js. |

## Convenções

- Uma skill = um assunto. Se passar de ~150 linhas, dividir.
- Descrição começa com o que a skill faz e termina com quando usar.
- Três.js: versão alvo r170+ (`three@0.170` ou mais nova). Conferir a doc oficial se a API divergir.
