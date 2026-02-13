import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let logoMesh = null;
let glowMesh = null;

// --- Create 3D Logo (light lavender metallic) ---
export async function createLogo(parentGroup, loadingManager) {
  return new Promise((resolve) => {
    const fontLoader = new FontLoader(loadingManager);

    fontLoader.load(
      'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/helvetiker_bold.typeface.json',
      (font) => {
        const geometry = new TextGeometry('CH', {
          font,
          size: 3,
          depth: 0.8,
          curveSegments: 16,
          bevelEnabled: true,
          bevelThickness: 0.12,
          bevelSize: 0.06,
          bevelSegments: 6,
        });

        geometry.computeBoundingBox();
        geometry.center();

        // Lavender metallic material
        const material = new THREE.MeshPhysicalMaterial({
          color: 0xC4B5FD,
          metalness: 0.9,
          roughness: 0.12,
          envMapIntensity: 1.2,
          clearcoat: 0.5,
          clearcoatRoughness: 0.1,
        });

        logoMesh = new THREE.Mesh(geometry, material);
        logoMesh.position.set(0, 0, 2);
        logoMesh.rotation.y = -0.15;

        parentGroup.add(logoMesh);

        // Subtle glow behind logo
        const glowGeo = new THREE.PlaneGeometry(12, 6);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0x8B7FBF,
          transparent: true,
          opacity: 0.06,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        glowMesh = new THREE.Mesh(glowGeo, glowMat);
        glowMesh.position.set(0, 0, 0.5);
        parentGroup.add(glowMesh);

        resolve();
      },
      undefined,
      (err) => {
        console.warn('Font failed to load, skipping 3D logo:', err);
        resolve();
      }
    );
  });
}

// --- Update Logo ---
export function updateLogo(elapsed) {
  if (!logoMesh) return;

  // Gentle oscillating rotation
  logoMesh.rotation.y = -0.15 + Math.sin(elapsed * 0.3) * 0.06;

  // Subtle breathing glow
  if (glowMesh) {
    glowMesh.material.opacity = 0.04 + Math.sin(elapsed * 0.5) * 0.02;
  }
}
