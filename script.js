/*
  Carrie's brain: the moving parts.
  1. Boot screen (home page only): types the welcome line, asks for the password, prints a boot log, then shows the site.
  2. Command line in the status bar: type help, ls, cd sketchbook, and so on.
  3. Clock and uptime in the status bar.
  4. Web experiments (sketchbook page): open one in a window over the right-hand viewport.
*/

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- 1. Boot screen ---------- */

// The password typed at the boot screen. This is for show: anyone can read it here in the page source.
// A hidden shortcut: typing any command instead (like "rage" or "cd sketchbook"), or just a place's name
// (like "sketchbook"), also gets in, and runs it as the site appears. Nothing on screen mentions this.
const password = ":)";

// Lines printed after Enter. Edit freely.
const bootLog = [
  "[ ok ] power-on self test passed",
  "[ ok ] loading cortex kernel v4.0.26",
  "[ ok ] mounting /dev/imagination",
  "[ ok ] synapse bus online ......... 86,000,000,000 nodes",
  "[ ok ] loading palette ............ 16,777,216 colors",
  "[ ok ] indexing ~/carries-brain ... 3 found",
  "[ ok ] warming dream cache",
  "[ ok ] aligning memory to the northern stars",
  "",
  "system ready.",
];

async function runBoot() {
  const root = document.documentElement;
  const boot = document.getElementById("boot");
  if (!boot || !root.classList.contains("booting")) return;

  const text = document.getElementById("boot-text");
  const login = document.getElementById("boot-login");
  const input = document.getElementById("boot-password");
  const message = document.getElementById("boot-message");
  const log = document.getElementById("boot-log");
  const cursor = document.getElementById("boot-cursor");

  // Type the welcome line one character at a time, with a little human unevenness.
  await wait(700);
  for (const char of text.dataset.text) {
    text.textContent += char;
    await wait(40 + Math.random() * 40);
  }
  await wait(400);

  // Show the password prompt and move the cursor down to it.
  login.classList.add("is-visible");
  login.appendChild(cursor);
  input.focus({ preventScroll: true });

  // Clicking or tapping anywhere puts the typing back in the password field.
  boot.addEventListener("click", () => input.focus({ preventScroll: true }));

  // Keep the field as wide as what's been typed, so the cursor sits right after it.
  const fitInput = () => { input.style.width = `${input.value.length}ch`; };
  input.addEventListener("input", fitInput);
  fitInput();

  // Wait for the right password, or a command or place name to run once in. Anything else clears the field
  // and asks again.
  const entered = await new Promise((resolve) => {
    login.addEventListener("submit", (event) => {
      event.preventDefault();
      const line = input.value.trim();
      if (input.value === password) {
        resolve("");
      } else if (line && findCommand(line)) {
        resolve(line);
      } else if (line && findPlace(line)) {
        resolve(`cd ${line}`);
      } else {
        message.textContent = "access denied. try again.";
        input.value = "";
        fitInput();
      }
    });
  });

  // Print the boot log.
  cursor.remove();
  input.disabled = true;
  message.textContent = "access granted.";
  for (const line of bootLog) {
    const row = document.createElement("div");
    row.textContent = line || " ";
    log.appendChild(row);
    await wait(90 + Math.random() * 160);
  }
  await wait(500);

  // Hide the boot screen and switch the desktop on. The right password is remembered for 24 hours
  // (localStorage key "unlocked", the time it was entered; index.html's <head> checks it).
  try { sessionStorage.setItem("booted", "1"); } catch (e) {}
  try { localStorage.setItem("unlocked", String(Date.now())); } catch (e) {}
  const screen = document.getElementById("screen");
  root.classList.remove("booting");
  if (entered) runCommand(entered);
  screen.classList.add("powering-on");
  screen.addEventListener("animationend", () => screen.classList.remove("powering-on"), { once: true });
  document.getElementById("main").focus({ preventScroll: true });
}

/* ---------- 2. Command line ---------- */

// The pretend file system that the file tree, the title bar and the command line all share. Each place is a
// folder (path) with the page that shows it (url). Experiments are files inside webgl; opening one
// opens it over that page. `names` are shortcuts that work from anywhere ("cd sketchbook", "cd home").
const places = [
  { path: "~", url: "index.html", names: ["~", "home", "/"] },
  { path: "~/carries-brain", url: "carries-brain.html", names: ["carries-brain"] },
  { path: "~/carries-brain/sketchbook", url: "sketchbook.html", names: ["sketchbook"] },
  { path: "~/carries-brain/sketchbook/design", url: "design.html", names: ["design"] },
  { path: "~/carries-brain/sketchbook/design/portfolio-grid", url: "portfolio-grid.html", names: ["portfolio-grid"] },
  { path: "~/carries-brain/sketchbook/webgl", url: "webgl.html", names: ["webgl"] },
  { path: "~/carries-brain/sketchbook/webgl/liquid-goo.glsl", url: "webgl.html#liquid-goo", names: ["liquid-goo"] },
  { path: "~/carries-brain/sketchbook/webgl/cloud-sim.glsl", url: "webgl.html#cloud-sim", names: ["cloud-sim"] },
  { path: "~/carries-brain/sketchbook/webgl/slime-brain.glsl", url: "webgl.html#slime-brain", names: ["slime-brain"] },
];
const isFile = (place) => place.path.endsWith(".glsl");

// The folder this page shows (home if the page isn't a place).
const here = (() => {
  const page = location.pathname.split("/").pop() || "index.html";
  return places.find((place) => place.url === page) || places[0];
})();

// Finds a place from what was typed: a shortcut name, a full path (~/carries-brain/sketchbook), or a path from
// the current folder (sketchbook, .., ../sketchbook/webgl). Capitals don't matter.
function findPlace(name) {
  const typed = (name || "").trim().toLowerCase().replace(/\/+$/, "");
  if (!typed) return null;
  const named = places.find((place) => place.names.includes(typed));
  if (named) return named;
  const parts = typed.startsWith("~") ? [] : here.path.split("/");
  for (const part of typed.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "~") parts.splice(0, parts.length, "~");
    else if (part === "..") { if (parts.length > 1) parts.pop(); }
    else parts.push(part);
  }
  const path = parts.join("/");
  return places.find((place) => place.path.toLowerCase() === path.toLowerCase()) || null;
}

