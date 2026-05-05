import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useCamera } from "./useCamera.js";
import { usePoseDetection } from "./usePoseDetection.js";
import { getModelPosition } from "./arUtils.js";

const LEGACY_PLACEHOLDER_MODEL_URL = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
const DUCK_PLACEHOLDER_MODEL_URL = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb";
const BOX_PLACEHOLDER_MODEL_URL = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb";
const PROCEDURAL_MODELS = {
  glasses: "__procedural_glasses__",
  hat: "__procedural_hat__",
  shirt: "__procedural_shirt__",
  jacket: "__procedural_jacket__",
  shoes: "__procedural_shoes__",
  watch: "__procedural_watch__",
  ring: "__procedural_ring__",
  bag: "__procedural_bag__"
};
const CATEGORY_MODEL_FALLBACKS = {
  glasses: PROCEDURAL_MODELS.glasses,
  hat: PROCEDURAL_MODELS.hat,
  shirt: PROCEDURAL_MODELS.shirt,
  jacket: PROCEDURAL_MODELS.jacket,
  shoes: PROCEDURAL_MODELS.shoes,
  watch: PROCEDURAL_MODELS.watch,
  ring: PROCEDURAL_MODELS.ring,
  bag: PROCEDURAL_MODELS.bag
};

const resolveModelUrl = (modelUrl, arCategory) => {
  const category = String(arCategory || "").trim().toLowerCase();
  const fallback = CATEGORY_MODEL_FALLBACKS[category];

  if (!String(modelUrl || "").trim()) {
    return fallback || modelUrl;
  }

  if (
    modelUrl === LEGACY_PLACEHOLDER_MODEL_URL ||
    modelUrl === BOX_PLACEHOLDER_MODEL_URL ||
    (category === "hat" && modelUrl === DUCK_PLACEHOLDER_MODEL_URL)
  ) {
    return fallback || modelUrl;
  }

  return modelUrl;
};

function ProceduralGlasses({ transform }) {
  return (
    <group position={transform.position} rotation={transform.rotation} scale={[transform.scale, transform.scale, transform.scale]}>
      <mesh position={[-0.24, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.18, 0.03, 16, 48]} />
        <meshStandardMaterial color="#111827" roughness={0.42} metalness={0.35} />
      </mesh>
      <mesh position={[0.24, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.18, 0.03, 16, 48]} />
        <meshStandardMaterial color="#111827" roughness={0.42} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.03, 0.03]} />
        <meshStandardMaterial color="#1f2937" roughness={0.42} metalness={0.3} />
      </mesh>
      <mesh position={[-0.24, 0, 0]} castShadow receiveShadow>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.3} roughness={0.2} metalness={0.05} />
      </mesh>
      <mesh position={[0.24, 0, 0]} castShadow receiveShadow>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.3} roughness={0.2} metalness={0.05} />
      </mesh>
    </group>
  );
}

function ProceduralHat({ transform }) {
  return (
    <group position={transform.position} rotation={transform.rotation} scale={[transform.scale, transform.scale, transform.scale]}>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.58, 0.36, 48]} />
        <meshStandardMaterial color="#1f2937" roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <ringGeometry args={[0.34, 0.86, 48]} />
        <meshStandardMaterial color="#111827" roughness={0.84} metalness={0.04} side={2} />
      </mesh>
      <mesh position={[0, 0.23, 0.42]} rotation={[-0.35, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.05, 0.34]} />
        <meshStandardMaterial color="#d4a373" roughness={0.65} metalness={0.05} />
      </mesh>
    </group>
  );
}

function ProceduralShirt({ transform, color = "#f59e0b", accent = "#fef3c7" }) {
  return (
    <group position={transform.position} rotation={transform.rotation} scale={[transform.scale, transform.scale, transform.scale]}>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.18, 1.42, 0.26]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.6, 0.02]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.24, 0.08]} />
        <meshStandardMaterial color={accent} roughness={0.8} metalness={0.02} />
      </mesh>
      <mesh position={[-0.86, 0.18, 0]} rotation={[0, 0, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.98, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.04} />
      </mesh>
      <mesh position={[0.86, 0.18, 0]} rotation={[0, 0, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.98, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.7, 0.02]} castShadow receiveShadow>
        <torusGeometry args={[0.2, 0.04, 12, 32, Math.PI]} />
        <meshStandardMaterial color={accent} roughness={0.8} metalness={0.02} />
      </mesh>
    </group>
  );
}

