// /** Paths for checked/unchecked user icons. */
// const CHECKED = './assets/icons/checked_icon.png';
// const UNCHECKED = './assets/icons/unchecked_icon.png';

// /** Safely converts any input (array/object/undefined) to an array. */
// function asArray(d) { return Array.isArray(d) ? d : Object.values(d || {}); };

// /** Normalizes subtasks to {title, status} array. */
// function normalizeSubtasks(subs) {
//   if (!subs) return [];
//   const list = Array.isArray(subs) ? subs : Object.values(subs);
//   return list.map(s => ({
//     title: (s.title ?? s.name ?? '').toString(),
//     status: s.status === 'done' ? 'done' : 'not done'
//   }));
// };

// /** Resolves task key from index or returns given key. */
// async function resolveKey(idOrKey) {
//   if (typeof idOrKey === 'string') return idOrKey;
//   return await findKey(idOrKey);
// };

// /** Builds uppercase initials from a full name. */
// function getInitials(name = '') {
//   return name.trim().split(/\s+/).slice(0, 2)
//     .map(p => p[0] || '').join('').toUpperCase();
// };

// /** Updates subtask progress bar in board cards. */
// function updateBoardSubtaskProgressUI(taskId, list) {
//   const total = list.length;
//   const done = list.filter(s => s.status === 'done').length;
//   const progress = total ? Math.round((done / total) * 100) : 0;
//   const el = document.getElementById('subtask-' + taskId);
//   if (el && typeof getSubtask === 'function') {
//     el.innerHTML = getSubtask(done, total, progress);
//   }
// };

// /** Ensures the toast element exists and returns it. */
// function getToastEl() {
//   let el = document.getElementById('subtask-toast');
//   if (el) return el;
//   el = document.createElement('div');
//   el.id = 'subtask-toast';
//   el.style.cssText =
//     'position:fixed;left:50%;bottom:20px;transform:translateX(-50%);' +
//     'background:#111;color:#fff;padding:10px 14px;border-radius:10px;z-index:10000;' +
//     'opacity:0;transition:opacity .2s;font-weight:600';
//   document.body.appendChild(el);
//   return el;
// };

// /** Shows a short toast with the subtask completion count. */
// function showSubtaskToast(done, total) {
//   const el = getToastEl();
//   el.textContent = `${done} of ${total} Subtasks Done!`;
//   requestAnimationFrame(() => el.style.opacity = '1');
//   clearTimeout(showSubtaskToast._t);
//   showSubtaskToast._t = setTimeout(() => el.style.opacity = '0', 1400);
// };

// let _fpInstance;
// /** Opens the edit overlay and initializes its content. */
// async function editTask(id, title, description, dueDate, priority) {
//   id--;
//   const box = document.getElementById('task-details');
//   box.innerHTML = getOverlayEdit(id, title, description, dueDate);
//   checkActivePriority(priority);
//   selectedUserEdit(id);
//   renderOverlayEditSubtasks(id);
//   await loadContacts(id);
//   initDate(dueDate);
//   const task = await loadTaskWithID(id);
//   renderEditFile(task);
//   initSubtaskEdit(id);
// };

// /** Initializes the date picker with optional default date (ISO). */
// function initDate(dueDateISO) {
//   const input = document.getElementById('due-date-input');
//   const btn   = document.getElementById('calendar-icon');
//   if (!input || !btn) return;
//   if (input._fpInstance) { input._fpInstance.destroy(); input._fpInstance = null; }

//   const today = new Date(); today.setHours(0,0,0,0);
//   input._fpInstance = flatpickr(input, {
//     disableMobile: true,        
//     allowInput: true,
//     dateFormat: 'Y-m-d',        
//     altInput: true,             
//     altFormat: 'd/m/Y',         
//     minDate: today,
//     defaultDate: (dueDateISO || '').slice(0,10) || null});

//   btn.onclick = () => input._fpInstance && input._fpInstance.open();
// }

// /** Highlights the active priority option in the UI. */
// function checkActivePriority(priority) {
//   const map = { Urgent: ['urgent', '#FF3D00'], Medium: ['medium', '#FFA800'], Low: ['low', '#7AE229'] };
//   ['urgent', 'medium', 'low'].forEach(p => {
//     document.getElementById(p + '-label').style.backgroundColor = '#FFFFFF';
//     document.getElementById(p + '-text').style.color = '#000';
//     document.getElementById(p + '-icon').src = `./assets/icons/${p}_icon.png`;
//   });
//   const [k, col] = map[priority] || ['medium', '#FFA800'];
//   document.getElementById(k + '-label').style.backgroundColor = col;
//   document.getElementById(k + '-text').style.color = '#FFFFFF';
//   document.getElementById(k + '-icon').src = `./assets/icons/${k}_icon_active.png`;
//   activePriority = priority;
// };