function goTo(name) {
  const place = findPlace(name);
  if (!place) return `no such file or directory: ${name || "(nothing)"}`;
  // An experiment on this page opens straight away; anything else is another page.
  const link = place.url.startsWith(location.pathname.split("/").pop() + "#") && document.getElementById(place.url.split("#")[1]);
  if (link) link.click();
  else window.location.href = place.url;
  return `opening ${place.path}${isFile(place) ? "" : "/"} ...`;
}

// What's in the current folder: folders end in /.
function list() {
  const inside = places.filter((place) => place.path.startsWith(here.path + "/") && !place.path.slice(here.path.length + 1).includes("/"));
  return inside.map((place) => place.path.split("/").pop() + (isFile(place) ? "" : "/")).join("  ") || "(empty)";
}

const commands = {
  help: () =>
    "commands: ls, cd <place>, open <place>, whoami, pwd, date, clear, reboot, silly, holo, rage, cowsay <words>, sky, quote\n" +
    "places:   ~, carries-brain, sketchbook, webgl, design (or any path, like ../sketchbook)",
  ls: list,
  cd: (name) => goTo(name || "~"),
  open: goTo,
  cat: goTo,
  whoami: () => "carrie markusen. physical + digital designer.",
  pwd: () => here.path,
  date: () => new Date().toString().toLowerCase(),
  clear: () => "",
  reboot: () => {
    try { sessionStorage.removeItem("booted"); localStorage.removeItem("unlocked"); } catch (e) {}
    window.location.href = "index.html";
    return "rebooting ...";
  },
  sudo: () => "nice try.",
  exit: () => "there is no exit. only more ideas.",
  silly: () => startMode("silly", () => setSilly(true)),
  "too silly": () => setSilly(false),
  cowsay: (words) => {
    nextHint = "type so cute";
    return cowsay(words || "moo.");
  },
  "so cute": () => ":)",
  quote: () => showQuote(),
  wow: () => "",
  sky: () => startMode("sky", setSky),
  sunset: () => setSunset(true),
  daytime: () => setSunset(false),
  holo: () => startMode("holo", () => setHolo(true)),
  rage: () => startMode("rage", () => setRage(true)),
  normal: () => backToNormal(),
};

// Quotes for the "quote" command: the first one in the list shows first on a visit; after that, one is picked
// at random each time (never the same one twice in a row).
// Add more to the list: the quote's text, and who it's by (shown in the command line's hint while the quote is
// up). Leave "by" out for a quote with no attribution.
// A quote stays above the command line until the visitor does anything else (a key, click, tap or scroll).
const quotes = [
  {
    text: "way leads on to way,",
  },
  {
    text: "Okay, if you can figure out the tilt, you can figure out any damn thing you choose. Because even light has weight, and when the note of a trainwhistle suddenly drops its Doppler effect and when an airplane breaks the sound barrier that bang isn't the applause of the angels or the flatulence of demons but only air collapsing back into place. I gave you the tilt and then I sat back about halfway up the auditorium to watch the show. I got nothing else to say, except that two and two makes four, the lights in the sky are stars, and if there's blood grownups can see it as well as kids, and dead boys stay dead.",
  },
];

// Whether a quote is showing right now, so the next key, click or scroll knows to clear it (setupCli).
let quoteShowing = false;

// Shows the first quote the first time, then a random one, skipping the one shown last. The last one is
// remembered across pages during a visit.
function showQuote() {
  let last = -1;
  try { last = Number(sessionStorage.getItem("quote") ?? -1); } catch (e) {}
  let next = 0;
  if (last !== -1 && quotes.length > 1) {
    do next = Math.floor(Math.random() * quotes.length); while (next === last);
  }
  try { sessionStorage.setItem("quote", String(next)); } catch (e) {}
  quoteShowing = true;
  nextHint = quotes[next].by || "";
  return quotes[next].text;
}

// A command can set this to suggest what to type next. Otherwise the hint goes back to "type help".
let nextHint = "";

// Silly mode: Wingdings and rainbows (styles at the end of styles.css). Lasts until "too silly" or the page changes.
function setSilly(on) {
  document.documentElement.classList.toggle("silly", on);
  return on ? cowsay("silly mode on.") : "back to normal.";
}

// Sky mode: the site's background becomes the sky and clouds fill the window (sky.js, styles at the end of
// styles.css). "sunset" and "daytime" switch colors; Esc ends it. Like silly mode, it lasts until the page changes.
function setSky() {
  const root = document.documentElement;
  if (!sky.start()) return "no sky here: this browser can't draw it.";
  root.classList.add("sky");
  return "sky mode on.";
}

function setSunset(on) {
  const root = document.documentElement;
  if (!root.classList.contains("sky")) {
    nextHint = "type sky";
    return "no sky yet. type sky first.";
  }
  sky.setSunset(on);
  root.classList.toggle("sunset", on);
  return on ? "sunset." : "daytime.";
}

// Holo mode: the whole site turns into holographic foil that catches the light as it tilts (styles at the end of
// styles.css). The mouse is the tilt; on phones, the phone's own tilt or a dragging finger. Esc ends it, and
// like silly mode it lasts until the page changes.
// holoTilt runs from -1 to 1 on each axis; dream.js reads it too, to light its folds.
const holoTilt = { x: 0, y: 0 };
const holoTarget = { x: 0, y: 0 };
let holoOn = false;
let holoFrameId = 0;
let holoLast = 0;

// The foil's big layers: a rainbow, fine lines and a glare behind the page, glitter in front.
// They move by sliding and turning whole layers, which the graphics card does without redrawing them.
const holoLayers = ["holo-foil", "holo-lines", "holo-glare", "holo-glitter holo-glitter-a", "holo-glitter holo-glitter-b"]
  .map((names) => {
    const layer = document.createElement("div");
    layer.className = `holo-layer ${names}`;
    layer.setAttribute("aria-hidden", "true");
    return layer;
  });

function aimHolo(x, y) {
  holoTarget.x = Math.max(-1, Math.min(1, x));
  holoTarget.y = Math.max(-1, Math.min(1, y));
  if (holoOn && !holoFrameId) {
    holoLast = performance.now();
    holoFrameId = requestAnimationFrame(holoFrame);
  }
}