function ProceduralJacket({ transform }) {
  return (
    <group position={transform.position} rotation={transform.rotation} scale={[transform.scale * 1.05, transform.scale * 1.05, transform.scale * 1.05]}>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.28, 1.56, 0.32]} />
        <meshStandardMaterial color="#1f2937" roughness={0.7} metalness={0.08} />
      </mesh>
      <mesh position={[-0.34, 0.08, 0.18]} castShadow receiveShadow>
        <boxGeometry args={[0.52, 1.36, 0.08]} />
        <meshStandardMaterial color="#111827" roughness={0.74} metalness={0.05} />
      </mesh>
      <mesh position={[0.34, 0.08, 0.18]} castShadow receiveShadow>
        <boxGeometry args={[0.52, 1.36, 0.08]} />
        <meshStandardMaterial color="#111827" roughness={0.74} metalness={0.05} />
      </mesh>
      <mesh position={[-0.94, 0.16, 0]} rotation={[0, 0, 0.42]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 1.04, 0.24]} />
        <meshStandardMaterial color="#1f2937" roughness={0.7} metalness={0.08} />
      </mesh>
      <mesh position={[0.94, 0.16, 0]} rotation={[0, 0, -0.42]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 1.04, 0.24]} />
        <meshStandardMaterial color="#1f2937" roughness={0.7} metalness={0.08} />
      </mesh>
    </group>
  );
}

function ProceduralWatch({ transform }) {
  return (
    <group position={transform.position} rotation={transform.rotation} scale={[transform.scale, transform.scale, transform.scale]}>
      <mesh position={[0, 0, -0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.58, 0.06]} />
        <meshStandardMaterial color="#78350f" roughness={0.82} metalness={0.04} />
      </mesh>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 32]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.34} metalness={0.72} />
      </mesh>
      <mesh position={[0, 0, 0.05]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.02, 32]} />
        <meshStandardMaterial color="#111827" roughness={0.28} metalness={0.15} />
      </mesh>
    </group>
  );
}

function ProceduralRing({ transform }) {
  return (
    <mesh position={transform.position} rotation={transform.rotation} scale={transform.scale} castShadow receiveShadow>
      <torusGeometry args={[0.18, 0.06, 16, 48]} />
      <meshStandardMaterial color="#fbbf24" roughness={0.18} metalness={0.92} />
    </mesh>
  );
}

function ProceduralBag({ transform }) {
  return (
    <group position={transform.position} rotation={transform.rotation} scale={[transform.scale, transform.scale, transform.scale]}>
      <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.86, 1.02, 0.34]} />
        <meshStandardMaterial color="#854d0e" roughness={0.82} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.32, 0.04, 16, 48, Math.PI]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.46} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.12, 0.18]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.1, 0.05]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.6} metalness={0.08} />
      </mesh>
    </group>
  );
}

function ProceduralShoes({ transform }) {
  return (
    <group position={transform.position} rotation={transform.rotation} scale={[transform.scale, transform.scale, transform.scale]}>
      <mesh position={[-0.22, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.16, 0.74]} />
        <meshStandardMaterial color="#0f172a" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[0.22, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.16, 0.74]} />
        <meshStandardMaterial color="#0f172a" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[-0.22, -0.1, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.05, 0.78]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.7} metalness={0.02} />
      </mesh>
      <mesh position={[0.22, -0.1, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.05, 0.78]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.7} metalness={0.02} />
      </mesh>
    </group>
  );
}

function ProceduralModel({ modelKey, transform }) {
  switch (modelKey) {
    case PROCEDURAL_MODELS.glasses:
      return <ProceduralGlasses transform={transform} />;
    case PROCEDURAL_MODELS.hat:
      return <ProceduralHat transform={transform} />;
    case PROCEDURAL_MODELS.shirt:
      return <ProceduralShirt transform={transform} />;
    case PROCEDURAL_MODELS.jacket:
      return <ProceduralJacket transform={transform} />;
    case PROCEDURAL_MODELS.watch:
      return <ProceduralWatch transform={transform} />;
    case PROCEDURAL_MODELS.ring:
      return <ProceduralRing transform={transform} />;
    case PROCEDURAL_MODELS.bag:
      return <ProceduralBag transform={transform} />;
    case PROCEDURAL_MODELS.shoes:
      return <ProceduralShoes transform={transform} />;
    default:
      return null;
  }
}

