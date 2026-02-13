import * as THREE from 'three';
import { createStarfield, updateStarfield } from './starfield.js';
import { createSpheres, updateSpheres } from './spheres.js';
import { initParallax, updateParallax, getParallaxOffset } from './parallax.js';
import { createLogo, updateLogo } from './logo.js';

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05020e);
scene.fog = new THREE.FogExp2(0x05020e, 0.008);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 30);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// --- Lighting (lavender/purple palette) ---
const ambientLight = new THREE.AmbientLight(0x1a1028, 0.6);
scene.add(ambientLight);

// Key light — soft lavender
const keyLight = new THREE.DirectionalLight(0xd4c4ff, 0.9);
keyLight.position.set(10, 12, 10);
scene.add(keyLight);

// Fill light — deep blue
const fillLight = new THREE.DirectionalLight(0x4455aa, 0.4);
fillLight.position.set(-8, -5, 5);
scene.add(fillLight);

// Rim light — warm violet accent
const rimLight = new THREE.PointLight(0x9966ff, 0.6, 60);
rimLight.position.set(0, 15, -10);
scene.add(rimLight);

// Cyan accent from below
const accentLight = new THREE.PointLight(0x44ddff, 0.3, 40);
accentLight.position.set(-10, -12, 5);
scene.add(accentLight);

// --- Loading Manager ---
const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 1200);
  }
};

// --- World Group (parallax target) ---
const worldGroup = new THREE.Group();
scene.add(worldGroup);

// --- Environment Map (lavender-tinted) ---
function createEnvironment() {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x05020e);

  // Lavender key
  const envLight1 = new THREE.PointLight(0xC4B5FD, 2, 100);
  envLight1.position.set(10, 10, 10);
  envScene.add(envLight1);

  // Deep blue fill
  const envLight2 = new THREE.PointLight(0x4466cc, 1.2, 100);
  envLight2.position.set(-10, -5, -10);
  envScene.add(envLight2);

  // Violet accent
  const envLight3 = new THREE.PointLight(0x8844cc, 0.8, 100);
  envLight3.position.set(0, -10, 5);
  envScene.add(envLight3);

  // Cyan edge
  const envLight4 = new THREE.PointLight(0x22ccff, 0.5, 100);
  envLight4.position.set(5, 8, -15);
  envScene.add(envLight4);

  const envRT = pmremGenerator.fromScene(envScene, 0, 0.1, 100);
  scene.environment = envRT.texture;
  pmremGenerator.dispose();
}

// --- Perspective Grid Floor ---
function createGrid() {
  const gridSize = 200;
  const gridDivisions = 60;
  const gridColor = new THREE.Color(0x6633cc);

  const grid = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor);
  grid.position.y = -18;
  grid.material.transparent = true;
  grid.material.opacity = 0.06;
  grid.material.depthWrite = false;
  worldGroup.add(grid);
}

// --- Floating Ring Accents ---
function createRings() {
  const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 16, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xC4B5FD,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const positions = [
    { x: -15, y: 5, z: -8, scale: 2.5, speed: 0.3 },
    { x: 12, y: -6, z: -10, scale: 1.8, speed: 0.4 },
    { x: 8, y: 9, z: -6, scale: 3.0, speed: 0.25 },
    { x: -10, y: -8, z: -12, scale: 2.0, speed: 0.35 },
  ];

  for (const pos of positions) {
    const ring = new THREE.Mesh(ringGeo, ringMat.clone());
    ring.position.set(pos.x, pos.y, pos.z);
    ring.scale.setScalar(pos.scale);
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.z = Math.random() * Math.PI;
    ring.userData.rotSpeed = pos.speed;
    worldGroup.add(ring);
    rings.push(ring);
  }
}

const rings = [];

// --- Initialize ---
async function init() {
  createEnvironment();
  createGrid();
  createRings();
  createStarfield(worldGroup);
  createSpheres(worldGroup, scene.environment);
  await createLogo(worldGroup, loadingManager);
  initParallax();

  // Fallback: hide loader after timeout
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 1200);
    }
  }, 5000);

  animate();
}

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const offset = getParallaxOffset();

  updateStarfield(elapsed);
  updateSpheres(elapsed, offset);
  updateLogo(elapsed);
  updateParallax(worldGroup);

  // Rotate accent rings
  for (const ring of rings) {
    ring.rotation.x += ring.userData.rotSpeed * 0.005;
    ring.rotation.y += ring.userData.rotSpeed * 0.003;
  }

  renderer.render(scene, camera);
}

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