const holoPointer = (event) => aimHolo((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
// Phone tilt: leaning left and right, and forward and back from holding it at about 45 degrees.
const holoOrientation = (event) => {
  if (event.gamma === null) return;
  aimHolo(event.gamma / 30, (event.beta - 45) / 30);
};

// The tilt eases toward where it's aimed, so the light glides instead of jumping. Once it arrives, it stops
// updating until the pointer moves again, so a still foil costs nothing.
function holoFrame(now) {
  holoFrameId = 0;
  if (!holoOn) return;
  const ease = 1 - Math.exp(-Math.min(0.1, Math.max(0, (now - holoLast) / 1000)) * 7);
  holoLast = now;
  holoTilt.x += (holoTarget.x - holoTilt.x) * ease;
  holoTilt.y += (holoTarget.y - holoTilt.y) * ease;
  const settled = Math.abs(holoTarget.x - holoTilt.x) < 0.001 && Math.abs(holoTarget.y - holoTilt.y) < 0.001;
  if (settled) Object.assign(holoTilt, holoTarget);
  paintHolo(settled);
  if (!settled) holoFrameId = requestAnimationFrame(holoFrame);
}

// The text ink and foil cards (--tx, --ty, --mx, --my) and the lines' hue (--lx, --ly) are costly to change:
// each change makes the browser restyle the whole page and repaint every piece of text. So while the layers
// move every frame, these catch up a few times a second. Smaller numbers are smoother but heavier.
const holoInkEvery = 50;     // milliseconds between text ink updates
const holoLinesEvery = 200;  // milliseconds between line color updates
let holoInkAt = -Infinity;
let holoLinesAt = -Infinity;

// Moves the layers, and sets --tx and --ty (-1 to 1) and --mx and --my (the pointer, in %) for the text
// ink and foil cards, and --lx and --ly (-1 to 1) for the lines. `all` updates everything right away, for when
// the tilt settles and the last step has to land exactly.
function paintHolo(all = true) {
  const { x, y } = holoTilt;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const [foil, lines, glare, glitterA, glitterB] = holoLayers;
  foil.style.transform = `translate(${(-x * 0.22 * w).toFixed(1)}px, ${(-y * 0.22 * h).toFixed(1)}px) rotate(${(x * 30 + y * 15).toFixed(2)}deg)`;
  lines.style.transform = `translate(${(x * 8).toFixed(1)}px, ${(y * 8).toFixed(1)}px)`;
  glare.style.transform = `translate(${((0.5 + x * 0.5) * w).toFixed(1)}px, ${((0.5 + y * 0.5) * h).toFixed(1)}px)`;
  glitterA.style.transform = `translate(${(-x * 14).toFixed(1)}px, ${(-y * 14).toFixed(1)}px)`;
  glitterB.style.transform = `translate(${(x * 22).toFixed(1)}px, ${(y * 22).toFixed(1)}px)`;

  const style = document.documentElement.style;
  const now = performance.now();
  if (all || now - holoInkAt >= holoInkEvery) {
    holoInkAt = now;
    style.setProperty("--tx", x.toFixed(3));
    style.setProperty("--ty", y.toFixed(3));
    style.setProperty("--mx", `${(50 + x * 50).toFixed(1)}%`);
    style.setProperty("--my", `${(50 + y * 50).toFixed(1)}%`);
  }
  if (all || now - holoLinesAt >= holoLinesEvery) {
    holoLinesAt = now;
    style.setProperty("--lx", x.toFixed(3));
    style.setProperty("--ly", y.toFixed(3));
  }
}

function setHolo(on) {
  const root = document.documentElement;
  root.classList.toggle("holo", on);
  if (on && !holoOn) {
    holoOn = true;
    document.body.prepend(...holoLayers);
    paintHolo();
    window.addEventListener("pointermove", holoPointer);
    window.addEventListener("deviceorientation", holoOrientation);
    window.addEventListener("resize", paintHolo);
    // iPhones only share their tilt after asking. Typing the command counts as a tap, so the question can show.
    if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
      DeviceOrientationEvent.requestPermission().catch(() => {});
    }
  } else if (!on) {
    holoOn = false;
    for (const layer of holoLayers) layer.remove();
    window.removeEventListener("pointermove", holoPointer);
    window.removeEventListener("deviceorientation", holoOrientation);
    window.removeEventListener("resize", paintHolo);
    for (const name of ["--tx", "--ty", "--mx", "--my", "--lx", "--ly"]) root.style.removeProperty(name);
  }
  return on ? "holo mode on. move around to tilt." : "back to normal.";
}

// Rage mode: the terminal in blood red, with living veins over everything that scream now and then (rage.js;
// styles at the end of styles.css); dream.js grows sharp spikes. Esc ends it; like silly mode it lasts until the page changes.
// The sidebar's :) turns into a :( while it's on. It starts by asking for a scream: the prompt says "scream
// something", and the next line typed is planted in the dream in place of the words, instead of being run.
// Typing rage again starts over (the usual words, and a new scream).
let awaitingScream = false;

function setRage(on) {
  const root = document.documentElement;
  if (on && root.classList.contains("rage")) document.dispatchEvent(new CustomEvent("dream-replant"));
  root.classList.toggle("rage", on);
  if (on) rage.start();
  else rage.stop();
  document.querySelectorAll(".sidebar-label").forEach((label) => { label.textContent = on ? ":(" : ":)"; });
  awaitingScream = on;
  setPromptName(on ? "scream something" : "carrie@brain");
  return on ? "" : "back to normal.";
}

function scream(line) {
  awaitingScream = false;
  setPromptName("carrie@brain");
  document.dispatchEvent(new CustomEvent("dream-replant", { detail: line.slice(0, 60) }));
  return "you have the power to escape your rage.";
}

// The command line's prompt: "carrie@brain ~>" (the ~> is drawn as one squiggly arrow). It never shows the path.
function setPromptName(name) {
  const label = document.querySelector('label[for="cli-input"]');
  if (label) label.textContent = name + " ~>";
}

// Modes take turns: switching one on first ends any other, so they never mix. Ends every mode except
// `keep` (or all of them), and returns nothing, so a command can read `endModes("holo") || setHolo(true)`.
function endModes(keep) {
  const root = document.documentElement;
  if (keep !== "silly" && root.classList.contains("silly")) setSilly(false);
  if (keep !== "rage" && root.classList.contains("rage")) setRage(false);
  if (keep !== "holo" && root.classList.contains("holo")) setHolo(false);
  if (keep !== "sky" && root.classList.contains("sky")) {
    sky.stop();
    root.classList.remove("sky", "sunset");
  }
}

// Modes are a moment of fun, not a new look for the site: they take turns, end when the page changes, and never
// run over an open experiment (experiments have their own looks, and a mode on top was too much for the graphics
// card). So a mode won't start while an experiment is open, and opening one ends the mode (setupExperiments).
function startMode(name, turnOn) {
  if (document.querySelector(".experiment-window")) return "close the experiment first.";
  endModes(name);
  return turnOn();
}

// Esc (or "normal") ends whichever mode is on.
function backToNormal() {
  const root = document.documentElement;
  if (!["sky", "holo", "rage", "silly"].some((mode) => root.classList.contains(mode))) return "already normal.";
  endModes();
  return "back to normal.";
}

// The hint in the command line when no command has suggested anything.
function defaultHint() {
  if (experimentHint) return experimentHint;
  const root = document.documentElement;
  if (root.classList.contains("sky")) return root.classList.contains("sunset") ? "type daytime" : "type sunset";
  // A page that opens in holo (carries-brain.html) suggests going on to the sketchbook instead.
  if (root.classList.contains("holo") && root.dataset.startMode === "holo") return "type cd sketchbook";
  if (root.classList.contains("holo") || root.classList.contains("rage")) return "press esc";
  if (root.classList.contains("silly")) return "type too silly";
  // The home page (<html data-page="home">) suggests silly mode.
  if (root.dataset.page === "home") return "type silly";
  if (root.dataset.page === "sketchbook") return "type rage";
  if (root.dataset.page === "design" || root.dataset.page === "webgl") return "open a project";
  if (root.dataset.page === "portfolio-grid") return "type cd design";
  return "type help";
}

// Wipe the command line's reply. Any change of page does this: going to another page, coming back to one (the
// browser can restore a page just as it was left, reply and all), and opening or closing an experiment.
function clearOutput() {
  const output = document.getElementById("cli-output");
  if (output) output.textContent = "";
  quoteShowing = false;
}

window.addEventListener("pagehide", clearOutput);
window.addEventListener("pageshow", (event) => { if (event.persisted) clearOutput(); });

// What an open experiment wants the hint to say (see setupExperiments). It stays until the window closes.
let experimentHint = "";

function showHint() {
  const input = document.getElementById("cli-input");
  input.placeholder = defaultHint();
}

// cowsay: a cow says your words in a speech bubble. Lines wrap at 30 characters so the cow fits on a phone.
function cowsay(words) {
  const width = 30;
  const lines = [];
  let line = "";
  // Words longer than a whole line are cut into line-sized pieces.
  const pieces = words.split(" ").flatMap((word) => word.match(new RegExp(`.{1,${width}}`, "g")));
  for (const word of pieces) {
    if (line && line.length + word.length + 1 > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  lines.push(line);

  const longest = Math.max(...lines.map((l) => l.length));
  const bubble = lines.map((l, i) => {
    const [left, right] =
      lines.length === 1 ? ["<", ">"] :
      i === 0 ? ["/", "\\"] :
      i === lines.length - 1 ? ["\\", "/"] : ["|", "|"];
    return `${left} ${l.padEnd(longest)} ${right}`;
  });

  return [
    ` ${"_".repeat(longest + 2)}`,
    ...bubble,
    ` ${"-".repeat(longest + 2)}`,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ].join("\n");
}

// Finds the command a typed line asks for. Two-word commands (like "too silly") are looked up whole first.
function findCommand(line) {
  const [name, ...args] = line.trim().split(/\s+/);
  const command = commands[line.trim().toLowerCase().replace(/\s+/g, " ")] || commands[name.toLowerCase()];
  return command ? () => command(args.join(" ")) : null;
}

// Runs a typed line, shows its reply above the status bar, and shows the suggested next command (or the usual hint).
function runCommand(line) {
  const command = findCommand(line);
  quoteShowing = false;  // any command replaces a showing quote ("quote" sets it again)
  if (awaitingScream) document.getElementById("cli-output").textContent = scream(line.trim());
  else document.getElementById("cli-output").textContent = command ? command() : `command not found: ${line.trim().split(/\s+/)[0]}. try help`;
  const input = document.getElementById("cli-input");
  input.placeholder = nextHint || defaultHint();
  nextHint = "";
}

function setupCli() {
  const form = document.getElementById("cli");
  const input = document.getElementById("cli-input");
  const output = document.getElementById("cli-output");
  if (!form) return;

  const history = [];
  let historyIndex = 0;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const line = input.value.trim();
    input.value = "";
    if (!line) return;

    history.push(line);
    historyIndex = history.length;

    runCommand(line);
  });

  // Up and down arrows walk through earlier commands, like a real shell.
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && historyIndex > 0) {
      historyIndex -= 1;
    } else if (event.key === "ArrowDown" && historyIndex < history.length) {
      historyIndex += 1;
    } else {
      return;
    }
    event.preventDefault();
    input.value = history[historyIndex] || "";
  });

  // A quote goes away with whatever the visitor does next: any key, click, tap or scroll. (Changing page clears
  // it too: each page starts with an empty reply line.) An Esc that clears a quote does nothing else.
  function clearQuote(event) {
    if (!quoteShowing) return;
    quoteShowing = false;
    output.textContent = "";
    input.placeholder = defaultHint();
    if (event.key === "Escape") event.stopImmediatePropagation();
  }
  document.addEventListener("keydown", clearQuote, true);
  document.addEventListener("pointerdown", clearQuote, true);
  document.addEventListener("wheel", clearQuote, { capture: true, passive: true });

  // Esc anywhere ends the modes. It only answers when there's something to clear, so Esc stays quiet the rest
  // of the time.
  document.addEventListener("keydown", (event) => {
    const root = document.documentElement;
    if (event.key !== "Escape" || root.classList.contains("booting")) return;
    if (!["sky", "holo", "rage", "silly"].some((mode) => root.classList.contains(mode))) return;
    output.textContent = backToNormal();
    input.placeholder = defaultHint();
  });

  // Press / anywhere to jump to the command line.
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== input && !document.documentElement.classList.contains("booting")) {
      event.preventDefault();
      input.focus();
    }
  });

  // Stay in the command line across page loads: if it was in use when the page was left (a reload, or a
  // command like cd), the next page puts the typing back there. Not while the boot screen wants the password.
  window.addEventListener("pagehide", () => {
    try { sessionStorage.setItem("cli-focus", document.activeElement === input ? "1" : ""); } catch (e) {}
  });
  try {
    if (sessionStorage.getItem("cli-focus") && !document.documentElement.classList.contains("booting")) {
      input.focus({ preventScroll: true });
    }
  } catch (e) {}
}

