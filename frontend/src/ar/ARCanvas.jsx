import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useCamera } from "./useCamera.js";
import { usePoseDetection } from "./usePoseDetection.js";
import { getModelPosition } from "./arUtils.js";

function ProductModel({ product, pose }) {
  const gltf = useGLTF(product.modelUrl);
  const videoSize = useMemo(() => ({ width: 1280, height: 720 }), []);
  const transform = getModelPosition(pose, product.arCategory, videoSize);

  return (
    <primitive
      object={gltf.scene}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
    />
  );
}

export default function ARCanvas({ product, onCaptureReady, preferredDeviceId, onCameraChange }) {
  const { videoRef, ready, error, devices, activeDeviceId } = useCamera({ preferredDeviceId });
  const { pose } = usePoseDetection(videoRef, ready);
  const containerRef = useRef(null);

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

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <video
        ref={videoRef}
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
      {error && <div style={{ position: "absolute", zIndex: 2, padding: 16 }}>Camera unavailable: {error.message}</div>}
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ position: "absolute", inset: 0, background: "transparent" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 4, 3]} intensity={2} />
        <Suspense fallback={null}>
          <ProductModel product={product} pose={pose} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}