// /** Changes priority and delegates highlight update. */
// function changePriority(newPriority) {
//   ['urgent', 'medium', 'low'].forEach(p => {
//     document.getElementById(p + '-label').style.backgroundColor = '#FFFFFF';
//     document.getElementById(p + '-text').style.color = '#000';
//     document.getElementById(p + '-icon').src = `./assets/icons/${p}_icon.png`;
//   });
//   checkActivePriority(newPriority);
// };

// /** Saves changes of edit overlay to Firebase. */
// async function saveEdit(id) {
//   id = await findKey(id);
//   const url = `${BASE_URL}/tasks/${id}.json`;
//   const cur = await loadTaskWithID(id);
//   const ch = generateChangeTask({ ...cur });
//   const p = {};
//   if (ch.title !== cur.title) p.title = ch.title;
//   if (ch.description !== cur.description) p.description = ch.description;
//   if (ch.dueDate !== cur.dueDate) p.dueDate = ch.dueDate;
//   if (ch.prio !== cur.prio) p.prio = ch.prio;
//   if (Object.keys(p).length) await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
//   showEditConfirm('Changes saved'); closeOverlay(); loadTasks();
// };

// /** Creates the confirmation overlay element. */
// function createConfirmOverlay(msg) {
//   const o = document.createElement('div');
//   o.id = 'edit-confirm-overlay';
//   o.style.cssText =
//     'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;' +
//     'background:rgba(0,0,0,.35);z-index:9999;opacity:0;transition:opacity .2s ease';
//   o.innerHTML =
//     `<div style="background:#111;color:#fff;padding:18px 20px;border-radius:12px;display:flex;gap:12px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.3)">
//       <div style="width:32px;height:32px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center">
//         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
//       </div><span style="font-weight:600">${msg}</span></div>`;
//   return o;
// };

// /** Shows a temporary confirmation overlay. */
// function showEditConfirm(msg) {
//   const o = createConfirmOverlay(msg);
//   document.body.appendChild(o);
//   requestAnimationFrame(() => { o.style.opacity = '1'; });
//   setTimeout(() => { o.style.opacity = '0'; setTimeout(() => o.remove(), 200); }, 1400);
// };

// /** Builds new task fields from current overlay inputs. */
// function generateChangeTask(responseJson) {
//   const t = document.getElementById('overlay-title').value;
//   const d = document.getElementById('overlay-description').value;
//   const due = document.getElementById('due-date-input').value.trim();
//   if (t) responseJson.title = t;
//   if (d) responseJson.description = d;
//   if (due) responseJson.dueDate = /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : convertDateFormat(due);
//   responseJson.prio = activePriorityButton();
//   return responseJson;
// };

// /** Returns the active priority by reading label background colors. */
// function activePriorityButton() {
//   const bg = id => window.getComputedStyle(document.getElementById(id)).getPropertyValue('background-color');
//   if (bg('low-label') === 'rgb(122, 226, 41)') return 'Low';
//   if (bg('medium-label') === 'rgb(255, 168, 0)') return 'Medium';
//   if (bg('urgent-label') === 'rgb(255, 61, 0)') return 'Urgent';
//   return 'Medium';
// };

// /** Simple cache container for contacts data. */
// let _contactsCache = null;

// /** Canonicalizes display name strings for comparisons. */
// function canon(s) { return (s || '').toLowerCase().replace(/\s*\(you\)\s*$/, '').trim(); };

// /** Removes "(You)" suffix from a display name. */
// function cleanDisplayName(n) { return (n || '').replace(/\s*\(You\)\s*$/, '').trim(); };

// /** Compares two names (first+last) in a canonical form. */
// function sameUser(aFN, aLN, bFN, bLN) { return canon(`${aFN} ${aLN}`) === canon(`${bFN} ${bLN}`); };

// /** Returns a safe DOM id derived from a name. */
// function safeIdFromName(name) { return 'contact-row-' + encodeURIComponent(name); };

// /** Returns display label for UI (kept as name). */
// function displayForUI(name, email) { return name; };