/* ---------- 3. Clock and uptime ---------- */

function setupClock() {
  const clock = document.getElementById("clock");
  const uptime = document.getElementById("uptime");
  if (!clock) return;

  const start = Date.now();
  const pad = (n) => String(n).padStart(2, "0");

  const tick = () => {
    const now = new Date();
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const seconds = Math.floor((Date.now() - start) / 1000);
    uptime.textContent = `uptime ${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  };
  tick();
  setInterval(tick, 1000);
}

// The password screen only greets a visit that starts at home (or a reboot). Opening any other page counts as
// being in, so getting home later (the sidebar link, cd ~, cd home...) goes straight past it.
if (!document.getElementById("boot")) {
  try { sessionStorage.setItem("booted", "1"); } catch (e) {}
}

/* ---------- 4. Web experiments (sketchbook) ---------- */

// Clicking an experiment opens it in a window that exactly covers the right-hand viewport. While it's open:
// - the top margin shows the experiment's own location, and on the right the nav tip [ press esc ] (Esc closes it);
// - the command line's hint gives context: data-hint on its link, until the experiment sends its own ({ hint });
// - the file tree gives way to the experiment's info: its file name, a line about it (data-about on its link), its
//   controls. The experiment hides its own controls when it's shown here and sends a description of them
//   (experiments/bridge.js); the sidebar draws them in the site's style and passes clicks and slider moves back.
// The experiments are listed in the file tree too: on the webgl page they open the same way; from other
// pages they go to webgl.html#<name>, which opens that one as the page loads.
// Without JavaScript, the link simply opens the experiment on its own page.
function setupExperiments() {
  const main = document.getElementById("main");
  const statusbar = document.querySelector(".statusbar");
  const links = document.querySelectorAll("a[data-experiment]");
  if (!main || !links.length) return;
  const root = document.documentElement;
  const pathLabel = document.querySelector(".titlebar-path");
  const pagePath = pathLabel ? pathLabel.textContent : "";
  // The title bar's tag on the right, like "[ explore ]": nav tips and info. It says [ press esc ] while an
  // experiment is open. (The command line's hint is for context.)
  const tagLabel = pathLabel && pathLabel.nextElementSibling;
  const pageTag = tagLabel ? tagLabel.textContent : "";
  const tree = document.querySelector(".tree");
  let open = null;

  const treeLink = (id) => document.querySelector(`.tree a[href$="#${id}"]`);

  // Cover the window (which already starts one band below the top band), kept inside the screen and above the
  // status bar.
  function place() {
    if (!open) return;
    const box = main.getBoundingClientRect();
    const top = Math.max(box.top, 0);
    const bottom = Math.min(box.bottom, window.innerHeight, statusbar ? statusbar.getBoundingClientRect().top : Infinity);
    Object.assign(open.window.style, {
      top: `${top}px`,
      left: `${box.left}px`,
      width: `${box.width}px`,
      height: `${Math.max(0, bottom - top)}px`,
    });
  }

  // The sidebar panel: file name, about line, then the controls (filled in when the experiment describes them).
  function makeInfo(link) {
    const info = document.createElement("section");
    info.className = "experiment-info";
    info.setAttribute("aria-label", `${link.dataset.experiment}: info and controls`);
    const name = document.createElement("p");
    name.className = "experiment-name";
    name.textContent = (link.dataset.path || link.dataset.experiment).split("/").pop();
    info.append(name);
    if (link.dataset.about) {
      const about = document.createElement("p");
      about.className = "experiment-about";
      about.textContent = link.dataset.about;
      info.append(about);
    }
    const controls = document.createElement("div");
    controls.className = "experiment-controls";
    info.append(controls);
    return { info, controls };
  }

  // Draw the controls an experiment described: rows of text, sliders, buttons and readouts.
  function drawControls(rows) {
    if (!open || !Array.isArray(rows)) return;
    const box = open.controls;
    box.textContent = "";
    open.parts = {};
    const send = (message) => open.frame.contentWindow.postMessage(message, "*");
    for (const row of rows.slice(0, 20)) {
      if (!Array.isArray(row)) continue;
      // (An empty row draws nothing, which leaves an extra blank line: experiments use it to group controls.)
      const line = document.createElement("div");
      line.className = "control-row";
      // A row with a slider in it stays on one line: liquid ---- goo.
      if (row.some((item) => item && item.kind === "range")) line.classList.add("control-slider");
      for (const item of row.slice(0, 12)) {
        if (!item || typeof item !== "object") continue;
        const id = String(item.id || "");
        let el;
        if (item.kind === "range") {
          el = document.createElement("input");
          el.type = "range";
          el.min = String(item.min);
          el.max = String(item.max);
          el.step = String(item.step);
          el.value = String(item.value);
          if (item.label) el.setAttribute("aria-label", String(item.label));
          el.addEventListener("input", () => send({ set: id, value: el.value }));
        } else if (item.kind === "button") {
          el = document.createElement("button");
          el.type = "button";
          el.className = "control-button";
          el.textContent = String(item.text || "");
          if (typeof item.pressed === "boolean") el.setAttribute("aria-pressed", String(item.pressed));
          if (item.action === "fullscreen") {
            // [ full screen ]: the experiment's frame fills the screen. Esc comes back to the site.
            el.addEventListener("click", () => {
              const frame = open && open.frame;
              const go = frame && (frame.requestFullscreen || frame.webkitRequestFullscreen);
              if (go) go.call(frame);
            });
          } else {
            el.addEventListener("click", () => send({ press: id }));
          }
        } else {
          el = document.createElement("span");
          el.className = item.kind === "output" ? "control-output" : "control-text";
          el.textContent = String(item.text || "");
        }
        if (id) open.parts[id] = el;
        line.append(el);
      }
      box.append(line);
    }
  }

  // An experiment says its controls changed: a slider's value, a button pressed or not, a readout's text.
  function updateControls(state) {
    if (!open || !open.parts || !state || typeof state !== "object") return;
    for (const [id, change] of Object.entries(state)) {
      const el = open.parts[id];
      if (!el || !change) continue;
      if ("value" in change && el.tagName === "INPUT" && document.activeElement !== el) el.value = String(change.value);
      if (typeof change.pressed === "boolean") el.setAttribute("aria-pressed", String(change.pressed));
      if ("text" in change && el.tagName === "SPAN") el.textContent = String(change.text);
    }
  }

  function close() {
    if (!open) return;
    open.window.remove();
    open.info.remove();
    root.classList.remove("experiment-open");
    if (pathLabel) pathLabel.textContent = pagePath;
    if (tagLabel) {
      tagLabel.textContent = pageTag;
      tagLabel.classList.remove("titlebar-instruction");
    }
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    experimentHint = "";
    showHint();
    open.link.focus({ preventScroll: true });
    open = null;
    clearOutput();
    window.removeEventListener("resize", place);
    window.removeEventListener("scroll", place, true);
  }

  for (const link of links) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      close();
      clearOutput();
      // Opening an experiment ends any mode (see startMode).
      const mode = ["sky", "holo", "rage", "silly"].find((m) => root.classList.contains(m));
      if (mode) {
        endModes();
        document.getElementById("cli-output").textContent = `${mode} mode off.`;
        document.getElementById("cli-input").placeholder = defaultHint();
      }
      const win = document.createElement("div");
      win.className = "experiment-window";
      win.setAttribute("role", "dialog");
      win.setAttribute("aria-label", `${link.dataset.experiment} (press esc to close)`);
      win.tabIndex = -1;
      const frame = document.createElement("iframe");
      frame.src = link.href;
      frame.title = link.dataset.experiment;
      frame.allow = "fullscreen";
      const stage = document.createElement("div");
      stage.className = "experiment-stage";
      stage.append(frame);
      win.append(stage);
      document.body.appendChild(win);

      // The sidebar's info and controls take the file tree's place.
      const { info, controls } = makeInfo(link);
      if (tree) tree.after(info);
      root.classList.add("experiment-open");

      open = { window: win, link, frame, info, controls, parts: {} };

      // The top margin: the experiment's location, and its instruction (in gray) if it has one.
      if (pathLabel) pathLabel.textContent = link.dataset.path || link.dataset.experiment;
      if (tagLabel) {
        tagLabel.textContent = "[ press esc ]";
        tagLabel.classList.add("titlebar-instruction");
      }
      // The command line's hint: context for the experiment (data-hint on its link).
      experimentHint = link.dataset.hint || "";
      showHint();
      // Opened from the keyboard, the window takes focus (Esc closes it).
      if (event.detail === 0) win.focus({ preventScroll: true });
      if (link.id) history.replaceState(null, "", `#${link.id}`);
      frame.addEventListener("load", place);
      place();
      window.addEventListener("resize", place);
      window.addEventListener("scroll", place, true);
    });
  }

  // The file tree's experiment entries open the experiment in place on this page.
  for (const link of links) {
    const entry = link.id && treeLink(link.id);
    if (!entry) continue;
    entry.addEventListener("click", (event) => {
      event.preventDefault();
      link.click();
    });
  }

  // Arriving at webgl.html#<name> (from the tree on another page) opens that experiment.
  const start = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (start && start.matches("a[data-experiment]")) start.click();

  // Messages from the open experiment: its controls ({ controls } and { state }), a new about line for the
  // sidebar ({ about }), the command line's hint ({ hint }, the cloud simulator sends these), and Esc ({ escape }). Nothing else is listened to.
  window.addEventListener("message", (event) => {
    if (!open || event.source !== open.frame.contentWindow) return;
    const data = event.data || {};
    // Esc pressed inside the experiment (bridge.js passes it on, since the keyboard belongs to the frame).
    if (data.escape === true) {
      close();
      return;
    }
    if (data.controls) drawControls(data.controls);
    if (data.state) updateControls(data.state);
    // A new about line for the sidebar (the cloud simulator sends each cloud type's description).
    if (typeof data.about === "string") {
      let about = open.info.querySelector(".experiment-about");
      if (!about) {
        about = document.createElement("p");
        about.className = "experiment-about";
        open.info.querySelector(".experiment-name").after(about);
      }
      about.textContent = data.about.slice(0, 600);
    }
    if (typeof data.hint === "string") {
      experimentHint = data.hint.slice(0, 300);
      showHint();
    }
  });

  // Esc closes the window first (before it would end a mode). Once you click into an experiment, the keyboard
  // belongs to it, so bridge.js passes its Esc up as { escape: true } (handled above).
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      close();
    }
  }, true);
}

