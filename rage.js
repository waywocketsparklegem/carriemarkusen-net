/*
  rage.exe: living tissue behind rage mode (the "rage" command).

  One canvas over the whole site draws pale veins that slowly drift and branch, with waves of firing rolling
  through them and sparks running along them, like neurons. Every few seconds the screen screams: blocks of
  the veins smear sideways, the page splits into red and cyan, and the whole screen inverts for a split second.
  If this browser can't draw it, rage mode keeps its still acid-wash veins instead (styles.css).

  It runs on the graphics card (WebGL): the shader below is run on every pixel at once.
*/

// Settings. Edit freely.
const rageScale = 0.5;           // canvas pixels per screen pixel: the veins are soft, so half looks the same
const rageScreamEvery = [4, 12];  // seconds between screams: a random time in this range
const rageScreamSeconds = 0.38;   // how long a scream lasts
const rageFlashSeconds = 0.04;    // how long the screen stays inverted at the start of a scream (about two frames)

/* ---------- Shader ---------- */

const rageVertexShader = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const rageShader = `
precision highp float;
uniform vec2 resolution;  // canvas size, in pixels
uniform float time;       // seconds
uniform float scream;     // 1 while screaming
uniform float salt;       // a random number, new every visit

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + salt) * 43758.5453); }

// Smooth random values between 0 and 1, and layers of them at finer and finer sizes.
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float layers(vec2 p) {
  float total = 0.0, amount = 0.5;
  for (int i = 0; i < 5; i++) { total += amount * noise(p); p *= 2.03; amount *= 0.5; }
  return total;
}

// Thin bright lines where the noise crosses its middle value: the veins. Warping the noise by more noise,
// which drifts over time, makes them wander and branch.
float veins(vec2 p, float t) {
  vec2 warp = vec2(layers(p + t * 0.03), layers(p + 5.2 - t * 0.025));
  float n = layers(p + 1.6 * warp);
  return pow(1.0 - abs(n * 2.0 - 1.0), 14.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;

  // Scream: blocks of the picture smear sideways, changing many times a second.
  vec2 block = floor(uv * vec2(9.0, 28.0));
  float tick = floor(time * 18.0);
  float r = hash(block + tick);
  if (r > 0.72) uv.x += (hash(block * 1.7 + tick) - 0.5) * 0.35 * scream;

  // Each color is drawn slightly to the side while screaming, so the veins split into red and blue.
  vec2 p = uv * vec2(resolution.x / resolution.y, 1.0) * 2.2;
  float split = 0.012 * scream;
  float v = veins(p, time);
  float vRed = veins(p + vec2(split, 0.0), time);
  float vBlue = veins(p - vec2(split, 0.0), time);

  // Firing: slow waves roll across the veins, and sparks run along them.
  float wave = pow(0.5 + 0.5 * sin(time * 1.1 - layers(p * 0.6) * 14.0), 5.0);
  float spark = pow(noise(p * 9.0 + vec2(time * 1.4, -time * 0.9)), 14.0) * 6.0;
  vec3 color = vec3(1.0, 0.92, 0.9) * vec3(vRed, v, vBlue) * (0.18 + 0.9 * wave + spark);

  // While screaming, a few blocks fill solid red or white.
  if (scream > 0.5 && r > 0.94) color = hash(block + tick + 3.0) > 0.5 ? vec3(0.84, 0.15, 0.18) : vec3(1.0);
  gl_FragColor = vec4(color, 1.0);
}`;

/* ---------- Running it ---------- */

const rage = (() => {
  let canvas, flash, gl, uniforms;
  let running = false;
  let screaming = false;
  let screamTimer;

  function setupGl() {
    canvas = document.createElement("canvas");
    canvas.className = "rage-canvas";
    canvas.setAttribute("aria-hidden", "true");
    gl = canvas.getContext("webgl");
    if (!gl) return false;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, rageVertexShader));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, rageShader));
    gl.bindAttribLocation(program, 0, "position");
    gl.linkProgram(program);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    uniforms = {};
    for (const name of ["resolution", "time", "scream", "salt"]) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    gl.uniform1f(uniforms.salt, Math.random() * 100);

    // A white layer in "difference" mode turns everything under it into its opposite: the inverted flash.
    flash = document.createElement("div");
    flash.className = "rage-flash";
    flash.setAttribute("aria-hidden", "true");
    return true;
  }

  function frame(now) {
    if (!running) return;

    const width = Math.max(1, Math.round(window.innerWidth * rageScale));
    const height = Math.max(1, Math.round(window.innerHeight * rageScale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform1f(uniforms.time, now / 1000);
    gl.uniform1f(uniforms.scream, screaming ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }

  // Screams come at random times, never closer than rageScreamEvery[0] seconds apart.
  function nextScream() {
    const [shortest, longest] = rageScreamEvery;
    screamTimer = setTimeout(() => {
      scream();
      nextScream();
    }, (shortest + Math.random() * (longest - shortest)) * 1000);
  }

  function scream() {
    const root = document.documentElement;
    screaming = true;
    root.classList.add("scream", "flashing");
    setTimeout(() => root.classList.remove("flashing"), rageFlashSeconds * 1000);
    setTimeout(() => {
      screaming = false;
      root.classList.remove("scream");
    }, rageScreamSeconds * 1000);
  }

  return {
    start() {
      if (!canvas && !setupGl()) return false;
      if (!gl) return false;
      document.body.append(canvas, flash);
      document.documentElement.classList.add("rage-live");
      if (!running) {
        running = true;
        requestAnimationFrame(frame);
        nextScream();
      }
      return true;
    },
    stop() {
      running = false;
      screaming = false;
      clearTimeout(screamTimer);
      document.documentElement.classList.remove("rage-live", "scream", "flashing");
      if (canvas) canvas.remove();
      if (flash) flash.remove();
    },
  };
})();
