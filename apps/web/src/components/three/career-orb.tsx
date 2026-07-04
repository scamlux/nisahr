'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Icosahedron, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Orb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.12;
    ref.current.rotation.x = Math.sin(t * 0.2) * 0.15;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
      <Icosahedron ref={ref} args={[1.35, 6]}>
        <MeshDistortMaterial
          color="#7c6cff"
          emissive="#40d6c4"
          emissiveIntensity={0.25}
          roughness={0.18}
          metalness={0.6}
          distort={0.35}
          speed={1.6}
        />
      </Icosahedron>
    </Float>
  );
}

function NodeCloud({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#9ad5ff"
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CursorRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.4, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.3, 0.05);
  });
  return <group ref={group}>{children}</group>;
}

export default function CareerOrb() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop="always"
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={2.4} color="#7c6cff" />
      <pointLight position={[-5, -3, 2]} intensity={1.6} color="#40d6c4" />
      <Stars radius={60} depth={40} count={1400} factor={3} saturation={0} fade speed={0.6} />
      <CursorRig>
        <Orb />
        <NodeCloud />
      </CursorRig>
    </Canvas>
  );
}