// Diagram switchers (portfolio-grid.html): each button shows its diagram (aria-controls) and hides the others in
// the same .diagram-switch; the pressed button is green.
function setupDiagramSwitches() {
  document.querySelectorAll(".diagram-switch").forEach((group) => {
    const buttons = group.querySelectorAll("button[aria-controls]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((other) => {
          const on = other === button;
          other.setAttribute("aria-pressed", String(on));
          const diagram = document.getElementById(other.getAttribute("aria-controls"));
          if (diagram) diagram.hidden = !on;
        });
      });
    });
  });
}

// Grid map (portfolio-grid.html, #com-grid-map): a scale drawing of carriemarkusen.com's grid in its golden-ratio
// frame (1618 x 1000 drawing units), plus the rows and columns tables. Hovering a table row lights up its line.
// Copied from Carrie's .com grid map artifact; text is lowercase here.
function setupGridMap() {
  const map = document.getElementById("com-grid-map");
  if (!map) return;
  const svg = map.querySelector("svg");
  const NS = "http://www.w3.org/2000/svg";
  const W = 1618, H = 1000, PAD_L = 44, PAD_T = 46, PAD_R = 20, PAD_B = 20, LINE_NAME = 22;
  const X = (v) => PAD_L + v * W / 100;
  const Y = (v) => PAD_T + v * H / 100;
  const css = (name) => getComputedStyle(map).getPropertyValue(name).trim();

  // [name, position as % of the frame, what the table shows for it, what sits there]
  const rows = [
    ["r1", 3.403, "3.403%", "outer margin ends; top band starts"],
    ["r2", 5.597, "5.597%", "top band ends"],
    ["r3", 23.607, "23.607%", "the name sits on it"],
    ["r4", 38.197, "38.197%", "the table starts"],
    ["r5", 61.803, "61.803%", "nothing placed on it"],
    ["r6", 76.393, "76.393%", "nothing placed on it"],
    ["r7", 94.403, "94.403%", "bottom band starts"],
    ["r8", 96.597, "96.597%", "bottom band ends"],
  ];
  const cols = [
    ["c1", 2.103, "= r1", "outer margin ends; square"],
    ["c2", 3.459, "= r2", "bands, headers and the table start"],
    ["c3", 14.590, "14.590%", "the table's second column starts"],
    ["c4", 38.197, "38.197%", "the table ends"],
    ["c5", 61.803, "61.803%", "the name ends"],
    ["c6", 85.410, "85.410%", "about ends"],
    ["c7", 96.541, "100% - r2", "bands and portfolio end"],
    ["c8", 97.897, "100% - r1", "outer margin starts"],
  ];
  const R = Object.fromEntries(rows.map((r) => [r[0], r[1]]));
  const C = Object.fromEntries(cols.map((c) => [c[0], c[1]]));
  const B = R.r2 - R.r1;

  svg.setAttribute("viewBox", `0 0 ${PAD_L + W + PAD_R} ${PAD_T + H + PAD_B}`);
  const el = (tag, attrs, parent = svg) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  };
  const rect = (x1, y1, x2, y2, fill, opacity = 1) =>
    el("rect", { x: X(x1), y: Y(y1), width: X(x2) - X(x1), height: Y(y2) - Y(y1), fill, opacity });
  const label = (x, y, text, size, attrs = {}) => {
    const t = el("text", { x, y, "font-size": size, fill: css("--map-text"), "font-weight": 100, ...attrs });
    t.textContent = text;
    return t;
  };

  // Screen, outer margin, and the band-wide strips just inside it.
  rect(0, 0, 100, 100, "#000");
  const margin = css("--map-margin"), band = css("--map-band");
  rect(0, 0, C.c1, 100, margin);
  rect(C.c8, 0, 100, 100, margin);
  rect(0, 0, 100, R.r1, margin);
  rect(0, R.r8, 100, 100, margin);
  rect(C.c1, R.r1, C.c2, R.r8, band, 0.45);
  rect(C.c7, R.r1, C.c8, R.r8, band, 0.45);
  rect(C.c2, R.r1, C.c7, R.r2, band);
  rect(C.c2, R.r7, C.c7, R.r8, band);

  // Band text (h1): left header, left footer, about (ends on c6) and portfolio (ends on c7), current page underlined.
  const H1 = 17;
  // Text on the bands uses the brighter gray (--map-band-text) so it reads on the green.
  const onBand = { fill: css("--map-band-text") };
  label(X(C.c2), Y(R.r2) - 3, "[left header]", H1, onBand);
  label(X(C.c2), Y(R.r8) - 3, "[left footer]", H1, onBand);
  label(X(C.c6), Y(R.r2) - 3, "about", H1, { ...onBand, "text-anchor": "end" });
  label(X(C.c7), Y(R.r2) - 3, "portfolio", H1, { ...onBand, "text-anchor": "end" });
  el("line", { x1: X(C.c6) - 5 * H1 * 0.6, x2: X(C.c6), y1: Y(R.r2), y2: Y(R.r2), stroke: css("--map-band-text"), "stroke-width": 1 });

  // The name: baseline on r3, c2 to c5, letter spacing 40 (15 letters + 14 gaps = 9.56em).
  const nameW = X(C.c5) - X(C.c2), nameSize = nameW / 9.56;
  label(X(C.c2), Y(R.r3), "carrie markusen", nameSize, { "font-weight": 400, "letter-spacing": nameSize * 0.04 });

  // Placeholder table from r4: labels c2 to c3, values c3 to c4.
  const BODY = 14, LH = BODY * 1.6;
  let y = Y(R.r4) + BODY * 0.73;
  [["role", ["[role]"]], ["timeline", ["[yyyy-yyyy]"]], ["highlights", ["[highlight]", "", "[highlight]"]]].forEach(([head, lines]) => {
    label(X(C.c2), y, head, BODY, { "font-weight": 400 });
    lines.forEach((t, i) => { if (t) label(X(C.c3), y + i * LH, t, BODY); });
    y += (lines.length + 2) * LH;
  });

  // Grid lines, named on the outside: row names on the left, left-aligned to the drawing's edge; column names
  // along the top (close pairs stagger).
  const lines = el("g", {});
  rows.forEach(([n, v]) => {
    el("line", { x1: PAD_L - 6, x2: X(100), y1: Y(v), y2: Y(v), stroke: "rgba(252,252,252,0.8)", "stroke-width": 1, "data-line": n }, lines);
    const dy = n === "r1" || n === "r7" ? -2 : n === "r2" || n === "r8" ? 10 : 4;
    label(0, Y(v) + dy * LINE_NAME / 13, n, LINE_NAME, { fill: css("--green") });
  });
  cols.forEach(([n, v]) => {
    el("line", { x1: X(v), x2: X(v), y1: PAD_T - 6, y2: Y(100), stroke: "rgba(252,252,252,0.8)", "stroke-width": 1, "data-line": n }, lines);
    const anchor = n === "c1" || n === "c7" ? "end" : n === "c2" || n === "c8" ? "start" : "middle";
    label(X(v) + (anchor === "end" ? -2 : anchor === "start" ? 2 : 0), PAD_T - 12, n, LINE_NAME, { fill: css("--green"), "text-anchor": anchor });
  });

  // The table: one line per row, row and height on the left, column and width on the right. Hovering a pair
  // lights up its line in the drawing, and hovering a line in the drawing lights up its pair in the table.
  const body = map.querySelector('table[data-map="lines"] tbody');
  const light = (n, on) => {
    map.querySelectorAll(`[data-line="${n}"], td[data-for="${n}"]`).forEach((e) => e.classList.toggle("is-on", on));
  };
  rows.forEach((row, i) => {
    const tr = document.createElement("tr");
    [row, cols[i]].forEach(([n, , shown]) => {
      [n, shown].forEach((text) => {
        const td = document.createElement("td");
        td.textContent = text;
        td.dataset.for = n;
        td.addEventListener("mouseenter", () => light(n, true));
        td.addEventListener("mouseleave", () => light(n, false));
        tr.appendChild(td);
      });
    });
    body.appendChild(tr);
  });

  // Lines are hairlines, so each gets a wider invisible strip on top to catch the pointer.
  const hits = el("g", {});
  svg.querySelectorAll("line[data-line]").forEach((line) => {
    const n = line.dataset.line;
    const hit = el("line", {
      x1: line.getAttribute("x1"), x2: line.getAttribute("x2"), y1: line.getAttribute("y1"), y2: line.getAttribute("y2"),
      stroke: "transparent", "stroke-width": 16, "pointer-events": "stroke", class: "grid-map-hit",
    }, hits);
    hit.addEventListener("mouseenter", () => light(n, true));
    hit.addEventListener("mouseleave", () => light(n, false));
  });
}

