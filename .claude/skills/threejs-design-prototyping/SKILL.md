---
name: threejs-design-prototyping
description: Como montar protótipos visuais e páginas de apresentação da Elight em Three.js (estrutura de projeto, composição de cena com a identidade de luz, UI sobreposta, acessibilidade e fallback). Use ao criar landing page, demo, mockup do editor ou estudo visual em Three.js.
---

# Three.js: protótipos de design

Protótipos Three.js servem para **testar linguagem visual** (luz, materiais, movimento) antes de implementá-la na engine em Rust, e para a página pública da Elight. Eles não são o motor do jogo.

## Estrutura mínima (Vite)

```
proto/
  index.html
  src/
    main.js          # bootstrap: renderer, loop, resize
    scene.js         # monta a cena
    theme.js         # lê tokens CSS → THREE.Color
    ui.css           # UI HTML sobreposta (usa tokens)
  public/env/        # HDRI, texturas KTX2, modelos GLB
```

`npm create vite@latest proto -- --template vanilla` e `npm i three`.

## Tokens CSS → Three.js

Uma fonte de verdade: ler as variáveis CSS (ver `elight-design-tokens`).

```js
const css = getComputedStyle(document.documentElement);
export const token = (name) => new THREE.Color(css.getPropertyValue(name).trim());
// scene.background = token('--bg'); keyLight.color = token('--accent');
```

Reagir à troca de tema relendo os tokens e atualizando cores (sem recriar a cena).

## Composição com a identidade "luz"

- Fundo `--bg`, neblina leve (`scene.fog`) na mesma cor para profundidade.
- **Uma** fonte de luz protagonista na cor de destaque, com halo (sprite aditivo) e bloom discreto.
- Geometria simples e limpa (esferas, grades, planos); materiais foscos; reflexos suaves por IBL.
- Movimento lento e contínuo (parallax com o mouse, flutuação suave). Nada que distraia do texto.
- Esquema: primeiro plano nítido, fundo desfocado ou escurecido para não competir com a UI.

## UI HTML sobre o canvas

- Canvas em `position: fixed; inset: 0; z-index: 0`; conteúdo em camadas HTML acima. Texto real em HTML (selecionável, acessível, SEO), **não** texturas.
- `pointer-events: none` no canvas decorativo; controles de câmera só quando fizer parte da interação.
- Rótulos 3D ancorados: projetar posição 3D para tela (`vector.project(camera)`) ou usar `CSS2DRenderer` de `three/addons`.

## Interação e scroll

- Scroll → câmera: mapear progresso (0–1) para posição/alvo da câmera com interpolação suave (`lerp`/damping), nunca saltos.
- Entradas respeitam `prefers-reduced-motion`: sem parallax nem flutuação, cena estática bem composta.
- Hover e foco em objetos 3D interativos com `Raycaster`, com alternativa por teclado (botão HTML equivalente).

## Qualidade e fallback

- Detectar WebGL (`WebGLRenderingContext`) e, se falhar, mostrar imagem estática da cena.
- Pixel ratio ≤ 2; reduzir bloom e sombras em mobile; pausar o loop quando a aba estiver oculta (`document.visibilityState`) ou o canvas fora da tela (`IntersectionObserver`).
- Orçamento de carga: JS + assets iniciais < 2 MB quando possível; carregar o resto sob demanda com indicador de progresso.

## Checklist de entrega

- [ ] Tokens em um só lugar, tema claro/escuro funcionando
- [ ] 60 fps em notebook modesto; verificado em `threejs-performance`
- [ ] Texto em HTML, contraste ok sobre a cena
- [ ] `prefers-reduced-motion` respeitado
- [ ] Descarte de recursos ao desmontar (`threejs-scene-setup`)
- [ ] Fallback sem WebGL
