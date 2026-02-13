# Build Plan: Space Orbs Landing Page (CH Projects Clone)

## Overview
Clone the CH Projects-style landing page featuring interactive 3D glass spheres
containing venue/restaurant images, floating in an animated outer-space starfield.
The spheres respond to mouse movement with parallax depth, creating an immersive
"floating in space" experience.

---

## Visual Breakdown (from screenshot)

| Element                  | Description                                                        |
|--------------------------|--------------------------------------------------------------------|
| **Background**           | Deep black space with stars, nebulae glow, and occasional shooting stars |
| **Spheres (~18-20)**     | Glass orb effect — venue photos mapped onto spheres with fisheye distortion, specular highlights, and reflections |
| **Center logo**          | 3D metallic "CH" monogram, slightly rotated, with chrome-like material |
| **Top-left logo**        | Small white "CH" icon                                              |
| **Top-right menu**       | Hamburger icon (three horizontal lines)                            |
| **Interactivity**        | Mouse parallax — spheres drift in response to cursor position; spheres gently float/bob |

---

## Technical Architecture

### Tech Stack
- **HTML5** — semantic structure
- **CSS3** — layout, nav, starfield layers, animations
- **Three.js (r160+)** — 3D sphere rendering with environment-mapped textures
- **Vanilla JS** — mouse tracking, parallax, floating animation

### Why Three.js?
The glass-orb effect (fisheye distortion, specular highlights, reflections) requires
real 3D sphere geometry with texture mapping. CSS `border-radius: 50%` alone cannot
produce the curved distortion visible on the sphere surfaces. Three.js provides:
- `SphereGeometry` for true 3D spheres
- `MeshPhysicalMaterial` with `envMap` for glass/chrome reflections
- Texture mapping that naturally wraps and distorts images onto spheres
- Built-in lighting for specular highlights

---

## File Structure

```
startup-of-the-year-havi/
├── index.html              # Main page (rewrite)
├── style.css               # Global styles (rewrite)
├── js/
│   ├── main.js             # Entry point — init scene, camera, renderer
│   ├── spheres.js          # Sphere creation, positioning, texture loading
│   ├── starfield.js        # Animated star background (canvas or Three.js particles)
│   └── parallax.js         # Mouse-move parallax controller
├── assets/
│   ├── images/             # Venue photos for sphere textures (placeholder images)
│   │   ├── venue-01.jpg
│   │   ├── venue-02.jpg
│   │   ├── ...
│   │   └── venue-18.jpg
│   ├── envmap/             # Environment map for reflections (space HDRI or cubemap)
│   │   └── space-env.jpg
│   └── logo.svg            # CH-style monogram logo
├── header.jpg              # (keep existing — can reuse or replace)
└── README.md
```

---

## Implementation Steps

### Step 1: HTML Scaffold & Navigation
**File:** `index.html`

- Clean HTML5 boilerplate
- Full-viewport `<canvas>` element for Three.js rendering
- Overlay `<nav>` with:
  - Top-left: small logo (SVG)
  - Top-right: hamburger menu button
- Load Three.js from CDN (ES module import map)
- Load local JS modules

### Step 2: CSS — Layout, Nav & Base Styles
**File:** `style.css`

- `body` / `html`: margin 0, overflow hidden, black background, full viewport
- Canvas: `position: fixed; top: 0; left: 0; width: 100%; height: 100%`
- Nav overlay: `position: fixed; z-index: 10` with logo and hamburger
- Hamburger icon: CSS-only (3 spans)
- Montserrat font retained from original

### Step 3: Three.js Scene Setup
**File:** `js/main.js`

- Create `Scene`, `PerspectiveCamera`, `WebGLRenderer`
- Renderer: `antialias: true`, `alpha: false`, background color `0x000000`
- Camera FOV ~60, positioned at z=30 (looking at origin)
- Resize handler for responsive canvas
- Animation loop (`requestAnimationFrame`)
- Import and initialize modules: spheres, starfield, parallax

### Step 4: Animated Starfield Background
**File:** `js/starfield.js`

Two layers of stars for depth:

1. **Distant stars (particle system)**
   - ~2000 `Points` using `BufferGeometry`
   - Randomly distributed in a large sphere (radius ~200)
   - Small white dots, varying opacity for twinkle
   - Slow rotation for subtle drift

