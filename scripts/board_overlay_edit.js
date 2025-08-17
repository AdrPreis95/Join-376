// --- helpers: einmalig einfügen ---
const CHECKED   = './assets/icons/checked_icon.png';
const UNCHECKED = './assets/icons/unchecked_icon.png';

function asArray(d){ return Array.isArray(d) ? d : Object.values(d||{}); }
function normalizeSubtasks(subs){
  if (!subs) return [];
  const list = Array.isArray(subs) ? subs : Object.values(subs);
  return list.map(s => ({
    title: (s.title ?? s.name ?? '').toString(),
    status: s.status === 'done' ? 'done' : 'not done'
  }));
}

/**Checks the Index of the Sutasks*/
async function resolveKey(idOrKey){
  if (typeof idOrKey === 'string') return idOrKey;
  return await findKey(idOrKey); 
}

/**Checks the initials and trims the firsat and last Name for the Avatar Icon Initials*/
function getInitials(name=''){
  return name.trim().split(/\s+/).slice(0,2).map(p=>p[0]||'').join('').toUpperCase();
}

/**updates the Board Subtask Progresses(checksa the length after every change and checkox click)*/
function updateBoardSubtaskProgressUI(taskId, list){
  const total = list.length;
  const done  = list.filter(s => s.status === 'done').length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  const el = document.getElementById('subtask-' + taskId);
  if (el && typeof getSubtask === 'function') el.innerHTML = getSubtask(done, total, progress);
}

/**shows the overlay for every done and not done sutask.*/
function showSubtaskToast(done, total){
  let el = document.getElementById('subtask-toast');
  if (!el){
    el = document.createElement('div');
    el.id = 'subtask-toast';
    el.style.cssText = 'position:fixed;left:50%;bottom:20px;transform:translateX(-50%);' +
      'background:#111;color:#fff;padding:10px 14px;border-radius:10px;z-index:10000;' +
      'opacity:0;transition:opacity .2s;font-weight:600';
    document.body.appendChild(el);
  }
  el.textContent = `${done} von ${total} Subtasks erledigt`;
  requestAnimationFrame(()=> el.style.opacity = '1');
  clearTimeout(showSubtaskToast._t);
  showSubtaskToast._t = setTimeout(()=> el.style.opacity = '0', 1400);
}


let _fpInstance;

/**Opens the edit overlay for a given task.*/
async function editTask(id, title, description, dueDate, priority) {
  id--;
  const box = document.getElementById('task-details');
  box.innerHTML = getOverlayEdit(id, title, description, dueDate);

  checkActivePriority(priority);
  selectedUserEdit(id);
  renderOverlayEditSubtasks(id);

  await loadContacts(id);  
  initDate(dueDate);       

  const task = await loadTaskWithID(id);
  renderEditFile(task);
}

/**Initializes the date picker with an optional default date.*/
function initDate(dueDateISO) {
  const input = document.getElementById('due-date-input');
  const btn   = document.getElementById('calendar-icon');
  if (!input || !btn) return;

  if (_fpInstance) { _fpInstance.destroy(); _fpInstance = null; }
  input.value = (dueDateISO || '').slice(0, 10);

  _fpInstance = flatpickr(input, {
    minDate: 'today',
    dateFormat: 'Y-m-d',
    defaultDate: input.value || null,
    allowInput: true
  });

  btn.onclick = () => _fpInstance && _fpInstance.open();
}

/**Highlights the active priority option. */
function checkActivePriority(priority) {
  const map = {Urgent:['urgent','#FF3D00'],Medium:['medium','#FFA800'],Low:['low','#7AE229']};
  ['urgent','medium','low'].forEach(p=>{
    document.getElementById(p+'-label').style.backgroundColor='#FFFFFF';
    document.getElementById(p+'-text').style.color='#000';
    document.getElementById(p+'-icon').src=`./assets/icons/${p}_icon.png`;
  });
  const [k,col] = map[priority] || ['medium','#FFA800'];
  document.getElementById(k+'-label').style.backgroundColor = col;
  document.getElementById(k+'-text').style.color = '#FFFFFF';
  document.getElementById(k+'-icon').src = `./assets/icons/${k}_icon_active.png`;
  activePriority = priority;
}

/**Changes the current priority and updates the UI. */
function changePriority(newPriority) {
  ['urgent','medium','low'].forEach(p=>{
    document.getElementById(p+'-label').style.backgroundColor='#FFFFFF';
    document.getElementById(p+'-text').style.color='#000';
    document.getElementById(p+'-icon').src=`./assets/icons/${p}_icon.png`;
  });
  checkActivePriority(newPriority);
}

