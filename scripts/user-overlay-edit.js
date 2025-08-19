/**Loads all contacts and renders the assigned-to list.*/
async function loadContacts(id) {
  const key  = await findKey(id);
  const task = await fetch(`${BASE_URL}/tasks/${key}.json`).then(r=>r.json()) || {};
  const res  = await fetch(BASE_URL + "/contacts.json");
  const json = await res.json();
  const contacts = Array.isArray(json) ? json : Object.values(json||{});

  _contactsCache = contacts;
  renderOverlayContacts(id, contacts, task.assignedTo || []);
  selectedUserEdit(id);
}

/**Refreshes the assigned-to UI from backend state.*/
async function refreshAssignedUI(id){
  const key  = await findKey(id);
  const task = await fetch(`${BASE_URL}/tasks/${key}.json`).then(r=>r.json()) || {};
  renderOverlayContacts(id, _contactsCache || [], task.assignedTo || []);
  selectedUserEdit(id);
}

/**Renders the contact list for the overlay assigned-to section.*/
function renderOverlayContacts(id, contacts, assignedList){
  const box = document.getElementById('user-dropdown');
  if (!box) return;

  const assignedSet = new Set((assignedList||[]).map(u => canon(`${u.firstName||''} ${u.lastName||''}`)));

  let html = '';
  for (const c of contacts){
    const shown = displayForUI(c.name, c.email);
    const isOn  = assignedSet.has(canon(cleanDisplayName(shown)));
    const rowId = safeIdFromName(shown);
    const pos   = (c.name || '').indexOf(' ');
    const fInit = (c.name||'')[0] || '';
    const lInit = pos > -1 ? (c.name||'')[pos+1] || '' : '';
    const icon  = isOn ? CHECKED : UNCHECKED;

    html += `
      <div id="${rowId}" class="user-container${isOn ? ' selected':''}">
        ${getContactName(id, shown, generateColor(), fInit, lInit, icon)}
      </div>`;
  }
  box.innerHTML = html;
  bindDropdownRowClicks();
}

/**Binds click events for selecting/deselecting assigned users. */
function bindDropdownRowClicks(){
  const list = document.getElementById('user-dropdown');
  if (!list || list._rowClickBound) return;
  list.addEventListener('click', (e) => {
    const row = e.target.closest('.user-container');
    if (!row) return;
    if (e.target.closest('img[id^="checkbox-contact-"], img.toggle-icon')) return;
    const icon = row.querySelector('img[id^="checkbox-contact-"], img.toggle-icon');
    if (icon) icon.click();
  });
  list._rowClickBound = true;
}

/**Toggles a contact's assigned-to state in the backend. */
async function toggleAssignedTo(name, id){
  const key = await findKey(id);
  const url = `${BASE_URL}/tasks/${key}.json`;
  const task = await fetch(url).then(r=>r.json()) || {};
  if (!Array.isArray(task.assignedTo)) task.assignedTo = [];
  const clean = cleanDisplayName(name);
  const [fn, ...rest] = clean.split(/\s+/);
  const ln = rest.join(' ');
  const exists = task.assignedTo.some(u => sameUser(u.firstName,u.lastName,fn,ln));
  if (exists){
    task.assignedTo = task.assignedTo.filter(u => !sameUser(u.firstName,u.lastName,fn,ln));
  } else {
    task.assignedTo.push({ firstName: fn, lastName: ln, color: generateColor() });}

  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},
                   body: JSON.stringify({ assignedTo: task.assignedTo })});
  await refreshAssignedUI(id);
}

/**Toggles the assigned to (users container) and checkbox*/
function rowToggleAssigned(row){
  const name=row.dataset.name, id=+row.dataset.id;
  const img=row.querySelector('img.toggle-icon');
  if(row.dataset.busy==='1') return; row.dataset.busy='1';
  if(img) img.src=img.src.includes('checked_icon')?UNCHECKED:CHECKED;
  row.classList.toggle('selected');
  toggleAssignedTo(name,id).finally(()=>row.dataset.busy='0');
}


/**Loads assigned users and renders them as chips in the edit overlay. */
async function selectedUserEdit(id) {
  const t = await loadTaskWithID(id);
  const items = (t.assignedTo || []).map(u => {
    const full  = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return { shown: full, initials: getInitials(full), color: u.color || generateColor() };
  });
  renderOverlayEditUser(items, id);
}

/**Renders assigned user chips in the edit overlay.*/
function renderOverlayEditUser(items, id) {
  const box = document.getElementById('user-names-edit-overlay');
  if (!box) return;
  let html = '';
  const n = Math.min(items.length, 8);

  for (let i = 0; i < n; i++) {
    const it = items[i];
    const chipId = 'chip-' + safeIdFromName(it.shown);
    html += `
      <div class="assigned-user-chip" id="${chipId}">
        <div class="user-initials-overlay" style="background-color:${it.color}">
          <p>${it.initials}</p>
        </div>
        <button class="delete-user-button"
                title="Remove ${it.shown}"
                aria-label="Remove ${it.shown}"
                onclick="removeAssignedUser(decodeURIComponent('${encodeURIComponent(it.shown)}'), ${id})">×</button>
      </div>`;
  }
  if (items.length > 8) html += getMoreUserOverlayEdit(items.length - 8);
  box.innerHTML = html;
}

/**Removes an assigned user from a task. */
async function removeAssignedUser(displayName, id){
  const key = await findKey(id);
  const url = `${BASE_URL}/tasks/${key}.json`;
  const task = await fetch(url).then(r=>r.json()) || {};
  if (!Array.isArray(task.assignedTo)) task.assignedTo = [];

  const clean = cleanDisplayName(displayName);
  const [fn, ...rest] = clean.split(/\s+/);
  const ln = rest.join(' ');

  task.assignedTo = task.assignedTo.filter(u => !sameUser(u.firstName,u.lastName,fn,ln));
  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},
                   body: JSON.stringify({ assignedTo: task.assignedTo })});

  await refreshAssignedUI(id);
}
