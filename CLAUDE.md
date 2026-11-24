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
index.html          home: boot screen (first visit), then "> cat thoughts.txt" and a big header: "exploration in progress",
                    then two notes on r5: "! important" (`.cmd-important` swaps the "> " for "! ", a nod to CSS) across the
                    first two columns, a paragraph on using the command line and a table (command / action: ls, cd
                    <place>, cd .., open <file>) with a darker gray hairline rule (`--rule-gray: #545454`,
                    local to `.tips-table`, not in the shared block) under its heading row, the whole table gray, the
                    paragraph white (`.sketch-tips`); and "? tip" (`.cmd-tip`) in the third column: "the brain will make
                    suggestions." (`.sketch-tip`). Body type. Carrie, 2026-11-23.
carries-brain.html  ~/carries-brain: the dream (dream.js) filling the window, no boot screen; opens in holo mode
sketchbook.html     "> cat thoughts.txt" and a big header: "plagued by concepts"
design.html         "> ls design/": same layout as webgl; one thumbnail, [ portfolio-grid ] (dates 112326): an animated
                    `.grid-thumb` (2026-11-23), the original golden-ratio grid (r1-r8, c1-c8) in gray 1px lines on black,
                    a golden rectangle centered in the square (84% wide), holding 2 s, growing to fill the square in 1 s,
                    holding 2 s, shrinking back in 1 s, looping (CSS `@keyframes grid-thumb`; still under Reduce motion);
                    a plain link to portfolio-grid.html (not an experiment, so no data-experiment); added 2026-11-23