// Site frames (portfolio-grid.html): a simulated browser window. The page renders at desktop size
// (1600 x 989) and is scaled to fit the frame. Dragging the corner handle (or arrow keys on it) resizes the
// simulated window inside the fixed frame, so the page lays itself out for smaller screens; it scrolls
// inside the window when it doesn't fit.
function setupSiteFrames() {
  const FULL_W = 1600, FULL_H = 989, MIN_W = 320, MIN_H = 400, STEP = 40;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  document.querySelectorAll(".site-frame").forEach((frame) => {
    const iframe = frame.querySelector("iframe");
    const edge = frame.querySelector(".site-window");
    const handle = frame.querySelector(".site-resize");
    let w = FULL_W, h = FULL_H, scale = 1;

    const draw = () => {
      scale = frame.clientWidth / FULL_W;
      frame.style.setProperty("--site-scale", scale);
      iframe.style.width = `${w}px`;
      iframe.style.height = `${h}px`;
      // The green edge sits on the frame's border, so it's one border wider on each side.
      const b = parseFloat(getComputedStyle(frame).borderTopWidth) || 0;
      edge.style.width = `${w * scale + 2 * b}px`;
      edge.style.height = `${h * scale + 2 * b}px`;
      handle.style.left = `${w * scale - handle.offsetWidth}px`;
      handle.style.top = `${h * scale - handle.offsetHeight}px`;
      frame.classList.toggle("is-sized", w < FULL_W || h < FULL_H);
    };
    new ResizeObserver(draw).observe(frame);
    draw();

    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      frame.classList.add("is-resizing");
    });
    handle.addEventListener("pointermove", (event) => {
      if (!handle.hasPointerCapture(event.pointerId)) return;
      const box = frame.getBoundingClientRect();
      w = clamp((event.clientX - box.left) / scale, MIN_W, FULL_W);
      h = clamp((event.clientY - box.top) / scale, MIN_H, FULL_H);
      draw();
    });
    const stop = (event) => {
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      frame.classList.remove("is-resizing");
    };
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);

    // Grid on/off buttons (the .site-grid-buttons after the frame): carriemarkusen.com pages show their grid lines
    // when the address ends in ?grid, so switching reloads the framed page with or without it. (A #grid address
    // would make the browser scroll this page and the frame to it.)
    const gridButtons = frame.parentElement.querySelectorAll(".site-grid-buttons button[data-grid]");
    const base = iframe.src.split("?")[0];
    gridButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.getAttribute("aria-pressed") === "true") return;
        gridButtons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
        iframe.src = base + (button.dataset.grid === "on" ? "?grid" : "");
      });
    });

    handle.addEventListener("keydown", (event) => {
      const moves = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] };
      if (!moves[event.key]) return;
      event.preventDefault();
      w = clamp(w + moves[event.key][0], MIN_W, FULL_W);
      h = clamp(h + moves[event.key][1], MIN_H, FULL_H);
      draw();
    });
  });
}

