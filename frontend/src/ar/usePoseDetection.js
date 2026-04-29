import { useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs";

export function usePoseDetection(videoRef, enabled = true) {
  const detectorRef = useRef(null);
  const frameRef = useRef(null);
  const [pose, setPose] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!enabled || !videoRef.current) return;

      try {
        setLoading(true);
        detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        });
        setLoading(false);

        const detect = async () => {
          if (cancelled || !videoRef.current || !detectorRef.current) return;

          if (videoRef.current.readyState >= 2) {
            const poses = await detectorRef.current.estimatePoses(videoRef.current, {
              maxPoses: 1,
              flipHorizontal: true
            });
            setPose(poses[0] || null);
          }

          frameRef.current = requestAnimationFrame(detect);
        };

        detect();
      } catch (poseError) {
        setError(poseError);
        setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      detectorRef.current?.dispose();
      detectorRef.current = null;
    };
  }, [enabled, videoRef]);

  return { pose, loading, error };
}
