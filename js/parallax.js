let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

const PARALLAX_STRENGTH = 2.0;
const LERP_FACTOR = 0.04;
let isMobile = false;
let hasGyroscope = false;

// --- Init ---
export function initParallax() {
  isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isMobile && window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', onDeviceOrientation);
    hasGyroscope = true;
  }

  if (!isMobile) {
    window.addEventListener('mousemove', onMouseMove);
  }
}

function onMouseMove(e) {
  targetX = (e.clientX / window.innerWidth) * 2 - 1;
  targetY = (e.clientY / window.innerHeight) * 2 - 1;
}

function onDeviceOrientation(e) {
  if (e.gamma === null && e.beta === null) {
    hasGyroscope = false;
    return;
  }
  targetX = (e.gamma || 0) / 45;
  targetY = (e.beta || 0) / 45 - 1;
}

// --- Update ---
export function updateParallax(worldGroup) {
  // Auto-drift fallback for mobile without gyroscope
  if (isMobile && !hasGyroscope) {
    const t = performance.now() * 0.001;
    targetX = Math.sin(t * 0.25) * 0.25;
    targetY = Math.cos(t * 0.18) * 0.18;
  }

  // Smooth lerp (slightly slower for more cinematic feel)
  currentX += (targetX - currentX) * LERP_FACTOR;
  currentY += (targetY - currentY) * LERP_FACTOR;

  // Rotate world group
  worldGroup.rotation.y = currentX * 0.05;
  worldGroup.rotation.x = currentY * 0.03;
}

// --- Get parallax offset ---
export function getParallaxOffset() {
  return {
    x: currentX * PARALLAX_STRENGTH,
    y: -currentY * PARALLAX_STRENGTH,
  };
}
