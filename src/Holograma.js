import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./Holograma.css";

function NucleoHolografico({ listening, speaking, musicPlaying }) {
  const coreRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const active = speaking || musicPlaying;
    const pulse = 1 + Math.sin(t * (active ? 1.0 : 0.4)) * (active ? 0.015 : listening ? 0.008 : 0.004);

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.015;
      coreRef.current.rotation.x = Math.sin(t * 0.08) * 0.04;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* Esfera com alta densidade de segmentos para um aspecto perfeitamente circular e uniforme */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshPhysicalMaterial
          color="#ff1a33"
          emissive="#ff0022"
          emissiveIntensity={0.8}
          wireframe
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight
        color="#ff1a33"
        intensity={speaking || musicPlaying ? 22 : listening ? 14 : 8}
        distance={7}
        decay={2}
      />
    </group>
  );
}

function CampoParticulas({ active }) {
  const particlesRef = useRef();

  const { positions, colors } = useMemo(() => {
    const count = 1800;
    const array = new Float32Array(count * 3);
    const colArray = new Float32Array(count * 3);

    const baseColor = new THREE.Color("#ff1a33");
    const altColor = new THREE.Color("#ff88aa");

    for (let i = 0; i < count; i++) {
      const radius = 1.8 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      array[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = baseColor.clone().lerp(altColor, Math.random());
      colArray[i * 3] = mixedColor.r;
      colArray[i * 3 + 1] = mixedColor.g;
      colArray[i * 3 + 2] = mixedColor.b;
    }
    return { positions: array, colors: colArray };
  }, []);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y += delta * (active ? 0.008 : 0.002);
    particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.008;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.018}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Holograma({ listening = false, speaking = false, musicPlaying = false }) {
  return (
    <div className={`hades-hologram-wrapper ${listening ? "is-listening" : ""} ${speaking ? "is-speaking" : ""} ${musicPlaying ? "is-playing" : ""}`}>
      <div className="hades-scanner-line" />
      <div className="hades-hud-corners">
        <span className="corner tl" /><span className="corner tr" />
        <span className="corner bl" /><span className="corner br" />
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ff6688" />
        <directionalLight position={[-5, -5, -5]} intensity={0.8} color="#ff0022" />
        <CampoParticulas active={speaking || musicPlaying} />
        <NucleoHolografico listening={listening} speaking={speaking} musicPlaying={musicPlaying} />
      </Canvas>

      <div className="hades-hologram-hud-footer">
        <div className="hades-hud-bar" />
        <div className="hades-hologram-label">
          <span className="hades-status-glow-dot" />
          {musicPlaying ? "STREAM_ACTIVE // AUDIO_SYNC" : speaking ? "HADES_SYNTH // TRANSMITTING" : listening ? "FREQUENCY_LOCK // LISTENING" : "SYSTEM_READY // STANDBY"}
        </div>
        <div className="hades-hud-bar" />
      </div>
    </div>
  );
}