"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, BackSide } from "three";
import { useState, useRef } from "react";

function Earth() {
  const meshRef = useRef();
  const cloudsRef = useRef();
  const [rotation, setRotation] = useState(0);

  const earthTexture = useLoader(TextureLoader, "/earth3.jpeg");
  const cloudsTexture = useLoader(TextureLoader, "/earth-clouds.png");

  useFrame(() => {
    if (meshRef.current) {
      setRotation(rotation - 0.001);
      meshRef.current.rotation.y = rotation;
      cloudsRef.current.rotation.y = rotation - 0.001;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry attach="geometry" args={[1, 32, 32]} />
        <meshPhongMaterial attach="material" map={earthTexture} />
      </mesh>
      <mesh ref={cloudsRef} position={[0, 0, 0]}>
        <sphereGeometry attach="geometry" args={[1.02, 32, 32]} />
        <meshPhongMaterial
          attach="material"
          alphaMap={cloudsTexture}
          transparent={true}
          opacity={0.5}
        />
      </mesh>
    </>
  );
}

function Starfield() {
  const starfieldTexture = useLoader(TextureLoader, "/starfield.jpeg");

  return (
    <mesh>
      <sphereGeometry attach="geometry" args={[5, 64, 64]} />{" "}
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
    <div className="bg-black h-screen">
      <Canvas camera={{ position: [0, 0, 2] }}>
        <directionalLight position={[10, 10, 10]} intensity={4} />
        <Starfield />
        <Earth />
      </Canvas>
    </div>
  );
}
