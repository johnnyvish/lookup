"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, BackSide } from "three";
import { useState, useRef, useEffect } from "react";
import { Text3D, OrbitControls } from "@react-three/drei";

function Earth() {
  const meshRef = useRef();
  const [rotation, setRotation] = useState(0);

  const earthTexture = useLoader(TextureLoader, "/earth.png");

  useFrame(() => {
    if (meshRef.current) {
      setRotation(rotation - 0.001);
      meshRef.current.rotation.y = rotation;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry attach="geometry" args={[1, 32, 32]} />
        <meshPhongMaterial attach="material" map={earthTexture} />
      </mesh>
    </>
  );
}

function Starfield() {
  const starfieldTexture = useLoader(TextureLoader, "/starfield.jpeg");

  return (
    <mesh>
      <sphereGeometry attach="geometry" args={[5, 16, 16]} />{" "}
      <meshBasicMaterial
        attach="material"
        map={starfieldTexture}
        side={BackSide}
      />
    </mesh>
  );
}

export default function Home() {
  return (
    <div className="bg-black w-screen h-screen">
      <Canvas camera={{ position: [0, 0, 2] }} dpr={[1, 2]}>
        <directionalLight position={[10, 10, 10]} intensity={4} />
        <Starfield />
        <Text3D
          font="/Inter_Bold.json"
          size={0.1}
          position={[-1, 0, 1]}
          bevelThickness={1}
        >
          HELLO R3F
        </Text3D>
        <Earth />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