// No scanlines over frames and images: the CRT layer (body::after) gets a hole cut in its mask for each one,
// clipped to the window they sit in, and the holes follow along as the page scrolls or resizes.
function setupScanlineHoles() {
  const PICTURES = ".site-frame, .grid-map-drawing, .project-diagram, .gallery img, .gallery video, .gallery iframe, .gallery .grid-thumb";
  const root = document.documentElement;
  let queued = false;
  const update = () => {
    queued = false;
    const holes = [];
    document.querySelectorAll(PICTURES).forEach((el) => {
      let r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const clip = el.closest(".window");
      let { left, top, right, bottom } = r;
      if (clip) {
        const c = clip.getBoundingClientRect();
        left = Math.max(left, c.left); top = Math.max(top, c.top);
        right = Math.min(right, c.right); bottom = Math.min(bottom, c.bottom);
      }
      if (right <= left || bottom <= top) return;
      holes.push(`linear-gradient(#000 0 0) ${left}px ${top}px / ${right - left}px ${bottom - top}px no-repeat`);
    });
    if (holes.length) root.style.setProperty("--scan-mask", ["linear-gradient(#000 0 0)", ...holes].join(", "));
    else root.style.removeProperty("--scan-mask");
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  document.addEventListener("scroll", queue, true);
  window.addEventListener("resize", queue);
  window.addEventListener("load", queue);
  document.addEventListener("click", queue, true);
  new ResizeObserver(queue).observe(document.body);
  update();
}

setupCli();
setupClock();
setupExperiments();
setupScanlineHoles();
setupSiteFrames();
setupGridMap();
setupDiagramSwitches();

// A page can open in a mode: <html data-start-mode="holo"> (carries-brain.html starts in holo). Esc or "normal"
// ends it as usual. The hint suggests "cd sketchbook".
if (document.documentElement.dataset.startMode === "holo") {
  setHolo(true);
  const input = document.getElementById("cli-input");
  if (input) input.placeholder = defaultHint();
}
runBoot();
