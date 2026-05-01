import * as THREE from "three";

export function keypointTo3D(keypoint, videoSize = { width: 1280, height: 720 }, depth = 0) {
  if (!keypoint) return new THREE.Vector3(0, 0, depth);

  const x = (keypoint.x / videoSize.width) * 2 - 1;
  const y = -(keypoint.y / videoSize.height) * 2 + 1;

  return new THREE.Vector3(x * 2.1, y * 1.2, depth);
}

const byName = (pose, name) => pose?.keypoints?.find((point) => point.name === name || point.part === name);

const midpoint = (a, b) => {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    score: Math.min(a.score || 1, b.score || 1)
  };
};

const distance = (a, b, fallback = 1) => {
  if (!a || !b) return fallback;
  return Math.hypot(a.x - b.x, a.y - b.y);
};

export function getModelPosition(pose, arCategory, videoSize) {
  const leftEye = byName(pose, "left_eye");
  const rightEye = byName(pose, "right_eye");
  const leftEar = byName(pose, "left_ear");
  const rightEar = byName(pose, "right_ear");
  const leftShoulder = byName(pose, "left_shoulder");
  const rightShoulder = byName(pose, "right_shoulder");
  const leftWrist = byName(pose, "left_wrist");
  const rightWrist = byName(pose, "right_wrist");
  const leftHip = byName(pose, "left_hip");
  const rightHip = byName(pose, "right_hip");
  const leftAnkle = byName(pose, "left_ankle");
  const rightAnkle = byName(pose, "right_ankle");

  const faceCenter = midpoint(leftEye, rightEye) || midpoint(leftEar, rightEar);
  const shoulderCenter = midpoint(leftShoulder, rightShoulder);
  const hipCenter = midpoint(leftHip, rightHip);
  const ankleCenter = midpoint(leftAnkle, rightAnkle);

  const shoulderWidth = distance(leftShoulder, rightShoulder, 220);
  const faceWidth = distance(leftEar, rightEar, shoulderWidth * 0.55);
  const torsoHeight = distance(shoulderCenter, hipCenter, 260);
  const armLength = distance(rightShoulder || leftShoulder, rightWrist || leftWrist, 180);

  const defaults = {
    position: new THREE.Vector3(0, 0, -1.8),
    rotation: new THREE.Euler(0, 0, 0),
    scale: 0.35
  };

  if (!pose) return defaults;

  switch (arCategory) {
    case "glasses":
      return {
        position: keypointTo3D(faceCenter, videoSize, -1.4),
        rotation: new THREE.Euler(0, 0, 0),
        scale: Math.max(faceWidth / 420, 0.08)
      };
    case "hat":
      return {
        position: keypointTo3D(
          faceCenter ? { ...faceCenter, y: faceCenter.y - faceWidth * 0.85 } : null,
          videoSize,
          -1.6
        ),
        rotation: new THREE.Euler(0, 0, 0),
        scale: Math.max(faceWidth / 360, 0.16)
      };
    case "shirt":
    case "jacket":
      return {
        position: keypointTo3D(
          shoulderCenter ? { ...shoulderCenter, y: shoulderCenter.y + torsoHeight * 0.18 } : null,
          videoSize,
          -2.1
        ),
        rotation: new THREE.Euler(0, 0, 0),
        scale: Math.max(shoulderWidth / 280, 0.28)
      };
    case "watch":
    case "ring":
      return {
        position: keypointTo3D(rightWrist || leftWrist, videoSize, -1.2),
        rotation: new THREE.Euler(0, 0, -0.3),
        scale: Math.max(armLength / 900, 0.06)
      };
    case "bag":
      return {
        position: keypointTo3D(
          leftShoulder
            ? { ...leftShoulder, x: leftShoulder.x - shoulderWidth * 0.15, y: leftShoulder.y + torsoHeight * 0.45 }
            : rightShoulder
              ? { ...rightShoulder, x: rightShoulder.x + shoulderWidth * 0.15, y: rightShoulder.y + torsoHeight * 0.45 }
              : null,
          videoSize,
          -1.9
        ),
        rotation: new THREE.Euler(0, 0.2, 0),
        scale: Math.max(shoulderWidth / 320, 0.2)
      };
    case "shoes":
      return {
        position: keypointTo3D(ankleCenter || hipCenter, videoSize, -1.3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: Math.max(shoulderWidth / 520, 0.12)
      };
    default:
      return defaults;
  }
}
