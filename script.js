/*
  Carrie's brain: the moving parts.
  1. Boot screen (home page only): types the welcome line, asks for the password, prints a boot log, then shows the site.
  2. Command line in the status bar: type help, ls, cd portfolio, open resume, and so on.
  3. Clock and uptime in the status bar.
  4. Web experiments (sketchbook page): open one in a window over the right-hand viewport.
*/

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- 1. Boot screen ---------- */

// The password typed at the boot screen. This is for show: anyone can read it here in the page source.
// A hidden shortcut: typing any command instead (like "rage" or "cd portfolio"), or just a place's name
// (like "portfolio"), also gets in, and runs it as the site appears. Nothing on screen mentions this.
const password = ":)";

// Lines printed after Enter. Edit freely.
const bootLog = [
  "[ ok ] power-on self test passed",
  "[ ok ] loading cortex kernel v4.0.26",
  "[ ok ] mounting /dev/imagination",
  "[ ok ] synapse bus online ......... 86,000,000,000 nodes",
  "[ ok ] loading palette ............ 16,777,216 colors",
  "[ ok ] indexing ~/sketchbook ...... 1 found",
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

  // Hide the boot screen and switch the desktop on.
  try { sessionStorage.setItem("booted", "1"); } catch (e) {}
  const screen = document.getElementById("screen");
  root.classList.remove("booting");
  if (entered) runCommand(entered);
  screen.classList.add("powering-on");
  screen.addEventListener("animationend", () => screen.classList.remove("powering-on"), { once: true });
  document.getElementById("main").focus({ preventScroll: true });
}

/* ---------- 2. Command line ---------- */

// Places you can go. The first name is the one shown by `ls`.
const places = [
  { names: ["project-1", "project1", "p1", "1"], url: "project-1.html" },
  { names: ["resume.txt", "resume", "cv", "about"], url: "resume.html" },
  { names: ["sketchbook"], url: "sketchbook.html" },
  { names: ["portfolio", "work"], url: "portfolio.html" },
  { names: ["consent"], url: "consent.html" },
  { names: ["medica"], url: "medica.html" },
  { names: ["thrivent"], url: "thrivent.html" },
  { names: ["ahip"], url: "ahip.html" },
  { names: ["two-mules"], url: "two-mules.html" },
  { names: ["~", "home", "..", "/", "carries-brain"], url: "index.html" },
  { names: ["dream.exe", "dream"], url: "dream.html" },
];

