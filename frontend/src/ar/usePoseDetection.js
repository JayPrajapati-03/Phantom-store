import { useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgpu";

const KEYPOINT_SCORE_THRESHOLD = 0.35;

const resolveBackend = async () => {
  await tf.ready();

  if (tf.engine().backendName) {
    return tf.engine().backendName;
  }

  const preferredBackends = ["webgpu", "webgl", "cpu"];

  for (const backend of preferredBackends) {
    try {
      const success = await tf.setBackend(backend);
      if (success) {
        await tf.ready();
        return backend;
      }
    } catch {
      // Try the next backend.
    }
  }

  throw new Error("No supported TensorFlow backend is available for pose detection.");
};

export function usePoseDetection(videoRef, enabled = true) {
  const detectorRef = useRef(null);
  const frameRef = useRef(null);
  const [pose, setPose] = useState(null);
  const [keypoints, setKeypoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backend, setBackend] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!enabled || !videoRef.current) return;

      try {
        setError(null);
        setLoading(true);
        const activeBackend = await resolveBackend();
        if (cancelled) return;

        setBackend(activeBackend);
        detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        });
        if (cancelled) return;

        setLoading(false);

        const detect = async () => {
          if (cancelled || !videoRef.current || !detectorRef.current) return;

          if (videoRef.current.readyState >= 2) {
            const poses = await detectorRef.current.estimatePoses(videoRef.current, {
              maxPoses: 1,
              flipHorizontal: true
            });
            const nextPose = poses[0] || null;
            setPose(nextPose);
            setKeypoints(
              nextPose?.keypoints?.filter((point) => (point.score ?? 0) >= KEYPOINT_SCORE_THRESHOLD) || []
            );
          }

          frameRef.current = requestAnimationFrame(detect);
        };

        detect();
      } catch (poseError) {
        setError(poseError);
        setLoading(false);
        setPose(null);
        setKeypoints([]);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      detectorRef.current?.dispose();
      detectorRef.current = null;
      setPose(null);
      setKeypoints([]);
    };
  }, [enabled, videoRef]);

  return { pose, keypoints, loading, error, backend };
}
