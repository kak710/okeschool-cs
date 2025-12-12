/* Double-helix sunflower petal animation.
   - Creates two interleaved helices
   - Per-petal helix param (angle, radius, speed)
   - Depth scaling and opacity for 3D feel
   - Gaussian blur via SVG filter applied via CSS class
   - Respawn when petals pass top for continuous flow
*/

const overlay = document.getElementById('sunflowers');

// dynamic overlay dimensions
function getW(){ return overlay.clientWidth; }
function getH(){ return overlay.clientHeight; }

// configuration
const TOTAL_PETALS = 120;       // total petals across both helices
const PETALS_PER_HELIX = TOTAL_PETALS / 2;
const PETAL_W = 14, PETAL_H = 42;
const HELIX_RADIUS = 100;        // horizontal radius of helix
const VERTICAL_SPACING = 10;    // how much y changes per angle turn
const ANGLE_SPEED_MIN = 0.014;
const ANGLE_SPEED_MAX = 0.058;
const RISE_SPEED = 0.8;         // global upward drift (px/frame-esque scaling)
const DEPTH_SCALE = 0.9;        // scaling factor for depth effect
const HUE_SHIFT = false;        // user said color shift is far fetched; keep false but you can enable

// container for particles
const petals = [];

/* helper */
const rand = (a,b) => Math.random()*(b-a)+a;
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

/* create a petal object and DOM element */
function makePetal(helixIndex, i) {
  const el = document.createElement('div');
  el.className = 'petal';
  // give some petals stronger halo blur for variety
  if (Math.random() > 0.85) el.classList.add('halo');

  overlay.appendChild(el);

  // each petal has its own angle offset so they are spaced along the helix
  const angle = (i / PETALS_PER_HELIX) * Math.PI * 2 + rand(-0.2,0.2);
  return {
    el,
    helix: helixIndex,      // 0 or 1
    angle,                 // current angle on helix
    speed: rand(ANGLE_SPEED_MIN, ANGLE_SPEED_MAX) * (helixIndex===0 ? 1 : 1.05),
    radius: HELIX_RADIUS * rand(0.85, 1.15),
    phaseOffset: rand(0, Math.PI*2),
    // vertical base position: randomly start between bottom and 80% height
    y: getH() - rand(10, getH()*0.3),
    cx: getW() * 0.5,      // horizontal center inside overlay (will be offset)
    vx: 0, vy: 0
  };
}

/* build both helices */
function spawnPetals() {
  // clear existing
  petals.forEach(p => p.el.remove());
  petals.length = 0;

  // choose center x inside overlay (a little inset from right edge)
  const baseCx = getW() * 0.5;
  for (let h = 0; h < 2; h++) {
    for (let i = 0; i < PETALS_PER_HELIX; i++) {
      const p = makePetal(h, i);
      p.cx = baseCx + (h===0 ? -12 : 12); // offset two helices laterally
      // make helix slightly staggered in vertical placement
      p.y = getH() - rand(10, getH()*0.35) - i * (VERTICAL_SPACING * 0.12);
      petals.push(p);
    }
  }
}

/* helix param -> screen position
   x = cx + radius * cos(angle + phase)
   y = baseY - k * angle   (rising with angle)
   To get two helices: helixIndex toggles phase by PI (opposite phase)
*/
function updateFrame() {
  const W = getW(), H = getH();

  for (let p of petals) {
    // advance angle
    p.angle += p.speed;

    // gentle upward drift combined with angle-based vertical mapping
    p.y -= RISE_SPEED * (0.9 + p.speed * 30) * 0.5; // global upward motion

    // helix vertical position driven by angle (makes spiral shape)
    const yFromAngle = - (p.angle * VERTICAL_SPACING);
    // combine to get final y (offset so p.y acts like base)
    const y = p.y + yFromAngle;

    // helix phase: opposite helix offset by PI
    const phase = p.phaseOffset + (p.helix === 0 ? 0 : Math.PI);

    // horizontal and depth via cos/sin
    const x = p.cx + Math.cos(p.angle + phase) * p.radius;
    const depth = (Math.sin(p.angle + phase) + 1) / 2; // 0..1 for z-depth illusion

    // scale and opacity for depth
    const scale = DEPTH_SCALE + depth * (1.2 - DEPTH_SCALE);
    const opacity = clamp(0.5 + depth * 0.6, 0.35, 1);

    // small lateral wobble to make motion organic
    const wobble = Math.sin((p.angle + p.phaseOffset) * 2.3) * (2 + depth * 2);

    // write transform (translate3d + rotation)
    const rot = (p.angle * 180 / Math.PI) + (p.helix === 0 ? 90 : -90);
    p.el.style.transform = `translate3d(${x + wobble}px, ${y}px, 0) rotate(${rot}deg) scale(${scale})`;
    p.el.style.left = '0px'; // keep left/top values stable (we use transform)
    p.el.style.top = '0px';
    p.el.style.opacity = opacity;

    // optional hue shift by depth (disabled by default)
    if (HUE_SHIFT) {
      const hue = Math.round(10 + depth * 20); // small warm shift
      p.el.style.filter = `hue-rotate(${hue}deg)`;
    }

    // respawn petals that have gone too far above
    if (y < -120) {
      // place them back near bottom with a new small randomization
      p.y = H + rand(10, 80);
      p.angle = rand(0, Math.PI*2);
      p.radius = HELIX_RADIUS * rand(0.85, 1.25);
      p.speed = rand(ANGLE_SPEED_MIN, ANGLE_SPEED_MAX) * (p.helix===0 ? 1 : 1.05);
    }
  }
}

/* animation loop */
let last = 0;
function loop(now) {
    if (now - last > 33){
  updateFrame();
    last = now;
}

  requestAnimationFrame(loop);
}

/* handle resize */
let resizeTO = null;
function onResize() {
  // re-center helices and respawn with new bounds for best visuals
  clearTimeout(resizeTO);
  resizeTO = setTimeout(() => {
    spawnPetals();
  }, 120);
}

window.addEventListener('resize', onResize);

// init
spawnPetals();
loop();

const dots = document.getElementById("dots");
let count = 0;

setInterval(() => {
  count = (count + 1) % 4;
  dots.textContent = ".".repeat(count);
}, 350);

function spawnPetals() {
  petals.forEach(p => p.el.remove());
  petals.length = 0;

  const W = getW();
  const H = getH();
  const isPhone = W <= 600;
  const BANNER_BOTTOM = H * 0.3;  // lock petals below banner
  const RIGHT_MARGIN = W - 10;

  for (let h = 0; h < 2; h++) {
    for (let i = 0; i < PETALS_PER_HELIX; i++) {
      const p = makePetal(h, i);

      if (isPhone) {
        // Only override positions for mobile
        const LEFT_MARGIN = W - 180;     // restrict to right-bottom
        p.cx = rand(LEFT_MARGIN, RIGHT_MARGIN);
        p.y = rand(BANNER_BOTTOM, H - 10);
        p.radius = HELIX_RADIUS * 0.8;
      } else {
        // Keep original PC positioning
        const baseCx = W * 0.5;
        p.cx = baseCx + (h===0 ? -12 : 12);
        p.y = H - rand(10, H*0.35) - i * (VERTICAL_SPACING * 0.12);
      }

      petals.push(p);
    }
  }
}

