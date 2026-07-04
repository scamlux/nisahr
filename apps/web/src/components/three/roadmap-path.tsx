'use client';

import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface PathNode {
  title: string;
  status: string;
  milestone: boolean;
  completion: number;
}

function Node({
  position,
  node,
  active,
}: {
  position: [number, number, number];
  node: PathNode;
  active: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const done = node.status === 'DONE';
  const color = done ? '#34c77b' : active ? '#7c6cff' : '#3a3f57';

  useFrame((state) => {
    if (!ref.current) return;
    const target = hovered ? 1.35 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
    if (active || done) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.06;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[node.milestone ? 0.34 : 0.26, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={done || active ? 0.6 : 0.15}
          roughness={0.25}
          metalness={0.5}
        />
      </mesh>
      {hovered && (
        <Html center distanceFactor={10} position={[0, 0.6, 0]}>
          <div className="whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-fg shadow-soft">
            {node.title} · {node.completion}%
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({ nodes }: { nodes: PathNode[] }) {
  const points = useMemo(() => {
    const n = nodes.length || 1;
    return nodes.map((_, i) => {
      const t = n > 1 ? i / (n - 1) : 0.5;
      const x = (t - 0.5) * 7;
      const y = Math.sin(t * Math.PI * 1.4) * 1.1;
      const z = Math.cos(t * Math.PI) * 0.6;
      return [x, y, z] as [number, number, number];
    });
  }, [nodes]);

  const activeIndex = useMemo(() => {
    const idx = nodes.findIndex((n) => n.status !== 'DONE');
    return idx === -1 ? nodes.length - 1 : idx;
  }, [nodes]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 4, 4]} intensity={2} color="#7c6cff" />
      <pointLight position={[-4, -2, 2]} intensity={1.2} color="#40d6c4" />
      {points.length > 1 && (
        <Line points={points} color="#3a3f57" lineWidth={2} dashed dashSize={0.2} gapSize={0.12} />
      )}
      <Float speed={1} rotationIntensity={0.15} floatIntensity={0.3}>
        {nodes.map((node, i) => (
          <Node key={i} position={points[i]} node={node} active={i === activeIndex} />
        ))}
      </Float>
    </>
  );
}

export default function RoadmapPath({ nodes }: { nodes: PathNode[] }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.5, 8], fov: 42 }} gl={{ alpha: true, antialias: true }}>
      <Scene nodes={nodes} />
    </Canvas>
  );
}
