---
name: threejs-materials-lighting
description: Materiais PBR, iluminação, sombras, HDRI/IBL e texturas em Three.js com foco em aparência consistente e custo controlado. Use ao definir aparência de objetos, luzes e ambiente de uma cena.
---

# Three.js: materiais e iluminação

## Materiais

- Padrão: `MeshStandardMaterial` (PBR metal/rough). Usar `MeshPhysicalMaterial` só quando precisar de `clearcoat`, `transmission`, `sheen`, `iridescence` (mais caro).
- `MeshBasicMaterial` para UI 3D, gizmos e elementos que não reagem à luz; `MeshToonMaterial` para estilo cel-shaded.
- Mapas: `map` (albedo, sRGB), `normalMap`, `roughnessMap`+`metalnessMap` (canais G e B de uma textura ORM combinada), `aoMap`, `emissiveMap` (sRGB). Combinar em texturas ORM economiza amostras e memória.
- Valores físicos plausíveis: dielétricos `metalness = 0`, metais `1`; evitar valores intermediários exceto em transições (sujeira, ferrugem).
- Cores de albedo nunca puras (0 ou 1): faixa útil ≈ 0.04 a 0.9 em linear.
- `emissive` + bloom dá o "efeito luz" da identidade Elight (ver `threejs-shaders-postprocessing`).

## Iluminação

Regra: **luz de ambiente por IBL, luz direcional para direção e sombra, poucas luzes dinâmicas**.

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

new RGBELoader().load('/env/studio.hdr', (tex) => {
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;          // iluminação + reflexo
  scene.background = tex;           // opcional
  scene.environmentIntensity = 1.0;
});

const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(5, 8, 4);
sun.castShadow = true;
scene.add(sun);
```

- Tipos: `DirectionalLight` (sol), `PointLight`/`SpotLight` (custo cresce com cada luz e sombra), `HemisphereLight` (ambiente barato), `RectAreaLight` (sem sombra, só com Standard/Physical).
- Para PMREM de HDRI use `PMREMGenerator` (o `scene.environment` com equirect já faz isso internamente).
- Cenas estáticas: **assar** iluminação (lightmaps / AO) em vez de luzes em tempo real.

## Sombras

```js
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 30;
// Ajustar o frustum ortográfico para cobrir só a área visível
Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
sun.shadow.bias = -0.0005;      // acne
sun.shadow.normalBias = 0.02;   // peter-panning
```

- Menor frustum possível = sombra mais nítida. Usar `CameraHelper(sun.shadow.camera)` para depurar.
- Poucas luzes com `castShadow`; cada uma re-renderiza a cena.
- Objetos que não projetam ou recebem sombra: desligar `castShadow`/`receiveShadow`.

## Texturas

- Potências de dois não são exigidas no WebGL2, mas mipmaps e dimensões múltiplas de 4 ajudam compressão.
- `texture.anisotropy = renderer.capabilities.getMaxAnisotropy()` para superfícies vistas em ângulo (limitar a 8 em alvos modestos).
- Preferir KTX2/Basis para reduzir VRAM; PNG/JPG só em protótipos.

## Estilo Elight

Cenas de apresentação: fundo `--bg`, uma fonte de luz quente (`--accent`) como key light, preenchimento frio fraco, emissivos na cor de destaque. Referenciar tokens em `elight-design-tokens`.
