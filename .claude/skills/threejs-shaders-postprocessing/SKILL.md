---
name: threejs-shaders-postprocessing
description: Custom shaders (ShaderMaterial, onBeforeCompile, TSL) and post-processing (EffectComposer, bloom, SMAA, vignette) in Three.js. Use when creating visual effects, light glow, dissolve, gradients or any post-process pass.
---

# Three.js: shaders and post-processing

## When to write a shader

Try first: material properties, `emissive` + bloom, textures, `onBeforeCompile`. Write a full shader only when the effect does not fit those.

## ShaderMaterial

```js
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime:  { value: 0 },
    uColor: { value: new THREE.Color('#ffd166') },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */`
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      float pulse = 0.6 + 0.4 * sin(uTime * 2.0);
      float d = distance(vUv, vec2(0.5));
      float glow = smoothstep(0.5, 0.0, d) * pulse;
      gl_FragColor = vec4(uColor * glow, glow);
      #include <colorspace_fragment>
    }`,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
// in the loop: material.uniforms.uTime.value = clock.elapsedTime;
```

- Include `#include <colorspace_fragment>` (and `<tonemapping_fragment>` if you want tone mapping) to respect the output color space. `RawShaderMaterial` injects nothing.
- Pass values through **uniforms**; never recompile the shader per frame.
- Color uniforms: `THREE.Color` is already linear in modern Three.
- Avoid divergent `if`s and long loops in the fragment shader; prefer `mix`, `step`, `smoothstep`.
- Precision: add `precision highp float;` when targeting mobile and seeing artifacts.

## Extending PBR materials

To keep lighting and shadows, modify the standard material:

```js
material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = { value: 0 };
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <emissivemap_fragment>',
    `#include <emissivemap_fragment>
     totalEmissiveRadiance += vec3(0.2, 0.1, 0.0) * (0.5 + 0.5 * sin(uTime));`
  ).replace('void main() {', 'uniform float uTime;\nvoid main() {');
  material.userData.shader = shader;
};
```

## TSL and WebGPU

In `three/tsl`, effects are node graphs in JS (`color`, `uv`, `time`, `mix`...), compiled to WGSL or GLSL. Prefer TSL in new code that already uses `WebGPURenderer`; raw GLSL remains valid on WebGL.

## Post-processing

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.6, 0.4, 0.85)); // strength, radius, threshold
composer.addPass(new OutputPass());   // tone mapping + sRGB at the end
// loop: composer.render() instead of renderer.render()
// resize: composer.setSize(w, h)
```

- Order: Render -> effects in linear space (bloom, SSAO) -> `OutputPass` (tone mapping/color) -> screen-space effects (grain, vignette) if needed.
- Selective bloom: high threshold, and only emissive materials above 1.0 glow (use `emissiveIntensity > 1`).
- Anti-aliasing with a composer: the renderer's MSAA does not apply; use `SMAAPass` or a render target with `samples: 4`.
- Each pass costs fill-rate; measure with the tools in `threejs-performance` and offer adjustable quality.

## Useful effects for the Elight identity

- **Light halo:** additive sprite/plane with a radial shader (above).
- **Dissolve/reveal:** `smoothstep` of noise with `discard` or alpha, emissive edge in the accent color.
- **Fading grid:** infinite grid shader that fades with distance, for the editor viewport.
- **"AI thinking" particles:** `Points` with a `ShaderMaterial`, position animated on the GPU by `uTime`.
