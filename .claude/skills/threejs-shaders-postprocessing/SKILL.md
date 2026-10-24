---
name: threejs-shaders-postprocessing
description: Shaders customizados (ShaderMaterial, onBeforeCompile, TSL) e pós-processamento (EffectComposer, bloom, SMAA, vinheta) em Three.js. Use ao criar efeitos visuais, brilho de luz, dissolve, gradientes ou qualquer passe de pós-processo.
---

# Three.js: shaders e pós-processamento

## Quando escrever shader

Primeiro tentar: propriedades do material, `emissive` + bloom, texturas, `onBeforeCompile`. Escrever shader completo só quando o efeito não cabe nisso.

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
// no loop: material.uniforms.uTime.value = clock.elapsedTime;
```

- Incluir `#include <colorspace_fragment>` (e `<tonemapping_fragment>` se quiser tone mapping) para respeitar o espaço de cor de saída. `RawShaderMaterial` não injeta nada.
- Passar valores por **uniforms**; nunca recompilar o shader por frame.
- Uniforms de cor: `THREE.Color` já está em linear no Three moderno.
- Evitar `if` divergentes e laços longos no fragment; preferir `mix`, `step`, `smoothstep`.
- Precisão: `precision highp float;` quando o alvo for mobile e houver artefatos.

## Estender materiais PBR

Para manter luz e sombra, modificar o material padrão:

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

## TSL e WebGPU

Em `three/tsl` os efeitos são grafos de nós em JS (`color`, `uv`, `time`, `mix`…), compilados para WGSL ou GLSL. Preferir TSL em código novo que já usa `WebGPURenderer`; GLSL cru continua válido no WebGL.

## Pós-processamento

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.6, 0.4, 0.85)); // força, raio, limiar
composer.addPass(new OutputPass());   // tone mapping + sRGB no final
// loop: composer.render() no lugar de renderer.render()
// resize: composer.setSize(w, h)
```

- Ordem: Render → efeitos em espaço linear (bloom, SSAO) → `OutputPass` (tone mapping/cor) → efeitos em espaço de tela (grão, vinheta) se precisar.
- Bloom seletivo: limiar alto e só materiais emissivos acima de 1.0 brilham (usar `emissiveIntensity > 1`).
- Anti-aliasing com composer: o MSAA do renderer não se aplica; usar `SMAAPass` ou `renderTarget` com `samples: 4`.
- Cada passe custa fill-rate; medir com o painel do `threejs-performance` e oferecer qualidade ajustável.

## Efeitos úteis para a identidade Elight

- **Halo de luz:** sprite/plano com shader radial aditivo (acima).
- **Dissolve/revelar:** `smoothstep` de ruído com `discard` ou alfa, borda emissiva na cor de destaque.
- **Grade com fade:** shader de grade infinita que some com a distância, para o viewport do editor.
- **Partículas de "pensamento da IA":** `Points` com `ShaderMaterial`, posição animada na GPU por `uTime`.
