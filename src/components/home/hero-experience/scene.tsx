"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { buildShapes, type ShapeKey } from "./shapes";
import { heroState, resolveSegment } from "./progress-store";

const SCATTER_AMP = 0.62;

const VERT = /* glsl */ `
  uniform float uMix;
  uniform float uScatter;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uTime;
  attribute vec3 aPosB;
  attribute vec3 aRand;
  attribute float aSeed;
  varying float vSeed;
  varying float vScatter;
  void main() {
    vSeed = aSeed;
    vScatter = uScatter;
    vec3 p = mix(position, aPosB, uMix);
    float tw = uScatter * (0.55 + aSeed * 0.9);
    p += aRand * tw;
    p.x += sin(uTime * 0.5 + aSeed * 6.2831) * 0.012;
    p.y += cos(uTime * 0.42 + aSeed * 6.2831) * 0.012;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.55 + aSeed * 1.0);
    gl_PointSize = size * uPixelRatio * (300.0 / -mv.z);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSeed;
  varying float vScatter;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.12, d) * 0.85;
    vec3 col = mix(uColorB, uColorA, vSeed);
    if (vSeed > 0.9) col = mix(col, vec3(1.0), 0.6);
    col += vScatter * 0.2;
    gl_FragColor = vec4(col, alpha);
  }
`;

function ParticleMorph({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const segRef = useRef(-1);
  const { gl } = useThree();

  const { geometry, material, shapes } = useMemo(() => {
    const built = buildShapes(count);
    const geo = new THREE.BufferGeometry();
    const position = Float32Array.from(built.scatter);
    const aPosB = Float32Array.from(built.watch);
    const aRand = new Float32Array(count * 3);
    const aSeed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      aRand[i * 3] = Math.sin(ph) * Math.cos(t);
      aRand[i * 3 + 1] = Math.sin(ph) * Math.sin(t);
      aRand[i * 3 + 2] = Math.cos(ph);
      aSeed[i] = Math.random();
    }
    geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.setAttribute("aPosB", new THREE.BufferAttribute(aPosB, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMix: { value: 0 },
        uScatter: { value: 0 },
        uSize: { value: count > 10000 ? 7.5 : 8.5 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color("#f7e9b0") },
        uColorB: { value: new THREE.Color("#b8862b") },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat, shapes: built };
  }, [count, gl]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __heroMat?: THREE.ShaderMaterial }).__heroMat =
        material;
    }
  }, [material]);

  useFrame((_, delta) => {
    const seg = resolveSegment(heroState.progress);
    if (seg.index !== segRef.current) {
      const pos = geometry.attributes.position;
      const posB = geometry.attributes.aPosB;
      (pos.array as Float32Array).set(shapes[seg.from as ShapeKey]);
      (posB.array as Float32Array).set(shapes[seg.to as ShapeKey]);
      pos.needsUpdate = true;
      posB.needsUpdate = true;
      segRef.current = seg.index;
    }
    material.uniforms.uMix.value = seg.mix;
    material.uniforms.uScatter.value = seg.scatter * SCATTER_AMP;
    material.uniforms.uTime.value += delta;

    if (pointsRef.current) {
      const t = material.uniforms.uTime.value;
      pointsRef.current.rotation.y = Math.sin(t * 0.16) * 0.16;
      pointsRef.current.rotation.x = Math.sin(t * 0.12) * 0.05;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

function AmbientDust({ count = 480 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 7;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1.5;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.018}
        color="#d4af37"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rig() {
  const { camera } = useThree();
  useFrame((_, delta) => {
    const seg = resolveSegment(heroState.progress);
    const p = heroState.progress;
    const pullBack = p > 0.9 ? ((p - 0.9) / 0.1) * 1.7 : 0;
    const targetZ = 4.5 - seg.scatter * 0.45 + pullBack;
    const k = 1 - Math.pow(0.0001, delta);
    camera.position.z += (targetZ - camera.position.z) * k;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function SceneContents({ count }: { count: number }) {
  return (
    <>
      <color attach="background" args={["#08080a"]} />
      <fog attach="fog" args={["#08080a", 5.5, 11]} />
      <ParticleMorph count={count} />
      <AmbientDust />
      <Rig />
      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={0.45}
          luminanceThreshold={0.62}
          luminanceSmoothing={0.2}
          mipmapBlur
          radius={0.5}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.75} />
      </EffectComposer>
    </>
  );
}