function findPlace(name) {
  const clean = (name || "").toLowerCase().replace(/\/$/, "").replace(/^(sketchbook|portfolio)\//, "");
  return places.find((place) => place.names.includes(clean));
}

function goTo(name) {
  const place = findPlace(name);
  if (!place) return `no such file or directory: ${name || "(nothing)"}`;
  window.location.href = place.url;
  return `opening ${place.names[0]} ...`;
}

const commands = {
  help: () =>
    "commands: ls, cd <place>, open <place>, whoami, pwd, date, clear, reboot, silly, holo, rage, cowsay <words>, sky, quote\n" +
    "places:   portfolio, consent, medica, thrivent, ahip, two-mules, sketchbook, project-1,\n" +
    "          resume, home",
  ls: () => "portfolio/  sketchbook/  resume.txt",
  cd: (name) => goTo(name || "~"),
  open: goTo,
  cat: goTo,
  whoami: () => "carrie markusen. physical + digital designer.",
  pwd: () => document.querySelector(".titlebar-path").textContent,
  date: () => new Date().toString().toLowerCase(),
  clear: () => "",
  reboot: () => {
    try { sessionStorage.removeItem("booted"); } catch (e) {}
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

// The command line's prompt: "carrie@brain ~>" (the ~> is drawn as one squiggly arrow).
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
  if (root.classList.contains("holo") || root.classList.contains("rage")) return "press esc";
  return root.classList.contains("silly") ? "type too silly" : "type help";
}

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

// Clicking an experiment opens it in a window that exactly covers the right-hand viewport: a title bar showing the
// shader's path, and the experiment under it, with an x in a box in its top right corner to close it (Esc closes
// it too), styled like the experiments' own controls.
// Without JavaScript, the link simply opens the experiment on its own page.
function setupExperiments() {
  const main = document.getElementById("main");
  const statusbar = document.querySelector(".statusbar");
  const links = document.querySelectorAll("a[data-experiment]");
  if (!main || !links.length) return;
  let open = null;

  // Cover the visible part of the right-hand viewport: inside the screen, and above the status bar (on phones
  // it sticks over the window).
  function place() {
    if (!open) return;
    const box = main.getBoundingClientRect();
    const top = Math.max(box.top, 0);
    const bottom = Math.min(box.bottom, window.innerHeight, statusbar ? statusbar.getBoundingClientRect().top : Infinity);
    if (open.theme) {
      // A themed experiment fills the whole screen, behind the site's see-through panels (styles.css). Its title
      // bar and close box stay over the right-hand viewport, and it's told where the panels are, so it can keep
      // its own controls clear of them.
      Object.assign(open.window.style, { top: "0", left: "0", width: "100%", height: "100%" });
      Object.assign(open.bar.style, { position: "absolute", top: `${top}px`, left: `${box.left}px`, width: `${box.width}px` });
      const barBottom = top + open.bar.offsetHeight;
      open.button.style.top = `${barBottom + 20}px`;
      open.frame.contentWindow.postMessage({
        inset: { top: barBottom, right: 0, bottom: window.innerHeight - bottom, left: box.left },
      }, "*");
      return;
    }
    Object.assign(open.window.style, {
      top: `${top}px`,
      left: `${box.left}px`,
      width: `${box.width}px`,
      height: `${Math.max(0, bottom - top)}px`,
    });
  }

  function close() {
    if (!open) return;
    open.window.remove();
    if (open.theme) document.documentElement.classList.remove(open.theme);
    if (experimentHint) {
      experimentHint = "";
      showHint();
    }
    open.link.focus({ preventScroll: true });
    open = null;
    window.removeEventListener("resize", place);
    window.removeEventListener("scroll", place, true);
  }

  for (const link of links) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      close();
      // Opening an experiment ends any mode (see startMode).
      const root = document.documentElement;
      const mode = ["sky", "holo", "rage", "silly"].find((m) => root.classList.contains(m));
      if (mode) {
        endModes();
        document.getElementById("cli-output").textContent = `${mode} mode off.`;
        document.getElementById("cli-input").placeholder = defaultHint();
      }
      const win = document.createElement("div");
      win.className = "experiment-window";
      win.setAttribute("role", "dialog");
      win.setAttribute("aria-label", link.dataset.experiment);
      const bar = document.createElement("div");
      bar.className = "titlebar experiment-titlebar";
      const path = document.createElement("span");
      path.className = "experiment-path";
      path.textContent = link.dataset.path || link.dataset.experiment;
      const frame = document.createElement("iframe");
      frame.src = link.href;
      frame.title = link.dataset.experiment;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "experiment-close";
      button.setAttribute("aria-label", `close ${link.dataset.experiment}`);
      button.textContent = "x";
      button.addEventListener("click", close);
      const stage = document.createElement("div");
      stage.className = "experiment-stage";
      stage.append(frame, button);
      bar.append(path);
      win.append(bar, stage);
      document.body.appendChild(win);
      // An experiment can bring a theme for the site while it's open (data-theme on its link: a class on <html>).
      const theme = link.dataset.theme || "";
      if (theme) root.classList.add(theme);
      open = { window: win, link, frame, bar, button, theme };
      frame.addEventListener("load", place);
      place();
      window.addEventListener("resize", place);
      window.addEventListener("scroll", place, true);
      button.focus({ preventScroll: true });
    });
  }

  // An experiment can set the command line's hint, by sending { hint: "..." } from its page (the cloud simulator
  // does). Only the open experiment is listened to.
  window.addEventListener("message", (event) => {
    if (!open || event.source !== open.frame.contentWindow) return;
    const hint = event.data && event.data.hint;
    if (typeof hint !== "string") return;
    experimentHint = hint.slice(0, 300);
    showHint();
  });

  // Esc closes the window first (before it would end a mode). Once you click into an experiment, the keyboard
  // belongs to it, so use the x.
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      close();
    }
  }, true);
}

setupCli();
setupClock();
setupExperiments();
runBoot();
