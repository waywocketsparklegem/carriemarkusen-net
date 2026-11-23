/*
  sky.exe: slowly changing clouds (the "sky" command).

  From the cloud simulator (sketchbook/webgl/cloud-sim). One canvas sits behind the whole site and paints the sky
  and clouds across the whole screen, so the site's background is the sky.
  The clouds are layers of noise that slowly change shape as they drift.
  "sunset" and "daytime" fade between the two color modes; "normal" turns it off (see script.js).

  It runs on the graphics card (WebGL): the shader below is run on every pixel at once.
*/

// Settings. Edit freely.
const skySpeed = 0.65;        // how fast the clouds drift and change shape (1 = the simulator's first pace)
const skyScale = 0.8;         // canvas pixels per screen pixel: the clouds are soft, so less than 1 looks the same
const skyFadeSeconds = 4;     // how long daytime and sunset take to fade into each other

/* ---------- Shader ---------- */

const skyVertexShader = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const skyShader = `
precision highp float;
uniform vec2 resolution;  // canvas size, in pixels
uniform float time;       // seconds
uniform float sunset;     // 0 = daytime, 1 = sunset

// 3D value noise: the third dimension is time, so clouds morph instead of just sliding.
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

// Each layer of detail evolves through time at its own rate: large masses swell and
// dissolve slowly, fine detail only slightly faster, so shapes morph gently.
float fbm(vec2 p, float t) {
  float v = 0.0;
  float a = 0.5;
  float rate = 1.0;
  for (int i = 0; i < 6; i++) {
    v += a * noise(vec3(p, t * rate + float(i) * 13.7));
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
    rate *= 1.08;
  }
  return v;
}

// Cloud density at a point in the sky
float density(vec2 p, float t, float coverage) {
  vec2 wind = vec2(t * 0.012, t * 0.003);
  vec2 q = p + wind;
  // Domain warp gives billowy shapes; it evolves very slowly so clouds do not swirl
  vec2 warp = vec2(fbm(q * 0.5, t * 0.006 + 3.1),
                   fbm(q * 0.5 + vec2(5.2, 1.3), t * 0.006 + 7.7));
  float n = fbm(q + warp * 0.7, t * 0.04);
  return smoothstep(coverage, coverage + 0.32, n);
}

void main() {
  vec2 frag = gl_FragCoord.xy / resolution;
  vec2 p = gl_FragCoord.xy / resolution.y * 4.8;
  float t = time;
  float s = sunset;
  float y = frag.y;

  // Daytime sky: deeper blue overhead, softer and lighter toward the horizon
  vec3 daySky = mix(vec3(0.36, 0.62, 0.92), vec3(0.07, 0.30, 0.72), pow(y, 0.8));

  // Sunset sky: the same looking-up gradient as daytime, in deeper evening blues
  vec3 duskSky = mix(vec3(0.20, 0.34, 0.64), vec3(0.05, 0.13, 0.38), pow(y, 0.8));

  // The sun is setting just out of view to the lower right; its warm light
  // glows into that corner of the sky
  vec2 sunPos = vec2(0.85 * resolution.x / resolution.y, -0.25);
  vec2 sd = gl_FragCoord.xy / resolution.y - sunPos;
  float sunDist = length(vec2(sd.x * 0.6, sd.y));
  float glow = exp(-sunDist * 3.0);
  duskSky = mix(duskSky, vec3(1.0, 0.60, 0.28), glow * 0.8);
  // Orange and blue average to grey, so boost saturation where they meet
  float lum = dot(duskSky, vec3(0.299, 0.587, 0.114));
  duskSky = mix(vec3(lum), duskSky, 1.0 + 1.6 * glow * (1.0 - glow));

  vec3 sky = mix(daySky, duskSky, s);

  // Coverage breathes slowly between wispy and fuller skies
  float coverage = 0.50 + 0.06 * sin(t * 0.021) + 0.03 * sin(t * 0.053 + 1.3);
  float d = density(p, t, coverage);

  // Self-shadowing: compare with density a little way toward the sun.
  // Day and sunset are lit separately (sun upper left by day, low on the right
  // at sunset) and then cross-faded, so switching modes is a gentle dissolve.
  float litDay = 0.0;
  float litDusk = 0.0;
  if (s < 1.0) {
    float dSun = density(p + vec2(-0.6, 0.8) * 0.06, t, coverage);
    litDay = clamp(0.78 + (d - dSun) * 2.2, 0.0, 1.0);
  }
  if (s > 0.0) {
    // At sunset most of each cloud falls in shadow and only the sun-facing parts glow
    float dSun = density(p + vec2(0.35, -0.94) * 0.06, t, coverage);
    litDusk = clamp(0.48 + (d - dSun) * 3.2, 0.0, 1.0);
  }

  // Sunset clouds, graded by distance from the sun: golden closest to it, warming
  // to peach-coral, then a soft rose farther away; shadows are deep dusky blue
  float sunLight = exp(-sunDist * 0.9);
  float warmth = smoothstep(0.3, 0.8, sunLight);
  float nearest = smoothstep(0.6, 0.9, sunLight);
  vec3 duskLit = mix(vec3(0.96, 0.60, 0.62), vec3(1.0, 0.66, 0.46), warmth);
  duskLit = mix(duskLit, vec3(1.0, 0.74, 0.38), nearest);
  duskLit *= 0.78 + 0.22 * sunLight;
  vec3 duskShadow = mix(vec3(0.18, 0.23, 0.42), vec3(0.46, 0.32, 0.32), warmth);

  vec3 dayCloud = mix(vec3(0.62, 0.70, 0.84), vec3(1.0, 0.995, 0.98), litDay);
  vec3 duskCloud = mix(duskShadow, duskLit, litDusk);
  vec3 cloud = mix(dayCloud, duskCloud, s);

  // Bright lining on thin edges: silver by day; at sunset, sunlight shining
  // through thin edges glows gold, strongest near the sun
  float edge = smoothstep(0.0, 0.35, d) * (1.0 - smoothstep(0.35, 0.8, d));
  cloud += edge * mix(vec3(0.08), vec3(0.30, 0.17, 0.05) * sunLight, s);

  gl_FragColor = vec4(mix(sky, cloud, d * 0.96), 1.0);
}`;

