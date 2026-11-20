/*
  Shown inside carriemarkusen.net (in a frame), an experiment's controls move to the site's sidebar.
  The experiment calls bridgeControls(container, rows): the container (its own controls) is hidden, and the rows
  are described to the site, which draws them in its own style. Each row is a list of elements:
    <input type="range">  a slider
    <button>              a button (aria-pressed, if it has one, marks a choice that's on or off; data-site-action
                          "fullscreen" makes the site fill the screen with the experiment instead of clicking it)
    <output>              a readout that changes, like "50%"
    anything else         words, like "liquid" or "goo"
  When the site's copy is used, the real control here is clicked or moved, so the experiment works as it always
  does. Changes here (a button turning on, a readout changing) are sent back.
  On its own page, nothing changes: the experiment keeps its controls.
*/
function bridgeControls(container, rows) {
  if (window.parent === window) return;
  container.style.display = 'none';

  const parts = {};
  let next = 0;
  const idOf = (el) => {
    if (!el.dataset.bridgeId) el.dataset.bridgeId = el.id || `part-${next++}`;
    parts[el.dataset.bridgeId] = el;
    return el.dataset.bridgeId;
  };

  const describe = (el) => {
    if (el.tagName === 'INPUT' && el.type === 'range') {
      return { kind: 'range', id: idOf(el), min: el.min, max: el.max, step: el.step, value: el.value,
               label: el.getAttribute('aria-label') || '' };
    }
    if (el.tagName === 'BUTTON') {
      const pressed = el.getAttribute('aria-pressed');
      // Its words only: the site draws the brackets.
      const text = el.textContent.trim().replace(/^\[\s*/, '').replace(/\s*\]$/, '');
      // data-site-action asks the site to do something itself, like "fullscreen" (filling the screen with the
      // experiment's frame has to be done by the site).
      return { kind: 'button', id: idOf(el), text, action: el.dataset.siteAction || null,
               pressed: pressed === null ? null : pressed === 'true' };
    }
    if (el.tagName === 'OUTPUT') return { kind: 'output', id: idOf(el), text: el.textContent.trim() };
    return { kind: 'text', text: el.textContent.trim() };
  };

  const send = (message) => window.parent.postMessage(message, '*');
  send({ controls: rows.map((row) => row.map(describe)) });

  // Send changes back: buttons turning on or off, readouts changing, sliders moved by the experiment itself.
  const stateOf = (el) => {
    if (el.tagName === 'INPUT') return { value: el.value };
    if (el.tagName === 'BUTTON') return { pressed: el.getAttribute('aria-pressed') === 'true' };
    return { text: el.textContent.trim() };
  };
  const report = (el) => send({ state: { [el.dataset.bridgeId]: stateOf(el) } });
  const watch = new MutationObserver((changes) => {
    const seen = new Set();
    for (const change of changes) {
      let el = change.target.nodeType === 1 ? change.target : change.target.parentElement;
      while (el && !el.dataset.bridgeId) el = el.parentElement;
      if (el && !seen.has(el)) { seen.add(el); report(el); }
    }
  });
  for (const el of Object.values(parts)) {
    if (el.tagName === 'INPUT') el.addEventListener('input', () => report(el));
    else watch.observe(el, { attributes: true, attributeFilter: ['aria-pressed'], childList: true, characterData: true, subtree: true });
  }

  // The site's copy was used: do the same here.
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return;
    const data = event.data || {};
    if (typeof data.press === 'string' && parts[data.press]) parts[data.press].click();
    if (typeof data.set === 'string' && parts[data.set] && parts[data.set].tagName === 'INPUT') {
      parts[data.set].value = data.value;
      parts[data.set].dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

// Inside the site's frame, the keyboard belongs to the experiment once it's clicked, so Esc is passed up to the
// site, which closes the experiment. On its own page, Esc does nothing here.
if (window.parent !== window) {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') window.parent.postMessage({ escape: true }, '*');
  });
}