// /** Toggles subtask status and persists changes. */
// async function changeStatusSubtask(displayId, subIndex, status) {
//   const key = await findKey(displayId - 1);
//   const url = `${BASE_URL}/tasks/${key}.json`;
//   const task = await fetch(url).then(r => r.json()) || {};
//   const subs = normalizeSubtasks(task.subtasks);
//   const nowDone = status !== 'done';
//   if (subs[subIndex]) subs[subIndex].status = nowDone ? 'done' : 'not done';
//   await applySubtaskStatus(key, task, subs, url);
// };

// /** Applies updated subtask list to Firebase and refreshes UI. */
// async function applySubtaskStatus(key, task, subs, url) {
//   await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subtasks: subs }) });
//   await renderOverlayEditSubtasks(key);
//   if (document.getElementById('subtasks-overlay') && typeof renderOverlaySubtasks === 'function') {
//     renderOverlaySubtasks({ id: task.id, subtasks: subs });
//   }
//   updateBoardSubtaskProgressUI(task.id, subs);
//   const done = subs.filter(s => s.status === 'done').length;
//   showSubtaskToast(done, subs.length);
// };

// /** Toggles the assigned-to dropdown in edit overlay. */
// function openDropdownAssigned() {
//   const dd = document.getElementById('selected-user-dropdown');
//   const arr = document.getElementById('arrow-dropdown');
//   const box = document.getElementById('user-names-edit-overlay');
//   if (!dd || !arr || !box) return;
//   const open = dd.className === 'd-none';
//   dd.classList.toggle('d-none', !open);
//   dd.classList.toggle('d_block', open);
//   arr.src = open ? './assets/icons/arrow_drop_down_top.png' : './assets/icons/arrow_drop_down.png';
//   box.classList.toggle('d-none', open);
// };

// /** Closes user dropdown when clicking outside of it. */
// document.addEventListener('DOMContentLoaded', () => {
//   document.addEventListener('click', (e) => {
//     const dd = document.getElementById('selected-user-dropdown');
//     const btn = document.getElementById('assigned-container');
//     const arr = document.getElementById('arrow-dropdown');
//     const box = document.getElementById('user-names-edit-overlay');
//     if (dd && btn && arr && box && !dd.contains(e.target) && !btn.contains(e.target)) {
//       dd.classList.add('d-none'); dd.classList.remove('d_block');
//       arr.src = './assets/icons/arrow_drop_down.png';
//       box.classList.remove('d-none');
//     }
//   });
// });

// /** Switches the subtask input area between + and icons. */
// function editMode(id) {
//   const c = document.getElementById('create-subtask-overlay');
//   const add = document.getElementById('add-subtask-overlay-edit')
//     .getAttribute('src') === "./assets/icons/add_subtask.png";
//   c.innerHTML = add ? getSubtaskOverlayIcons(id) : getSubtaskOverlayAddIcon();
// };

// /** Creates a new subtask from the edit overlay field. */
// async function createSubtaskOverlay(idOrKey) {
//   const input = document.getElementById('subtask-edit');
//   const title = (input?.value || '').trim();
//   const key = await resolveKey(idOrKey);
//   if (!title) { renderOverlayEditSubtasks(key); return clearSubtaskInput(); }
//   await saveNewSubtask(key, title);
// };

// /** Saves a new subtask and refreshes progress and list. */
// async function saveNewSubtask(key, title) {
//   const url = `${BASE_URL}/tasks/${key}.json`;
//   const task = await fetch(url).then(r => r.json()) || {};
//   const subs = normalizeSubtasks(task.subtasks);
//   subs.push({ title, status: 'not done' });
//   await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subtasks: subs }) });
//   clearSubtaskInput();
//   await renderOverlayEditSubtasks(key);
//   updateBoardSubtaskProgressUI(task.id, subs);
//   showSubtaskToast(subs.filter(s => s.status === 'done').length, subs.length);
// };

// /** Clears the subtask input field value. */
// function clearSubtaskInput() {
//   const i = document.getElementById('subtask-edit');
//   if (i) i.value = "";
// };

// /** Renders all subtasks into the edit overlay list. */
// async function renderOverlayEditSubtasks(id) {
//   const t = await loadTaskWithID(id);
//   const box = document.getElementById('subtasks-overlay-edit');
//   if (!box) return;
//   if (!Array.isArray(t.subtasks)) { box.innerHTML = ''; return; }
//   let html = '';
//   for (let i = 0; i < t.subtasks.length; i++) {
//     html += getSubtasksOverlayEdit(t.subtasks[i].title, id, i);
//   }
//   box.innerHTML = html;
// };

