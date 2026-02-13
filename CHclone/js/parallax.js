let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

const PARALLAX_STRENGTH = 2.0;
const LERP_FACTOR = 0.05;
let isMobile = false;
let hasGyroscope = false;

// --- Init ---
export function initParallax() {
  isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isMobile && window.DeviceOrientationEvent) {
    // Try to use gyroscope on mobile
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

// --- Update (called every frame) ---
export function updateParallax(worldGroup) {
  // Auto-drift fallback for mobile without gyroscope
  if (isMobile && !hasGyroscope) {
    const t = performance.now() * 0.001;
    targetX = Math.sin(t * 0.3) * 0.3;
    targetY = Math.cos(t * 0.2) * 0.2;
  }

  // Smooth lerp
  currentX += (targetX - currentX) * LERP_FACTOR;
  currentY += (targetY - currentY) * LERP_FACTOR;

  // Rotate the world group subtly
  worldGroup.rotation.y = currentX * 0.05;
  worldGroup.rotation.x = currentY * 0.03;
}

// --- Get parallax offset for per-sphere positioning ---
export function getParallaxOffset() {
  return {
    x: currentX * PARALLAX_STRENGTH,
    y: -currentY * PARALLAX_STRENGTH,
  };
}
