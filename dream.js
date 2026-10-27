/*
  dream.exe: a brain that grows its own folds.

  A reaction-diffusion simulation (the Gray-Scott model). Two imaginary chemicals, A and B, spread across
  a grid. Where they meet, B feeds on A and makes more B, while B slowly fades away. With the right rates,
  the pattern that appears looks like brain coral. It starts from a big :) and grows outward.
  Used on the home page (in the window) and on dream.html (full screen).
  Drag across it to seed new growth. The rates drift slowly, so the folds keep rearranging.

  It runs on the graphics card (WebGL2): each step is a tiny program (a shader) run on every cell at once.
*/

// Settings. Edit freely.
const cellSize = 2;        // screen pixels per grid cell: bigger means bigger folds and less work
const stepsPerFrame = 4;   // simulation steps per frame: more means faster growth
const rageStepsPerFrame = 1;    // the same in rage mode (0.5 would be one step every other frame)
const brushSize = 5;       // radius of the drag brush, in cells
const green = [3 / 255, 249 / 255, 0];            // --green
const white = [252 / 255, 252 / 255, 252 / 255];  // --white

/* ---------- Shaders ---------- */

// Covers the screen with one big triangle; uv runs from 0 to 1 across it.
const vertexShader = `#version 300 es
in vec2 position;
out vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Starting state: chemical A everywhere, plus B wherever the :) was drawn.
// Each spot in the :) starts with a slightly different amount of B, so the folds grow differently every time.
const seedShader = `#version 300 es
precision highp float;
uniform sampler2D seed;
uniform float salt;  // a random number, new for every start
in vec2 uv;
out vec4 color;
void main() {
  float amount = fract(sin(dot(uv * 997.0 + salt, vec2(12.9898, 78.233))) * 43758.5453);
  float shape = step(0.5, texture(seed, uv).a);
  color = vec4(1.0, shape * (0.55 + 0.45 * amount), shape, 1.0);  // blue remembers the starting shape
}`;

// One step of the simulation. The red channel holds chemical A, green holds chemical B.
const stepShader = `#version 300 es
precision highp float;
uniform sampler2D state;
uniform vec2 grid;         // grid size, in cells
uniform float time;        // seconds
uniform vec2 brushFrom;    // the line the pointer dragged along, in cells
uniform vec2 brushTo;
uniform float brushSize;   // 0 when nothing is being dragged
uniform float rage;        // 1 in rage mode: rules that shoot sharp spikes out from the words
uniform vec2 slashFrom;    // rage mode: the line the mouse just slashed along, in cells
uniform vec2 slashTo;
uniform float slashWidth;  // 0 when the mouse hasn't moved
in vec2 uv;
out vec4 color;

vec2 at(vec2 offset) {
  return texture(state, uv + offset / grid).rg;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Smooth random values between 0 and 1.
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec2 here = at(vec2(0.0));
  float shape = texture(state, uv).b;  // the letters, in rage mode

  // Rage mode: the chemicals spread mostly in one direction, which points out from the middle of the window and
  // wobbles from place to place, so growth shoots outward in spikes. In some patches they spread evenly and blob.
  vec2 out_ = uv * grid - grid * 0.5;
  float angle = atan(out_.y, out_.x) + 2.4 * (noise(uv * 7.0 + time * 0.02) - 0.5);
  vec2 direction = vec2(cos(angle), sin(angle));
  float sharp = rage * (1.0 - smoothstep(0.6, 0.8, noise(uv * 3.0 + 17.0)));

  // How much each chemical differs from its neighbours: this is what makes them spread.
  vec2 spread = vec2(0.0);
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      if (x == 0 && y == 0) continue;
      vec2 offset = vec2(x, y);
      float weight = (x == 0 || y == 0) ? 0.2 : 0.05;
      float along = dot(normalize(offset), direction);
      weight *= mix(1.0, 0.15 + 1.36 * along * along, sharp);
      spread += weight * (at(offset) - here);
    }
  }

  // Feed and kill rates drift across the screen and over time, so different areas grow different folds.
  // Rage mode feeds less and kills a little less, which grows thin, sharp strands instead of rounded coral.
  float feed = mix(0.0545, 0.030, rage) + 0.003 * sin(uv.x * 4.0 + time * 0.07) * cos(uv.y * 3.0 - time * 0.05);
  float kill = mix(0.0625, 0.0565, rage) + 0.0008 * sin(uv.y * 5.0 + time * 0.04);

  float reaction = here.r * here.g * here.g;
  vec2 next = here + vec2(
    1.0 * spread.r - reaction + feed * (1.0 - here.r),
    0.5 * spread.g + reaction - (kill + feed) * here.g
  );

  // Dragging drops chemical B along the pointer's path.
  vec2 p = uv * grid - brushFrom;
  vec2 line = brushTo - brushFrom;
  float along = clamp(dot(p, line) / max(dot(line, line), 0.0001), 0.0, 1.0);
  if (length(p - line * along) < brushSize) next.g = 1.0;

  // Rage mode: the letters keep feeding the growth, so they stay readable while spikes shoot out of them.
  next.g = max(next.g, 0.8 * shape * rage);

  // Rage mode: the mouse rips a jagged cut through everything, letters included, leaving torn fibers along the edges.
  if (slashWidth > 0.0) {
    vec2 q = uv * grid - slashFrom;
    vec2 cut = slashTo - slashFrom;
    float t = clamp(dot(q, cut) / max(dot(cut, cut), 0.0001), 0.0, 1.0);
    float distance = length(q - cut * t);
    float width = slashWidth * (1.0 - 0.7 * t) * (0.6 + 0.8 * hash(floor(uv * grid * 0.5) + time));  // tapers to a point
    if (distance < width) {
      next = vec2(1.0, 0.0);
      shape = 0.0;
    } else if (distance < width + 2.0 && hash(uv * grid + time) > 0.7) {
      next.g = 1.0;
    }
  }

  color = vec4(clamp(next, 0.0, 1.0), shape, 1.0);
}`;

// Draws the grid: chemical B is treated as height and lit from the top left, so the folds look solid.
// In silly mode, the folds are a cycling rainbow and everything else is see-through.
const drawShader = `#version 300 es
precision highp float;
uniform sampler2D state;
uniform vec2 grid;
uniform vec3 green;
uniform vec3 white;
uniform float time;
uniform float silly;  // 1 in silly mode, 0 otherwise
uniform float holo;   // 1 in holo mode, 0 otherwise
uniform vec2 tilt;    // holo mode's tilt, -1 to 1 on each axis
uniform float rage;   // 1 in rage mode, 0 otherwise
uniform vec3 red;     // rage mode's blood red
in vec2 uv;
out vec4 color;