// /** Switches a subtask row into inline edit mode. */
// async function editSubtask(id, subtask) {
//   const t = await loadTaskWithID(id);
//   const i = findSubtask(t, subtask);
//   if (i != null) {
//     document.getElementById('list-' + i).innerHTML =
//       getSubtasksOverlayEditInput(t.subtasks[i].title, id);
//     const input = document.getElementById('change-subtask-input');
//     if (input) {
//       input.dataset.taskKey = id;
//       input.dataset.oldTitle = t.subtasks[i].title;
//       input.focus();
//     }
//   }
// };

// /** Deletes a subtask from a task and updates UI. */
// async function deleteSubtask(idOrKey, subtaskName) {
//   const key = await resolveKey(idOrKey);
//   const url = `${BASE_URL}/tasks/${key}.json`;
//   const task = await fetch(url).then(r => r.json()) || {};
//   const subs = normalizeSubtasks(task.subtasks);
//   const i = subs.findIndex(s => s.title === subtaskName);
//   if (i !== -1) subs.splice(i, 1);
//   await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subtasks: subs }) });
//   await renderOverlayEditSubtasks(key);
//   updateBoardSubtaskProgressUI(task.id, subs);
//   showSubtaskToast(subs.filter(s => s.status === 'done').length, subs.length);
// };

// /** Finds subtask index by title on a task object. */
// function findSubtask(task, subtask) {
//   if (!Array.isArray(task.subtasks)) return -1;
//   for (let i = 0; i < task.subtasks.length; i++) {
//     if (task.subtasks[i].title === subtask) return i;
//   }
//   return -1;
// };

// /** Saves edited subtask title after validation. */
// async function saveEditSubtask(idOrKey, oldTitle) {
//   const key = await resolveKey(idOrKey);
//   const input = document.getElementById('change-subtask-input');
//   const val = (input?.value || '').trim();
//   if (!val) {
//     document.getElementById('warn-emptyinput-container').innerHTML = getWarningEmptyInput();
//     return;
//   }
//   await updateSubtaskTitle(key, oldTitle, val);
// };

// /** Updates a subtask title in Firebase and refreshes UI. */
// async function updateSubtaskTitle(key, oldTitle, newTitle) {
//   const url = `${BASE_URL}/tasks/${key}.json`;
//   const task = await fetch(url).then(r => r.json()) || {};
//   const subs = normalizeSubtasks(task.subtasks);
//   const i = subs.findIndex(s => s.title === oldTitle);
//   if (i !== -1) subs[i].title = newTitle;
//   await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subtasks: subs }) });
//   await renderOverlayEditSubtasks(key);
//   updateBoardSubtaskProgressUI(task.id, subs);
// };

// /** Saves edited subtask on Enter in the inline field. */
// document.addEventListener('keydown', e => {
//   if (e.key === 'Enter' && document.activeElement.id === 'change-subtask-input') {
//     const el = document.getElementById('change-subtask-input');
//     const idOrKey = el?.dataset.taskKey;
//     const oldTitle = el?.dataset.oldTitle;
//     if (idOrKey && oldTitle) saveEditSubtask(idOrKey, oldTitle);
//   }
// });

// /** Handles subtask input events wiring for edit overlay. */
// function initSubtaskEdit(id) {
//   const input = document.getElementById('subtask-edit');
//   const btn = document.getElementById('add-subtask-overlay-edit');
//   if (!input || !btn) return;
//   btn.onclick = () => { switchToIcons(id); input.focus(); };
//   input.addEventListener('input', () => { input.value.trim() ? switchToIcons(id) : resetToPlus(); });
//   input.addEventListener('keydown', async e => {
//     if (e.key !== 'Enter') return;
//     e.preventDefault(); await createSubtaskOverlay(id); resetToPlus(); input.value = '';
//   });
// };

// /** Switches subtask area to confirm/cancel icons. */
// function switchToIcons(id) {
//   const c = document.getElementById('create-subtask-overlay');
//   if (c.innerHTML.includes('add_subtask.png')) c.innerHTML = getSubtaskOverlayIcons(id);
// };

// /** Restores the '+' add-subtask button UI. */
// function resetToPlus() {
//   document.getElementById('create-subtask-overlay').innerHTML = getSubtaskOverlayAddIcon();
// };


/** Paths for checked/unchecked user icons. */
const CHECKED = './assets/icons/checked_icon.png';
const UNCHECKED = './assets/icons/unchecked_icon.png';