/**Saves changes made to a task in edit mode. */
async function saveEdit(id) {
  id = await findKey(id);
  const url = `${BASE_URL}/tasks/${id}.json`;
  const cur = await loadTaskWithID(id);
  const ch  = generateChangeTask({...cur});

  const p = {};
  if (ch.title!==cur.title) p.title = ch.title;
  if (ch.description!==cur.description) p.description = ch.description;
  if (ch.dueDate!==cur.dueDate) p.dueDate = ch.dueDate;
  if (ch.prio!==cur.prio) p.prio = ch.prio;

  if (Object.keys(p).length) {
    await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
  }
  showEditConfirm('Changes saved');
  closeOverlay();
  loadTasks();
}

/**Shows a confirmation overlay for saved changes. */
function showEditConfirm(msg){
  const o=document.createElement('div');
  o.id='edit-confirm-overlay';
  o.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);z-index:9999;opacity:0;transition:opacity .2s ease';
  o.innerHTML=`<div style="background:#111;color:#fff;padding:18px 20px;border-radius:12px;display:flex;gap:12px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.3)">
    <div style="width:32px;height:32px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div><span style="font-weight:600">${msg}</span></div>`;
  document.body.appendChild(o);
  requestAnimationFrame(()=>{o.style.opacity='1';});
  setTimeout(()=>{ o.style.opacity='0'; setTimeout(()=>o.remove(),200); },1400);
}

/**Generates an updated task object from the edit overlay values. */
function generateChangeTask(responseJson) {
  const t   = document.getElementById('overlay-title').value;
  const d   = document.getElementById('overlay-description').value;
  const due = document.getElementById('due-date-input').value.trim();

  if (t) responseJson.title = t;
  if (d) responseJson.description = d;
  if (due) responseJson.dueDate = /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : convertDateFormat(due);
  responseJson.prio = activePriorityButton();
  return responseJson;
}

/**Returns the currently active priority from the UI.*/
function activePriorityButton() {
  const bg = id => window.getComputedStyle(document.getElementById(id)).getPropertyValue('background-color');
  if (bg('low-label')==='rgb(122, 226, 41)') return 'Low';
  if (bg('medium-label')==='rgb(255, 168, 0)') return 'Medium';
  if (bg('urgent-label')==='rgb(255, 61, 0)') return 'Urgent';
  return 'Medium';
}

// const CHECKED   = './assets/icons/checked_icon.png';
// const UNCHECKED = './assets/icons/unchecked_icon.png';
let _contactsCache = null;

/**Normalizes a string for comparison. */
function canon(s){ return (s||'').toLowerCase().replace(/\s*\(you\)\s*$/,'').trim(); }

/**Removes "(You)" from a display name. */
function cleanDisplayName(n){ return (n||'').replace(/\s*\(You\)\s*$/,'').trim(); }

/**Compares two user names for equality. */
function sameUser(aFN,aLN,bFN,bLN){ return canon(`${aFN} ${aLN}`) === canon(`${bFN} ${bLN}`); }

/**Generates a safe HTML id from a name. */
function safeIdFromName(name){ return 'contact-row-' + encodeURIComponent(name); }

/**Returns the display name for UI elements */
function displayForUI(name, email){
  return name;
}

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
    task.assignedTo.push({ firstName: fn, lastName: ln, color: generateColor() });
  }

  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},
                   body: JSON.stringify({ assignedTo: task.assignedTo })});
  await refreshAssignedUI(id);
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

/**Changes the status of a subtask between done and not done. */
async function changeStatusSubtask(displayId, subIndex, status) {
  const key = await findKey(displayId - 1);
  const url = `${BASE_URL}/tasks/${key}.json`;
  const task = await fetch(url).then(r=>r.json()) || {};
  const subs = normalizeSubtasks(task.subtasks);
  const nowDone = status !== 'done'; 
  if (subs[subIndex]) subs[subIndex].status = nowDone ? 'done' : 'not done';

  await fetch(url, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ subtasks: subs })});
  await renderOverlayEditSubtasks(key);

  if (document.getElementById('subtasks-overlay') && typeof renderOverlaySubtasks === 'function') {
    renderOverlaySubtasks({ id: task.id, subtasks: subs });
  }

  updateBoardSubtaskProgressUI(task.id, subs);
  const done = subs.filter(s=>s.status==='done').length;
  showSubtaskToast(done, subs.length);
}

/**Toggles the assigned-to dropdown visibility in the edit overlay. */
function openDropdownAssigned() {
  const dd  = document.getElementById('selected-user-dropdown');
  const arr = document.getElementById('arrow-dropdown');
  const box = document.getElementById('user-names-edit-overlay');
  if (!dd||!arr||!box) return;
  const open = dd.className==='d-none';
  dd.classList.toggle('d-none',!open);
  dd.classList.toggle('d_block',open);
  arr.src = open? './assets/icons/arrow_drop_down_top.png':'./assets/icons/arrow_drop_down.png';
  box.classList.toggle('d-none',open);
}