// A fully saturated color for a hue from 0 to 1 (red, yellow, green, cyan, blue, magenta, red).
vec3 rainbow(float hue) {
  return clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

float height(vec2 offset) {
  return texture(state, uv + offset / grid).g;
}

void main() {
  vec2 slope = vec2(height(vec2(1.0, 0.0)) - height(vec2(-1.0, 0.0)),
                    height(vec2(0.0, 1.0)) - height(vec2(0.0, -1.0)));
  vec3 normal = normalize(vec3(-slope * 6.0, 1.0));
  vec3 light = normalize(vec3(-0.6, 0.7, 0.8));
  float diffuse = max(dot(normal, light), 0.0);
  float shine = pow(max(reflect(-light, normal).z, 0.0), 20.0);

  float fold = smoothstep(0.08, 0.3, height(vec2(0.0)));
  // Silly mode: a rainbow across the screen that slides through every color every 8 seconds.
  vec3 goo = mix(green, rainbow(uv.x + uv.y * 0.5 - time / 8.0), silly);
  vec3 lit = fold * (goo * (0.2 + 0.8 * diffuse) + white * shine * 0.7);

  // Holo mode: the folds are an iridescent film. Each fold's color comes from the angle between its surface
  // and the tilt, like a hologram sticker, and a bright glint sits where the tilted light hits it square on.
  vec3 holoLight = normalize(vec3(tilt.x, -tilt.y, 0.9));
  float angle = dot(normal, holoLight);
  vec3 film = 0.55 + 0.45 * cos(6.2831 * (angle * 1.6 + dot(normal.xy, tilt) * 0.8 + vec3(0.0, 0.33, 0.67)));
  float glint = pow(max(reflect(-holoLight, normal).z, 0.0), 30.0);
  vec3 holoLit = fold * (mix(film, vec3(1.0), 0.15) * (0.55 + 0.45 * diffuse) + vec3(glint));
  lit = mix(lit, holoLit, holo);

  // Rage mode: hard-edged strands shaded like dark metal: near black in the creases, blood red on the faces,
  // and a hot, almost white edge where the light catches.
  float blade = smoothstep(0.22, 0.25, height(vec2(0.0)));
  float hot = pow(max(reflect(-light, normal).z, 0.0), 40.0);
  vec3 rageLit = blade * (red * (0.08 + 1.1 * pow(diffuse, 3.0)) + vec3(1.0, 0.78, 0.72) * hot * 0.9);
  lit = mix(lit, rageLit, rage);

  // Outside the folds: black normally, see-through in silly and holo modes.
  float alpha = mix(1.0, fold, max(silly, holo));
  color = vec4(min(lit, vec3(alpha)), alpha);
}`;

/* ---------- WebGL plumbing ---------- */

const canvas = document.getElementById("dream");
const hint = document.getElementById("dream-hint");
const gl = canvas.getContext("webgl2", { antialias: false });

function makeProgram(fragmentSource) {
  const program = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, vertexShader], [gl.FRAGMENT_SHADER, fragmentSource]]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    gl.attachShader(program, shader);
  }
  gl.bindAttribLocation(program, 0, "position");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

// Uses a program and sets its uniforms, e.g. use(step, { grid: [w, h], time: 1.5 }).
function use(program, uniforms) {
  gl.useProgram(program);
  for (const [name, value] of Object.entries(uniforms)) {
    const location = gl.getUniformLocation(program, name);
    const values = [].concat(value);
    gl[`uniform${values.length}f`](location, ...values);
  }
}

// The grid lives in two textures: each step reads one and writes the other, then they swap.
let floatFormat;
let filter;

function makeTarget(width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, floatFormat, width, height, 0, gl.RGBA, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("can't draw into float textures");
  return { texture, framebuffer };
}

// Runs a program over a whole target (or the screen, when target is null).
function run(target, width, height, input) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
  gl.viewport(0, 0, width, height);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, input);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/* ---------- The dream ---------- */

let seedProgram, stepProgram, drawProgram;
let grid = [1, 1];
let targets = [];
let current = 0;
let brush = null;   // { from, to } in cells, waiting to be drawn
let slash = null;   // rage mode: { from, to, width } in cells, waiting to be cut
let lastHover = null;
let lastPoint = null;

// Sizes the canvas and grid to the window, then plants the :).
function setup() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
  grid = [Math.max(1, Math.round(canvas.clientWidth / cellSize)), Math.max(1, Math.round(canvas.clientHeight / cellSize))];

  for (const target of targets) {
    gl.deleteTexture(target.texture);
    gl.deleteFramebuffer(target.framebuffer);
  }
  targets = [makeTarget(...grid), makeTarget(...grid)];
  current = 0;

  // Draw a big :) on a hidden canvas the size of the grid, and use it as the starting B. In rage mode it's the
  // rage words (rageText) in JetBrains Mono Thin instead, wrapped into lines.
  const sketch = document.createElement("canvas");
  [sketch.width, sketch.height] = grid;
  const pen = sketch.getContext("2d");
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  if (document.documentElement.classList.contains("rage")) {
    const lines = wrapWords(rageText);
    const longest = Math.max(...lines.map((line) => line.length));
    const size = Math.min(grid[1] * 0.8 / (lines.length * 1.2), grid[0] * 0.85 / (longest * 0.6));
    pen.font = `100 ${size}px "JetBrains Mono", monospace`;
    lines.forEach((line, i) => {
      pen.fillText(line, grid[0] / 2, grid[1] / 2 + (i - (lines.length - 1) / 2) * size * 1.2);
    });
  } else {
    const size = Math.min(grid[1] * 0.6, grid[0] / 1.4);
    pen.font = `400 ${size}px "JetBrains Mono", monospace`;
    pen.fillText(":)", grid[0] / 2, grid[1] / 2);
  }

  const seed = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, seed);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sketch);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  use(seedProgram, { salt: Math.random() * 100 });
  run(targets[0], ...grid, seed);
  gl.deleteTexture(seed);
}

// The feed and kill rates drift over time; starting at a random point in that drift gives each visit a
// different layout of rates, so the first folds don't always grow the same way.
const rateStart = Math.random() * 1000;

// Rage mode (the "rage" command): sharp spikes shoot out of "you make me feel so dumb" in blood red, and the mouse slashes them.
const rageRed = [215 / 255, 38 / 255, 46 / 255];  // --rage-red in styles.css
let raging = false;
const rageWords = "you make me feel so dumb";  // planted first; then whatever the visitor screams
let rageText = rageWords;

// Breaks words into lines of roughly equal length, about as many lines as characters per line, so the words
// fill the window: "you make me feel so dumb" becomes "you make / me feel / so dumb".
function wrapWords(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const width = Math.max(...words.map((word) => word.length), Math.ceil(Math.sqrt(text.length * 2.2)));
  const lines = [];
  for (const word of words) {
    const last = lines.length - 1;
    if (last >= 0 && lines[last].length + 1 + word.length <= width) lines[last] += " " + word;
    else lines.push(word);
  }
  return lines;
}
let rageSteps = 0;  // rage mode's steps owed so far, since it can run less than one per frame

function frame(now) {
  // Entering or leaving rage mode plants a fresh seed (the words in rage, :) otherwise), so no mode inherits the other's growth.
  const rageNow = document.documentElement.classList.contains("rage");
  if (rageNow !== raging) {
    rageText = rageWords;
    hint.textContent = rageNow ? "[ move to slash ]" : "[ drag to grow ]";
    setup();
  }
  raging = rageNow;

  // In sky mode the clouds take the window's place, so the dream pauses until it ends.
  if (document.documentElement.classList.contains("sky")) {
    requestAnimationFrame(frame);
    return;
  }

  // On the home page, the dream waits behind the boot screen, so it starts growing as the site appears.
  const waiting = document.documentElement.classList.contains("booting");

  use(stepProgram, {
    grid,
    time: now / 1000 + rateStart,
    brushFrom: brush ? brush.from : [0, 0],
    brushTo: brush ? brush.to : [0, 0],
    brushSize: brush ? brushSize : 0,
    rage: raging ? 1 : 0,
    slashFrom: slash ? slash.from : [0, 0],
    slashTo: slash ? slash.to : [0, 0],
    slashWidth: slash ? slash.width : 0,
  });
  // Rage mode grows slower (rageStepsPerFrame), adding up fractions of a step until a whole one is due.
  let steps = stepsPerFrame;
  if (raging) {
    rageSteps += rageStepsPerFrame;
    steps = Math.floor(rageSteps);
    rageSteps -= steps;
  }
  if (waiting) steps = 0;
  for (let i = 0; i < steps; i++) {
    run(targets[1 - current], ...grid, targets[current].texture);
    current = 1 - current;
  }
  // A brush or slash waits for a frame that actually runs a step.
  if (steps > 0) {
    brush = null;
    slash = null;
  }

  use(drawProgram, {
    grid,
    green,
    white,
    time: now / 1000,
    silly: document.documentElement.classList.contains("silly") ? 1 : 0,
    holo: document.documentElement.classList.contains("holo") ? 1 : 0,
    tilt: [holoTilt.x, holoTilt.y],
    rage: raging ? 1 : 0,
    red: rageRed,
  });
  run(null, canvas.width, canvas.height, targets[current].texture);
  requestAnimationFrame(frame);
}

// Pointer position in grid cells (y counts up from the bottom, like the grid).
function toCells(event) {
  const box = canvas.getBoundingClientRect();
  return [
    ((event.clientX - box.left) / box.width) * grid[0],
    (1 - (event.clientY - box.top) / box.height) * grid[1],
  ];
}

function setupPointer() {
  canvas.addEventListener("pointerdown", (event) => {
    if (raging) return;  // in rage mode moving is enough
    canvas.setPointerCapture(event.pointerId);
    lastPoint = toCells(event);
    brush = { from: lastPoint, to: lastPoint };
  });
  canvas.addEventListener("pointermove", (event) => {
    if (raging) {
      // Rage mode: every move slashes, no click needed. Faster moves cut wider and overshoot further.
      const point = toCells(event);
      if (lastHover) {
        const move = [point[0] - lastHover[0], point[1] - lastHover[1]];
        const length = Math.hypot(...move);
        if (length > 0.5) {
          const to = [point[0] + move[0] * 0.4, point[1] + move[1] * 0.4];
          const width = Math.min(5, 1.2 + length * 0.12);
          slash = { from: slash ? slash.from : lastHover, to, width: Math.max(slash ? slash.width : 0, width) };
        }
      }
      lastHover = point;
      return;
    }
    if (!lastPoint) return;
    const point = toCells(event);
    brush = { from: brush ? brush.from : lastPoint, to: point };
    lastPoint = point;
  });
  canvas.addEventListener("pointerleave", () => { lastHover = null; });
  const stop = () => { lastPoint = null; };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
}

async function start() {
  try {
    if (!gl) throw new Error("no webgl2");
    // Full floats where the graphics card can draw into them, half floats otherwise.
    const fullFloat = gl.getExtension("EXT_color_buffer_float");
    if (!fullFloat && !gl.getExtension("EXT_color_buffer_half_float")) throw new Error("no float textures");
    floatFormat = fullFloat ? gl.RGBA32F : gl.RGBA16F;
    filter = !fullFloat || gl.getExtension("OES_texture_float_linear") ? gl.LINEAR : gl.NEAREST;

    const triangle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    seedProgram = makeProgram(seedShader);
    stepProgram = makeProgram(stepShader);
    drawProgram = makeProgram(drawShader);

    // Wait for the font so the :) (and rage mode's words, in Thin) are drawn in JetBrains Mono.
    try {
      await Promise.all([document.fonts.load('400 100px "JetBrains Mono"'), document.fonts.load('100 100px "JetBrains Mono"')]);
    } catch (e) {}
    setup();
    setupPointer();
    // Sent by script.js with what the visitor screamed (or nothing, to start over with the usual words).
    document.addEventListener("dream-replant", (event) => {
      rageText = event.detail || rageWords;
      setup();
    });
    requestAnimationFrame(frame);

    // A new window size starts a new dream.
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 250);
    });
  } catch (error) {
    hint.textContent = "[ this dream needs a browser with webgl2 ]";
    console.error(error);
  }
}

start();
