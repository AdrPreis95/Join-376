let _fpInstance;

// async function editTask(id, title, description, dueDate, priority) {
//   id--; const box = document.getElementById('task-details');
//   box.innerHTML = getOverlayEdit(id, title, description, dueDate);
//   document.getElementById('due-date-input').defaultValue = dateFormatter(dueDate);
//   checkActivePriority(priority); selectedUserEdit(id); renderOverlayEditSubtasks(id);
//   loadContacts(id); activeFlatPickr(); const task = await loadTaskWithID(id);
//   renderEditFile(task);
// }
async function editTask(id, title, description, dueDate, priority) {
  id--;
  const box = document.getElementById('task-details');
  box.innerHTML = getOverlayEdit(id, title, description, dueDate);

  checkActivePriority(priority);
  selectedUserEdit(id);
  renderOverlayEditSubtasks(id);
  loadContacts(id);

  initDate(dueDate);                 
  const task = await loadTaskWithID(id);
  renderEditFile(task);
}



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


function checkActivePriority(priority) {
  const map = {Urgent:['urgent','#FF3D00'],Medium:['medium','#FFA800'],Low:['low','#7AE229']};
  ['urgent','medium','low'].forEach(p=>{document.getElementById(p+'-label').style.backgroundColor='#FFFFFF';
    document.getElementById(p+'-text').style.color='#000';
    document.getElementById(p+'-icon').src=`./assets/icons/${p}_icon.png`;});
  const [k,col] = map[priority] || ['medium','#FFA800'];
  document.getElementById(k+'-label').style.backgroundColor = col;
  document.getElementById(k+'-text').style.color = '#FFFFFF';
  document.getElementById(k+'-icon').src = `./assets/icons/${k}_icon_active.png`; activePriority = priority;
}

function changePriority(newPriority) {
  ['urgent','medium','low'].forEach(p=>{document.getElementById(p+'-label').style.backgroundColor='#FFFFFF';
    document.getElementById(p+'-text').style.color='#000';
    document.getElementById(p+'-icon').src=`./assets/icons/${p}_icon.png`;});
  checkActivePriority(newPriority);
}

async function saveEdit(id) {
  id = await findKey(id); const url = `${BASE_URL}/tasks/${id}.json`;
  const cur = await loadTaskWithID(id); const ch = generateChangeTask({...cur});
  const p = {}; if (ch.title!==cur.title) p.title = ch.title;
  if (ch.description!==cur.description) p.description = ch.description;
  if (ch.dueDate!==cur.dueDate) p.dueDate = ch.dueDate;
  if (ch.prio!==cur.prio) p.prio = ch.prio;
  if (Object.keys(p).length) await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
  showEditConfirm('Changes saved'); closeOverlay(); loadTasks();
}

function showEditConfirm(msg){
  const o=document.createElement('div');
  o.id='edit-confirm-overlay';
  o.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);z-index:9999;opacity:0;transition:opacity .2s ease';
  o.innerHTML=`<div style="background:#111;color:#fff;padding:18px 20px;border-radius:12px;display:flex;gap:12px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.3)">
    <div style="width:32px;height:32px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div><span style="font-weight:600">${msg}</span></div>`;
  document.body.appendChild(o); requestAnimationFrame(()=>{o.style.opacity='1';});
  setTimeout(()=>{ o.style.opacity='0'; setTimeout(()=>o.remove(),200); },1400);
}



