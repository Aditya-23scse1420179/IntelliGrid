'use client';

import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Torus } from '@react-three/drei';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Zap, Play, Pause, RotateCcw } from 'lucide-react';

/* ---------------- ENERGY SPHERE ---------------- */

function EnergySphere({ usage, color, paused }: any) {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current || paused) return;
    meshRef.current.rotation.y += 0.01;
    const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
    meshRef.current.scale.set(pulse, pulse, pulse);
  });

  const normalizedUsage = Math.min(usage / 100, 2);
  const sphereSize = 0.5 + normalizedUsage * 0.5;

  return (
    <Sphere ref={meshRef} args={[sphereSize, 32, 32]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        metalness={0.9}
        roughness={0.1}
      />
    </Sphere>
  );
}

/* ---------------- PARTICLES ---------------- */

function EnergyParticles({ count = 100, paused }: any) {
  const particlesRef = useRef<any>(null);

  const particles = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame(() => {
    if (!particlesRef.current || paused) return;
    particlesRef.current.rotation.y += 0.001;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} transparent opacity={0.6} />
    </points>
  );
}

/* ---------------- RING ---------------- */

function EnergyRing({ radius = 2, color = '#10b981', paused }: any) {
  const ringRef = useRef<any>(null);

  useFrame(() => {
    if (!ringRef.current || paused) return;
    ringRef.current.rotation.x += 0.02;
    ringRef.current.rotation.y += 0.01;
  });

  return (
    <Torus ref={ringRef} args={[radius, 0.05, 16, 100]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.7}
      />
    </Torus>
  );
}

/* ---------------- BUILDING ---------------- */

function EnergyBuilding() {
  return (
    <group position={[0, -1, 0]}>
      <Box args={[2, 2, 2]}>
        <meshStandardMaterial color="#4b5563" />
      </Box>

      <Box args={[2.2, 0.3, 2.2]} position={[0, 1.15, 0]}>
        <meshStandardMaterial color="#1f2933" />
      </Box>

      <Box args={[1.5, 0.05, 1]} position={[0, 1.5, 0]} rotation={[Math.PI * 0.15, 0, 0]}>
        <meshStandardMaterial emissive="#3b82f6" />
      </Box>
    </group>
  );
}

/* ---------------- SCENE ---------------- */

function Scene({ usage, paused }: any) {
  const getEnergyColor = (u: number) =>
    u < 30 ? '#10b981' : u < 70 ? '#fbbf24' : '#ef4444';

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />

      <EnergySphere usage={usage} color={getEnergyColor(usage)} paused={paused} />
      <EnergyRing radius={2} paused={paused} />
      <EnergyRing radius={2.5} color="#06b6d4" paused={paused} />
      <EnergyParticles paused={paused} />

      <EnergyBuilding />

      <OrbitControls autoRotate={!paused} />
    </>
  );
}

/* ---------------- MAIN EXPORT ---------------- */

export function Energy3DVisualization({ currentUsage }: { currentUsage: number }) {
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <Card className={fullscreen ? 'fixed inset-4 z-50' : ''}>
      <div className="p-4 flex justify-between">
        <div className="flex gap-2 items-center">
          <Zap />
          <span>3D Energy</span>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setPaused(!paused)}>
            {paused ? <Play /> : <Pause />}
          </Button>
          <Button onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      <div className="h-96 bg-black">
        <Canvas key={fullscreen ? 'full' : 'normal'} camera={{ position: [5, 3, 5] }}>
          <Suspense fallback={null}>
            <Scene usage={currentUsage} paused={paused} />
          </Suspense>
        </Canvas>
      </div>
    </Card>
  );
}
