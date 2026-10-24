---
name: elight-design-tokens
description: Tokens de design da Elight (cores, tipografia, espaçamento, raios, sombras, movimento, temas claro/escuro) com valores iniciais em CSS. Use ao definir ou consumir qualquer valor visual em UI web, editor ou protótipos.
---

# Tokens de design

Fonte única de verdade para valores visuais. Código e protótipos consomem **tokens**, nunca valores literais. Os valores abaixo são o ponto de partida; ajustar aqui e propagar.

## Arquivo base (`tokens.css`)

```css
:root {
  /* cor: superfícies (do fundo para o topo) */
  --bg:        #0e1014;
  --surface-1: #151821;
  --surface-2: #1c202b;
  --surface-3: #252a38;
  --border:    #2d3344;

  /* cor: texto */
  --text:        #e8eaf0;
  --text-muted:  #9aa1b5;
  --text-faint:  #6b7288;

  /* cor: destaque (a "luz") */
  --accent:      #ffd166;
  --accent-ink:  #1a1400;   /* texto sobre o destaque */
  --accent-glow: color-mix(in srgb, var(--accent) 35%, transparent);

  /* cor: semânticas */
  --ok: #5ad19a;  --warn: #f2a65a;  --danger: #f0647a;  --info: #6cb4ff;

  /* tipografia */
  --font-ui:   "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --fs-xs: 11px; --fs-sm: 12px; --fs-md: 14px; --fs-lg: 18px; --fs-xl: 24px; --fs-2xl: 36px;
  --lh-tight: 1.2; --lh-body: 1.5;

  /* espaçamento (grade de 4) */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-6: 24px; --sp-8: 32px; --sp-12: 48px;

  /* forma */
  --r-sm: 4px; --r-md: 8px; --r-lg: 12px; --r-full: 999px;
  --shadow-1: 0 1px 2px rgb(0 0 0 / .4);
  --shadow-2: 0 8px 24px rgb(0 0 0 / .45);

  /* movimento */
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
  :root:not([data-theme="dark"]) { /* repetir os valores de [data-theme="light"] */ }
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; }
}
```

## Regras

- Nome do token descreve **função** (`--surface-2`, `--text-muted`), não aparência (`--gray-800`).
- Não usar o destaque em mais de ~10% da área da tela. Ele guia o olho; se está em tudo, não guia nada.
- Texto sobre o destaque usa `--accent-ink`. Conferir contraste dos pares texto/fundo ao mudar qualquer valor.
- Tipografia: no máximo duas famílias (UI e mono). Mono para código, valores numéricos do inspetor e logs.
- Números de inspetor e HUD usam `font-variant-numeric: tabular-nums`.
- No Three.js, converter tokens de cor para `THREE.Color` a partir do hex, mantendo o espaço sRGB (ver `threejs-scene-setup`).