/** Session-Änderungsmarker (Subtasks/Overlay) */
let _sessionChanged = false;

/** Trim & Mehrfachspaces -> 1 Space */
function _s(v){ return (v||'').replace(/\s+/g,' ').trim(); }

/** Safely converts any input (array/object/undefined) to an array. */
function asArray(d){ return Array.isArray(d)?d:Object.values(d||{}); };

/** Normalizes subtasks to {title, status} array. */
function normalizeSubtasks(subs){
  if(!subs) return [];
  const list = Array.isArray(subs)?subs:Object.values(subs);
  return list.map(s=>({ title:(s.title??s.name??'').toString(), status:s.status==='done'?'done':'not done' }));
};

/** Resolves task key from index or returns given key. */
async function resolveKey(idOrKey){ if(typeof idOrKey==='string') return idOrKey; return await findKey(idOrKey); };

/** Builds uppercase initials from a full name. */
function getInitials(name=''){ return name.trim().split(/\s+/).slice(0,2).map(p=>p[0]||'').join('').toUpperCase(); };

/** Updates subtask progress bar in board cards. */
function updateBoardSubtaskProgressUI(taskId,list){
  const total=list.length, done=list.filter(s=>s.status==='done').length;
  const progress=total?Math.round((done/total)*100):0, el=document.getElementById('subtask-'+taskId);
  if(el && typeof getSubtask==='function') el.innerHTML=getSubtask(done,total,progress);
};

/** Ensures the toast element exists and returns it. */
function getToastEl(){
  let el=document.getElementById('subtask-toast'); if(el) return el;
  el=document.createElement('div'); el.id='subtask-toast';
  el.style.cssText='position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:#111;color:#fff;padding:10px 14px;border-radius:10px;z-index:10000;opacity:0;transition:opacity .2s;font-weight:600';
  document.body.appendChild(el); return el;
};

/** Shows a short toast with the subtask completion count. */
function showSubtaskToast(done,total){
  const el=getToastEl(); el.textContent=`${done} of ${total} Subtasks Done!`;
  requestAnimationFrame(()=>el.style.opacity='1'); clearTimeout(showSubtaskToast._t);
  showSubtaskToast._t=setTimeout(()=>el.style.opacity='0',1400);
};

let _fpInstance;
/** Opens the edit overlay and initializes its content. */
async function editTask(id,title,description,dueDate,priority){
  _sessionChanged=false;
  id--; const box=document.getElementById('task-details');
  box.innerHTML=getOverlayEdit(id,title,description,dueDate);
  checkActivePriority(priority); selectedUserEdit(id); renderOverlayEditSubtasks(id);
  await loadContacts(id); initDate(dueDate); const task=await loadTaskWithID(id);
  renderEditFile(task); initSubtaskEdit(id);
};

/** Initializes the date picker with optional default date (ISO). */
function initDate(dueDateISO){
  const input=document.getElementById('due-date-input'), btn=document.getElementById('calendar-icon');
  if(!input||!btn) return; if(input._fpInstance){ input._fpInstance.destroy(); input._fpInstance=null; }
  const today=new Date(); today.setHours(0,0,0,0);
  input._fpInstance=flatpickr(input,{disableMobile:true,allowInput:true,dateFormat:'Y-m-d',altInput:true,altFormat:'d/m/Y',minDate:today,defaultDate:(dueDateISO||'').slice(0,10)||null});
  btn.onclick=()=>input._fpInstance && input._fpInstance.open();
}

/** Highlights the active priority option in the UI. */
function checkActivePriority(priority){
  const map={Urgent:['urgent','#FF3D00'],Medium:['medium','#FFA800'],Low:['low','#7AE229']};
  ['urgent','medium','low'].forEach(p=>{document.getElementById(p+'-label').style.backgroundColor='#FFFFFF';
    document.getElementById(p+'-text').style.color='#000'; document.getElementById(p+'-icon').src=`./assets/icons/${p}_icon.png`;});
  const [k,col]=map[priority]||['medium','#FFA800']; document.getElementById(k+'-label').style.backgroundColor=col;
  document.getElementById(k+'-text').style.color='#FFFFFF'; document.getElementById(k+'-icon').src=`./assets/icons/${k}_icon_active.png`;
  activePriority=priority;
};

