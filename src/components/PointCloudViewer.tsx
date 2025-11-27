import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

interface Point {
  x: number;
  y: number;
  z: number;
}

interface Props {
  points: Point[];
}

function PointCloud({ points }: Props) {
  const positions = useMemo(() => {
    const pos = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    });
    return pos;
  }, [points]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.01}
        sizeAttenuation
        color="#00ffcc"
        transparent
        opacity={0.8}
      />
    </points>
  );
}

export default function PointCloudViewer({ points }: Props) {
  if (!points || points.length === 0) return null;

  return (
    <div className="absolute inset-0 bg-black z-30">
      <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <OrbitControls enableDamping dampingFactor={0.05} />
        <PointCloud points={points} />
        <gridHelper args={[10, 10]} />
      </Canvas>
    </div>
  );
}
