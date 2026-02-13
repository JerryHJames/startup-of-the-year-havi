import * as THREE from 'three';

const STAR_COUNT = 2500;
const NEBULA_COUNT = 80;

let stars;
let nebulaStars;
let shootingStars = [];
let parentRef;

// --- Create Starfield ---
export function createStarfield(parentGroup) {
  parentRef = parentGroup;

  // --- Layer 1: Distant Stars (white + cool blue tint) ---
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);

  for (let i = 0; i < STAR_COUNT; i++) {
    const r = 120 + Math.random() * 180;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Mix of cool white, blue-white, and faint lavender
    const tint = Math.random();
    if (tint < 0.6) {
      // White
      colors[i * 3] = 0.9 + Math.random() * 0.1;
      colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
      colors[i * 3 + 2] = 1.0;
    } else if (tint < 0.85) {
      // Blue-white
      colors[i * 3] = 0.6 + Math.random() * 0.2;
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
      colors[i * 3 + 2] = 1.0;
    } else {
      // Faint lavender
      colors[i * 3] = 0.7 + Math.random() * 0.15;
      colors[i * 3 + 1] = 0.55 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
    }
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.7,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  stars = new THREE.Points(starGeo, starMat);
  parentGroup.add(stars);

  // --- Layer 2: Nebula Glow (purple / violet / cyan) ---
  const nebulaGeo = new THREE.BufferGeometry();
  const nebulaPos = new Float32Array(NEBULA_COUNT * 3);
  const nebulaColors = new Float32Array(NEBULA_COUNT * 3);

  for (let i = 0; i < NEBULA_COUNT; i++) {
    const r = 80 + Math.random() * 120;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    nebulaPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    nebulaPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    nebulaPos[i * 3 + 2] = r * Math.cos(phi);

    // Purple / violet / cyan nebula tones
    const variant = Math.random();
    if (variant < 0.4) {
      // Lavender
      nebulaColors[i * 3] = 0.6 + Math.random() * 0.2;
      nebulaColors[i * 3 + 1] = 0.45 + Math.random() * 0.2;
      nebulaColors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
    } else if (variant < 0.7) {
      // Deep violet
      nebulaColors[i * 3] = 0.4 + Math.random() * 0.2;
      nebulaColors[i * 3 + 1] = 0.15 + Math.random() * 0.15;
      nebulaColors[i * 3 + 2] = 0.7 + Math.random() * 0.3;
    } else {
      // Cyan accent
      nebulaColors[i * 3] = 0.15 + Math.random() * 0.15;
      nebulaColors[i * 3 + 1] = 0.6 + Math.random() * 0.3;
      nebulaColors[i * 3 + 2] = 0.85 + Math.random() * 0.15;
    }
  }

  nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
  nebulaGeo.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

  const nebulaMat = new THREE.PointsMaterial({
    size: 4.0,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  nebulaStars = new THREE.Points(nebulaGeo, nebulaMat);
  parentGroup.add(nebulaStars);
}

// --- Shooting Stars (lavender/cyan trails) ---
let nextShootingStarTime = Math.random() * 4 + 2;
const SHOOTING_INTERVAL_MIN = 4;
const SHOOTING_INTERVAL_MAX = 12;

function spawnShootingStar() {
  const startX = (Math.random() - 0.5) * 80;
  const startY = 20 + Math.random() * 20;
  const startZ = -25 + Math.random() * 10;

  const dirX = 0.5 + Math.random() * 0.5;
  const dirY = -(0.3 + Math.random() * 0.3);

  const trailLength = 25;
  const points = [];
  for (let i = 0; i < trailLength; i++) {
    points.push(new THREE.Vector3(
      startX + i * dirX * 0.7,
      startY + i * dirY * 0.7,
      startZ
    ));
  }

  // Lavender or cyan trail color
  const isCyan = Math.random() > 0.6;
  const color = isCyan ? 0x66ddff : 0xC4B5FD;

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
  });

  const line = new THREE.Line(geometry, material);
  parentRef.add(line);

  shootingStars.push({
    mesh: line,
    life: 0,
    maxLife: 1.2 + Math.random() * 0.8,
    dirX,
    dirY,
  });
}

function updateShootingStars(elapsed) {
  if (elapsed > nextShootingStarTime) {
    spawnShootingStar();
    nextShootingStarTime = elapsed +
      SHOOTING_INTERVAL_MIN +
      Math.random() * (SHOOTING_INTERVAL_MAX - SHOOTING_INTERVAL_MIN);
  }

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    star.life += 0.016;

    const progress = star.life / star.maxLife;

    if (progress >= 1) {
      parentRef.remove(star.mesh);
      star.mesh.geometry.dispose();
      star.mesh.material.dispose();
      shootingStars.splice(i, 1);
      continue;
    }

    const fadeIn = Math.min(progress * 5, 1);
    const fadeOut = 1 - Math.max((progress - 0.4) * 1.67, 0);
    star.mesh.material.opacity = fadeIn * fadeOut * 0.7;

    const positions = star.mesh.geometry.attributes.position.array;
    for (let j = 0; j < positions.length; j += 3) {
      positions[j] += star.dirX * 0.6;
      positions[j + 1] += star.dirY * 0.6;
    }
    star.mesh.geometry.attributes.position.needsUpdate = true;
  }
}

// --- Update ---
export function updateStarfield(elapsed) {
  if (stars) {
    stars.rotation.y = elapsed * 0.004;
    stars.rotation.x = elapsed * 0.0015;
  }

  if (nebulaStars) {
    nebulaStars.material.opacity = 0.35 + Math.sin(elapsed * 0.4) * 0.15;
    nebulaStars.rotation.y = elapsed * 0.002;
  }

  updateShootingStars(elapsed);
}