/* ---------- Running it ---------- */

// Turns the sky on or off. Returns false if this browser can't draw it.
const sky = (() => {
  let canvas, gl, uniforms;
  let running = false;
  let sunsetTarget = 0;
  let sunsetProgress = 0;
  let last = 0;
  const offset = Math.random() * 1000;  // a random start, so every visit shows a different sky
  let clock = 0;

  function setupGl() {
    canvas = document.createElement("canvas");
    canvas.className = "sky-canvas";
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
    gl.attachShader(program, compile(gl.VERTEX_SHADER, skyVertexShader));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, skyShader));
    gl.bindAttribLocation(program, 0, "position");
    gl.linkProgram(program);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    uniforms = {};
    for (const name of ["resolution", "time", "sunset"]) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    return true;
  }

  function frame(now) {
    if (!running) return;

    const width = Math.max(1, Math.round(window.innerWidth * skyScale));
    const height = Math.max(1, Math.round(window.innerHeight * skyScale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    // Fade toward daytime or sunset, eased at both ends.
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    clock += dt * skySpeed;
    const step = dt / skyFadeSeconds;
    sunsetProgress = sunsetTarget > sunsetProgress
      ? Math.min(sunsetTarget, sunsetProgress + step)
      : Math.max(sunsetTarget, sunsetProgress - step);
    const eased = sunsetProgress * sunsetProgress * (3 - 2 * sunsetProgress);

    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform1f(uniforms.time, offset + clock);
    gl.uniform1f(uniforms.sunset, eased);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }

  return {
    start() {
      if (!canvas && !setupGl()) return false;
      if (!gl) return false;
      document.body.prepend(canvas);
      if (!running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      }
      return true;
    },
    stop() {
      running = false;
      if (canvas) canvas.remove();
      // Next time sky mode starts, it starts in daytime.
      sunsetTarget = 0;
      sunsetProgress = 0;
    },
    setSunset(on) {
      sunsetTarget = on ? 1 : 0;
    },
  };
})();
