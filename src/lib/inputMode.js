const modes = new Set();
let path;

function record(mode) {
  const currentPath = window.location.pathname;
  if (currentPath !== path) modes.clear();
  path = currentPath;
  if (mode) modes.add(mode);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', event => record(event.pointerType || 'mouse'), true);
  window.addEventListener('keydown', event => {
    if (!event.repeat && !['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) record('keyboard');
  }, true);
}

export function consumeInputMode() {
  record();
  const mode = modes.size > 1 ? 'mixed' : [...modes][0] ?? 'unknown';
  modes.clear();
  return mode;
}
