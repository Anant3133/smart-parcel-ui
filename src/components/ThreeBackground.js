import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function ThreeBackground() {
  const count = 5000;
  const positions = new Float32Array(count * 3).map(() => THREE.MathUtils.randFloatSpread(100));

  return (
    <Canvas camera={{ position: [0, 0, 1] }} className="fixed top-0 left-0 w-full h-full -z-10">
      <Points positions={positions} stride={3} frustumCulled>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </Canvas>
  );
}
