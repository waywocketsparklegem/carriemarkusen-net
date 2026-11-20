# Portfolio site: project notes

Personal site for Carrie Markusen, live at https://carriemarkusen.net. It's a hand-coded wireframe that Carrie designs on top of, one build at a time.

## Constraints

- Plain HTML, CSS and a few small scripts. No framework, no build step.
- Hosted on GitHub Pages from the `main` branch, root folder. Repo: `waywocketsparklegem/carriemarkusen-net` (public; renamed from `waywocketsparklegem.github.io` on 2026-10-28). Local folder: `~/Documents/Claude/carriemarkusen-net`.
- `CNAME` holds `carriemarkusen.net`. `.nojekyll` is empty and turns off Jekyll.
- Sister site: carriemarkusen.com, in `~/Documents/Claude/carriemarkusen-com`. The top of each site's `styles.css` has a block marked "Shared with ..." (the `:root` tokens and base `*`/`html`/`body` rules) that must stay identical in both. Whenever that block changes in either site, ask Carrie whether to copy the change to the other site. Everything below the block is the site's own.
- Files are edited by hand, so keep the code simple and readable, and keep links relative (`styles.css`, `sketchbook.html`) so pages work when opened locally and on the live site.

## Working with Carrie

- Carrie is a graphic and web designer. She knows basic HTML and CSS but is new to git and the terminal. Explain each command before running it.
- For a new build: plan first, show the plan, and wait for approval before writing files.
- Don't commit until Carrie has seen it working locally. Don't push unless asked.
- Don't give visual design advice (colors, contrast, sizing, type). Make the requested visual change and report what was done. Code and technical issues are fine to raise.
- No emojis anywhere, including commit messages.
- She designs layouts as screenshots over the golden-ratio grid (see Layout) and refers to grid lines by number ("the third column", "the blue margin box"). Match them to the `--c*`/`--r*`/`--band` variables.
- Modes (site states turned on by a command) come in two kinds, which Carrie uses as references when designing new ones: modes like `silly` keep the UI intact; modes like `sky` reduce the UI to the bare minimum. When she asks for a new mode, ask which kind it is if she hasn't said.
- Modes are meant as a moment of fun, not a permanent change to the site's theme. Experiments have their own looks, so modes stay temporary: they take turns, end when the page changes, and never run over an open experiment. Keep new modes to the same rules.
- Carrie says when a new build starts. Until she does, commits (when she asks for them) are part of the current build; never number or start a new build on your own. Earlier builds are the restore points.

## Content and carriemarkusen.com

Until 2026-11-19 this site held the portfolio (`portfolio.html` and five project pages) and the resume, and was the content source for carriemarkusen.com. The grid redesign (below) removed them from .net; .com keeps its own copy and is now the only home for that content. The old pages are in git history (last in commit `b068792`) if they're ever needed.

## Files

```
index.html          home: boot screen (first visit), then the dream (dream.js) filling the window
sketchbook.html     "> cat thoughts.txt" and a big header: "i'm not sure what this will be"
web-experiments.html  "> ls web-experiments/": two looping video thumbnails that open the experiments
styles.css          all styles
script.js           boot screen, command line, clock, experiments (setupExperiments)
dream.js            the WebGL2 dream simulation on the home page (settings at the top)
sky.js              sky mode's clouds (the `sky` command), loaded on every page
rage.js             rage mode's living veins and screams (the `rage` command), loaded on every page
experiments/        cloud-simulator.html, liquid-goo.html (self-contained; liquid-goo embeds its source photo
                    and a derived map as base64, ~950 KB), and bridge.js (moves their controls into the site)
images/sketchbook/  liquid-goo.mp4 and cloud-simulator.mp4 (800x600 H.264 loops) with -poster.jpg first frames
images/placeholder.svg  flat #111111 box; now only used by silly and holo mode styles
favicon.svg         green :) on black
basic-grid/basic-grid.html  Carrie's reference for the golden-ratio grid (also reachable on the live site)
CNAME  .nojekyll  .gitignore
```

