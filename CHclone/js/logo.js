import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let logoMesh = null;

// --- Create 3D Logo ---
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
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.1,
          bevelSize: 0.05,
          bevelSegments: 5,
        });

        geometry.computeBoundingBox();
        geometry.center();

        const material = new THREE.MeshStandardMaterial({
          color: 0x888899,
          metalness: 0.95,
          roughness: 0.15,
          envMapIntensity: 1.0,
        });

        logoMesh = new THREE.Mesh(geometry, material);
        logoMesh.position.set(0, 0, 2);
        logoMesh.rotation.y = -0.15;

        parentGroup.add(logoMesh);
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
  logoMesh.rotation.y = -0.15 + Math.sin(elapsed * 0.3) * 0.05;
}
