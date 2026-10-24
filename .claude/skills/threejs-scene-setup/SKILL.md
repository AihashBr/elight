---
name: threejs-scene-setup
description: Correct Three.js scene setup (renderer, color space, tone mapping, camera, loop, resize, controls, resource disposal). Use when creating or reviewing any Three.js scene, viewer or prototype.
---

# Three.js: scene setup

Target version: r170+. Install with `npm i three` and import as modules (`three`, `three/addons/...`).

## Skeleton

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;      // default, keep it
renderer.toneMapping = THREE.ACESFilmicToneMapping;    // or AgXToneMapping / NeutralToneMapping
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
camera.position.set(3, 2, 6);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

function resize() {
  const { clientWidth: w, clientHeight: h } = canvas;
  if (canvas.width !== w * renderer.getPixelRatio() || canvas.height !== h * renderer.getPixelRatio()) {
    renderer.setSize(w, h, false);          // false: do not touch CSS
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

## Rules

- **Color:** hex values from design tokens enter as sRGB and Three converts them to linear (`ColorManagement` is on by default). Color textures (albedo, emissive) use `texture.colorSpace = THREE.SRGBColorSpace`; data maps (normal, roughness, metalness, AO) stay `NoColorSpace`.
- **Loop:** use `renderer.setAnimationLoop` (also works with WebXR) and `dt` for all animation; never advance per frame.
- **Resize:** observe the element (`ResizeObserver`) instead of only `window.resize` when the canvas lives in a dockable editor panel.
- **Pixel ratio:** cap at 2; allow dynamic resolution on weak GPUs.
- **Camera:** `near` as large and `far` as small as possible to preserve depth precision; for large worlds consider `logarithmicDepthBuffer` or a floating origin.
- **Controls:** `OrbitControls` for viewers; for the editor, custom controls with the shortcuts from `elight-editor-ui`.

## Disposal (avoid memory leaks)

Removing an object from the scene does **not** free GPU memory. When discarding:

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

Also call `renderer.dispose()` and `controls.dispose()` when destroying the view. Watch `renderer.info.memory` (geometries/textures) during development.

## Asset loading

- Prefer **glTF/GLB** with `GLTFLoader`; Draco/Meshopt compression and KTX2 textures (`KTX2Loader`) reduce size and VRAM.
- Reuse a single `LoadingManager` for one progress bar.
- Cache by URL; clone skinned models with `SkeletonUtils.clone`.

## WebGPU

`WebGPURenderer` and TSL materials exist (`three/webgpu`, `three/tsl`) and are the future path. Use them when the target allows and the feature (compute, TSL) justifies it; keep WebGL as a fallback.