portfolio-grid.html a design project (2026-11-23): path ~/carries-brain/sketchbook/design/portfolio-grid/, in the tree
                    under design. Sections stacked in one column across the first two columns from r3
                    (`.sketch-project`), three bands apart, each a command with its output one band below; the
                    window scrolls (no visible scrollbar) when they run long. Commands don't have to be cat: mix
                    them to fit the content. "> cat context.txt": intro paragraph (body type, white).
                    "> ./baseline-areas": a paragraph (two columns wide): the baseline areas come from subdividing a golden
                    rectangle, then three diagrams (`#baseline-1`..`3`, placeholders for now:
                    `.project-diagram`, golden-ratio shape) in a `.diagram-switch`, with buttons one band below,
                    [ baseline 1 ] [ baseline 2 ] [ baseline 3 ] (2ch apart; pressed one green, others gray).
                    Each button's aria-controls names its diagram; `setupDiagramSwitches` in script.js shows it
                    and hides the others. A second golden rectangle (`.project-diagram-side`, placeholder,
                    doesn't switch) sits in the third column, top-aligned with the diagram. The diagrams themselves
                    are still to be built.
                    "> open .com-grid-map": the .com grid map artifact on the page. A paragraph (two columns),
                    then the drawing across the first two columns (an SVG drawn by `setupGridMap` in script.js:
                    the outer margin and bands in dark tints of the site green (`#013200`, `#025e00`; they were the PDFs' purple and blue, then grays), its text a darker gray (`--map-text`, #6e6e6e) except on the bands, where it's the normal gray (`--map-band-text`), bands, the name, the placeholder table, lines r1-r8 and c1-c8
                    named in green, row names on the left; its text lowercase), with the legend (gray, in a row) under
                    it, across the first two columns; in the third column, top-aligned with the drawing's frame, one
                    table (row, height, column, width: r1-r8 beside c1-c8). Line names in the drawing are larger
                    (22 units, `LINE_NAME`), row names left-aligned to the drawing's left edge. The table is gray with a hairline under the heading; hovering a name/value pair lights its line green in the drawing, and hovering a line in the drawing (a 16-unit invisible strip over each hairline, `.grid-map-hit`) lights its pair in the table. The map's
                    numbers are typed into setupGridMap: update them if the .com grid changes.
                    "> curl carriemarkusen.com/about": the working site. A paragraph (two columns) on Claude
                    Code turning the model into a responsive html/css site outside web-builder frameworks, then
                    the live https://carriemarkusen.com/about.html in a frame (`.site-frame`) across all three
                    columns, golden-ratio shape, white hairline. The frame stays fixed; inside it is a simulated
                    browser window. The iframe starts at desktop size (1600 x 989) scaled to fit (`--site-scale`,
                    set by `setupSiteFrames` in script.js). A small green corner handle (`.site-resize`) at the
                    window's bottom right drags it smaller (down to 320 x 400, in desktop pixels; arrow keys on the
                    handle move 40px), and the page inside lays itself out for that size, so it shows .com's
                    tablet layout under 1000px. The window's edge is a green hairline (`.site-window`), always
                    shown and drawn over the frame's white one. The framed page is shown all in gray (`filter: grayscale(1) brightness(3) brightness(0.431)` on the iframe: every color is pushed to white, then dimmed to a dark gray, #4d4d4d, so all text is one gray). The page scrolls inside the window when it doesn't fit (until later on 2026-11-23 scrolling was off). Under the frame, [ grid on ] [ grid off ]
                    (`.site-grid-buttons`, same style as the baseline buttons; on by default): they reload the
                    frame at about.html?grid or about.html, and .com pages show their own grid lines with ?grid
                    (a one-line script in .com's about/portfolio/project heads; see .com's CLAUDE.md). Needs the
                    internet; shows whatever is pushed to .com. More to follow: the golden-ratio
                    model, the grid maps, the responsive math. No big header (removed).
webgl.html          "> ls webgl/" (the folder was web-experiments until 2026-11-23; web-experiments.html is now a
                    redirect to webgl.html that keeps the #experiment): thumbnails that open the experiments (two looping videos, and slime brain running live)
styles.css          all styles
script.js           boot screen, command line, clock, experiments (setupExperiments)
dream.js            the WebGL2 dream simulation on the home page (settings at the top)
sky.js              sky mode's clouds (the `sky` command), loaded on every page
rage.js             rage mode's living veins and screams (the `rage` command), loaded on every page
experiments/        cloud-sim.html (the cloud simulator; renamed cloud-sim 2026-11-23), liquid-goo.html, slime-brain.html (slime brain loads the site's ../dream.js; the others are self-contained; liquid-goo embeds its source photo
                    and a derived map as base64, ~950 KB), and bridge.js (moves their controls into the site)
                    goo-dubstep.html (was liquid-goo-dubstep.html; 2026-11-24, standalone for now: not in the gallery or command line (in the tree under experiments/, opens in a new tab), no
                    bridge.js): liquid-goo reacting to music (dubstep). Audio from a dropped/opened file, another chrome tab's
                    sound (getDisplayMedia, "also share tab audio"), or a line in. Song energy sets iridescence by section
                    (calm low, build flashes on kicks/snares/screeches, drop full, gap before a drop dims and freezes the goo);
                    hits squeeze the film where they land so the color shows. Motion
                    escalates too: a "drive" scales every music force (calm motion when calm, climbing to full over the build
                    ramp, full in the drop), and a drop needs at least "min build" seconds of build first. Each hit also adds an eddy (swirl) and small bubbles well
                    up with the energy (bubbling), so the film folds and mixes instead of only being shoved. No scramble. Floating, draggable, foldable tool
                    panels (engineering-software style; places and slider values kept in localStorage) that hide when the mouse
                    is still (2.5 s while music plays, 10 s without), plus a status bar.
                    Keys: f full screen, esc leaves it, x hides/shows the panels (hidden by x they stay hidden until x again).
                    Hovering a setting's name shows a small window by the pointer describing it (each SETTINGS entry's `about`).
                    `[ pointer on ]` / `[ pointer off ]` in the goo panel turns the pointer's push on the goo on or off (off by default; remembered).
                    07 subwoofer panel (2026-11-24): a speaker under the middle of the goo. Kicks send rings outward (they
                    push and squeeze the film and ripple its thickness in the display), the sub-bass pumps ripples outward
                    continuously, and kicks thump the view toward you (a small zoom). Kick detection uses a lower threshold
                    (3.5 dB) so kicks register over a constant sub.
                    `[ reset goo ]` (goo panel, next to the pointer button) puts the film back to the photo and stops all motion.
                    Rings push out ahead and pull back in behind (net zero), and a home pull slider (default 120 s; liquid-goo
                    itself uses an hour) eases the film back to its place, so the color doesn't get pushed out of frame.
                    The rings and pump don't draw circles: they bend the goo's own image outward and back as they pass, add
                    only a little thickness (color), and the film's own thickness bends them out of round (ragged slider).
                    liquid/goo goes thicker than liquid-goo's: its whole range is the first 60% of the slider (default 0.3,
                    like liquid-goo's middle); past that, more damping and much more viscosity (THICK_FROM in the code).
                    Ring speed follows the song's loudness moment to moment (0.35x to 1.8x of ring speed; speed follow slider).
                    08 feel panel (2026-11-24, "high EQ": responding to the music's feeling, not just loudness): finds the
                    tempo (120-167 bpm) and bar/phrase (8 bars, anchored at each drop) from kicks and snares; breathes once a
                    bar, bubbles on eighth notes, accents hits on beats 1 and 3 (groove); tension through a build (length,
                    phrase position, snare rolls, risers) makes the goo inhale (an inward spiral, color draining, view drawing
                    back), held in the gap, released by the drop as a bloom of iridescence spreading from the middle with one
                    big ring and thump (anticipation); a long drop slowly wears the response down, refreshed by new sections or
                    a clear change in the sound (adapt); melodic stretches (sustained mids, few drums, little sub, tonal) slow
                    and soften it (tenderness); spectral brightness tints/shines/deepens (mood color); harshness (spectral
                    flatness) makes it ragged and streaky, smoothness rounder (mood texture); stereo pan and sound type place
                    hits (staging); each drop makes color linger and calm shimmer more (song memory); when the music stops it
                    settles home over the ending time (status shows "settling"). A gap now needs near silence straight out of
                    a build. Default panel layout (Carrie's screenshot, 2026-11-24): two columns, left source/sections/
                    subwoofer/feel, right signal/forces/goo/iridescence, stacked without overlapping; on short windows the
                    gaps shrink and then all panel sizes scale down (to 70% at most) so they fit. The source panel's gray
                    how-to text was removed. Saved panel places use the key ...-panels-v2 (older saved places are ignored).
                    Nothing is centered any more (Carrie: it made a puddle in the middle): each kick ring starts at its own
                    place (across by stereo, anywhere up and down), the sub pump's source and the heave wander over most of
                    the frame, a build's inhale gathers toward a new random focus point (fading with distance) and its drop
                    blooms from there, staging spreads hits wider, and the rings bend the image along each wave's own slope.
                    Layering (feel panel, default 1; Carrie found it too busy, worst in calm and build parts, and the plain
                    liquid-goo nicer): a level (0 calm/tender, rising through a build with its length and tension, 1 in the
                    drop, sinking back over seconds after) gates each layer: calm is only the once-a-bar breath and a faint
                    sub heave (no rings, pump, bubbles, mood color, tender glow or memory shimmer) and the film drifts home
                    faster (home pull at most 45 s); a build adds sub, then kicks/rings/pump, then snares and screeches, then
                    wobble and bubbles, then mood color. The feel panel's "layers" readout shows which are on. Layering 0
                    is the earlier behavior.
                    Smooth, not glitchy (Carrie, 2026-11-24): the rings' and bloom's out-of-roundness now comes from smooth
                    slow waves (wobble() in the display shader) instead of the goo's own per-pixel detail, which turned to
                    shimmering noise once the goo was churned; rings carry more color again (RING_THICK 0.14); the
                    hits' eddies and the bubbles' swirls (what shreds the film into strands) are mostly saved for the drop
                    (G.chaos: 20% before it), bubbles only come in near and during the drop, and in calm parts the film
                    drifts home within 30 s.
                    The deep sub-bass comes from the center again, subtly (Carrie missed the center subwoofer): the sub pump's
                    ripples and the soft ring for a new bass note start at the center (SUB_PUMP 0.3, SUB_RING 0.35); kick
                    rings still start all over the frame.
                    SIMPLIFIED (2026-11-24, Carrie: "getting ridiculous with how many modifiers there are"): six panels, 22
                    sliders (was eight panels, about 50). Panel order (Carrie, later 2026-11-24): left 01 source, 02 signal, 03 song;
                    right 06 goo, 05 motion, 04 color. 03 song (build at, drop at, contrast [the old
                    layering], anticipation, groove, mood), 04 color (calm, build flash, drop, squeeze, color, color speed,
                    gloss). 02 signal (scope; readouts section [shows "inhaling"], tempo with bar of the phrase, layers;
                    sensitivity), 05 motion (bass, hits, ring speed, swirl, bubbling), 06 goo (liquid, speed, recover; the
                    pointer/reset/copy/defaults buttons). Merged: mood = mood color + mood texture + tenderness; squeeze = hit,
                    drop and ring squeeze; bass = sub heave + sub pump + wobble; hits = kick + snare + screech + kick rings +
                    thump; recover = home pull + settle. Fixed (in derive(), which sets every old S.* name from the sliders):
                    response 1.8 s, min build 4 s, drop hold 3 s, gap freeze 0.8, flash fade 0.6 s, calm motion 0.3, build ramp
                    6 s, adapt 0.6, song memory 0.7, ending 60 s, staging 0.8, hit size 1, ragged 1.5, speed follow 1. Color
                    speed (new): keeps turning the hue, 0 off, 1 = one turn per 5 s, readout in seconds per turn. The panel
                    names above this paragraph (sections, iridescence, forces, subwoofer, feel) are the old layout. Saved
                    panel places use ...-panels-v4.
                    Springs and drains (2026-11-24, exploring; `[ drains on ]` / `[ drains off ]` in the goo panel, on by
                    default, remembered; off is exactly the goo without them): two springs well up liquid (the pressure solve
                    is given a target divergence there) and fill their cores with fresh goo from a wandering reservoir
                    elsewhere in the photo (the inject pass); two drains take the same amount and swirl like a bathtub. They
                    drift slightly around fixed spots (SD_HOME), flow gently on their own and harder with level and sub-bass
                    the film may squeeze around them so color rings form. They have their own panel, 07 springs & drains
                    (bottom of the right column; the toggle moved there): springs 1-4, drains 1-4 (the drains together always
                    take what the springs give, so fewer drains pull harder each), flow (each spring's rate, default 0.10), wander (0 fixed at
                    their spots, 1 roaming slowly over most of the frame). Up to 8 slots in the shaders (springs 0-3, drains
                    4-7). Saved panel places now use ...-panels-v5.
                    Drains made less visible (Carrie: colors converged there): no squeeze at drains (only springs), drains
                    2.2x wider, gentler swirl (DRAIN_SPIN 2), and goo reaching a drain's core fades back into the photo as it
                    was there (DRAIN_FADE, in the inject pass). Bigger calm-to-drop difference: calm default 0, drop default
                    4 (max 6), drop squeeze 0.9x squeeze (was 0.6x). SETTINGS_VERSION 5 resets saved calm, drop and flow once.
                    Carrie's setup became the defaults (2026-11-24, from her screenshot): sensitivity 0.85, drop sensitivity
                    2.1, build at 0.21, drop at 0.73, color speed 0.15 (222s), gloss 0.22, wander 0.39, speed 0 (0.10x).
                    SETTINGS_VERSION 6 resets those saved values once.
                    Liquid/goo default 0.5 (was 0.3; 2026-11-24); SETTINGS_VERSION 7 resets saved liquid once.
                    Drop sensitivity (02 signal, default 2.1x): hit sensitivity rises with the level from the sensitivity slider
                    in calm to sensitivity x drop sensitivity in the drop (hitSens(); "sensitivity now" readout). It only
                    changes the hit thresholds, not the loudness used to read sections, so it can't hold a drop open. The logic was checked by running the page's script in node against a synthetic song
                    (fake DOM, WebGL and audio); the visuals still need Carrie's eyes.
images/sketchbook/  liquid-goo.mp4 and cloud-sim.mp4 (800x600 H.264 loops) with -poster.jpg first frames
images/placeholder.svg  flat #111111 box; now only used by silly and holo mode styles
favicon.svg         green :) on black
basic-grid/basic-grid.html  Carrie's reference for the golden-ratio grid (also reachable on the live site)
CNAME  .nojekyll  .gitignore
```

The thumbnails' videos were made from Carrie's screen recordings (kept in `~/Documents/claude-repo/web-experiments/`, not in this repo) with the ffmpeg bundled in the Python package `imageio-ffmpeg`, installed in a scratch virtual env (Homebrew ffmpeg isn't installed). They play as `<video autoplay muted loop playsinline>`, like a GIF. Captions call them `.glsl` (the shaders' language), with the name in brackets (`.shot-name`), then the date last modified and the date made, both MMDDYY (`.shot-dates`, one span each, in `--gray`). Up to 1000px wide (portrait tablet, basic-grid's tablet size): one left-aligned block, a blank line after the name, one date per line. Wider than 1000px: the dates sit on the right, aligned to the image's right edge, on one line with one space (`112026 092926`). This 1001px media query is the site's only width breakpoint (Carrie, 2026-11-23). The modified date is typed by hand: update it in `webgl.html` whenever an experiment changes (renames and code-comment edits don't count; cloud-sim's 111926 is its last real change, before the rename).

## Layout: the golden-ratio grid

Every page is laid out on fixed grid lines (`basic-grid/basic-grid.html` shows them). Rows come from Carrie's "layout experiment" PDFs; columns from "new net grid.pdf" (2026-11-19), which opened the left side up into a regular 4-column grid. In `styles.css`: rows `--r1`..`--r8` (dvh); columns `--c1`..`--c5`: c1 and c5 are one margin A in from the edges, and margin A is square at every window shape (Carrie, 2026-11-23): c1 = r1 (measured on the height) and c5 = 100vw - r1 (in the PDFs' golden-ratio frame, 2.103 and 97.897vw; before 2026-11-23 they were fixed at those vw values, so the side margins got wide on near-square windows). The nav runs c1 to c2 (14.590vw), and c2 to c5 is three equal columns, worked out from c2 and c5 (c3 = c2 + (c5 - c2) / 3, c4 = c2 + 2(c5 - c2) / 3; 42.359 and 70.128vw in the golden-ratio frame). Since `--margin-a` is c1, the gutters are square-margin sized too. Until 2026-11-23 it was four columns, c2 to c6 (c3 35.417, c4 56.244, c5 77.070, c6 97.897); margins and gutters didn't change. Each column's content starts one margin A after its line (the gutter) and runs to the next line. Carrie's two margin sizes: **margin A** (purple in her PDFs; `--margin-a` = c1 across, `--margin-a-y` = r1 down), the outer margin and the column gutters; **margin B** (blue; `--band`, r2 - r1), the band height and the gap between a command and its output. Pages are either 1-column (carries-brain: the window holds the dream) or 3-column (home, sketchbook, WebGL, design). Until 2026-11-19 the columns were c1..c8 (old c2 3.459, c4 38.197, c5 61.803, c6 85.410, c7 96.541 are gone; old c3 and c8 are now c2 and c6). Type sizes come from the band: `--margin-type` (0.9 band) and `--body-type` (0.6 band). There are no breakpoints yet (deferred): the desktop grid is used at every size. `.grid-lines` in each page draws the lines but is hidden in CSS; unhide it to check alignment.

Every page: skip link, then `<div class="screen">` (fixed, full viewport) holding:
- `<header class="band band-top">`: `:) <3 *` (`.band-mark`, a link home (`index.html`) with no hover state; white, except green on the home page (`<html data-page="home">`); the only link to home, which isn't in the tree; the `:)` is `.sidebar-label`, which rage and silly turn into `:(`), then `.titlebar` with the page's path (`.titlebar-path`, gray) on the right, ending at c5. Since 2026-11-24 the mark is body type (was margin type), and the path, the status bar's uptime and clock, and the tree are `--h3-type` (0.5 band). The tag after the path (`[ explore ]` until 2026-11-24) is now empty on every page and hidden when empty; the scripts still fill it briefly (`[ press esc ]`, `[ move to slash ]`, the WebGL2 error), and it then shows to the left of the path. The bands run from c1 to c5; a long path is cut off at the window's left edge (c2 + margin A).
- `<nav class="tree">`: from c1 to c2, from r3 to r6. `~/carries-brain` (links to `carries-brain.html`), then `sketchbook/` > `design` > `portfolio-grid`, then `webgl` > `liquid-goo`, `cloud-sim`, `slime-brain` (design listed first since 2026-11-23, in the tree and in `ls`; no `.glsl` in the tree since 2026-11-23; captions, paths and the command line keep it) (nested `ul.tree-sub`, indented 2ch). All names gray except the current page (`aria-current="page"`), which is white with a green ` <` pointer (2026-11-23; before, all names were white). The experiment entries link to `webgl.html#<id>`. After sketchbook, `experiments/` (2026-11-24; a plain label, `.tree-folder`, gray, not a page or a command-line place) holds `goo-dubstep`, which opens `experiments/goo-dubstep.html` in a new tab (`target="_blank"`). That page is standalone, with no way back to the site, so it can be shared as a link on its own (carriemarkusen.net/experiments/goo-dubstep). The short address carriemarkusen.net/goo-dubstep is `goo-dubstep.html` at the root, a redirect page (like web-experiments.html) that sends visitors to the experiment; the tree still links to the experiment directly. Renamed from liquid-goo-dubstep on 2026-11-24; its saved-settings keys in this browser's storage keep the old name (`liquid-goo-dubstep-settings` etc.) so nothing saved is lost.
- `<main id="main" class="window">`: from c2 + margin A to c5, from one band below the top band (r2 + band) to one band above the bottom band. Sketchbook, WebGL and design content starts at the window's left edge (the first column's content), with the command (`<p class="cmd">`, CSS adds `> `) on r3 and its output one band (margin B) below. The sketchbook header spans all three columns; the WebGL and design thumbnails fill the columns in order (square, one column wide).
- `<footer class="band band-bottom statusbar">`: the command line (`carrie@brain ~>`, body type size; JetBrains Mono ligatures merge `~>` into one squiggly arrow, which Carrie wants) and uptime and clock on the right, all hanging from the band's top edge.