The thumbnails' videos were made from Carrie's screen recordings (kept in `~/Documents/claude-repo/web-experiments/`, not in this repo) with the ffmpeg bundled in the Python package `imageio-ffmpeg`, installed in a scratch virtual env (Homebrew ffmpeg isn't installed). They play as `<video autoplay muted loop playsinline>`, like a GIF. Captions call them `.glsl` (the shaders' language) with the date each was made as MMDDYY.

## Layout: the golden-ratio grid

Every page is laid out on fixed grid lines (`basic-grid/basic-grid.html` shows them). Rows come from Carrie's "layout experiment" PDFs; columns from "new net grid.pdf" (2026-11-19), which opened the left side up into a regular 4-column grid. In `styles.css`: rows `--r1`..`--r8` (dvh); columns `--c1`..`--c6` (vw): c1 2.103 and c6 97.897 are one margin A in from the edges, the nav runs c1 to c2 (14.590), and c2 to c6 is four equal columns (c3 35.417, c4 56.244, c5 77.070). Each column's content starts one margin A after its line (the gutter) and runs to the next line. Carrie's two margin sizes: **margin A** (purple in her PDFs; `--margin-a` = c1 across, `--margin-a-y` = r1 down), the outer margin and the column gutters; **margin B** (blue; `--band`, r2 - r1), the band height and the gap between a command and its output. Pages are either 1-column (home: the window holds the dream) or 4-column (sketchbook, web-experiments). Until 2026-11-19 the columns were c1..c8 (old c2 3.459, c4 38.197, c5 61.803, c6 85.410, c7 96.541 are gone; old c3 and c8 are now c2 and c6). Type sizes come from the band: `--margin-type` (0.9 band) and `--body-type` (0.6 band). There are no breakpoints yet (deferred): the desktop grid is used at every size. `.grid-lines` in each page draws the lines but is hidden in CSS; unhide it to check alignment.

Every page: skip link, then `<div class="screen">` (fixed, full viewport) holding:
- `<header class="band band-top">`: `:) <3 *` (`.band-mark`, a link home with no hover state; the `:)` is `.sidebar-label`, which rage and silly turn into `:(`), then `.titlebar` with the page's path (`.titlebar-path`, gray) and a tag on the right (`[ explore ]` by default; the home page has `[ drag to grow ]`). The bands run from c1 to c6; the path starts at the window's left edge (c2 + margin A).
- `<nav class="tree">`: from c1 to c2, from r3 to r6. `~/carries-brain`, then `sketchbook/` > `web-experiments` > `liquid-goo.glsl`, `cloud-simulator.glsl` (nested `ul.tree-sub`, indented 2ch). All names white; only the current page's ` <` pointer is green (`aria-current="page"`). The experiment entries link to `web-experiments.html#<id>`.
- `<main id="main" class="window">`: from c2 + margin A to c6, from one band below the top band (r2 + band) to one band above the bottom band. Sketchbook and web-experiments content starts at the window's left edge (the first column's content), with the command (`<p class="cmd">`, CSS adds `> `) on r3 and its output one band (margin B) below. The sketchbook header spans all four columns; the web-experiments thumbnails fill the columns in order (square, one column wide).
- `<footer class="band band-bottom statusbar">`: the command line (`carrie@brain ~>`, body type size; JetBrains Mono ligatures merge `~>` into one squiggly arrow, which Carrie wants) and uptime and clock on the right, all hanging from the band's top edge.

After `.screen`, outside it: `<div class="response">`, the command line's replies (c1 to c3, r6 to one band above the bottom band). It's outside `.screen` so it can sit above everything (z-index 1000), including an open experiment. Each line of a reply has its own black highlight (an inline span with `box-decoration-break: clone`). Empty space lets clicks through to what's underneath. Replies clear whenever the page changes: leaving a page, coming back with Back/Forward (bfcache), and opening or closing an experiment (`clearOutput` in `script.js`).

**Carrie's rule for the two text spots:** the top band's tag on the right gives nav tips or info (`[ explore ]`, `[ press esc ]`, `[ drag to grow ]`); the command line's hint (carrie@brain) gives context. (Holo and rage mode still say "press esc" in the hint; they predate the rule.)

The band, tree, window and status bar markup is **copied into every page** and must stay identical apart from `aria-current`, the path and the tag.