function LoadedProductModel({ modelUrl, transform }) {
  const gltf = useGLTF(modelUrl);
  return (
    <primitive
      object={gltf.scene}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
    />
  );
}

function ProductModel({ modelUrl, keypoints, arCategory, videoSize }) {
  const resolvedModelUrl = resolveModelUrl(modelUrl, arCategory);
  const transform = getModelPosition(keypoints, arCategory, videoSize);

  if (!Array.isArray(keypoints) || !keypoints.length) return null;
  if (Object.values(PROCEDURAL_MODELS).includes(resolvedModelUrl)) {
    return <ProceduralModel modelKey={resolvedModelUrl} transform={transform} />;
  }

  return <LoadedProductModel modelUrl={resolvedModelUrl} transform={transform} />;
}

export default function ARCanvas({ product, onCaptureReady, preferredDeviceId, onCameraChange }) {
  const { videoRef, ready, error, devices, activeDeviceId } = useCamera({ preferredDeviceId });
  const { keypoints, loading: poseLoading, error: poseError, backend } = usePoseDetection(videoRef, ready);
  const containerRef = useRef(null);
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 });

  useEffect(() => {
    if (!onCameraChange) return;
    onCameraChange({ devices, activeDeviceId });
  }, [activeDeviceId, devices, onCameraChange]);

  useEffect(() => {
    if (!onCaptureReady) return undefined;

    const capture = () => {
      const video = videoRef.current;
      const webglCanvas = containerRef.current?.querySelector("canvas");

      if (!video || !webglCanvas || !video.videoWidth || !video.videoHeight) {
        throw new Error("AR preview is not ready to capture");
      }

      const snapshot = document.createElement("canvas");
      snapshot.width = video.videoWidth;
      snapshot.height = video.videoHeight;

      const context = snapshot.getContext("2d");
      if (!context) {
        throw new Error("Unable to create screenshot canvas");
      }

      context.translate(snapshot.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, snapshot.width, snapshot.height);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.drawImage(webglCanvas, 0, 0, snapshot.width, snapshot.height);

      return snapshot.toDataURL("image/jpeg", 0.92);
    };

    onCaptureReady(capture);
    return () => onCaptureReady(null);
  }, [onCaptureReady, videoRef]);

  useEffect(() => {
    if (!ready || !videoRef.current) return undefined;

    const video = videoRef.current;
    const syncVideoSize = () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoSize({ width: video.videoWidth, height: video.videoHeight });
      }
    };

    syncVideoSize();
    video.addEventListener("loadedmetadata", syncVideoSize);
    video.addEventListener("resize", syncVideoSize);

    return () => {
      video.removeEventListener("loadedmetadata", syncVideoSize);
      video.removeEventListener("resize", syncVideoSize);
    };
  }, [ready, videoRef]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)"
        }}
      />
      {!ready && !error && (
        <div style={{ position: "absolute", zIndex: 2, padding: 16, color: "#f5f7fb" }}>
          Requesting camera access...
        </div>
      )}
      {error && (
        <div style={{ position: "absolute", zIndex: 2, padding: 16, color: "#f5f7fb" }}>
          Camera unavailable: {error.message}
        </div>
      )}
      {ready && !error && (
        <div
          style={{
            position: "absolute",
            zIndex: 2,
            right: 12,
            top: 12,
            borderRadius: 999,
            padding: "8px 12px",
            background: "rgba(11, 13, 18, 0.72)",
            color: "#f5f7fb",
            fontSize: 12
          }}
        >
          {poseError
            ? `Pose error: ${poseError.message}`
            : poseLoading
              ? "Loading pose detection..."
              : `MoveNet ${backend || "ready"} - ${keypoints.length} keypoints`}
        </div>
      )}
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ position: "absolute", inset: 0, background: "transparent" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 4, 3]} intensity={2} />
        <Suspense fallback={null}>
          <ProductModel
            modelUrl={product.modelUrl}
            keypoints={keypoints}
            arCategory={product.arCategory}
            videoSize={videoSize}
          />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}