After `.screen`, outside it: `<div class="response">`, the command line's replies (c1 to c3, r6 to one band above the bottom band). It's outside `.screen` so it can sit above everything (z-index 1000), including an open experiment. Each line of a reply has its own black highlight (an inline span with `box-decoration-break: clone`). Empty space lets clicks through to what's underneath. Replies clear whenever the page changes: leaving a page, coming back with Back/Forward (bfcache), and opening or closing an experiment (`clearOutput` in `script.js`).

**Carrie's rule for paths (2026-11-23):** the title bar path always shows where you are in the pretend file system of the file tree (not the real code files): home `~/home`, `~/carries-brain/`, `~/carries-brain/sketchbook/`, `~/carries-brain/sketchbook/webgl/`, and an open experiment's `.../webgl/<name>.glsl`. The command line uses the same paths (see Command line). Earlier made-up file names (`dream.exe`, `readme.txt`) are gone.

**Carrie's rule for the two text spots:** the top band's tag (empty since 2026-11-24 except for the scripts' brief notes) gives nav tips or info (`[ explore ]`, `[ press esc ]`, `[ drag to grow ]`); the command line's hint (carrie@brain) gives context. (Holo and rage mode still say "press esc" in the hint; they predate the rule.)

The band, tree, window and status bar markup is **copied into every page** and must stay identical apart from `aria-current`, the path and the tag.

## Web experiments

Clicking a thumbnail on `webgl.html` (or an experiment in the tree) opens it in `.experiment-window`, an iframe that `setupExperiments` in `script.js` sizes to cover the window. While it's open:
- The top band's path shows the experiment's location (the link's `data-path`, e.g. `~/carries-brain/sketchbook/webgl/liquid-goo.glsl`), and the tag says `[ press esc ]` in gray.
- The command line's hint gives context: the link's `data-hint` (liquid goo: "swirl it up"), or the experiment's own `{ hint }` (the cloud simulator: "i could lay here with you forever").
- The tree is hidden and `.experiment-info` takes its place: the file name (gray), a gray italic description (`data-about`, where `&#10;` would be a line break: "lose yourself." / "enjoy this beautiful day :)"), then the experiment's controls. There's no close button: Esc closes it. Interactive controls are green; choices (cloud types, daytime/sunset) are white with the current one green, one per line, no brackets; buttons like `[ scramble ]` keep brackets and are white (hover inverts in white). Sliders (since 2026-11-23) have white words and a white hairline track, with only the block handle green; they span the column's width on one line with no brackets (`liquid ━━ goo`, `color ━━`, `iridescence ━━`, `gloss ━━`, `turbulence ━━`, `speed ━━`, `cover ━━ 50%`). The sidebar runs c1 to c2, so margin A separates it from the experiment.
- The page address gets `#<id>`, so reloading or sharing reopens that experiment; arriving at `webgl.html#<id>` from another page opens it.

How the controls move (`experiments/bridge.js`): inside a frame, each experiment hides its own controls and calls `bridgeControls(container, rows)`, which posts `{ controls }` describing them (sliders, buttons with `aria-pressed`, `<output>` readouts, plain words). The site draws them and posts back `{ press: id }` or `{ set: id, value }`; the bridge clicks or moves the real control, and posts `{ state }` when a button or readout changes. Opened on their own, the experiments keep their original bottom-right controls. Other messages from the open experiment's frame (only that frame is listened to): `{ escape: true }` closes it (bridge.js sends this when Esc is pressed inside the frame, since a clicked-into frame keeps the keyboard); `{ hint }` sets the command line's hint (the cloud simulator's "i could lay here with you forever", on open and on daytime/sunset), and `{ about }` replaces the sidebar description (the cloud simulator sends each picked cloud type's description: its latin meaning and how it forms; these are too long for the hint's single line).

**slime-brain.glsl** (added 2026-11-23 as dream.glsl, renamed slime mold, then slime brain, the same day at Carrie's request; link id `slime-brain`): `experiments/slime-brain.html` runs the site's own `dream.js` full-frame (so changes to the dream show up on both `carries-brain.html` and here). It defines a still `holoTilt` (normally from `script.js`) and a hidden `#dream-hint`, shown only for the webgl2 error. Sidebar description "drag to grow.", `data-hint` a slime mold fact ("slime mold can find the shortest path through a maze", Physarum, Nakagaki 2000), no controls yet (it doesn't call `bridgeControls`; bridge.js is loaded only so Esc closes it). Caption date 092826, from `dream.js`'s first commit (2026-09-28). The thumbnail is the experiment itself, live (2026-11-23): `experiments/slime-brain.html` in an `<iframe class="shot-live">`, at full speed (it ran at a quarter speed via `?thumb` for part of 2026-11-23; `slime-brain.html?thumb` still sets the global `dreamStepsPerFrame` to 1, which dream.js uses when a page sets it, if it's wanted again) in the square, `pointer-events: none` and `tabindex="-1"`, so clicks go to the link (which opens the full experiment as usual) and it just grows from the smiley on its own. It's a second WebGL context while the page is open. Headless Firefox can't render WebGL, so it can't be checked in screenshots here. The gallery's hover outline covers `img`, `video` and `iframe`.

While an experiment is open no mode starts ("close the experiment first."), and opening one ends any mode that's on ("<mode> mode off."; `startMode` in `script.js`). It began with holo, whose foil plus an experiment's simulation overloaded the graphics card. Without JavaScript the links open the experiments' own pages.

The experiments came from `~/Documents/claude-repo/web-experiments/` (liquid-goo was called oil-spill until 2026-10-01). The site's copies have since changed: the bridge script and its call at the end of each file, liquid-goo's screenshot feature removed and a color slider added under liquid/goo (2026-11-19; it turns every color around the color wheel, `hueTurn` in the display shader), a turbulence slider under gloss (0, the default, is the goo as it was; higher adds random bubbles that swell, push the film aside and fade, more often and bigger the higher it goes; `bubble()` and the `bubbles` shader. A speed slider under turbulence: default in the middle = the original speed, ends 1/10x and 10x (`SPEED_RANGE`); no readout. It only scales the goo's own resting motion (drift, ghost push, the memory pull home, turbulence's bubbles); dragging and `[ scramble ]` always run at normal speed, per Carrie. In the sidebar, empty rows (`[]` in the `bridgeControls` call) add an extra blank line after liquid/goo, gloss, speed and `[ scramble ]`, grouping the controls. Whole-sheet shakes were tried and dropped: Carrie didn't like the plane being jostled), a color speed slider (2026-11-20, removed 2026-11-23), two sliders under color (2026-11-20, replacing a brightness slider Carrie found irrelevant): iridescence (how strongly the rainbow sheen shows where the film is stirred: 0 none, middle as it was, right 3x; `uIris`) and gloss (0 matte, middle the original `GLOSS`, right 4x); both start at 0 (since 2026-11-23; before, the middle); no readouts, and `[ scramble ]` randomizes both. A film thickness slider was tried and dropped the same day, and `[ reset ]` replaced by `[ scramble ]` (a random mix stirs the film for 0.5 to 2 s: 2 to 12 blobs that swirl, shove, or puff/pinch, some stretched into streaks, leaning toward one kind per click, plus up to 3 shear waves; the ghost push gets a new path; the liquid/goo and color sliders jump to random places, and so do iridescence and gloss; turbulence and speed stay), a `[ full screen ]` button under `[ scramble ]` (2026-11-20; its `data-site-action="fullscreen"` tells the site to put the experiment's frame in browser full screen itself, since a frame can't do that from a relayed click; Esc comes back; on its own page it toggles the page's full screen). Clicking the goo to drop in a glob, then to press into it, were tried and removed (2026-11-19), and the cloud simulator's own controls (a cover slider, 0 to 100%, clouds grow or melt over 3 seconds; ordered cloud types, then cover, then daytime/sunset, in the sidebar (with an extra blank line before daytime/sunset) and on its own page (2026-11-19); the four basic cloud types, cirrus, cumulus, stratus and nimbus, from the US National Weather Service's descriptions, each a row of numbers in `TYPES`, dissolving over 3 seconds; daytime / sunset). If an experiment is copied over again from claude-repo, redo those changes. The goo's memory (`MEMORY`, how long it takes to ease back toward the photo's layout) went from 30 seconds to an hour on 2026-11-20, so the photo comes back only very slowly. Turning it off completely was tried and undone the same day. The memory exists so endless stirring doesn't fold everything into one muddy color; at an hour it does much less of that. liquid-goo starts moving on its own (a slow wandering push, random each visit, not turned off by Reduce motion, at Carrie's request).

## The home page and the dream

2026-11-23: the home page was copied to `carries-brain.html`, now its own page (the tree's `~/carries-brain`, with `aria-current`). `index.html` stays the home page, reached by `:) <3 *` and `cd ~`/`home`, and is not listed in the tree; the same day Carrie had it changed to mirror the sketchbook page: path `~/home` (was `~/index.html` until later on 2026-11-23), tag `[ explore ]`, `> cat thoughts.txt` and the header "exploration in progress" (was "you have landed here"), then the tips (see Files). It keeps the boot screen; it doesn't load `dream.js`. The dream now lives only on `carries-brain.html`, which has no boot screen. `carries-brain.html`'s tag is `[ explore ]` (was `[ drag to grow ]`; dream.js keeps the page's own tag in `hintText` and puts it back when rage mode ends), and the page opens in holo mode: `<html data-start-mode="holo">`, read at the end of `script.js`. While that holo is on, the hint is "type cd sketchbook" (`defaultHint`; was "type silly"). Esc and `normal` end holo, and so does leaving the page. On iPhone the tilt sensor can't be asked for without a tap, so there the foil follows a dragging finger until `holo` is typed. Below, "the home page's window holds the dream" now means `carries-brain.html`; the boot screen paragraph still means `index.html`.


The home page's window holds the dream: its `<h1>` is the title bar path (`~/carries-brain/`, until 2026-11-23 `~/carries-brain/dream.exe`) with the `[ explore ]` tag, and `.home-dream` holds the canvas. The dream waits while the boot screen shows, so it starts growing as the site appears. `dream.js` runs a Gray-Scott reaction-diffusion simulation on the graphics card, seeded with a big `:)` (a random amount of B in each cell, and the rate drift starting at a random time, so each start grows differently); dragging seeds new growth; the feed and kill rates drift slightly across the screen and over time (kept narrow: wider drift turns areas solid or spotty). A window resize restarts it. Needs WebGL2 with float render targets; otherwise the title bar says so. (`dream.html`, a full-screen version opened with `cd dream`, was removed on 2026-11-19 along with the command; some `.dream` styles in `styles.css` are left over from it.)

Home page only: a `<script>` in `<head>` adds `booting` to `<html>` on the first visit of a browser session (sessionStorage key `booted`) unless the password was entered in the last 24 hours (localStorage `unlocked`). That shows `.boot`: it types "welcome to carrie's brain", then shows "> enter password:" with a plain text field (typed characters are shown, not masked). The password is `:)` (the `password` constant in `script.js`); a wrong one prints "access denied. try again." and clears the field. The right one prints "access granted.", a boot log (technical, with a touch of fantasy; no jokes; now "indexing ~/carries-brain ... 3 found"), then reveals the site with a power-on animation. Hidden shortcut (deliberately not mentioned anywhere on the site): any command the command line knows (`rage`, `holo`, `cd sketchbook`, `cowsay hi`...) or a bare place name (`sketchbook`) is also accepted, logs in the same way, and is run through `runCommand` as the site appears. Clicking anywhere on the boot screen just refocuses the field. The password is cosmetic: it's readable in the page source, the other pages can be opened directly, and the repo is public. Carrie knows and chose this over taking the site offline. Later visits to home skip it; the `reboot` command replays it. Opening any other page also sets `booted`.

Carrie's Mac has Reduce motion on. Typing and the cursor blink run for everyone regardless; only the power-on animation is skipped under `prefers-reduced-motion`.

## Command line

`script.js`: help, ls (lists the current folder), cd/open/cat <place> (a bare `cd` goes home), whoami, pwd (the current folder), date, clear, reboot, sudo, exit, sky / sunset / daytime, holo, rage, normal, quote, cowsay <words>. The command line works in the file tree's pretend file system (2026-11-23): the `places` array lists each folder's path and page (`~` index.html, `~/carries-brain`, `.../sketchbook`, `.../webgl`) and the three experiments as `.glsl` files in WebGL (they open over webgl.html, `#<id>`), and `.../sketchbook/design` (design.html, shortcut `design`) with `.../design/portfolio-grid` (portfolio-grid.html, shortcut `portfolio-grid`). `here` is the current page's folder. The prompt is always `carrie@brain ~>` and never shows the path (Carrie, 2026-11-23); `pwd` and `ls` do. `cd`/`open`/`cat` take a shortcut name from anywhere (`sketchbook`, `webgl` (`web-experiments` and `experiments` removed 2026-11-24; `cd experiments` goes nowhere for now), `carries-brain`, `liquid-goo`/`cloud-sim`/`slime-brain`, `~`/`home`/`/`), a full path (`~/carries-brain/sketchbook`), or a path from the current folder (`..`, `../..`, `webgl/cloud-sim.glsl`); replies say `opening <path> ...`. The boot log line is now "indexing ~/carries-brain ... 3 found". The hint (the input's placeholder) is always italic; typed text is not. A command can set `nextHint` to suggest what to type next; an open experiment can set it too (see Web experiments). Otherwise the hint is "type help" ("type silly" on the home page and "type rage" on the sketchbook page, "open a project" on the design and webgl pages, "type cd design" on portfolio-grid: each input's placeholder, and `defaultHint` checks `data-page` = `home` / `sketchbook` / `design` / `webgl` / `portfolio-grid`), or "type too silly" in silly mode. `/` focuses the command line; up/down arrows recall history. If the command line had focus when a page was left, the next page focuses it again (sessionStorage key `cli-focus`), except while the boot screen shows.

- `cowsay <words>`: the classic cow in a speech bubble; lines wrap at 30 characters; no words: "moo."; afterwards the hint says "type so cute", and `so cute` replaces the cow with just `:)`.
- `quote`: the first quote in the `quotes` list the first time in a visit, then a random one, never the same twice in a row (sessionStorage key `quote`), shown in the reply area exactly as Carrie wrote it (her capitals are intentional, an exception to the site's lowercase rule). Each entry has `text` and an optional `by`, shown as the hint while the quote is up. Anything the visitor does next clears it. Carrie supplies the quotes.
- `silly` (UI intact): class `silly` on `<html>`. Wingdings everywhere except the command line and its reply, a rainbow gradient background sliding right to left, text and lines in one color cycling every 8 seconds, placeholder images cycling through the rainbow, the dream see-through with rainbow folds (`dream.js` checks the class every frame), no glow, scanlines or vignette. `too silly` turns it off.
- `sky` (bare minimum): class `sky` on `<html>`. `sky.js` puts one fixed canvas behind everything that paints the sky and clouds across the whole screen. The window's content is hidden (the dream is paused), lines are removed except the status bar's, no scanlines or vignette, `--green` and `--glow` become red-orange (`#ff4500`), and the tree and title bars are `visibility: hidden` (keeping their space). The hint is "type sunset"; `sunset` fades to sunset colors over 4 seconds and the hint becomes "type daytime"; `daytime` fades back. The clouds come from Carrie's cloud simulator; she tuned the motion and colors by eye, so change them only when asked.
- `holo` (UI intact): class `holo` on `<html>`. The site becomes holographic foil that catches the light as it tilts (mouse position; on phones the tilt sensor, asked for on iPhone when the command is typed, or a dragging finger). `script.js` eases the tilt and sets `--tx`/`--ty` and `--mx`/`--my` on `<html>`; `holoTilt` is read by `dream.js`. The foil is five fixed `.holo-layer` divs (rainbow gradient, fine diffraction lines and a soft glow behind the page, two glitter layers in front), moved only with `transform` for speed; the CSS variables are throttled (`holoInkEvery` 50 ms, `holoLinesEvery` 200 ms) because changing one restyles the whole page. Text is ink painted through the letters, mostly near-black (`--holo-dark`) with color bands that sweep through as it tilts (each text-only element paints its own: painting once from `body` misplaces text in Chrome). Placeholder images become foil cards; the dream's folds become an iridescent film. The hint is "press esc". (A WebGL foil was tried and dropped; Carrie prefers the CSS gradient.)
- `rage` (terminal kind, UI intact, modeled on a deathcore shirt Carrie shared): `--green` and `--glow` become blood red (`--rage-red: #d7262e`), `body::before` lays an acid-wash texture under the scanlines, and `rage.js` adds a WebGL canvas of pale living veins that drift, branch and fire. Every 4 to 12 seconds it screams for 0.38 s (class `scream`: smeared blocks, red/blue split, and a 0.04 s full-screen invert, class `flashing`), regardless of Reduce motion. The `:)` becomes `:(`. The dream is reseeded with "you make / me feel / so dumb" and switches to spiky rules (feed 0.030, kill 0.0565) drawn as hard-edged dark red metal (`rageStepsPerFrame`). Turning it on shows no reply; the prompt becomes "scream something ~>", and the next line typed replaces the words in the dream (`dream-replant` event, cut to 60 characters, `wrapWords` in `dream.js`), then the prompt returns and the reply says "you have the power to escape your rage." In rage mode the mouse slashes the dream without clicking; the title bar tag says "[ move to slash ]". The hint is "press esc".
- Modes take turns: turning one on ends any other (`endModes`). **Esc** ends any mode and replies "back to normal."; `normal` does the same. None of them are saved, so changing page ends them.

## CSS

Settings live at the top of `styles.css`:
- **Colors (black, white and green, plus gray for data text):** `--black: #000000`, `--white: #fcfcfc`, `--green: #03f900`. Green rules use `--rule: 0.5px`. `--placeholder: #111111` (one tint lighter than black). `--gray: #a8a8a8` for data text: the title bar path, an experiment's instruction tag, and the experiment captions' dates. No other colors, per Carrie. The green text glow and black scanline overlay are effects, not new colors. The experiment sidebar uses a fixed `--action: #03f900` for its green so modes can't recolor it.
- **Font:** JetBrains Mono, Thin (100) everywhere, italics for hints and the experiment description. The Google Fonts `<link>` is in every page's `<head>`.
- **Focus outline:** none, including the browser's default ring (`:focus, :focus-visible { outline: none; }` above the link styles). The site-wide `:focus-visible` 1px dashed green outline was removed 2026-11-23 at Carrie's request (it showed around open experiments, which take focus so Esc works). Links still invert on keyboard focus, and the experiment controls have their own focus styles; other focusable things (the window, an open experiment) show no focus at all.
- **Links:** no underline. Hover and keyboard focus invert them (green background, black text), except `:) <3 *`, which doesn't change.
- **CRT effect:** `body::after` draws scanlines and a vignette over everything, with `pointer-events: none`. Frames and images have no scanlines (2026-11-23): `setupScanlineHoles` in script.js cuts a hole in the layer's mask (`--scan-mask`) for each `.site-frame`, `.grid-map-drawing`, `.project-diagram` and gallery image/video, clipped to the window, updated on scroll and resize.
- **All visible text is lowercase,** written that way in the HTML. This includes the `webgl` folder name (Carrie first asked for `webgl`, then for everything lowercase, 2026-11-23). The command line ignores capitals in paths.
- Some older rules are no longer used by any page (`.listing`, `.facts`, `.pager`, `.sidebar`, `--sidebar-width`, the `.dream` page styles, the 50em note in the header comment). They're harmless; remove them in a cleanup pass if Carrie asks.

## Build history

- **Build 1:** Carrie's 2017 portfolio rebuilt as clean code, using placeholders.
- **Build 2:** a neutral wireframe with separate HTML pages, one breakpoint, and a hover-to-reveal menu.
- **Build 3:** the sidebar became name / projects / `:)`. The contact page was renamed `resume.html`. All text went lowercase, letter spacing to 0, link hover to italic. Black sidebar, off-black pages, green accent.
- **Build 4:** "carrie's brain". The site became a terminal: boot screen with a password prompt (`:)`), file-tree sidebar, command windows, status bar with a working command line and clock, CRT scanlines, favicon. Pushed live as one commit (`c7a7838`).
- **Build 5:** a white-themed portfolio with five project pages, `sketchbook/`, the web experiments, the dream on the home page, and the modes (silly, sky, holo, rage).
- **Grid redesign (2026-11-19, not yet numbered or committed):** built in a separate `portfolio-new` folder and copied in here. The golden-ratio grid layout; the portfolio, project pages, resume and `dream.html` removed; `webgl.html` split out of the sketchbook; experiments open with their info and controls in the sidebar (`bridge.js`). Carrie hasn't said whether this is Build 6.

## Where things stand (2026-11-19)

- Build 5 is live. The grid redesign is in the working folder, uncommitted, waiting for Carrie to check it in a browser and ask for a commit and push.
- GitHub's Pages "DNS check" showed "in progress" after launch. DNS at Porkbun was verified correct (four GitHub A records, `www` CNAME to `waywocketsparklegem.github.io`) and the site loads. If the check is still stuck, remove and re-add the custom domain in Settings > Pages, then confirm `CNAME` is still in the repo.
- Carrie was offered real privacy (verify the domain, make the repo private, take Pages offline) and chose the cosmetic password instead. Don't re-suggest unless she asks.

## Open items (deferred by Carrie)

1. **Phones and small screens:** no breakpoints; the desktop grid is used everywhere.
2. **`cloud-simulator.glsl` wrapped in the tree** at 1440px wide. Resolved 2026-11-23 by the rename to `cloud-sim.glsl` (link id `cloud-sim`).
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