function generateChangeTask(responseJson) {
  const t = document.getElementById('overlay-title').value;
  const d = document.getElementById('overlay-description').value;
  const due = document.getElementById('due-date-input').value.trim();

  if (t) responseJson.title = t;
  if (d) responseJson.description = d;
  if (due) {
    responseJson.dueDate = /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : convertDateFormat(due);
  }
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

async function loadContacts(id) {
  const me = {email: loggedUser.email, id:0, name: `${loggedUser.name} (You)`, phone:'000000'};
  const active = await loadActiveUser(id);
  const res = await fetch(BASE_URL + "/contacts.json"); const json = await res.json();
  const contacts = Array.isArray(json)? json : Object.values(json||{});
  const idx = checkActiveUser(active, contacts).sort(); contacts.unshift(me);
  renderOverlayContacts(id, contacts, idx);
}

function safeIdFromName(name) {
  return 'contact-row-' + encodeURIComponent(name);
}

function renderOverlayContacts(id, responseJson, activeUserIndex) {
  const set = new Set(activeUserIndex.map(i => i + 1));
  let html = '';

  for (let i = 0; i < responseJson.length; i++) {
    const c = responseJson[i];
    const pos = c.name.indexOf(' ');
    const isActive = set.has(i);
    const icon = isActive ? './assets/icons/checked_icon.png' : './assets/icons/unchecked_icon.png';

    const rowId = safeIdFromName(c.name);
    const selectedClass = isActive ? ' selected' : '';
    html += `
      <div id="${rowId}" class="user-container${selectedClass}">
        ${getContactName(id, c.name, generateColor(), c.name[0], c.name[pos + 1] || '', icon)}
      </div>
    `;
  }

  document.getElementById('user-dropdown').innerHTML = html;
}
function isCheckedIcon(src) {
  return src && src.indexOf('checked_icon.png') > -1;
}

async function toggleAssignedTo(name, id) {
  const taskRefUrl = `${BASE_URL}/tasks/${id}.json`;
  const task = await loadTaskWithID(id);
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ');

  updateAssignedTo(task, firstName, lastName);
  await updateTaskInFirebase(taskRefUrl, { assignedTo: task.assignedTo });

  
  const ref = document.getElementById('checkbox-contact-' + name);
  toggleIcon(ref, './assets/icons/checked_icon.png', './assets/icons/unchecked_icon.png');

  
  const rowId = safeIdFromName(name);
  const row = document.getElementById(rowId);
  if (row && ref) {
    const nowChecked = isCheckedIcon(ref.getAttribute('src'));
    row.classList.toggle('selected', nowChecked);
  }

  
  document.getElementById('user-names-edit-overlay').innerHTML = '';
  selectedUserEdit(id);
}


async function loadActiveUser(id) {
  const task = await loadTaskWithID(id); const arr = [];
  if (Array.isArray(task.assignedTo)) task.assignedTo.forEach(u=>arr.push(`${u.firstName||''} ${u.lastName||''}`.trim()));
  return arr;
}

function checkActiveUser(activeUser, responseJson) {
  const names = responseJson.map(c=>c.name), idx=[];
  activeUser.forEach(n=>{ const i=names.indexOf(n); if(i>-1) idx.push(i);}); return idx;
}

function updateAssignedTo(task, firstName, lastName) {
  if (!Array.isArray(task.assignedTo)) task.assignedTo = [];
  const i = task.assignedTo.findIndex(u=>u.firstName===firstName && u.lastName===lastName);
  if (i===-1) task.assignedTo.push({firstName,lastName,color:generateColor()}); else task.assignedTo.splice(i,1);
}

async function updateTaskInFirebase(taskRefUrl, updatedField) {
  try {
    const cur = await fetch(taskRefUrl).then(r=>r.json()); if (!cur) return;
    await fetch(taskRefUrl,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(updatedField)});
  } catch(e){ console.error('Fehler beim Aktualisieren der Aufgabe:', e); }
}

function toggleIcon(contactRef, checkedIcon, uncheckedIcon) {
  const isChecked = contactRef.getAttribute('src') === checkedIcon;
  contactRef.setAttribute('src', isChecked ? uncheckedIcon : checkedIcon);
}

function isCheckedIconSrc(src) {
  return src && src.indexOf('checked_icon.png') !== -1;
}


const list = document.getElementById('user-dropdown');
if (list && !list._rowClickBound) {
  list.addEventListener('click', (e) => {
    const row = e.target.closest('.user-container');
    if (!row) return;
    if (e.target.closest('img[id^="checkbox-contact-"]')) return;
    const icon = row.querySelector('img[id^="checkbox-contact-"]');
    if (icon) icon.click();
  });
  list._rowClickBound = true;
}

async function toggleAssignedTo(name, id) {
  const taskRefUrl = `${BASE_URL}/tasks/${id}.json`;
  const task = await loadTaskWithID(id);
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.join(' ');

  updateAssignedTo(task, firstName, lastName);
  await updateTaskInFirebase(taskRefUrl, { assignedTo: task.assignedTo });
  const ref = document.getElementById('checkbox-contact-' + name);
  if (ref) toggleIcon(ref, './assets/icons/checked_icon.png', './assets/icons/unchecked_icon.png');
  const row = ref?.closest('.user-container');
  if (row) {
    const isSelected = task.assignedTo?.some(u => u.firstName === firstName && u.lastName === lastName);
    row.classList.toggle('selected', !!isSelected);
  }

  const box = document.getElementById('user-names-edit-overlay');
  if (box) box.innerHTML = '';
  selectedUserEdit(id);
}


