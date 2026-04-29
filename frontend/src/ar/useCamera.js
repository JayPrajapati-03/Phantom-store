import { useEffect, useRef, useState } from "react";

export function useCamera({ video = true, audio = false, facingMode = "user" } = {}) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let currentStream = null;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio,
          video: video
            ? {
                facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            : false
        });

        currentStream = mediaStream;

        if (!active) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (cameraError) {
        setError(cameraError);
      }
    };

    startCamera();

    return () => {
      active = false;
      setReady(false);
      currentStream?.getTracks().forEach((track) => track.stop());
    };
  }, [audio, facingMode, video]);

  return { videoRef, stream, error, ready };
}
