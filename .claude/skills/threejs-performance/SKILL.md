---
name: threejs-performance
description: Otimização e medição de desempenho em Three.js (draw calls, instancing, merge, LOD, culling, texturas, memória, orçamento de frame). Use quando uma cena estiver lenta, ao planejar cenas grandes ou ao definir níveis de qualidade.
---

# Three.js: desempenho

**Medir antes de otimizar.** Orçamento de frame: 16,6 ms a 60 fps (menos ainda se a IA local disputa a GPU).

## Medição

- `renderer.info.render` → `calls`, `triangles`; `renderer.info.memory` → `geometries`, `textures`.
- `stats.js` ou `stats-gl` para FPS/ms; Chrome DevTools Performance e a extensão Spector.js para capturar draw calls.
- Perfilar na **máquina alvo mais fraca**, não só na sua.
- Separar custo de CPU (JS, draw calls) do custo de GPU (fill-rate, shaders): reduzir `setPixelRatio` — se o FPS sobe, o gargalo é GPU.

## Draw calls (gargalo mais comum)

- Meta de partida: < 200 draw calls para cenas comuns.
- **`InstancedMesh`** para muitas cópias do mesmo objeto (1 draw call):

```js
const mesh = new THREE.InstancedMesh(geometry, material, count);
const m = new THREE.Matrix4();
for (let i = 0; i < count; i++) { m.setPosition(x, y, z); mesh.setMatrixAt(i, m); }
mesh.instanceMatrix.needsUpdate = true;
```

- `BatchedMesh` para muitas geometrias diferentes com o mesmo material.
- Fundir geometrias estáticas (`mergeGeometries` de `BufferGeometryUtils`) e compartilhar materiais entre meshes; evitar criar materiais por objeto.
- Atlas de texturas para reduzir trocas.

## Geometria e visibilidade

- Frustum culling vem ligado; para instâncias, atualizar `boundingSphere` (`computeBoundingSphere`).
- **LOD:** `THREE.LOD` com 3 níveis; ou impostores para objetos distantes.
- Reduzir triângulos antes de qualquer outra coisa em malhas pesadas (Meshopt/gltfpack, `simplify`).
- Objetos estáticos: `matrixAutoUpdate = false` e chamar `updateMatrix()` uma vez.

## Luz e sombra

- Poucas luzes com sombra; sombras estáticas assadas; `shadow.autoUpdate = false` quando a cena não muda e `needsUpdate = true` só quando preciso.
- Evitar muitas `PointLight`; trocar por IBL + emissivos + bloom.

## Texturas e memória

- VRAM por textura ≈ `largura × altura × 4 × 1.33` bytes sem compressão. Uma 4096² sem compressão ≈ 85 MB.
- Usar **KTX2 (Basis/UASTC)** e mipmaps; redimensionar para o tamanho realmente usado.
- Descartar o que saiu de cena (`dispose`, ver `threejs-scene-setup`); acompanhar `renderer.info.memory`.
- Em jogos com IA local, **VRAM é compartilhada com o modelo**: reservar fatia fixa para gráficos e expor no painel de IA do editor.

## Loop e JS

- Zero alocação por frame: reutilizar `Vector3`/`Matrix4`/`Quaternion` temporários; evitar `new` e closures no loop.
- Atualizar só o que mudou (`needsUpdate` apenas quando necessário).
- Trabalho pesado (física, pathfinding, parsing) em Web Workers; `OffscreenCanvas` para renderizar fora da thread principal quando a UI for pesada.
- Renderização sob demanda: em viewers estáticos, renderizar só quando algo muda (`invalidate()`), poupando bateria.

## Qualidade ajustável

Definir presets (baixo/médio/alto) controlando: pixel ratio, resolução e tipo de sombra, bloom ligado/desligado, distância de LOD, densidade de instâncias. Oferecer resolução dinâmica: se a média de ms passar do orçamento, reduzir `pixelRatio` gradualmente.
