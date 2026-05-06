import * as THREE from "three";

export function keypointTo3D(keypoint, videoSize = { width: 1280, height: 720 }, depth = 0) {
  if (!keypoint) return new THREE.Vector3(0, 0, depth);

  const videoWidth = videoSize.width || 1280;
  const videoHeight = videoSize.height || 720;
  const displayWidth = videoSize.displayWidth || videoWidth;
  const displayHeight = videoSize.displayHeight || videoHeight;
  const coverScale = Math.max(displayWidth / videoWidth, displayHeight / videoHeight);
  const renderedWidth = videoWidth * coverScale;
  const renderedHeight = videoHeight * coverScale;
  const cropX = (renderedWidth - displayWidth) / 2;
  const cropY = (renderedHeight - displayHeight) / 2;
  const displayX = keypoint.x * coverScale - cropX;
  const displayY = keypoint.y * coverScale - cropY;

  const x = (displayX / displayWidth) * 2 - 1;
  const y = -(displayY / displayHeight) * 2 + 1;
  const cameraZ = videoSize.cameraZ || 5;
  const fov = THREE.MathUtils.degToRad(videoSize.fov || 45);
  const distanceFromCamera = Math.abs(cameraZ - depth);
  const visibleHeight = 2 * Math.tan(fov / 2) * distanceFromCamera;
  const visibleWidth = visibleHeight * (displayWidth / displayHeight);

  return new THREE.Vector3(x * (visibleWidth / 2), y * (visibleHeight / 2), depth);
}

const getKeypoints = (poseOrKeypoints) => {
  if (Array.isArray(poseOrKeypoints)) return poseOrKeypoints;
  return poseOrKeypoints?.keypoints || [];
};

const byName = (poseOrKeypoints, name) =>
  getKeypoints(poseOrKeypoints).find((point) => point.name === name || point.part === name);
const normalizeCategory = (value = "") => String(value).trim().toLowerCase();
const FACE_CATEGORIES = new Set(["face", "glasses", "hat", "cap", "helmet", "earring"]);
const UPPER_BODY_CATEGORIES = new Set(["upper-body", "shirt", "jacket", "hoodie", "dress", "top"]);
const FEET_CATEGORIES = new Set(["feet", "shoes", "sneakers", "heels"]);
const WRIST_CATEGORIES = new Set(["watch", "bracelet"]);
const FINGER_CATEGORIES = new Set(["ring"]);
const BAG_CATEGORIES = new Set(["bag", "purse", "crossbody"]);

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

const hasPair = (a, b) => Boolean(a && b);

const angleBetween = (a, b, fallback = 0) => {
  if (!a || !b) return fallback;
  return Math.atan2(b.y - a.y, b.x - a.x);
};

