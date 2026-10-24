import * as THREE from 'three';

export interface LightField {
  dispose(): void;
}

// Reads a design token from the root element so the scene shares the page palette.
function token(name: string): THREE.Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(value || '#ffffff');
}

// Soft radial sprite used for the core halo and round points.
function radialTexture(size: number, hardness: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(hardness, 'rgba(255,255,255,0.35)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function randomOnShell(min: number, max: number, target: THREE.Vector3): THREE.Vector3 {
  const u = Math.random() * 2 - 1;
  const theta = Math.random() * Math.PI * 2;
  const r = min + Math.random() * (max - min);
  const s = Math.sqrt(1 - u * u);
  return target.set(r * s * Math.cos(theta), r * u, r * s * Math.sin(theta));
}

function points(positions: Float32Array, size: number, map: THREE.Texture): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    size,
    map,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return new THREE.Points(geometry, material);
}

/**
 * Decorative background for the home page: a glowing "light core" (the brand motif)
 * wrapped in a slowly rotating neural shell, orbit rings, sparks and floating wireframes.
 * Throws if WebGL is unavailable so the caller can show a fallback.
 */
export function createLightField(canvas: HTMLCanvasElement): LightField {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(token('--bg'), 10, 34);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
  camera.position.set(0, 0, 14);

  const glowTexture = radialTexture(128, 0.25);
  const dotTexture = radialTexture(32, 0.6);

  // Everything around the core moves together so it can be placed per viewport.
  const cluster = new THREE.Group();
  scene.add(cluster);

  // Core: the protagonist light source.
  const coreMaterial = new THREE.MeshBasicMaterial({ toneMapped: false });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.7, 48, 48), coreMaterial);
  cluster.add(core);

  const haloInner = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTexture, transparent: true, depthWrite: false }),
  );
  haloInner.scale.setScalar(6);
  const haloOuter = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTexture, transparent: true, depthWrite: false }),
  );
  haloOuter.scale.setScalar(16);
  cluster.add(haloInner, haloOuter);

  // Orbit rings.
  const ringMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
  const rings = [2.1, 3.0, 4.1].map((radius, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.008, 8, 160), ringMaterial);
    ring.rotation.set(Math.PI / 2 + (i - 1) * 0.45, i * 0.6, 0);
    cluster.add(ring);
    return ring;
  });

  // Neural shell: nodes plus links between close neighbours.
  const shell = new THREE.Group();
  cluster.add(shell);

  const nodeCount = 700;
  const nodes: THREE.Vector3[] = [];
  const nodePositions = new Float32Array(nodeCount * 3);
  for (let i = 0; i < nodeCount; i++) {
    const p = randomOnShell(4.6, 6.8, new THREE.Vector3());
    nodes.push(p);
    p.toArray(nodePositions, i * 3);
  }
  const nodePoints = points(nodePositions, 0.09, dotTexture);
  shell.add(nodePoints);

  const linkPositions: number[] = [];
  const linkSources = Math.min(260, nodeCount);
  for (let i = 0; i < linkSources; i++) {
    let links = 0;
    for (let j = i + 1; j < nodeCount && links < 3; j++) {
      if (nodes[i].distanceToSquared(nodes[j]) < 1.3) {
        linkPositions.push(...nodes[i].toArray(), ...nodes[j].toArray());
        links++;
      }
    }
  }
  const linkGeometry = new THREE.BufferGeometry();
  linkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linkPositions, 3));
  const linkMaterial = new THREE.LineBasicMaterial({ transparent: true, depthWrite: false });
  shell.add(new THREE.LineSegments(linkGeometry, linkMaterial));

  // Sparks orbiting close to the core.
  const sparkPositions = new Float32Array(90 * 3);
  const tmp = new THREE.Vector3();
  for (let i = 0; i < 90; i++) {
    randomOnShell(1.4, 3.8, tmp).toArray(sparkPositions, i * 3);
  }
  const sparks = points(sparkPositions, 0.14, dotTexture);
  cluster.add(sparks);

  // Depth dust across the whole page.
  const dustPositions = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    dustPositions.set(
      [(Math.random() - 0.5) * 44, (Math.random() - 0.5) * 34, -Math.random() * 18 + 4],
      i * 3,
    );
  }
  const dust = points(dustPositions, 0.06, dotTexture);
  scene.add(dust);

  // Floating wireframe solids, far from the text column.
  const edgeMaterial = new THREE.LineBasicMaterial({ transparent: true, depthWrite: false });
  const solidGeometries = [
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1, 0)),
    new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1, 0)),
    new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(1, 0)),
  ];
  const solids = [
    [-11, 6, -6, 1.1],
    [-8, -7, -3, 0.8],
    [12, -5, -5, 1.4],
    [-14, -1, -9, 1.6],
    [9, 8, -8, 0.9],
    [2, -11, -7, 1.2],
  ].map(([x, y, z, s], i) => {
    const solid = new THREE.LineSegments(solidGeometries[i % solidGeometries.length], edgeMaterial);
    solid.position.set(x, y, z);
    solid.scale.setScalar(s);
    solid.userData['base'] = solid.position.clone();
    solid.userData['phase'] = Math.random() * Math.PI * 2;
    scene.add(solid);
    return solid;
  });

  function applyColors(): void {
    const accent = token('--accent');
    const muted = token('--text-muted');
    const faint = token('--text-faint');

    (scene.fog as THREE.Fog).color = token('--bg');
    coreMaterial.color = accent.clone().multiplyScalar(1.15);

    for (const [halo, opacity] of [
      [haloInner, 0.9],
      [haloOuter, 0.35],
    ] as const) {
      halo.material.color = accent;
      halo.material.blending = THREE.AdditiveBlending;
      halo.material.opacity = opacity;
      halo.userData['opacity'] = opacity;
    }

    ringMaterial.color = accent;
    ringMaterial.opacity = 0.3;
    ringMaterial.blending = THREE.AdditiveBlending;

    const nodeMaterial = nodePoints.material as THREE.PointsMaterial;
    nodeMaterial.color = muted;
    nodeMaterial.opacity = 0.6;

    linkMaterial.color = muted;
    linkMaterial.opacity = 0.14;

    const sparkMaterial = sparks.material as THREE.PointsMaterial;
    sparkMaterial.color = accent;
    sparkMaterial.blending = THREE.AdditiveBlending;
    sparkMaterial.opacity = 0.9;

    const dustMaterial = dust.material as THREE.PointsMaterial;
    dustMaterial.color = faint;
    dustMaterial.opacity = 0.45;

    edgeMaterial.color = faint;
    edgeMaterial.opacity = 0.4;
    renderOnce();
  }

  // Keep the core next to the hero console on wide screens and above the text on narrow ones.
  const clusterBase = new THREE.Vector3();
  let halfHeight = 1;

  function layout(): void {
    halfHeight = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const halfWidth = halfHeight * camera.aspect;
    if (camera.aspect >= 1.1) {
      clusterBase.set(halfWidth * 0.6, halfHeight * 0.4, -1);
      cluster.scale.setScalar(1);
    } else {
      clusterBase.set(halfWidth * 0.75, halfHeight * 0.9, -2);
      cluster.scale.setScalar(0.5);
    }
    cluster.position.copy(clusterBase);
  }

  function resize(): void {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) {
      return;
    }
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    layout();
    renderOnce();
  }

  const pointer = new THREE.Vector2();
  const onPointerMove = (event: PointerEvent) => {
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
  };

  function scrollProgress(): number {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  }

  // Scroll in viewport heights; the core leaves with the hero so it never sits behind body text.
  function scrollViewports(): number {
    return window.scrollY / Math.max(window.innerHeight, 1);
  }

  const clock = new THREE.Clock();
  let elapsed = 0;

  function frame(): void {
    const dt = Math.min(clock.getDelta(), 0.1);
    elapsed += dt;
    const damping = 1 - Math.exp(-dt * 2.5);
    const progress = scrollProgress();

    // Slow pulse on the core and halo ("thinking" language from the design principles).
    const pulse = Math.sin(elapsed * 1.1);
    core.scale.setScalar(1 + pulse * 0.04);
    haloInner.material.opacity = haloInner.userData['opacity'] * (0.85 + pulse * 0.15);

    shell.rotation.y += dt * 0.05;
    shell.rotation.x = Math.sin(elapsed * 0.1) * 0.15;
    sparks.rotation.y -= dt * 0.18;
    sparks.rotation.z += dt * 0.04;
    rings.forEach((ring, i) => (ring.rotation.z += dt * (0.08 + i * 0.05) * (i % 2 ? -1 : 1)));
    dust.rotation.y += dt * 0.006;

    for (const solid of solids) {
      const base = solid.userData['base'] as THREE.Vector3;
      const phase = solid.userData['phase'] as number;
      solid.position.y = base.y + Math.sin(elapsed * 0.4 + phase) * 0.4;
      solid.rotation.x += dt * 0.08;
      solid.rotation.y += dt * 0.1;
    }

    // Mouse parallax and scroll drift, both damped so nothing jumps.
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * damping;
    camera.position.y += (-pointer.y * 0.5 - progress * 2 - camera.position.y) * damping;
    const clusterY = clusterBase.y + Math.min(scrollViewports(), 2) * halfHeight * 1.6;
    cluster.position.y += (clusterY - cluster.position.y) * Math.min(damping * 3, 1);
    cluster.rotation.x += (progress * 0.8 - cluster.rotation.x) * damping;
    camera.lookAt(0, camera.position.y * 0.6, 0);

    renderer.render(scene, camera);
  }

  function renderOnce(): void {
    if (reducedMotion) {
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
  }

  function setRunning(running: boolean): void {
    if (reducedMotion) {
      return;
    }
    if (running) {
      clock.getDelta();
      renderer.setAnimationLoop(frame);
    } else {
      renderer.setAnimationLoop(null);
    }
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);


  const onVisibility = () => setRunning(document.visibilityState === 'visible');
  document.addEventListener('visibilitychange', onVisibility);
  if (!reducedMotion) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  resize();
  applyColors();
  setRunning(true);

  return {
    dispose() {
      setRunning(false);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);

      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        materials.forEach((material) => material.dispose());
      });
      solidGeometries.forEach((geometry) => geometry.dispose());
      glowTexture.dispose();
      dotTexture.dispose();
      renderer.dispose();
    },
  };
}
