import { useEffect, useRef, useState } from "react";

const isPreferredIntegratedCamera = (label = "") => {
  const value = label.toLowerCase();
  return (
    (value.includes("integrated") || value.includes("internal") || value.includes("built-in")) &&
    value.includes("camera")
  );
};

const isLikelyPhoneOrVirtualCamera = (label = "") => {
  const value = label.toLowerCase();
  return (
    value.includes("phone") ||
    value.includes("iphone") ||
    value.includes("android") ||
    value.includes("epoccam") ||
    value.includes("droidcam") ||
    value.includes("iriun") ||
    value.includes("virtual")
  );
};

export function useCamera({ video = true, audio = false, facingMode = "user", preferredDeviceId = "" } = {}) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(preferredDeviceId);

  useEffect(() => {
    let active = true;
    let currentStream = null;

    const stopStream = (mediaStream) => {
      mediaStream?.getTracks().forEach((track) => track.stop());
    };

    const loadDevices = async () => {
      const availableDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = availableDevices.filter((device) => device.kind === "videoinput");

      if (active) {
        setDevices(videoDevices);
      }

      return videoDevices;
    };

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported in this browser.");
        }

        setError(null);
        setReady(false);
        stopStream(currentStream);

        const videoDevices = await loadDevices();

        const selectedDevice =
          videoDevices.find((device) => device.deviceId === preferredDeviceId) ||
          videoDevices.find((device) => isPreferredIntegratedCamera(device.label)) ||
          videoDevices.find((device) => !isLikelyPhoneOrVirtualCamera(device.label)) ||
          videoDevices[0];

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio,
          video: video
            ? selectedDevice?.deviceId
              ? {
                  deviceId: { exact: selectedDevice.deviceId },
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }
              : {
                  facingMode,
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }
            : false
        });

        currentStream = mediaStream;

        if (!active) {
          stopStream(mediaStream);
          return;
        }

        setStream(mediaStream);
        const activeTrack = mediaStream.getVideoTracks()[0];
        const activeSettings = activeTrack?.getSettings?.() || {};
        const resolvedDeviceId = activeSettings.deviceId || selectedDevice?.deviceId || "";
        setActiveDeviceId(resolvedDeviceId);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          await videoRef.current.play();
          setReady(true);
        }

        await loadDevices();
      } catch (cameraError) {
        stopStream(currentStream);
        setStream(null);
        setError(cameraError);
      }
    };

    startCamera();

    return () => {
      active = false;
      setReady(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      stopStream(currentStream);
    };
  }, [audio, facingMode, preferredDeviceId, video]);

  return { videoRef, stream, error, ready, devices, activeDeviceId };
}