export function getModelPosition(poseOrKeypoints, arCategory, videoSize) {
  const category = normalizeCategory(arCategory);
  const keypoints = getKeypoints(poseOrKeypoints);
  const leftEye = byName(keypoints, "left_eye");
  const rightEye = byName(keypoints, "right_eye");
  const nose = byName(keypoints, "nose");
  const leftEar = byName(keypoints, "left_ear");
  const rightEar = byName(keypoints, "right_ear");
  const leftShoulder = byName(keypoints, "left_shoulder");
  const rightShoulder = byName(keypoints, "right_shoulder");
  const leftWrist = byName(keypoints, "left_wrist");
  const rightWrist = byName(keypoints, "right_wrist");
  const leftHip = byName(keypoints, "left_hip");
  const rightHip = byName(keypoints, "right_hip");
  const leftAnkle = byName(keypoints, "left_ankle");
  const rightAnkle = byName(keypoints, "right_ankle");

  const faceCenter = midpoint(leftEye, rightEye) || nose || midpoint(leftEar, rightEar);
  const shoulderCenter = midpoint(leftShoulder, rightShoulder);
  const hipCenter = midpoint(leftHip, rightHip);
  const ankleCenter = midpoint(leftAnkle, rightAnkle);
  const leftHand = midpoint(leftWrist, leftWrist);
  const rightHand = midpoint(rightWrist, rightWrist);

  const shoulderWidth = distance(leftShoulder, rightShoulder, 220);
  const eyeWidth = distance(leftEye, rightEye, 80);
  const faceWidth = hasPair(leftEar, rightEar)
    ? distance(leftEar, rightEar, eyeWidth * 2.45)
    : Math.max(eyeWidth * 2.45, 120);
  const hatWidth = hasPair(leftEar, rightEar)
    ? faceWidth
    : Math.max(eyeWidth * 2.55, shoulderWidth * 0.42, 130);
  const faceTilt = angleBetween(leftEye, rightEye);
  const torsoHeight = distance(shoulderCenter, hipCenter, 260);
  const armLength = distance(rightShoulder || leftShoulder, rightWrist || leftWrist, 180);
  const handSize = distance(rightWrist, leftWrist, armLength * 0.35);
  const ankleWidth = distance(leftAnkle, rightAnkle, shoulderWidth * 0.4);

  const defaults = {
    position: new THREE.Vector3(0, 0, -1.8),
    rotation: new THREE.Euler(0, 0, 0),
    scale: 0.35
  };

  if (!keypoints.length) return defaults;

  if (category === "glasses") {
    return {
      position: keypointTo3D(nose || faceCenter, videoSize, -1.35),
      rotation: new THREE.Euler(0, 0, 0),
      scale: Math.max(eyeWidth / 65, 0.12)
    };
  }

  if (category === "hat" || category === "cap" || category === "helmet") {
    return {
      position: keypointTo3D(
        faceCenter ? { ...faceCenter, y: faceCenter.y - hatWidth * 0.58 } : null,
        videoSize,
        -1.6
      ),
      rotation: new THREE.Euler(0, 0, faceTilt),
      scale: Math.max(hatWidth / 205, 0.26)
    };
  }

  if (FACE_CATEGORIES.has(category)) {
    return {
      position: keypointTo3D(nose || faceCenter, videoSize, -1.45),
      rotation: new THREE.Euler(0, 0, 0),
      scale: Math.max(faceWidth / 240, 0.14)
    };
  }

  if (UPPER_BODY_CATEGORIES.has(category)) {
    return {
      position: keypointTo3D(
        shoulderCenter ? { ...shoulderCenter, y: shoulderCenter.y + torsoHeight * 0.18 } : null,
        videoSize,
        -2.1
      ),
      rotation: new THREE.Euler(0, 0, 0),
      scale: Math.max(shoulderWidth / 280, 0.28)
    };
  }

  if (WRIST_CATEGORIES.has(category)) {
    return {
      position: keypointTo3D(rightWrist || leftWrist, videoSize, -1.2),
      rotation: new THREE.Euler(0, 0, -0.3),
      scale: Math.max(armLength / 900, 0.06)
    };
  }

  if (FINGER_CATEGORIES.has(category)) {
    return {
      position: keypointTo3D(rightHand || leftHand || rightWrist || leftWrist, videoSize, -1.05),
      rotation: new THREE.Euler(0, 0, -0.25),
      scale: Math.max(handSize / 420, 0.04)
    };
  }

  if (BAG_CATEGORIES.has(category)) {
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
  }

  if (FEET_CATEGORIES.has(category)) {
    return {
      position: keypointTo3D(ankleCenter || leftAnkle || rightAnkle || hipCenter, videoSize, -1.3),
      rotation: new THREE.Euler(0, 0, 0),
      scale: Math.max(ankleWidth / 180, 0.12)
    };
  }

  switch (category) {
    case "watch":
    case "bracelet":
      return {
        position: keypointTo3D(rightWrist || leftWrist, videoSize, -1.2),
        rotation: new THREE.Euler(0, 0, -0.3),
        scale: Math.max(armLength / 900, 0.06)
      };
    case "ring":
      return {
        position: keypointTo3D(rightHand || leftHand || rightWrist || leftWrist, videoSize, -1.05),
        rotation: new THREE.Euler(0, 0, -0.25),
        scale: Math.max(handSize / 420, 0.04)
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
        position: keypointTo3D(ankleCenter || leftAnkle || rightAnkle || hipCenter, videoSize, -1.3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: Math.max(ankleWidth / 180, 0.12)
      };
    default:
      return defaults;
  }
}
