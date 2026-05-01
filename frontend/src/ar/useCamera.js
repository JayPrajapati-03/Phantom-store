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

    const startCamera = async () => {
      try {
        setError(null);
        setReady(false);

        const availableDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = availableDevices.filter((device) => device.kind === "videoinput");
        if (active) {
          setDevices(videoDevices);
        }

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
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(mediaStream);
        setActiveDeviceId(selectedDevice?.deviceId || "");

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
  }, [audio, facingMode, preferredDeviceId, video]);

  return { videoRef, stream, error, ready, devices, activeDeviceId };
}
