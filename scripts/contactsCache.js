/** Global Function for all Contact Avatar BG Colors  (Color POOL) */
(function (global) {
  global.allContacts = global.allContacts || [];

  global.COLOR_POOL = global.COLOR_POOL || [
    '#FF7A00','#FF5EB3','#6E52FF','#00B894','#00C2FF',
    '#E17055','#55EFC4','#FDCB6E','#A29BFE','#74B9FF'
  ];

  let contactsCache = null;
  let contactsLoadedAt = 0;
  const CONTACTS_TTL_MS = 5 * 60 * 1000;

  /* ---------- tiny helpers (pure refactor, no logic change) ---------- */
  function isHex6(s){ return /^#?[0-9A-F]{6}$/i.test(s||''); }
  function withHash(s){ return s.startsWith('#') ? s : ('#' + s); }
  function poolPick(i){ return global.COLOR_POOL[i % global.COLOR_POOL.length]; }
  function isFresh(now){ return contactsCache && (now - contactsLoadedAt) < CONTACTS_TTL_MS; }

  /** Returns a positive hash from a string. */
  function stringHash(s){
    s = String(s || '');
    let h = 0, i = 0;
    while (i < s.length) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
    return Math.abs(h);
  }

  /** Creates a canonical key for a contact. */
  function canonicalKey(c){
    if (!c) return 'unknown';
    const id = c.id || c.uid; if (id) return 'id:' + id;
    if (c.email) return 'email:' + String(c.email).trim().toLowerCase();
    const fn = (c.firstName || '').trim().toLowerCase();
    const ln = (c.lastName || '').trim().toLowerCase();
    if (fn || ln) return 'name:' + fn + ' ' + ln;
    if (c.name) return 'name_only:' + String(c.name).trim().toLowerCase();
    return 'unknown';
  }

  /** Derives a deterministic color from a key. */
  function deriveColorDeterministic(key){
    const idx = stringHash(key) % global.COLOR_POOL.length;
    return global.COLOR_POOL[idx];
  }

  /** Ensures a contact has a valid color, generating one if needed. */
  function ensureContactColor(contact,{persist=false}={}){
    if (contact?.color && isHex6(contact.color)) {
      contact.color = withHash(contact.color);
      return contact.color;
    }
    const key = canonicalKey(contact);
    const lsKey = 'contactColor:' + key;
    const stored = localStorage.getItem(lsKey);
    if (stored && isHex6(stored)) {
      contact.color = withHash(stored);
      return contact.color;
    }
    const col = deriveColorDeterministic(key);
    localStorage.setItem(lsKey, col);
    contact.color = col;
    return col;
  }

  /** Returns contacts from cache or reloads them if expired. */
  async function getContactsCached(force=false){
    const now = Date.now();
    if (!force && isFresh(now)) return contactsCache;
    const raw = await global.loadContacts?.();
    const list = Array.isArray(raw) ? raw : (global.allContacts || []);
    list.forEach(c => ensureContactColor(c));
    contactsCache = list; contactsLoadedAt = now; global.allContacts = list;
    return list;
  }

  global.getContactsCached = getContactsCached;
  global.ensureContactColor = ensureContactColor;
  global.canonicalKey = canonicalKey;

  /** Generates a stable color for a contact or key. */
  global.generateColor = function(arg){
    if (arg == null) return poolPick(Math.floor(Math.random() * global.COLOR_POOL.length));
    if (typeof arg === 'object') return ensureContactColor(arg);
    const key = 'contactColor:' + String(arg).trim().toLowerCase();
    let col = localStorage.getItem(key);
    if (!col) { col = deriveColorDeterministic(key); localStorage.setItem(key, col); }
    return col;
  };

  /** Alias for generateColor. */
  global.getRandomColor = function(arg){ return global.generateColor(arg); };

  /** Internal stable handle for color generation. */
  global.__ctxGenerateColor = global.generateColor;

})(window);