2. **Bright stars / nebula glow**
   - ~50 larger sprite particles with glow texture
   - Warm gold/orange tint (matching the screenshot's star colors)
   - Random brightness pulsing via shader or opacity animation

3. **Shooting star** (optional enhancement)
   - Occasional animated line/trail across the scene

### Step 5: Glass Sphere Creation
**File:** `js/spheres.js`

Each sphere:

```
Geometry:  SphereGeometry(radius, 64, 64)  — high segment count for smooth surface
Material:  MeshPhysicalMaterial({
             map: venueTexture,           — the photo wrapped onto the sphere
             envMap: spaceEnvironment,     — reflection of surrounding space
             metalness: 0.3,              — slight metallic sheen
             roughness: 0.1,              — very smooth/glossy
             clearcoat: 1.0,              — glass-like clear coat layer
             clearcoatRoughness: 0.05,    — sharp reflections
             envMapIntensity: 0.8,        — visible but not overpowering reflections
           })
```

**Sphere layout:**
- Define an array of ~18 sphere configs: `{ x, y, z, radius, textureUrl }`
- Positions roughly match the screenshot's organic cluster pattern
- Varying sizes (radius 1.5 to 4.0) — larger spheres in center, smaller at edges
- Z-depth variation (-3 to +3) for natural layering

**Floating animation:**
- Each sphere gets a unique `floatSpeed` and `floatAmplitude`
- In the render loop: `sphere.position.y += sin(time * speed) * amplitude`
- Subtle rotation: `sphere.rotation.y += 0.001`

### Step 6: Center 3D Logo
**File:** `js/main.js` (or `js/spheres.js`)

- Create the "CH" monogram as a 3D object in the center of the sphere cluster
- Approach: Use `TextGeometry` with a bold font, or load a pre-made `.glb` model
- Simpler fallback: CSS-positioned SVG/PNG overlaid on the canvas
- Material: `MeshStandardMaterial` with high metalness (0.9) and low roughness (0.1)
  for a chrome/gunmetal look

### Step 7: Mouse Parallax Interaction
**File:** `js/parallax.js`

- Track `mousemove` events, normalize to -1...+1 range
- In render loop, offset each sphere's position based on mouse + depth:
  ```
  offsetX = mouseX * sphere.z * parallaxStrength
  offsetY = mouseY * sphere.z * parallaxStrength
  ```
- Spheres at different Z depths move at different rates = parallax
- Use lerp (linear interpolation) for smooth, eased movement:
  ```
  current += (target - current) * 0.05
  ```
- Slightly rotate the entire scene group based on mouse for added depth

### Step 8: Placeholder Assets
**File:** `assets/images/`

Since we don't have the actual venue photos:
- Use 18 royalty-free restaurant/bar interior images (from Unsplash or generated)
- Or use colorful placeholder images with warm tones to match the screenshot's aesthetic
- Create a simple space environment map for reflections

### Step 9: Performance & Polish

- **Texture optimization**: Resize venue images to 512x512 or 1024x1024 max
- **LOD**: Reduce sphere segments for smaller/distant spheres
- **Dispose**: Clean up textures/geometries on page unload
- **Mobile**: Detect touch devices; replace mousemove parallax with device orientation (gyroscope) or gentle auto-drift
- **Loading**: Add a simple loading screen while textures load (Three.js `LoadingManager`)
- **Fallback**: For browsers without WebGL, show a static CSS version with circular images

---

## Build Order (Priority Sequence)

| #  | Task                                    | Est. Complexity |
|----|-----------------------------------------|-----------------|
| 1  | HTML scaffold + CSS reset/layout        | Low             |
| 2  | Three.js scene setup + render loop      | Low             |
| 3  | Starfield particle background           | Medium          |
| 4  | Glass spheres with texture mapping      | High            |
| 5  | Sphere positioning (cluster layout)     | Medium          |
| 6  | Floating/bobbing animation              | Low             |
| 7  | Mouse parallax interaction              | Medium          |
| 8  | Navigation overlay (logo + hamburger)   | Low             |
| 9  | Center logo (3D or overlay)             | Medium          |
| 10 | Loading screen                          | Low             |
| 11 | Mobile/responsive handling              | Medium          |
| 12 | Performance tuning                      | Low             |

---

## Key Decisions / Notes

1. **No build tools needed** — Three.js via CDN import map keeps this as a simple
   static site, matching the current repo's approach.
2. **Placeholder images** — We'll use generated/placeholder venue images. These can
   be swapped out later for real photos.
3. **Logo** — Will create a simple SVG monogram. The 3D chrome effect can be done
   via Three.js or as a CSS-styled overlay initially.
4. **The existing `header.jpg` and `style.css`** will be fully replaced (not patched).
