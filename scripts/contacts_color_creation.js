/** Global one-time guard to avoid double installation. */
if (typeof window.__colorShimInstalled === 'undefined') window.__colorShimInstalled = false;
if (window.__colorShimInstalled === false) window.__colorShimInstalled = true;

/** Default fallback color pool (can be overridden via window.COLOR_POOL/colorsUser). */
const COLOR_DEFAULT_POOL = [
  "#FF7A00","#FF5EB3","#6E52FF","#9327FF","#00BEE8","#1FD7C1",
  "#FF745E","#FFA35E","#FC71FF","#FFC701","#0038FF","#C3FF2B",
  "#FFE62B","#FF4646","#FFBB2B"
];

/**Returns the active color pool.*/
function color_getPool() {
  if (Array.isArray(window.COLOR_POOL) && window.COLOR_POOL.length) return window.COLOR_POOL;
  if (Array.isArray(window.colorsUser) && window.colorsUser.length) return window.colorsUser;
  return COLOR_DEFAULT_POOL;
}

/**Deterministic non-crypto hash of a string (>= 0).*/
function color_hashStr(s) {
  s = String(s || ""); let h = 0, i = 0;
  while (i < s.length) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return Math.abs(h);
}

/**Picks a random color from a pool.*/
function color_pickFromPool(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

/**Derives a stable color from key using the pool.*/
function color_deriveColor(pool, key) {
  return pool[color_hashStr(key) % pool.length];
}

/**Builds a stable key from a contact-like object.*/
function color_keyFromObj(arg) {
  return (arg.email || String(arg.id) ||
    (`${arg.firstName || ""} ${arg.lastName || arg.name || ""}`))
    .trim().toLowerCase();
}

/**Reads a color from localStorage or derives & persists it.*/
function color_colorFromKey(pool, k) {
  const lsKey = "contactColor:" + k;
  let col = localStorage.getItem(lsKey);
  if (!col) { col = color_deriveColor(pool, lsKey); localStorage.setItem(lsKey, col); }
  return col;
}

/** Resolves a color for any input (object, string, null).*/
function color_colorFor(arg) {
  const pool = color_getPool();
  if (arg == null) return color_pickFromPool(pool);
  if (typeof arg === "object") {
    const col = color_colorFromKey(pool, color_keyFromObj(arg));
    if (!arg.color) arg.color = col; return arg.color;
  }
  return color_colorFromKey(pool, String(arg).trim().toLowerCase());
}

/**Public shim delegating to color_colorFor.*/
function generateColor(a) { return color_colorFor(a); }

/**Alias of generateColor for backward compatibility.*/
function getRandomColor(a) { return color_colorFor(a); }

/**Ensures an object has a persistent .color property.*/
function ensureColor(c) {
  if (!c) return;
  c.color = c.color || color_colorFor(c);
  return c.color;
}