document.addEventListener('DOMContentLoaded',()=>{
  document.addEventListener('click',(e)=>{
    const dd=document.getElementById('selected-user-dropdown');
    const btn=document.getElementById('assigned-container');
    const arr=document.getElementById('arrow-dropdown');
    const box=document.getElementById('user-names-edit-overlay');
    if(dd&&btn&&arr&&box && !dd.contains(e.target) && !btn.contains(e.target)){
      dd.classList.add('d-none'); dd.classList.remove('d_block');
      arr.src='./assets/icons/arrow_drop_down.png'; box.classList.remove('d-none');
    }
  });
});

/**Toggles between subtask add mode and icon mode in the edit overlay. */
function editMode(id) {
  const c = document.getElementById('create-subtask-overlay');
  const add = document.getElementById('add-subtask-overlay-edit').getAttribute('src')==="./assets/icons/add_subtask.png";
  c.innerHTML = add ? getSubtaskOverlayIcons(id) : getSubtaskOverlayAddIcon();
}

/**Creates a new subtask from the edit overlay input. */
async function createSubtaskOverlay(idOrKey) {
  const input = document.getElementById('subtask-edit');
  const title = (input?.value || '').trim();
  const key = await resolveKey(idOrKey);
  if (!title) { renderOverlayEditSubtasks(key); return clearSubtaskInput(); }

  const url = `${BASE_URL}/tasks/${key}.json`;
  const task = await fetch(url).then(r=>r.json()) || {};
  const subs = normalizeSubtasks(task.subtasks);
  subs.push({ title, status: 'not done' });

  await fetch(url, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ subtasks: subs })});

  clearSubtaskInput();
  await renderOverlayEditSubtasks(key);
  updateBoardSubtaskProgressUI(task.id, subs);
  showSubtaskToast(subs.filter(s=>s.status==='done').length, subs.length);
}

/**Clears the subtask input field.*/
function clearSubtaskInput() { const i = document.getElementById('subtask-edit'); if (i) i.value = ""; }

/**Renders all subtasks for the edit overlay. */
async function renderOverlayEditSubtasks(id) {
  const t = await loadTaskWithID(id);
  const box = document.getElementById('subtasks-overlay-edit');
  if (!box) return;
  if (!Array.isArray(t.subtasks)) { box.innerHTML = ''; return; }
  let html=''; for (let i=0;i<t.subtasks.length;i++) html += getSubtasksOverlayEdit(t.subtasks[i].title, id, i);
  box.innerHTML = html;
}

/**Switches a subtask into edit mode in the overlay. */
async function editSubtask(id, subtask) {
  const t = await loadTaskWithID(id);
  const i = findSubtask(t, subtask);
  if (i!=null) document.getElementById('list-'+i).innerHTML = getSubtasksOverlayEditInput(t.subtasks[i].title, id);
}

/**Deletes a subtask from a task. */
async function deleteSubtask(idOrKey, subtaskName) {
  const key = await resolveKey(idOrKey);
  const url = `${BASE_URL}/tasks/${key}.json`;
  const task = await fetch(url).then(r=>r.json()) || {};
  const subs = normalizeSubtasks(task.subtasks);

  const i = subs.findIndex(s => s.title === subtaskName);
  if (i !== -1) subs.splice(i, 1);

  await fetch(url, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ subtasks: subs })});

  await renderOverlayEditSubtasks(key);
  updateBoardSubtaskProgressUI(task.id, subs);
  showSubtaskToast(subs.filter(s=>s.status==='done').length, subs.length);
}

/**Finds the index of a subtask in a task object. */
function findSubtask(task, subtask) {
  if (!Array.isArray(task.subtasks)) return -1;
  for (let i=0;i<task.subtasks.length;i++) if (task.subtasks[i].title===subtask) return i;
  return -1;
}

/**Saves changes to a subtask title.*/
async function saveEditSubtask(idOrKey, oldTitle) {
  const key = await resolveKey(idOrKey);
  const val = (document.getElementById('change-subtask-input')?.value || '').trim();
  if (!val) {
    document.getElementById('warn-emptyinput-container').innerHTML = getWarningEmptyInput();
    return;}

  const url = `${BASE_URL}/tasks/${key}.json`;
  const task = await fetch(url).then(r=>r.json()) || {};
  const subs = normalizeSubtasks(task.subtasks);

  const i = subs.findIndex(s => s.title === oldTitle);
  if (i !== -1) subs[i].title = val;

  await fetch(url, {
    method:'PATCH',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ subtasks: subs })});

  await renderOverlayEditSubtasks(key);
  updateBoardSubtaskProgressUI(task.id, subs);
}
window.editTask = editTask;
