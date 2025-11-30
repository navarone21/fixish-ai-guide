import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function AnimatedSphere({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) {
  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function AnimatedBox({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) {
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh position={position}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
    </Float>
  );
}

function AnimatedTorus({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) {
  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={2}>
      <mesh position={position}>
        <torusGeometry args={[1, 0.4, 16, 100]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
      </mesh>
    </Float>
  );
}

export function Hero3DBackground() {
  return (
    <div className="absolute inset-0 opacity-60">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4F46E5" />
        <pointLight position={[10, -10, -5]} intensity={0.5} color="#06B6D4" />

        {/* Animated 3D Objects */}
        <AnimatedSphere position={[-4, 2, -2]} color="#4F46E5" speed={1.5} />
        <AnimatedBox position={[4, -2, -3]} color="#06B6D4" speed={2} />
        <AnimatedTorus position={[0, 3, -5]} color="#8B5CF6" speed={1.2} />
        <AnimatedSphere position={[5, 3, -4]} color="#10B981" speed={1.8} />
        <AnimatedBox position={[-5, -3, -2]} color="#F59E0B" speed={1.4} />
        <AnimatedTorus position={[3, -4, -6]} color="#EC4899" speed={1.6} />

        {/* Orbit controls disabled for background effect */}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}