## Web experiments

Clicking a thumbnail on `web-experiments.html` (or an experiment in the tree) opens it in `.experiment-window`, an iframe that `setupExperiments` in `script.js` sizes to cover the window. While it's open:
- The top band's path shows the experiment's location (the link's `data-path`, e.g. `~/carries-brain/sketchbook/web-experiments/liquid-goo.glsl`), and the tag says `[ press esc ]` in gray.
- The command line's hint gives context: the link's `data-hint` (liquid goo: "swirl it up"), or the experiment's own `{ hint }` (the cloud simulator: "i could lay here with you forever").
- The tree is hidden and `.experiment-info` takes its place: the file name, an italic description (`data-about`, where `&#10;` would be a line break: "lose yourself." / "enjoy this beautiful day :)"), then the experiment's controls. There's no close button: Esc closes it. Interactive controls are green; choices (cloud types, daytime/sunset) are white with the current one green, one per line, no brackets; buttons like `[ scramble ]` keep brackets and are white (hover inverts in white). Sliders span the column's width on one line with no brackets (`liquid ━━ goo`, `color ━━`, `brightness ━━`, `turbulence ━━`, `speed ━━`, `cover ━━ 50%`). The sidebar runs c1 to c2, so margin A separates it from the experiment.
- The page address gets `#<id>`, so reloading or sharing reopens that experiment; arriving at `web-experiments.html#<id>` from another page opens it.

How the controls move (`experiments/bridge.js`): inside a frame, each experiment hides its own controls and calls `bridgeControls(container, rows)`, which posts `{ controls }` describing them (sliders, buttons with `aria-pressed`, `<output>` readouts, plain words). The site draws them and posts back `{ press: id }` or `{ set: id, value }`; the bridge clicks or moves the real control, and posts `{ state }` when a button or readout changes. Opened on their own, the experiments keep their original bottom-right controls. Other messages from the open experiment's frame (only that frame is listened to): `{ escape: true }` closes it (bridge.js sends this when Esc is pressed inside the frame, since a clicked-into frame keeps the keyboard); `{ hint }` sets the command line's hint (the cloud simulator's "i could lay here with you forever", on open and on daytime/sunset), and `{ about }` replaces the sidebar description (the cloud simulator sends each picked cloud type's description: its latin meaning and how it forms; these are too long for the hint's single line).

While an experiment is open no mode starts ("close the experiment first."), and opening one ends any mode that's on ("<mode> mode off."; `startMode` in `script.js`). It began with holo, whose foil plus an experiment's simulation overloaded the graphics card. Without JavaScript the links open the experiments' own pages.

The experiments came from `~/Documents/claude-repo/web-experiments/` (liquid-goo was called oil-spill until 2026-10-01). The site's copies have since changed: the bridge script and its call at the end of each file, liquid-goo's screenshot feature removed and a color slider added under liquid/goo (2026-11-19; it turns every color around the color wheel, `hueTurn` in the display shader), a turbulence slider under brightness (0, the default, is the goo as it was; higher adds random bubbles that swell, push the film aside and fade, more often and bigger the higher it goes; `bubble()` and the `bubbles` shader. A speed slider under turbulence: default in the middle = the original speed, ends 1/10x and 10x (`SPEED_RANGE`); no readout. It only scales the goo's own resting motion (drift, ghost push, the memory pull home, turbulence's bubbles); dragging and `[ scramble ]` always run at normal speed, per Carrie. In the sidebar, empty rows (`[]` in the `bridgeControls` call) add an extra blank line after liquid/goo, brightness and speed, grouping the sliders. Whole-sheet shakes were tried and dropped: Carrie didn't like the plane being jostled), a brightness slider under color (all the way right, the default, is full brightness; all the way left is 10%, `BRIGHT_MIN`, never black; no readout per Carrie, dims the final image; not touched by `[ scramble ]`), and `[ reset ]` replaced by `[ scramble ]` (a random mix stirs the film for 0.5 to 2 s: 2 to 12 blobs that swirl, shove, or puff/pinch, some stretched into streaks, leaning toward one kind per click, plus up to 3 shear waves; the ghost push gets a new path; the liquid/goo and color sliders jump to random places; brightness, turbulence and speed stay). Clicking the goo to drop in a glob, then to press into it, were tried and removed (2026-11-19), and the cloud simulator's own controls (a cover slider, 0 to 100%, clouds grow or melt over 3 seconds; ordered cloud types, then cover, then daytime/sunset, in the sidebar (with an extra blank line before daytime/sunset) and on its own page (2026-11-19); the four basic cloud types, cirrus, cumulus, stratus and nimbus, from the US National Weather Service's descriptions, each a row of numbers in `TYPES`, dissolving over 3 seconds; daytime / sunset). If an experiment is copied over again from claude-repo, redo those changes. liquid-goo starts moving on its own (a slow wandering push, random each visit, not turned off by Reduce motion, at Carrie's request).

## The home page and the dream

The home page's window holds the dream: its `<h1>` is the title bar path (`~/carries-brain/dream.exe`) with a `[ drag to grow ]` tag, and `.home-dream` holds the canvas. The dream waits while the boot screen shows, so it starts growing as the site appears. `dream.js` runs a Gray-Scott reaction-diffusion simulation on the graphics card, seeded with a big `:)` (a random amount of B in each cell, and the rate drift starting at a random time, so each start grows differently); dragging seeds new growth; the feed and kill rates drift slightly across the screen and over time (kept narrow: wider drift turns areas solid or spotty). A window resize restarts it. Needs WebGL2 with float render targets; otherwise the title bar says so. (`dream.html`, a full-screen version opened with `cd dream`, was removed on 2026-11-19 along with the command; some `.dream` styles in `styles.css` are left over from it.)

Home page only: a `<script>` in `<head>` adds `booting` to `<html>` on the first visit of a browser session (sessionStorage key `booted`) unless the password was entered in the last 24 hours (localStorage `unlocked`). That shows `.boot`: it types "welcome to carrie's brain", then shows "> enter password:" with a plain text field (typed characters are shown, not masked). The password is `:)` (the `password` constant in `script.js`); a wrong one prints "access denied. try again." and clears the field. The right one prints "access granted.", a boot log (technical, with a touch of fantasy; no jokes; it still says "indexing ~/sketchbook ...... 1 found"), then reveals the site with a power-on animation. Hidden shortcut (deliberately not mentioned anywhere on the site): any command the command line knows (`rage`, `holo`, `cd sketchbook`, `cowsay hi`...) or a bare place name (`sketchbook`) is also accepted, logs in the same way, and is run through `runCommand` as the site appears. Clicking anywhere on the boot screen just refocuses the field. The password is cosmetic: it's readable in the page source, the other pages can be opened directly, and the repo is public. Carrie knows and chose this over taking the site offline. Later visits to home skip it; the `reboot` command replays it. Opening any other page also sets `booted`.

Carrie's Mac has Reduce motion on. Typing and the cursor blink run for everyone regardless; only the power-on animation is skipped under `prefers-reduced-motion`.

## Command line

`script.js`: help, ls (prints `sketchbook/`), cd/open/cat <place> (a bare `cd` goes home), whoami, pwd, date, clear, reboot, sudo, exit, sky / sunset / daytime, holo, rage, normal, quote, cowsay <words>. Places are in the `places` array: `sketchbook`; `web-experiments` (or `experiments`; a `sketchbook/` prefix is ignored); `~`, `home`, `..`, `/`, `carries-brain`. The hint (the input's placeholder) is always italic; typed text is not. A command can set `nextHint` to suggest what to type next; an open experiment can set it too (see Web experiments). Otherwise the hint is "type help", or "type too silly" in silly mode. `/` focuses the command line; up/down arrows recall history. If the command line had focus when a page was left, the next page focuses it again (sessionStorage key `cli-focus`), except while the boot screen shows.

- `cowsay <words>`: the classic cow in a speech bubble; lines wrap at 30 characters; no words: "moo."; afterwards the hint says "type so cute", and `so cute` replaces the cow with just `:)`.
- `quote`: the first quote in the `quotes` list the first time in a visit, then a random one, never the same twice in a row (sessionStorage key `quote`), shown in the reply area exactly as Carrie wrote it (her capitals are intentional, an exception to the site's lowercase rule). Each entry has `text` and an optional `by`, shown as the hint while the quote is up. Anything the visitor does next clears it. Carrie supplies the quotes.
- `silly` (UI intact): class `silly` on `<html>`. Wingdings everywhere except the command line and its reply, a rainbow gradient background sliding right to left, text and lines in one color cycling every 8 seconds, placeholder images cycling through the rainbow, the dream see-through with rainbow folds (`dream.js` checks the class every frame), no glow, scanlines or vignette. `too silly` turns it off.
- `sky` (bare minimum): class `sky` on `<html>`. `sky.js` puts one fixed canvas behind everything that paints the sky and clouds across the whole screen. The window's content is hidden (the dream is paused), lines are removed except the status bar's, no scanlines or vignette, `--green` and `--glow` become red-orange (`#ff4500`), and the tree and title bars are `visibility: hidden` (keeping their space). The hint is "type sunset"; `sunset` fades to sunset colors over 4 seconds and the hint becomes "type daytime"; `daytime` fades back. The clouds come from Carrie's cloud simulator; she tuned the motion and colors by eye, so change them only when asked.
- `holo` (UI intact): class `holo` on `<html>`. The site becomes holographic foil that catches the light as it tilts (mouse position; on phones the tilt sensor, asked for on iPhone when the command is typed, or a dragging finger). `script.js` eases the tilt and sets `--tx`/`--ty` and `--mx`/`--my` on `<html>`; `holoTilt` is read by `dream.js`. The foil is five fixed `.holo-layer` divs (rainbow gradient, fine diffraction lines and a soft glow behind the page, two glitter layers in front), moved only with `transform` for speed; the CSS variables are throttled (`holoInkEvery` 50 ms, `holoLinesEvery` 200 ms) because changing one restyles the whole page. Text is ink painted through the letters, mostly near-black (`--holo-dark`) with color bands that sweep through as it tilts (each text-only element paints its own: painting once from `body` misplaces text in Chrome). Placeholder images become foil cards; the dream's folds become an iridescent film. The hint is "press esc". (A WebGL foil was tried and dropped; Carrie prefers the CSS gradient.)
- `rage` (terminal kind, UI intact, modeled on a deathcore shirt Carrie shared): `--green` and `--glow` become blood red (`--rage-red: #d7262e`), `body::before` lays an acid-wash texture under the scanlines, and `rage.js` adds a WebGL canvas of pale living veins that drift, branch and fire. Every 4 to 12 seconds it screams for 0.38 s (class `scream`: smeared blocks, red/blue split, and a 0.04 s full-screen invert, class `flashing`), regardless of Reduce motion. The `:)` becomes `:(`. The dream is reseeded with "you make / me feel / so dumb" and switches to spiky rules (feed 0.030, kill 0.0565) drawn as hard-edged dark red metal (`rageStepsPerFrame`). Turning it on shows no reply; the prompt becomes "scream something ~>", and the next line typed replaces the words in the dream (`dream-replant` event, cut to 60 characters, `wrapWords` in `dream.js`), then the prompt returns and the reply says "you have the power to escape your rage." In rage mode the mouse slashes the dream without clicking; the title bar tag says "[ move to slash ]". The hint is "press esc".
- Modes take turns: turning one on ends any other (`endModes`). **Esc** ends any mode and replies "back to normal."; `normal` does the same. None of them are saved, so changing page ends them.

## CSS

Settings live at the top of `styles.css`:
- **Colors (black, white and green, plus gray for data text):** `--black: #000000`, `--white: #fcfcfc`, `--green: #03f900`. Green rules use `--rule: 0.5px`. `--placeholder: #111111` (one tint lighter than black). `--gray: #a8a8a8` for data text: the title bar path and an experiment's instruction tag. No other colors, per Carrie. The green text glow and black scanline overlay are effects, not new colors. The experiment sidebar uses a fixed `--action: #03f900` for its green so modes can't recolor it.
- **Font:** JetBrains Mono, Thin (100) everywhere, italics for hints and the experiment description. The Google Fonts `<link>` is in every page's `<head>`.
- **Links:** no underline. Hover and keyboard focus invert them (green background, black text), except `:) <3 *`, which doesn't change.
- **CRT effect:** `body::after` draws scanlines and a vignette over everything, with `pointer-events: none`.
- **All visible text is lowercase,** written that way in the HTML.
- Some older rules are no longer used by any page (`.listing`, `.facts`, `.pager`, `.sidebar`, `--sidebar-width`, the `.dream` page styles, the 50em note in the header comment). They're harmless; remove them in a cleanup pass if Carrie asks.

## Build history

- **Build 1:** Carrie's 2017 portfolio rebuilt as clean code, using placeholders.
- **Build 2:** a neutral wireframe with separate HTML pages, one breakpoint, and a hover-to-reveal menu.
- **Build 3:** the sidebar became name / projects / `:)`. The contact page was renamed `resume.html`. All text went lowercase, letter spacing to 0, link hover to italic. Black sidebar, off-black pages, green accent.
- **Build 4:** "carrie's brain". The site became a terminal: boot screen with a password prompt (`:)`), file-tree sidebar, command windows, status bar with a working command line and clock, CRT scanlines, favicon. Pushed live as one commit (`c7a7838`).
- **Build 5:** a white-themed portfolio with five project pages, `sketchbook/`, the web experiments, the dream on the home page, and the modes (silly, sky, holo, rage).
- **Grid redesign (2026-11-19, not yet numbered or committed):** built in a separate `portfolio-new` folder and copied in here. The golden-ratio grid layout; the portfolio, project pages, resume and `dream.html` removed; `web-experiments.html` split out of the sketchbook; experiments open with their info and controls in the sidebar (`bridge.js`). Carrie hasn't said whether this is Build 6.

## Where things stand (2026-11-19)

- Build 5 is live. The grid redesign is in the working folder, uncommitted, waiting for Carrie to check it in a browser and ask for a commit and push.
- GitHub's Pages "DNS check" showed "in progress" after launch. DNS at Porkbun was verified correct (four GitHub A records, `www` CNAME to `waywocketsparklegem.github.io`) and the site loads. If the check is still stuck, remove and re-add the custom domain in Settings > Pages, then confirm `CNAME` is still in the repo.
- Carrie was offered real privacy (verify the domain, make the repo private, take Pages offline) and chose the cosmetic password instead. Don't re-suggest unless she asks.

## Open items (deferred by Carrie)

1. **Phones and small screens:** no breakpoints; the desktop grid is used everywhere.
2. **`cloud-simulator.glsl` wraps in the tree** at 1440px wide (the column is too narrow for it at two indents). Carrie chose to leave it.
3. **Enforce HTTPS:** `http://` doesn't forward to `https://`. Tick "Enforce HTTPS" in the repo's Settings > Pages (may stay greyed out until the DNS check passes).
4. **No custom `404.html`.** If one is added, its links must start with `/`, because GitHub serves it at whatever address was mistyped.
5. **No `<meta name="description">` or social preview image on pages.**
6. **iPhone zoom on the command line:** its text is under 16px, so iOS Safari zooms in when it's tapped. Fixing it means a 16px field on phones, a visual change for Carrie to decide.

## Checking changes

- `node --check` the scripts after editing (node is installed at `/opt/homebrew/bin/node`).
- Confirm relative links point to existing files, and that the band, tree and status bar blocks match across pages once `aria-current`, path and tag are ignored.
- Screenshots: Google Chrome isn't installed now; headless Firefox works: `/Applications/Firefox.app/Contents/MacOS/firefox --headless --no-remote --profile <empty scratch folder> --window-size=1440,900 --screenshot <out.png> file://<page>`. It can't click, so experiments and the command line need Carrie to try them in a browser. To get past the boot screen, screenshot a page other than home, or a temporary copy of `index.html` without the `booting` script.
- Check with Carrie's display in mind: a Retina 5K screen with Reduce motion turned on.

Git pushes use HTTPS with a token saved in the macOS Keychain. Commits in this repo use the GitHub noreply email address, set in this repository's git config.
