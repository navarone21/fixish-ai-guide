import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

interface ArrowInstruction {
  from: [number, number, number];
  to: [number, number, number];
  label?: string;
}

interface MeshViewerProps {
  meshUrl: string | null;
  highlightParts?: string[];
  overlayArrows?: ArrowInstruction[];
}

function Arrow({ from, to, label }: ArrowInstruction) {
  const direction = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const length = direction.length();
  const arrowRef = useRef<THREE.ArrowHelper>(null);

  return (
    <group>
      <arrowHelper
        ref={arrowRef}
        args={[
          direction.normalize(),
          new THREE.Vector3(...from),
          length,
          0x00ff00,
          length * 0.2,
          length * 0.1,
        ]}
      />
      {label && (
        <mesh position={to}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}
    </group>
  );
}

function LoadedMesh({ url, highlightParts }: { url: string; highlightParts?: string[] }) {
  const meshRef = useRef<THREE.Group>(null);
  const [mesh, setMesh] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    const extension = url.split(".").pop()?.toLowerCase();
    let loader: OBJLoader | PLYLoader | GLTFLoader;

    if (extension === "obj") {
      loader = new OBJLoader();
      loader.load(url, (object) => {
        setMesh(object);
      });
    } else if (extension === "ply") {
      loader = new PLYLoader();
      loader.load(url, (geometry) => {
        const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const meshObj = new THREE.Mesh(geometry, material);
        setMesh(meshObj);
      });
    } else if (extension === "glb" || extension === "gltf") {
      loader = new GLTFLoader();
      loader.load(url, (gltf) => {
        setMesh(gltf.scene);
      });
    }
  }, [url]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  if (!mesh) return null;

  return (
    <group ref={meshRef}>
      <primitive object={mesh} />
    </group>
  );
}

export function MeshViewer({ meshUrl, highlightParts = [], overlayArrows = [] }: MeshViewerProps) {
  if (!meshUrl) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-xl">
        <p className="text-muted-foreground">No mesh data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls enableDamping dampingFactor={0.05} />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <LoadedMesh url={meshUrl} highlightParts={highlightParts} />
        
        {overlayArrows.map((arrow, idx) => (
          <Arrow key={idx} {...arrow} />
        ))}
        
        <gridHelper args={[10, 10]} />
      </Canvas>
    </div>
  );
}
