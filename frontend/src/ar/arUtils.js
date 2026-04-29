import * as THREE from "three";

export function keypointTo3D(keypoint, videoSize = { width: 1280, height: 720 }, depth = 0) {
  if (!keypoint) return new THREE.Vector3(0, 0, depth);

  const x = (keypoint.x / videoSize.width) * 2 - 1;
  const y = -(keypoint.y / videoSize.height) * 2 + 1;

  return new THREE.Vector3(x * 4, y * 2.25, depth);
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

  const faceCenter = midpoint(leftEye, rightEye) || midpoint(leftEar, rightEar);
  const shoulderCenter = midpoint(leftShoulder, rightShoulder);
  const hipCenter = midpoint(leftHip, rightHip);

  const shoulderWidth = leftShoulder && rightShoulder ? Math.abs(leftShoulder.x - rightShoulder.x) : 220;
  const faceWidth = leftEar && rightEar ? Math.abs(leftEar.x - rightEar.x) : shoulderWidth * 0.55;

  const defaults = {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    scale: 1
  };

  if (!pose) return defaults;

  switch (arCategory) {
    case "glasses":
      return {
        position: keypointTo3D(faceCenter, videoSize, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: Math.max(faceWidth / 130, 0.6)
      };
    case "hat":
      return {
        position: keypointTo3D(faceCenter ? { ...faceCenter, y: faceCenter.y - faceWidth * 0.75 } : null, videoSize, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: Math.max(faceWidth / 150, 0.7)
      };
    case "shirt":
    case "jacket":
      return {
        position: keypointTo3D(shoulderCenter, videoSize, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: Math.max(shoulderWidth / 180, 0.8)
      };
    case "watch":
    case "ring":
      return {
        position: keypointTo3D(rightWrist || leftWrist, videoSize, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: Math.max(shoulderWidth / 420, 0.35)
      };
    case "bag":
      return {
        position: keypointTo3D(leftShoulder || rightShoulder, videoSize, 0),
        rotation: new THREE.Euler(0, 0.2, 0),
        scale: Math.max(shoulderWidth / 260, 0.55)
      };
    case "shoes":
      return {
        position: keypointTo3D(hipCenter, videoSize, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: Math.max(shoulderWidth / 260, 0.5)
      };
    default:
      return defaults;
  }
}
