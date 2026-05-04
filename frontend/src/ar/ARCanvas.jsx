import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useCamera } from "./useCamera.js";
import { usePoseDetection } from "./usePoseDetection.js";
import { getModelPosition } from "./arUtils.js";

function ProductModel({ modelUrl, keypoints, arCategory, videoSize }) {
  const gltf = useGLTF(modelUrl);
  const transform = getModelPosition(keypoints, arCategory, videoSize);

  if (!Array.isArray(keypoints) || !keypoints.length) return null;

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
