import * as THREE from 'three';
import { createStarfield, updateStarfield } from './starfield.js';
import { createSpheres, updateSpheres } from './spheres.js';
import { initParallax, updateParallax, getParallaxOffset } from './parallax.js';
import { createLogo, updateLogo } from './logo.js';

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000005);

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
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
keyLight.position.set(10, 10, 10);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
fillLight.position.set(-5, -5, 5);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xffaa44, 0.5, 50);
rimLight.position.set(0, 15, -10);
scene.add(rimLight);

// --- Loading Manager ---
const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 1000);
  }
};

// --- World Group (parallax target) ---
const worldGroup = new THREE.Group();
scene.add(worldGroup);

// --- Environment Map (procedural) ---
function createEnvironment() {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x000005);

  const envLight1 = new THREE.PointLight(0xffaa44, 2, 100);
  envLight1.position.set(10, 10, 10);
  envScene.add(envLight1);

  const envLight2 = new THREE.PointLight(0x4488ff, 1, 100);
  envLight2.position.set(-10, -5, -10);
  envScene.add(envLight2);

  const envLight3 = new THREE.PointLight(0xff4488, 0.8, 100);
  envLight3.position.set(0, -10, 5);
  envScene.add(envLight3);

  const envRT = pmremGenerator.fromScene(envScene, 0, 0.1, 100);
  scene.environment = envRT.texture;
  pmremGenerator.dispose();
}

// --- Initialize ---
async function init() {
  createEnvironment();
  createStarfield(worldGroup);
  createSpheres(worldGroup, scene.environment);
  await createLogo(worldGroup, loadingManager);
  initParallax();

  // If logo font fails to load, still hide the loader after a timeout
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 1000);
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

  renderer.render(scene, camera);
}

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
