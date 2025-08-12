

let _fpInstance;

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

function initDate(dueDateISO) {
  const input = document.getElementById('due-date-input');
  const btn   = document.getElementById('calendar-icon');
  if (!input || !btn) return;

  if (_fpInstance) { _fpInstance.destroy(); _fpInstance = null; }
  input.value = (dueDateISO || '').slice(0, 10); // "YYYY-MM-DD"

  _fpInstance = flatpickr(input, {
    minDate: 'today',
    dateFormat: 'Y-m-d',
    defaultDate: input.value || null,
    allowInput: true
  });

  btn.onclick = () => _fpInstance && _fpInstance.open();
}

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

function changePriority(newPriority) {
  ['urgent','medium','low'].forEach(p=>{
    document.getElementById(p+'-label').style.backgroundColor='#FFFFFF';
    document.getElementById(p+'-text').style.color='#000';
    document.getElementById(p+'-icon').src=`./assets/icons/${p}_icon.png`;
  });
  checkActivePriority(newPriority);
}

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

function activePriorityButton() {
  const bg = id => window.getComputedStyle(document.getElementById(id)).getPropertyValue('background-color');
  if (bg('low-label')==='rgb(122, 226, 41)') return 'Low';
  if (bg('medium-label')==='rgb(255, 168, 0)') return 'Medium';
  if (bg('urgent-label')==='rgb(255, 61, 0)') return 'Urgent';
  return 'Medium';
}

/***** === ASSIGNED-TO: SINGLE SOURCE OF TRUTH (Firebase) === *****/
const CHECKED   = './assets/icons/checked_icon.png';
const UNCHECKED = './assets/icons/unchecked_icon.png';
let _contactsCache = null;

function canon(s){ return (s||'').toLowerCase().replace(/\s*\(you\)\s*$/,'').trim(); }
function cleanDisplayName(n){ return (n||'').replace(/\s*\(You\)\s*$/,'').trim(); }
function sameUser(aFN,aLN,bFN,bLN){ return canon(`${aFN} ${aLN}`) === canon(`${bFN} ${bLN}`); }
function safeIdFromName(name){ return 'contact-row-' + encodeURIComponent(name); }

function displayForUI(name, email){
  // Falls du "(You)" anzeigen willst, hier aktivieren:
  // if (email && loggedUser && email === loggedUser.email) return `${name} (You)`;
  return name;
}

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

async function refreshAssignedUI(id){
  const key  = await findKey(id);
  const task = await fetch(`${BASE_URL}/tasks/${key}.json`).then(r=>r.json()) || {};
  renderOverlayContacts(id, _contactsCache || [], task.assignedTo || []);
  selectedUserEdit(id);
}

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

  await refreshAssignedUI(id); // UI strikt nach Backend-Zustand setzen
}

/***** === AVATAR-CHIPS MIT "X" === *****/
async function selectedUserEdit(id) {
  const t = await loadTaskWithID(id);
  const items = (t.assignedTo || []).map(u => {
    const full  = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return { shown: full, initials: getInitials(full), color: u.color || generateColor() };
  });
  renderOverlayEditUser(items, id);
}

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

/***** === SUBTASKS & DROPDOWN OPEN/CLOSE ===*****/
async function changeStatusSubtask(id, subtaskId, status) {
  id--; id = await findKey(id);
  const newStatus = status==='done' ? 'not done' : 'done';
  await fetch(`${BASE_URL}/tasks/${id}/subtasks/${subtaskId}/status.json`,{
    method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(newStatus)
  });
  document.getElementById('subtasks-overlay').innerHTML = '';
  const t = await loadTaskWithID(id);
  renderOverlaySubtasks(t);
}

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


function editMode(id) {
  const c = document.getElementById('create-subtask-overlay');
  const add = document.getElementById('add-subtask-overlay-edit').getAttribute('src')==="./assets/icons/add_subtask.png";
  c.innerHTML = add ? getSubtaskOverlayIcons(id) : getSubtaskOverlayAddIcon();
}

async function createSubtaskOverlay(id) {
  const input = document.getElementById('subtask-edit'); const title = (input?.value||'').trim();
  const task = await loadTaskWithID(id);
  if (!title) { renderOverlayEditSubtasks(id); return clearSubtaskInput(); }
  const idx = (task.subtasks?.length||0);
  await fetch(`${BASE_URL}/tasks/${id}/subtasks/${idx}.json`,{
    method:'PUT',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({status:'not done',title})
  });
  renderOverlayEditSubtasks(id); clearSubtaskInput();
}

function clearSubtaskInput() { const i = document.getElementById('subtask-edit'); if (i) i.value = ""; }

async function renderOverlayEditSubtasks(id) {
  const t = await loadTaskWithID(id);
  const box = document.getElementById('subtasks-overlay-edit');
  if (!box) return;
  if (!Array.isArray(t.subtasks)) { box.innerHTML = ''; return; }
  let html=''; for (let i=0;i<t.subtasks.length;i++) html += getSubtasksOverlayEdit(t.subtasks[i].title, id, i);
  box.innerHTML = html;
}

async function editSubtask(id, subtask) {
  const t = await loadTaskWithID(id);
  const i = findSubtask(t, subtask);
  if (i!=null) document.getElementById('list-'+i).innerHTML = getSubtasksOverlayEditInput(t.subtasks[i].title, id);
}

async function deleteSubtask(taskId, subtaskName) {
  const t = await loadTaskWithID(taskId);
  const i = findSubtask(t, subtaskName);
  if (i!==-1) {
    t.subtasks.splice(i,1);
    await fetch(BASE_URL+"/tasks/"+taskId+".json",{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(t)});
  }
  renderOverlayEditSubtasks(taskId);
}

function findSubtask(task, subtask) {
  if (!Array.isArray(task.subtasks)) return -1;
  for (let i=0;i<task.subtasks.length;i++) if (task.subtasks[i].title===subtask) return i;
  return -1;
}

async function saveEditSubtask(id, subtask) {
  const t = await loadTaskWithID(id);
  const i = findSubtask(t, subtask);
  const val = document.getElementById('change-subtask-input').value.trim();
  if (!val) { document.getElementById('warn-emptyinput-container').innerHTML = getWarningEmptyInput(); return; }
  await fetch(`${BASE_URL}/tasks/${id}/subtasks/${i}.json`,{
    method:'PUT',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({status:'not done',title:val})
  });
  renderOverlayEditSubtasks(id);
}
