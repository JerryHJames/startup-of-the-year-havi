import * as THREE from 'three';

let sphereMeshes = [];

// --- Sphere layout configs ---
const SPHERE_CONFIGS = [
  // Top area
  { x: -8,   y:  7,   z: -2,  radius: 2.0,  hue: 20,  label: 'Venue 1'  },
  { x: -2,   y:  8.5, z: -1,  radius: 2.5,  hue: 35,  label: 'Venue 2'  },
  { x:  5,   y:  7.5, z: -3,  radius: 1.8,  hue: 50,  label: 'Venue 3'  },
  { x:  10,  y:  6,   z: -2,  radius: 1.5,  hue: 200, label: 'Venue 4'  },
  // Upper-middle
  { x: -11,  y:  3,   z:  1,  radius: 2.8,  hue: 10,  label: 'Venue 5'  },
  { x: -4,   y:  4,   z:  2,  radius: 3.0,  hue: 340, label: 'Venue 6'  },
  { x:  4,   y:  3.5, z:  1,  radius: 3.2,  hue: 25,  label: 'Venue 7'  },
  { x:  9,   y:  2,   z: -1,  radius: 2.2,  hue: 180, label: 'Venue 8'  },
  // Center row (gap in middle for logo)
  { x: -12,  y:  0,   z:  0,  radius: 2.5,  hue: 45,  label: 'Venue 9'  },
  { x: -6.5, y: -1,   z:  3,  radius: 2.0,  hue: 15,  label: 'Venue 10' },
  { x:  6.5, y:  0,   z:  2,  radius: 2.3,  hue: 280, label: 'Venue 11' },
  { x:  12,  y: -1,   z: -1,  radius: 1.8,  hue: 60,  label: 'Venue 12' },
  // Lower-middle
  { x: -9,   y: -4,   z: -1,  radius: 2.2,  hue: 330, label: 'Venue 13' },
  { x: -3,   y: -4.5, z:  1,  radius: 3.0,  hue: 5,   label: 'Venue 14' },
  { x:  3,   y: -5,   z:  0,  radius: 2.8,  hue: 40,  label: 'Venue 15' },
  { x:  8,   y: -4,   z: -2,  radius: 2.0,  hue: 160, label: 'Venue 16' },
  // Bottom area
  { x: -7,   y: -8,   z: -3,  radius: 1.5,  hue: 220, label: 'Venue 17' },
  { x:  0,   y: -8.5, z: -2,  radius: 1.8,  hue: 30,  label: 'Venue 18' },
  { x:  7,   y: -7,   z: -1,  radius: 2.0,  hue: 350, label: 'Venue 19' },
  { x:  13,  y: -6,   z: -4,  radius: 1.2,  hue: 90,  label: 'Venue 20' },
];

// --- Procedural placeholder texture ---
function createPlaceholderTexture(label, hue) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Warm radial gradient background
  const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 300);
  gradient.addColorStop(0, `hsl(${hue}, 70%, 55%)`);
  gradient.addColorStop(0.5, `hsl(${hue + 20}, 50%, 35%)`);
  gradient.addColorStop(1, `hsl(${hue + 40}, 30%, 15%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Add some visual noise / pattern
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 20 + Math.random() * 60;
    const circGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    circGrad.addColorStop(0, `hsl(${hue + Math.random() * 60}, 60%, 70%)`);
    circGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = circGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label text
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// --- Create Spheres ---
export function createSpheres(parentGroup, envMap) {
  for (const config of SPHERE_CONFIGS) {
    const texture = createPlaceholderTexture(config.label, config.hue);

    const geometry = new THREE.SphereGeometry(config.radius, 64, 64);
    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      envMap: envMap || null,
      metalness: 0.1,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 0.6,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(config.x, config.y, config.z);

    // Animation metadata
    const phase = Math.random() * Math.PI * 2;
    const floatSpeed = 0.3 + Math.random() * 0.3;
    const floatAmp = 0.08 + Math.random() * 0.14;

    mesh.userData = {
      baseX: config.x,
      baseY: config.y,
      baseZ: config.z,
      floatSpeed,
      floatAmp,
      phase,
      rotSpeed: 0.0005 + Math.random() * 0.001,
    };

    parentGroup.add(mesh);
    sphereMeshes.push(mesh);
  }
}

// --- Update Spheres ---
export function updateSpheres(elapsed, parallaxOffset) {
  for (const mesh of sphereMeshes) {
    const ud = mesh.userData;

    // Floating bob
    const floatY = Math.sin(elapsed * ud.floatSpeed + ud.phase) * ud.floatAmp;
    const floatX = Math.sin(elapsed * ud.floatSpeed * 0.7 + ud.phase + 1.0) * ud.floatAmp * 0.3;

    // Parallax offset (depth-dependent)
    const depthFactor = 1.0 + (ud.baseZ * -0.15);
    const px = parallaxOffset.x * depthFactor;
    const py = parallaxOffset.y * depthFactor;

    mesh.position.x = ud.baseX + floatX + px;
    mesh.position.y = ud.baseY + floatY + py;

    // Slow self-rotation
    mesh.rotation.y += ud.rotSpeed;
  }
}
