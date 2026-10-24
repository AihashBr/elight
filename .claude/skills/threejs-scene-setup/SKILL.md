---
name: threejs-scene-setup
description: Configuração correta de uma cena Three.js (renderer, espaço de cor, tone mapping, câmera, loop, resize, controles, descarte de recursos). Use ao criar ou revisar qualquer cena, viewer ou protótipo em Three.js.
---

# Three.js: setup de cena

Versão alvo: r170+. Instalar com `npm i three` e importar de módulos (`three`, `three/addons/...`).

## Esqueleto

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;      // padrão, manter
renderer.toneMapping = THREE.ACESFilmicToneMapping;    // ou AgXToneMapping / NeutralToneMapping
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
camera.position.set(3, 2, 6);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

function resize() {
  const { clientWidth: w, clientHeight: h } = canvas;
  if (canvas.width !== w * renderer.getPixelRatio() || canvas.height !== h * renderer.getPixelRatio()) {
    renderer.setSize(w, h, false);          // false: não mexe no CSS
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  resize();
  const dt = clock.getDelta();
  controls.update();
  // update(dt)
  renderer.render(scene, camera);
});
```

## Regras

- **Cor:** hex de design tokens entram como sRGB e o Three converte para linear (`ColorManagement` já vem ligado). Texturas de cor (albedo, emissive) usam `texture.colorSpace = THREE.SRGBColorSpace`; mapas de dados (normal, roughness, metalness, AO) ficam em `NoColorSpace`.
- **Loop:** usar `renderer.setAnimationLoop` (funciona também com WebXR) e `dt` para toda animação; nunca avanço por frame.
- **Resize:** observar o elemento (`ResizeObserver`) em vez de só `window.resize` quando o canvas está em painel acoplável do editor.
- **Pixel ratio:** limitar a 2; em GPUs fracas permitir resolução dinâmica.
- **Câmera:** `near` o maior possível e `far` o menor possível para preservar precisão de profundidade; para mundos grandes considerar `logarithmicDepthBuffer` ou origem flutuante.
- **Controles:** `OrbitControls` para viewers; para o editor, controles próprios com atalhos do `elight-editor-ui`.

## Descarte (evitar vazamento de memória)

Remover um objeto da cena **não** libera a GPU. Ao descartar:

```js
function disposeObject(root) {
  root.traverse((o) => {
    o.geometry?.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      for (const v of Object.values(m)) if (v?.isTexture) v.dispose();
      m.dispose();
    }
  });
}
```

Também chamar `renderer.dispose()` e `controls.dispose()` ao destruir a view. Monitorar `renderer.info.memory` (geometries/textures) durante desenvolvimento.

## Carregamento de assets

- Preferir **glTF/GLB** com `GLTFLoader`; compressão com Draco/Meshopt e texturas KTX2 (`KTX2Loader`) para reduzir tamanho e VRAM.
- Reutilizar `LoadingManager` para barra de progresso única.
- Cachear por URL; clonar com `SkeletonUtils.clone` para modelos com esqueleto.

## WebGPU

`WebGPURenderer` e materiais TSL existem (`three/webgpu`, `three/tsl`) e são o caminho futuro. Usar quando o alvo permitir e o recurso (compute, TSL) justificar; manter WebGL como fallback.