async function changeStatusSubtask(id, subtaskId, status) {
  id--; id = await findKey(id);
  const newStatus = status==='done' ? 'not done' : 'done';
  await fetch(`${BASE_URL}/tasks/${id}/subtasks/${subtaskId}/status.json`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(newStatus)});
  document.getElementById('subtasks-overlay').innerHTML = '';
  const t = await loadTaskWithID(id); renderOverlaySubtasks(t);
}

function openDropdownAssigned() {
  const dd = document.getElementById('selected-user-dropdown');
  const arr = document.getElementById('arrow-dropdown');
  const box = document.getElementById('user-names-edit-overlay'); if (!dd||!arr||!box) return;
  const open = dd.className==='d-none'; dd.classList.toggle('d-none',!open);
  dd.classList.toggle('d_block',open); arr.src = open? './assets/icons/arrow_drop_down_top.png':'./assets/icons/arrow_drop_down.png';
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

async function selectedUserEdit(id) {
  const t = await loadTaskWithID(id); const init=[], colors=[];
  (t.assignedTo||[]).forEach(u=>{ const n=`${u.firstName||''} ${u.lastName||''}`.trim(); init.push(getInitials(n)); colors.push(u.color);});
  renderOverlayEditUser(init, colors);
}

function renderOverlayEditUser(usersFirstLetters, colors) {
  const box = document.getElementById('user-names-edit-overlay'); if (!box) return; let html='';
  const n = Math.min(usersFirstLetters.length,8);
  for (let i=0;i<n;i++) html += getUserInititalsOverlayEdit(colors[i], usersFirstLetters[i]);
  if (usersFirstLetters.length>8) html += getMoreUserOverlayEdit(usersFirstLetters.length-8);
  box.innerHTML = html;
}

function editMode(id) {
  const c = document.getElementById('create-subtask-overlay');
  const add = document.getElementById('add-subtask-overlay-edit').getAttribute('src')==="./assets/icons/add_subtask.png";
  c.innerHTML = add ? getSubtaskOverlayIcons(id) : getSubtaskOverlayAddIcon();
}

async function createSubtaskOverlay(id) {
  const input = document.getElementById('subtask-edit'); const title = (input?.value||'').trim();
  const task = await loadTaskWithID(id); if (!title) { return renderOverlayEditSubtasks(id), clearSubtaskInput(); }
  const idx = (task.subtasks?.length||0);
  await fetch(`${BASE_URL}/tasks/${id}/subtasks/${idx}.json`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'not done',title})});
  renderOverlayEditSubtasks(id); clearSubtaskInput();
}

function clearSubtaskInput() { const i = document.getElementById('subtask-edit'); if (i) i.value = ""; }

async function renderOverlayEditSubtasks(id) {
  const t = await loadTaskWithID(id); const box = document.getElementById('subtasks-overlay-edit'); if (!box) return;
  if (!Array.isArray(t.subtasks)) return box.innerHTML = '';
  let html=''; for (let i=0;i<t.subtasks.length;i++) html += getSubtasksOverlayEdit(t.subtasks[i].title, id, i);
  box.innerHTML = html;
}

async function editSubtask(id, subtask) {
  const t = await loadTaskWithID(id); const i = findSubtask(t, subtask);
  if (i!=null) document.getElementById('list-'+i).innerHTML = getSubtasksOverlayEditInput(t.subtasks[i].title, id);
}

async function deleteSubtask(taskId, subtaskName) {
  const t = await loadTaskWithID(taskId); const i = findSubtask(t, subtaskName);
  if (i!==-1) { t.subtasks.splice(i,1); await fetch(BASE_URL+"/tasks/"+taskId+".json",{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(t)}); }
  renderOverlayEditSubtasks(taskId);
}

function findSubtask(task, subtask) {
  if (!Array.isArray(task.subtasks)) return -1;
  for (let i=0;i<task.subtasks.length;i++) if (task.subtasks[i].title===subtask) return i; return -1;
}

async function saveEditSubtask(id, subtask) {
  const t = await loadTaskWithID(id); const i = findSubtask(t, subtask);
  const val = document.getElementById('change-subtask-input').value.trim();
  if (!val) { document.getElementById('warn-emptyinput-container').innerHTML = getWarningEmptyInput(); return; }
  await fetch(`${BASE_URL}/tasks/${id}/subtasks/${i}.json`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'not done',title:val})});
  renderOverlayEditSubtasks(id);
}
