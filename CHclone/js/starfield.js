import * as THREE from 'three';

const STAR_COUNT = 2000;
const BRIGHT_STAR_COUNT = 50;

let stars;
let brightStars;
let shootingStars = [];
let parentRef;

// --- Create Starfield ---
export function createStarfield(parentGroup) {
  parentRef = parentGroup;

  // --- Layer 1: Distant Stars ---
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    const r = 150 + Math.random() * 150;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.8,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  stars = new THREE.Points(starGeo, starMat);
  parentGroup.add(stars);

  // --- Layer 2: Bright / Nebula Stars ---
  const brightGeo = new THREE.BufferGeometry();
  const brightPos = new Float32Array(BRIGHT_STAR_COUNT * 3);
  const brightColors = new Float32Array(BRIGHT_STAR_COUNT * 3);

  for (let i = 0; i < BRIGHT_STAR_COUNT; i++) {
    const r = 100 + Math.random() * 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    brightPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    brightPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    brightPos[i * 3 + 2] = r * Math.cos(phi);
    // Warm gold/amber tones
    brightColors[i * 3] = 0.8 + Math.random() * 0.2;
    brightColors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
    brightColors[i * 3 + 2] = 0.1 + Math.random() * 0.2;
  }

  brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPos, 3));
  brightGeo.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));

  const brightMat = new THREE.PointsMaterial({
    size: 3.0,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  brightStars = new THREE.Points(brightGeo, brightMat);
  parentGroup.add(brightStars);
}

// --- Shooting Star ---
let lastShootingStarTime = 0;
const SHOOTING_STAR_INTERVAL_MIN = 5;
const SHOOTING_STAR_INTERVAL_MAX = 15;
let nextShootingStarTime = Math.random() * 5 + 3;

function spawnShootingStar() {
  const startX = (Math.random() - 0.5) * 80;
  const startY = 20 + Math.random() * 20;
  const startZ = -30 + Math.random() * 10;

  const dirX = 0.6 + Math.random() * 0.4;
  const dirY = -(0.3 + Math.random() * 0.3);

  const trailLength = 20;
  const points = [];
  for (let i = 0; i < trailLength; i++) {
    points.push(new THREE.Vector3(
      startX + i * dirX * 0.8,
      startY + i * dirY * 0.8,
      startZ
    ));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
  });

  const line = new THREE.Line(geometry, material);
  parentRef.add(line);

  shootingStars.push({
    mesh: line,
    life: 0,
    maxLife: 1.5 + Math.random(),
    dirX,
    dirY,
  });
}

function updateShootingStars(elapsed) {
  // Spawn new shooting stars
  if (elapsed > nextShootingStarTime) {
    spawnShootingStar();
    nextShootingStarTime = elapsed +
      SHOOTING_STAR_INTERVAL_MIN +
      Math.random() * (SHOOTING_STAR_INTERVAL_MAX - SHOOTING_STAR_INTERVAL_MIN);
  }

  // Update existing shooting stars
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    star.life += 0.016; // ~60fps delta

    const progress = star.life / star.maxLife;

    if (progress >= 1) {
      parentRef.remove(star.mesh);
      star.mesh.geometry.dispose();
      star.mesh.material.dispose();
      shootingStars.splice(i, 1);
      continue;
    }

    // Fade in then out
    const fadeIn = Math.min(progress * 4, 1);
    const fadeOut = 1 - Math.max((progress - 0.5) * 2, 0);
    star.mesh.material.opacity = fadeIn * fadeOut * 0.8;

    // Move the line
    const positions = star.mesh.geometry.attributes.position.array;
    for (let j = 0; j < positions.length; j += 3) {
      positions[j] += star.dirX * 0.5;
      positions[j + 1] += star.dirY * 0.5;
    }
    star.mesh.geometry.attributes.position.needsUpdate = true;
  }
}

// --- Update ---
export function updateStarfield(elapsed) {
  if (stars) {
    stars.rotation.y = elapsed * 0.005;
    stars.rotation.x = elapsed * 0.002;
  }

  if (brightStars) {
    brightStars.material.opacity = 0.4 + Math.sin(elapsed * 0.5) * 0.2;
    brightStars.rotation.y = elapsed * 0.003;
  }

  updateShootingStars(elapsed);
}
