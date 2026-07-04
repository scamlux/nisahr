'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Full-bleed WebGL background: a slow black-hole / cosmic vortex.
 * A single full-screen quad; everything is drawn in the fragment shader, so
 * it's cheap and loops forever. Colours are driven by the active theme.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform vec3 uBg;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uDark;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv - 0.5;
    uv.x *= uAspect;

    float r = length(uv);
    float ang = atan(uv.y, uv.x);

    // Accretion swirl — rotation accelerates toward the core.
    float swirl = ang + 0.6 / (r + 0.16) - uTime * 0.22;
    float bands = 0.5 + 0.5 * sin(swirl * 3.0 + r * 8.0);

    // Nebula haze, dragged along the swirl.
    vec2 np = vec2(cos(swirl), sin(swirl)) * r * 3.0 + uTime * 0.03;
    float neb = fbm(np * 1.5);

    // Bright ring hugging the event horizon + soft outer falloff.
    // (square manually — pow() with a negative base is undefined in GLSL.)
    float rd = (r - 0.22) * 7.0;
    float ring = exp(-rd * rd);
    float glow = smoothstep(0.95, 0.0, r);

    float energy = (bands * 0.5 + neb * 0.7) * glow + ring * 1.3;
    vec3 tint = mix(uColorA, uColorB, clamp(neb + bands * 0.4, 0.0, 1.0));

    // Dark theme: glowing vortex on near-black, dark core, twinkling stars.
    float hole = smoothstep(0.20, 0.05, r);
    vec3 darkC = uBg + tint * energy;
    darkC = mix(darkC, uBg * 0.12, hole);
    vec2 sp = vUv * vec2(uAspect, 1.0) * 220.0;
    float star = step(0.986, hash(floor(sp)));
    float tw = 0.55 + 0.45 * sin(uTime * 3.0 + hash(floor(sp)) * 30.0);
    darkC += star * tw * glow * vec3(0.9, 0.95, 1.0) * 0.7;

    // Light theme: soft pastel swirl that gently removes light (no black hole).
    vec3 lightC = uBg - (vec3(1.0) - tint) * energy * 0.22;

    vec3 col = mix(lightC, darkC, uDark);
    col *= smoothstep(1.2, 0.15, r); // vignette
    gl_FragColor = vec4(col, 1.0);
  }
`;

function rgbVar(name: string): THREE.Color {
  if (typeof window === 'undefined') return new THREE.Color(0, 0, 0);
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const [r, g, b] = raw.split(/\s+/).map(Number);
  return new THREE.Color((r || 0) / 255, (g || 0) / 255, (b || 0) / 255);
}

function Vortex({ dark }: { dark: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uBg: { value: rgbVar('--bg') },
      uColorA: { value: rgbVar('--primary') },
      uColorB: { value: rgbVar('--accent') },
      uDark: { value: dark ? 1 : 0 },
    }),
    // Re-read palette when the theme flips.
    [dark],
  );

  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uAspect.value = size.width / size.height;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function CosmicScene({ dark }: { dark: boolean }) {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 1], fov: 50 }}
      frameloop="always"
    >
      <Vortex dark={dark} />
    </Canvas>
  );
}
