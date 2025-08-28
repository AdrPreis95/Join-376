(function (global) {
  global.allContacts = global.allContacts || [];

  // --- Pool GLOBAL machen ---
  global.COLOR_POOL = global.COLOR_POOL || [
    '#FF7A00','#FF5EB3','#6E52FF','#00B894','#00C2FF',
    '#E17055','#55EFC4','#FDCB6E','#A29BFE','#74B9FF'
  ];

  let contactsCache = null;
  let contactsLoadedAt = 0;
  const CONTACTS_TTL_MS = 5 * 60 * 1000;

  function stringHash(s){ s=String(s||''); let h=0,i=0; while(i<s.length) h=((h<<5)-h+s.charCodeAt(i++))|0; return Math.abs(h); }

  function canonicalKey(c){
    if(!c) return 'unknown';
    const id=c.id||c.uid; if(id) return 'id:'+id;
    if(c.email) return 'email:'+String(c.email).trim().toLowerCase();
    const fn=(c.firstName||'').trim().toLowerCase(), ln=(c.lastName||'').trim().toLowerCase();
    if(fn||ln) return 'name:'+fn+' '+ln;
    if(c.name) return 'name_only:'+String(c.name).trim().toLowerCase();
    return 'unknown';
  }

  function deriveColorDeterministic(key){
    const idx = stringHash(key) % global.COLOR_POOL.length;
    return global.COLOR_POOL[idx];
  }

  function ensureContactColor(contact,{persist=false}={}){
    if(contact?.color && /^#?[0-9A-F]{6}$/i.test(contact.color)){
      contact.color = contact.color.startsWith('#') ? contact.color : '#'+contact.color;
      return contact.color;
    }
    const key = canonicalKey(contact);
    const lsKey = 'contactColor:'+key;
    const stored = localStorage.getItem(lsKey);
    if(stored && /^#?[0-9A-F]{6}$/i.test(stored)){
      contact.color = stored.startsWith('#') ? stored : '#'+stored;
      return contact.color;
    }
    const col = deriveColorDeterministic(key);
    localStorage.setItem(lsKey,col);
    contact.color = col;
    // if(persist && (contact.id||contact.uid)) saveContactColor(contact.id||contact.uid,col).catch(()=>{});
    return col;
  }

  async function getContactsCached(force=false){
    const now=Date.now();
    const fresh=contactsCache && (now-contactsLoadedAt)<CONTACTS_TTL_MS;
    if(!force && fresh) return contactsCache;
    const raw = await global.loadContacts?.();
    const list = Array.isArray(raw) ? raw : (global.allContacts||[]);
    list.forEach(c=>ensureContactColor(c));
    contactsCache=list; contactsLoadedAt=now; global.allContacts=list;
    return list;
  }

  // --- Exporte ---
  global.getContactsCached = getContactsCached;
  global.ensureContactColor = ensureContactColor;
  global.canonicalKey = canonicalKey;

  // --- stabile Farb-API global (Namen bleiben) ---
  global.generateColor = function(arg){
    if(arg==null) return global.COLOR_POOL[Math.floor(Math.random()*global.COLOR_POOL.length)];
    if(typeof arg==='object') return ensureContactColor(arg);
    const key='contactColor:'+String(arg).trim().toLowerCase();
    let col=localStorage.getItem(key);
    if(!col){ col=deriveColorDeterministic(key); localStorage.setItem(key,col); }
    return col;
  };
  global.getRandomColor = function(arg){ return global.generateColor(arg); };
  global.__ctxGenerateColor = global.generateColor; // fester Handle

})(window);