/** Changes priority and delegates highlight update. */
function changePriority(newPriority){
  ['urgent','medium','low'].forEach(p=>{document.getElementById(p+'-label').style.backgroundColor='#FFFFFF';
    document.getElementById(p+'-text').style.color='#000'; document.getElementById(p+'-icon').src=`./assets/icons/${p}_icon.png`;});
  checkActivePriority(newPriority);
};

/** Creates the confirmation overlay element (ok | x | warn). */
function createConfirmOverlay(msg,type='ok'){
  const ok=type==='ok', warn=type==='warn';
  const bg= ok?'#22c55e':(warn?'#f59e0b':'#ef4444');
  const icon = ok ? '<polyline points="20 6 9 17 4 12"/>'
    : warn ? '<line x1="12" y1="5" x2="12" y2="13"/><circle cx="12" cy="17" r="1.5"/>'
           : '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
  const o=document.createElement('div'); o.id='edit-confirm-overlay';
  o.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);z-index:9999;opacity:0;transition:opacity .2s ease';
  o.innerHTML=`<div style="background:#111;color:#fff;padding:18px 20px;border-radius:12px;display:flex;gap:12px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.3)">
  <div style="width:32px;height:32px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
  </div><span style="font-weight:600">${msg}</span></div>`; return o;
};

/** Shows a temporary confirmation overlay. */
function showEditConfirm(msg,type='ok'){
  const o=createConfirmOverlay(msg,type); document.body.appendChild(o);
  requestAnimationFrame(()=>{o.style.opacity='1'}); setTimeout(()=>{o.style.opacity='0'; setTimeout(()=>o.remove(),200);},1400);
};

/** Builds new task fields from current overlay inputs. */
function generateChangeTask(responseJson){
  const t=_s(document.getElementById('overlay-title').value);
  const d=_s(document.getElementById('overlay-description').value);
  const raw=_s(document.getElementById('due-date-input').value), due=raw?(/^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:convertDateFormat(raw)):'';
  if(t) responseJson.title=t; if(d) responseJson.description=d; if(due) responseJson.dueDate=due;
  responseJson.prio=activePriorityButton(); return responseJson;
};

/** Returns the active priority by reading label background colors. */
function activePriorityButton(){
  const bg=id=>window.getComputedStyle(document.getElementById(id)).getPropertyValue('background-color');
  if(bg('low-label')==='rgb(122, 226, 41)') return 'Low';
  if(bg('medium-label')==='rgb(255, 168, 0)') return 'Medium';
  if(bg('urgent-label')==='rgb(255, 61, 0)') return 'Urgent';
  return 'Medium';
};

let _contactsCache=null; function canon(s){return (s||'').toLowerCase().replace(/\s*\(you\)\s*$/,'').trim();};
function cleanDisplayName(n){return (n||'').replace(/\s*\(You\)\s*$/,'').trim();};
function sameUser(aFN,aLN,bFN,bLN){return canon(`${aFN} ${aLN}`)===canon(`${bFN} ${bLN}`);};
function safeIdFromName(name){return 'contact-row-'+encodeURIComponent(name);};
function displayForUI(name,email){return name;};

/** Saves changes of edit overlay to Firebase (Subtasks zählen mit). */
async function saveEdit(id){
  if(document.getElementById('change-subtask-input')){
    showEditConfirm('Please change the subtask and confirm with Enter','warn'); return;
  }
  id=await findKey(id); const url=`${BASE_URL}/tasks/${id}.json`;
  const cur=await loadTaskWithID(id); const ch=generateChangeTask({...cur}); const p={}; const s=_s;
  if(s(ch.title)!==s(cur.title) && s(ch.title)) p.title=s(ch.title);
  if(s(ch.description)!==s(cur.description) && s(ch.description)) p.description=s(ch.description);
  if(s(ch.dueDate)!==s(cur.dueDate) && s(ch.dueDate)) p.dueDate=s(ch.dueDate);
  if(s(ch.prio)!==s(cur.prio) && s(ch.prio)) p.prio=s(ch.prio);

  if(Object.keys(p).length){
    await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    showEditConfirm('Changes saved','ok'); _sessionChanged=false; closeOverlay(); loadTasks(); return;
  }
  if(_sessionChanged){ showEditConfirm('Changes saved','ok'); _sessionChanged=false; closeOverlay(); loadTasks(); return; }
  showEditConfirm('Nothing changed – task closed','x'); closeOverlay();
};

