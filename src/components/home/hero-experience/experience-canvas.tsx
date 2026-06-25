"use client";

import { Canvas } from "@react-three/fiber";
import { SceneContents } from "./scene";

export default function ExperienceCanvas({
  count,
  onContextLost,
}: {
  count: number;
  onContextLost?: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 4.5], fov: 42 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            onContextLost?.();
          },
          { once: true },
        );
      }}
    >
      <SceneContents count={count} />
    </Canvas>
  );
}
