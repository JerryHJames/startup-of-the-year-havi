import * as THREE from 'three';

let sphereMeshes = [];

// --- Sphere layout configs (futuristic palette) ---
const SPHERE_CONFIGS = [
  // Top area
  { x: -8,   y:  7,   z: -2,  radius: 2.0,  hue: 260,  label: 'Nova'      },
  { x: -2,   y:  8.5, z: -1,  radius: 2.5,  hue: 220,  label: 'Horizon'   },
  { x:  5,   y:  7.5, z: -3,  radius: 1.8,  hue: 290,  label: 'Drift'     },
  { x:  10,  y:  6,   z: -2,  radius: 1.5,  hue: 195,  label: 'Flux'      },
  // Upper-middle
  { x: -11,  y:  3,   z:  1,  radius: 2.8,  hue: 275,  label: 'Lumina'    },
  { x: -4,   y:  4,   z:  2,  radius: 3.0,  hue: 310,  label: 'Prism'     },
  { x:  4,   y:  3.5, z:  1,  radius: 3.2,  hue: 245,  label: 'Aether'    },
  { x:  9,   y:  2,   z: -1,  radius: 2.2,  hue: 180,  label: 'Orbit'     },
  // Center row (gap for logo)
  { x: -12,  y:  0,   z:  0,  radius: 2.5,  hue: 265,  label: 'Solace'    },
  { x: -6.5, y: -1,   z:  3,  radius: 2.0,  hue: 230,  label: 'Echo'      },
  { x:  6.5, y:  0,   z:  2,  radius: 2.3,  hue: 300,  label: 'Zenith'    },
  { x:  12,  y: -1,   z: -1,  radius: 1.8,  hue: 200,  label: 'Pulse'     },
  // Lower-middle
  { x: -9,   y: -4,   z: -1,  radius: 2.2,  hue: 320,  label: 'Ember'     },
  { x: -3,   y: -4.5, z:  1,  radius: 3.0,  hue: 255,  label: 'Vertex'    },
  { x:  3,   y: -5,   z:  0,  radius: 2.8,  hue: 240,  label: 'Radiant'   },
  { x:  8,   y: -4,   z: -2,  radius: 2.0,  hue: 185,  label: 'Shift'     },
  // Bottom area
  { x: -7,   y: -8,   z: -3,  radius: 1.5,  hue: 210,  label: 'Cipher'    },
  { x:  0,   y: -8.5, z: -2,  radius: 1.8,  hue: 270,  label: 'Warp'      },
  { x:  7,   y: -7,   z: -1,  radius: 2.0,  hue: 285,  label: 'Nimbus'    },
  { x:  13,  y: -6,   z: -4,  radius: 1.2,  hue: 205,  label: 'Fragment'  },
];

// --- Procedural futuristic texture ---
function createFuturisticTexture(label, hue) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep radial gradient with purple/blue tones
  const gradient = ctx.createRadialGradient(256, 200, 30, 256, 300, 350);
  gradient.addColorStop(0, `hsl(${hue}, 50%, 55%)`);
  gradient.addColorStop(0.4, `hsl(${hue + 15}, 40%, 30%)`);
  gradient.addColorStop(0.7, `hsl(${hue + 30}, 35%, 15%)`);
  gradient.addColorStop(1, `hsl(${hue + 40}, 30%, 8%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Holographic streak lines
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 15; i++) {
    const y = Math.random() * 512;
    const grad = ctx.createLinearGradient(0, y, 512, y + 20);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.3, `hsl(${hue + 60}, 70%, 70%)`);
    grad.addColorStop(0.7, `hsl(${hue - 20}, 70%, 70%)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 512, 2 + Math.random() * 4);
  }

  // Soft glowing orbs
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 15 + Math.random() * 50;
    const circGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    circGrad.addColorStop(0, `hsl(${hue + Math.random() * 40 - 20}, 60%, 65%)`);
    circGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = circGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle hex grid pattern
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = `hsl(${hue}, 40%, 60%)`;
  ctx.lineWidth = 0.5;
  const hexSize = 30;
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 20; col++) {
      const cx = col * hexSize * 1.5 + (row % 2) * hexSize * 0.75;
      const cy = row * hexSize * 0.866;
      drawHex(ctx, cx, cy, hexSize * 0.4);
    }
  }

  // Label text
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = `hsl(${hue}, 30%, 80%)`;
  ctx.font = '300 28px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.toUpperCase(), 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawHex(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

// --- Create Spheres ---
export function createSpheres(parentGroup, envMap) {
  for (const config of SPHERE_CONFIGS) {
    const texture = createFuturisticTexture(config.label, config.hue);

    const geometry = new THREE.SphereGeometry(config.radius, 64, 64);
    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      envMap: envMap || null,
      metalness: 0.15,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      envMapIntensity: 0.8,
      // Iridescence for holographic shimmer
      iridescence: 0.3,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [100, 400],
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(config.x, config.y, config.z);

    // Animation metadata
    const phase = Math.random() * Math.PI * 2;
    const floatSpeed = 0.25 + Math.random() * 0.25;
    const floatAmp = 0.1 + Math.random() * 0.15;

    mesh.userData = {
      baseX: config.x,
      baseY: config.y,
      baseZ: config.z,
      floatSpeed,
      floatAmp,
      phase,
      rotSpeed: 0.0004 + Math.random() * 0.0008,
    };

    parentGroup.add(mesh);
    sphereMeshes.push(mesh);
  }
}

// --- Update Spheres ---
export function updateSpheres(elapsed, parallaxOffset) {
  for (const mesh of sphereMeshes) {
    const ud = mesh.userData;

    // Floating bob (slightly more fluid / orbiting feel)
    const floatY = Math.sin(elapsed * ud.floatSpeed + ud.phase) * ud.floatAmp;
    const floatX = Math.cos(elapsed * ud.floatSpeed * 0.6 + ud.phase + 0.8) * ud.floatAmp * 0.4;

    // Parallax offset (depth-dependent)
    const depthFactor = 1.0 + (ud.baseZ * -0.15);
    const px = parallaxOffset.x * depthFactor;
    const py = parallaxOffset.y * depthFactor;

    mesh.position.x = ud.baseX + floatX + px;
    mesh.position.y = ud.baseY + floatY + py;

    // Slow self-rotation
    mesh.rotation.y += ud.rotSpeed;
    mesh.rotation.x += ud.rotSpeed * 0.3;
  }
}