/** Toggles subtask status and persists changes (silent). */
async function changeStatusSubtask(displayId,subIndex,status){
  const key=await findKey(displayId-1), url=`${BASE_URL}/tasks/${key}.json`;
  const task=await fetch(url).then(r=>r.json())||{}, subs=normalizeSubtasks(task.subtasks);
  const nowDone=status!=='done'; if(subs[subIndex]) subs[subIndex].status=nowDone?'done':'not done';
  _sessionChanged=true;
  await applySubtaskStatus(key,task,subs,url);
};

/** Applies updated subtask list to Firebase and refreshes UI (silent). */
async function applySubtaskStatus(key,task,subs,url){
  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({subtasks:subs})});
  await renderOverlayEditSubtasks(key);
  if(document.getElementById('subtasks-overlay') && typeof renderOverlaySubtasks==='function') renderOverlaySubtasks({id:task.id,subtasks:subs});
  updateBoardSubtaskProgressUI(task.id,subs);
  const done=subs.filter(s=>s.status==='done').length; showSubtaskToast(done,subs.length);
};

/** Toggles the assigned-to dropdown in edit overlay. */
function openDropdownAssigned(){
  const dd=document.getElementById('selected-user-dropdown'), arr=document.getElementById('arrow-dropdown'), box=document.getElementById('user-names-edit-overlay');
  if(!dd||!arr||!box) return; const open=dd.className==='d-none';
  dd.classList.toggle('d-none',!open); dd.classList.toggle('d_block',open);
  arr.src=open?'./assets/icons/arrow_drop_down_top.png':'./assets/icons/arrow_drop_down.png';
  box.classList.toggle('d-none',open);
};

/** Closes user dropdown when clicking outside of it. */
document.addEventListener('DOMContentLoaded',()=>{
  document.addEventListener('click',(e)=>{
    const dd=document.getElementById('selected-user-dropdown'), btn=document.getElementById('assigned-container'), arr=document.getElementById('arrow-dropdown'), box=document.getElementById('user-names-edit-overlay');
    if(dd&&btn&&arr&&box && !dd.contains(e.target) && !btn.contains(e.target)){ dd.classList.add('d-none'); dd.classList.remove('d_block'); arr.src='./assets/icons/arrow_drop_down.png'; box.classList.remove('d-none'); }
  });
});

/** Switches the subtask input area between + and icons. */
function editMode(id){
  const c=document.getElementById('create-subtask-overlay');
  const add=document.getElementById('add-subtask-overlay-edit').getAttribute('src')==="./assets/icons/add_subtask.png";
  c.innerHTML=add?getSubtaskOverlayIcons(id):getSubtaskOverlayAddIcon();
};

/** Creates a new subtask (Enter speichert still, leer => Warnung). */
async function createSubtaskOverlay(idOrKey){
  const input=document.getElementById('subtask-edit'), title=_s(input?.value||'');
  const key=await resolveKey(idOrKey);
  if(!title){ showEditConfirm('Please enter a subtask title','warn'); renderOverlayEditSubtasks(key); return clearSubtaskInput(); }
  await saveNewSubtask(key,title);
};

/** Saves a new subtask (silent, Session flag). */
async function saveNewSubtask(key,title){
  const url=`${BASE_URL}/tasks/${key}.json`, task=await fetch(url).then(r=>r.json())||{};
  const subs=normalizeSubtasks(task.subtasks); subs.push({title:_s(title),status:'not done'});
  _sessionChanged=true;
  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({subtasks:subs})});
  clearSubtaskInput(); await renderOverlayEditSubtasks(key); updateBoardSubtaskProgressUI(task.id,subs);
  showSubtaskToast(subs.filter(s=>s.status==='done').length,subs.length);
};

/** Clears the subtask input field value. */
function clearSubtaskInput(){ const i=document.getElementById('subtask-edit'); if(i) i.value=""; };

/** Renders all subtasks into the edit overlay list. */
async function renderOverlayEditSubtasks(id){
  const t=await loadTaskWithID(id), box=document.getElementById('subtasks-overlay-edit'); if(!box) return;
  if(!Array.isArray(t.subtasks)){ box.innerHTML=''; return; }
  let html=''; for(let i=0;i<t.subtasks.length;i++) html+=getSubtasksOverlayEdit(t.subtasks[i].title,id,i); box.innerHTML=html;
};

/** Switches a subtask row into inline edit mode. */
async function editSubtask(id,subtask){
  const t=await loadTaskWithID(id), i=findSubtask(t,subtask);
  if(i!=null){ document.getElementById('list-'+i).innerHTML=getSubtasksOverlayEditInput(t.subtasks[i].title,id);
    const input=document.getElementById('change-subtask-input'); if(input){ input.dataset.taskKey=id; input.dataset.oldTitle=t.subtasks[i].title; input.focus(); } }
};

/** Deletes a subtask (silent, Session flag). */
async function deleteSubtask(idOrKey,subtaskName){
  const key=await resolveKey(idOrKey), url=`${BASE_URL}/tasks/${key}.json`;
  const task=await fetch(url).then(r=>r.json())||{}, subs=normalizeSubtasks(task.subtasks);
  const i=subs.findIndex(s=>s.title===subtaskName); if(i!==-1) subs.splice(i,1);
  _sessionChanged=true;
  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({subtasks:subs})});
  await renderOverlayEditSubtasks(key); updateBoardSubtaskProgressUI(task.id,subs);
  showSubtaskToast(subs.filter(s=>s.status==='done').length,subs.length);
};

/** Finds subtask index by title on a task object. */
function findSubtask(task,subtask){
  if(!Array.isArray(task.subtasks)) return -1;
  for(let i=0;i<task.subtasks.length;i++) if(task.subtasks[i].title===subtask) return i;
  return -1;
};

/** Saves edited subtask title (Enter: leer => Warnung; gleich => X; sonst silent). */
async function saveEditSubtask(idOrKey,oldTitle){
  const key=await resolveKey(idOrKey), input=document.getElementById('change-subtask-input');
  const val=_s(input?.value||'');
  if(!val){ showEditConfirm('Please change the subtask','warn'); return; }
  if(val===_s(oldTitle)){ showEditConfirm('Nothing changed – task closed','x'); return; }
  await updateSubtaskTitle(key,oldTitle,val);
};

/** Updates a subtask title (silent, Session flag). */
async function updateSubtaskTitle(key,oldTitle,newTitle){
  const url=`${BASE_URL}/tasks/${key}.json`, task=await fetch(url).then(r=>r.json())||{};
  const subs=normalizeSubtasks(task.subtasks), i=subs.findIndex(s=>s.title===oldTitle);
  if(i!==-1) subs[i].title=_s(newTitle);
  _sessionChanged=true;
  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({subtasks:subs})});
  await renderOverlayEditSubtasks(key); updateBoardSubtaskProgressUI(task.id,subs);
};

/** Saves edited subtask on Enter in the inline field. */
document.addEventListener('keydown',e=>{
  if(e.key==='Enter' && document.activeElement.id==='change-subtask-input'){
    const el=document.getElementById('change-subtask-input'), idOrKey=el?.dataset.taskKey, oldTitle=el?.dataset.oldTitle;
    if(idOrKey && oldTitle) saveEditSubtask(idOrKey,oldTitle);
  }
});

/** Handles subtask input events wiring for edit overlay. */
function initSubtaskEdit(id){
  const input=document.getElementById('subtask-edit'), btn=document.getElementById('add-subtask-overlay-edit');
  if(!input||!btn) return; btn.onclick=()=>{switchToIcons(id); input.focus();};
  input.addEventListener('input',()=>{ input.value.trim()?switchToIcons(id):resetToPlus(); });
  input.addEventListener('keydown',async e=>{ if(e.key!=='Enter') return; e.preventDefault(); await createSubtaskOverlay(id); resetToPlus(); input.value=''; });
};

/** Switches subtask area to confirm/cancel icons. */
function switchToIcons(id){
  const c=document.getElementById('create-subtask-overlay'); if(c.innerHTML.includes('add_subtask.png')) c.innerHTML=getSubtaskOverlayIcons(id);
};

/** Restores the '+' add-subtask button UI. */
function resetToPlus(){ document.getElementById('create-subtask-overlay').innerHTML=getSubtaskOverlayAddIcon(); };

/* ===== markiere Upload-/User-Aktionen als Änderung ===== */
document.addEventListener('change', (e) => {
  if (e.target?.type === 'file') _sessionChanged = true;              // Upload hinzugefügt/geändert
});

document.addEventListener('click', (e) => {
  // Datei aus Liste/Preview entfernt
  if (e.target.closest('[data-file-delete], .file-delete, .remove-file')) _sessionChanged = true;

  // User ausgewählt/entfernt – deckt Liste, Chips, Toggles ab
  const userChanged = e.target.closest(
    '[data-contact-id], .contact-row, .user-row, .assigned-toggle,' +
    ' [data-name].selected-user-chip, #picked-user-avatar .remove, #picked-user-avatar .chip'
  );
  if (userChanged) _sessionChanged = true;
});
