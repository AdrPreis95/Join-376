/** Returns the checked icon path. */
const CHECKED = './assets/icons/checked_icon.png';
/** Returns the unchecked icon path. */
const UNCHECKED = './assets/icons/unchecked_icon.png';

/** Tracks whether the session has unsaved changes. */
let _sessionChanged = false;

/** Collapses multiple spaces and trims a string. */
function _s(v){ return (v||'').replace(/\s+/g,' ').trim(); }

/** Converts input to an array in a safe manner. */
function asArray(d){ return Array.isArray(d)?d:Object.values(d||{}); };

/** Normalizes subtasks to {title, status} objects. */
function normalizeSubtasks(subs){
  if(!subs) return [];
  const list = Array.isArray(subs)?subs:Object.values(subs);
  return list.map(s=>({
    title:(s.title??s.name??'').toString(),
    status:s.status==='done'?'done':'not done'
  }));
};

/** Resolves a Firebase key from an index or returns given key. */
async function resolveKey(idOrKey){
  if(typeof idOrKey==='string') return idOrKey;
  return await findKey(idOrKey);
};

/** Builds two-letter uppercase initials from a name. */
function getInitials(name=''){
  return name.trim().split(/\s+/).slice(0,2)
    .map(p=>p[0]||'').join('').toUpperCase();
};

/** Updates a board card’s subtask progress UI. */
function updateBoardSubtaskProgressUI(taskId,list){
  const total=list.length, done=list.filter(s=>s.status==='done').length;
  const progress=total?Math.round((done/total)*100):0;
  const el=document.getElementById('subtask-'+taskId);
  if(el && typeof getSubtask==='function'){
    el.innerHTML=getSubtask(done,total,progress);
  }
};

/** Ensures a toast element exists and returns it. */
function getToastEl(){
  let el=document.getElementById('subtask-toast');
  if(el) return el;
  el=document.createElement('div');
  el.id='subtask-toast';
  el.style.cssText='position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:#111;color:#fff;padding:10px 14px;border-radius:10px;z-index:10000;opacity:0;transition:opacity .2s;font-weight:600';
  document.body.appendChild(el);
  return el;
};

/** Shows a temporary subtask progress toast. */
function showSubtaskToast(done,total){
  const el=getToastEl();
  el.textContent=`${done} of ${total} Subtasks Done!`;
  requestAnimationFrame(()=>el.style.opacity='1');
  clearTimeout(showSubtaskToast._t);
  showSubtaskToast._t=setTimeout(()=>el.style.opacity='0',1400);
};

let _fpInstance;

/** Opens the edit overlay and initializes its content. */
async function editTask(id,title,description,dueDate,priority){
  _sessionChanged=false; id--;
  const box=document.getElementById('task-details');
  box.innerHTML=getOverlayEdit(id,title,description,dueDate);
  checkActivePriority(priority);
  selectedUserEdit(id);
  renderOverlayEditSubtasks(id);
  await loadContacts(id);
  initDate(dueDate);
  const task=await loadTaskWithID(id);
  renderEditFile(task);
  initSubtaskEdit(id);
  initAssignedChangeTracking();
  snapshotAssignedInit();
};

/** Initializes flatpickr on the due date input. */
function initDate(dueDateISO){
  const input=document.getElementById('due-date-input');
  const btn=document.getElementById('calendar-icon');
  if(!input||!btn) return;
  if(input._fpInstance){ input._fpInstance.destroy(); input._fpInstance=null; }
  const today=new Date(); today.setHours(0,0,0,0);
  input._fpInstance=flatpickr(input,{
    disableMobile:true,allowInput:true,dateFormat:'Y-m-d',
    altInput:true,altFormat:'d/m/Y',minDate:today,
    defaultDate:(dueDateISO||'').slice(0,10)||null
  });
  btn.onclick=()=>input._fpInstance && input._fpInstance.open();
}

/** Highlights the active priority choice in the UI. */
function checkActivePriority(priority){
  const map={Urgent:['urgent','#FF3D00'],Medium:['medium','#FFA800'],Low:['low','#7AE229']};
  ['urgent','medium','low'].forEach(p=>{
    document.getElementById(p+'-label').style.backgroundColor='#FFFFFF';
    document.getElementById(p+'-text').style.color='#000';
    document.getElementById(p+'-icon').src=`./assets/icons/${p}_icon.png`;
  });
  const [k,col]=map[priority]||['medium','#FFA800'];
  document.getElementById(k+'-label').style.backgroundColor=col;
  document.getElementById(k+'-text').style.color='#FFFFFF';
  document.getElementById(k+'-icon').src=`./assets/icons/${k}_icon_active.png`;
  activePriority=priority;
};

/** Sets a new priority and refreshes highlight state. */
function changePriority(newPriority){
  ['urgent','medium','low'].forEach(p=>{
    document.getElementById(p+'-label').style.backgroundColor='#FFFFFF';
    document.getElementById(p+'-text').style.color='#000';
    document.getElementById(p+'-icon').src=`./assets/icons/${p}_icon.png`;
  });
  checkActivePriority(newPriority);
};

/** Creates an inline confirmation overlay element. */
function createConfirmOverlay(msg,type='ok'){
  const ok=type==='ok', warn=type==='warn';
  const bg= ok?'#22c55e':(warn?'#f59e0b':'#ef4444');
  const icon = ok ? '<polyline points="20 6 9 17 4 12"/>'
    : warn ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
           : '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
  const o=document.createElement('div'); o.id='edit-confirm-overlay';
  o.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);z-index:9999;opacity:0;transition:opacity .2s ease';
  o.innerHTML=`<div style="background:#111;color:#fff;padding:18px 20px;border-radius:12px;display:flex;gap:12px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.3)"><div style="width:32px;height:32px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></div><span style="font-weight:600">${msg}</span></div>`;
  return o;
};

/** Shows a temporary confirmation overlay. */
function showEditConfirm(msg,type='ok'){
  const o=createConfirmOverlay(msg,type);
  document.body.appendChild(o);
  requestAnimationFrame(()=>{o.style.opacity='1'});
  setTimeout(()=>{o.style.opacity='0'; setTimeout(()=>o.remove(),200);},1400);
};

/** Builds a change object from the current overlay inputs. */
function generateChangeTask(responseJson){
  const t=_s(document.getElementById('overlay-title').value);
  const d=_s(document.getElementById('overlay-description').value);
  const raw=_s(document.getElementById('due-date-input').value);
  const due=raw?(/^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:convertDateFormat(raw)):'';
  if(t) responseJson.title=t;
  if(d) responseJson.description=d;
  if(due) responseJson.dueDate=due;
  responseJson.prio=activePriorityButton();
  return responseJson;
};

/** Reads active priority from styled label backgrounds. */
function activePriorityButton(){
  const bg=id=>window.getComputedStyle(document.getElementById(id)).getPropertyValue('background-color');
  if(bg('low-label')==='rgb(122, 226, 41)') return 'Low';
  if(bg('medium-label')==='rgb(255, 168, 0)') return 'Medium';
  if(bg('urgent-label')==='rgb(255, 61, 0)') return 'Urgent';
  return 'Medium';
};

/** Canonicalizes a display name for comparisons. */
function canon(s){return (s||'').toLowerCase().replace(/\s*\(you\)\s*$/,'').trim();};

/** Strips “(You)” from a display name for UI. */
function cleanDisplayName(n){return (n||'').replace(/\s*\(You\)\s*$/,'').trim();};

/** Compares two users by first/last names. */
function sameUser(aFN,aLN,bFN,bLN){return canon(`${aFN} ${aLN}`)===canon(`${bFN} ${bLN}`);};

/** Returns a safe DOM id derived from a name. */
function safeIdFromName(name){return 'contact-row-'+encodeURIComponent(name);};

/** Maps a contact to its UI display string. */
function displayForUI(name,email){return name;};

/** Reads the current assigned selection (chips or checkboxes). */
function getAssignedSelection(){
  const chips=[...document.querySelectorAll('#picked-user-avatar [data-contact-id]')]
    .map(n=>n.dataset.contactId).filter(Boolean);
  if(chips.length) return chips.sort();
  const checks=[...document.querySelectorAll('#user-names-edit-overlay input[type="checkbox"][data-contact-id]:checked')]
    .map(i=>i.dataset.contactId).filter(Boolean);
  return checks.sort();
};

/** Saves a snapshot of the assigned selection. */
function snapshotAssignedInit(){ _assignedInit = getAssignedSelection(); };

let _assignedInit = [];
let _assignedMO;

/** Checks whether assigned selection changed. */
function assignedChanged(){
  const now=getAssignedSelection();
  return JSON.stringify(now)!==JSON.stringify(_assignedInit);
};

/** Starts a MutationObserver for assigned changes. */
function initAssignedChangeTracking(){
  const root=document.getElementById('picked-user-avatar')
    || document.getElementById('user-names-edit-overlay')
    || document.getElementById('selected-user-dropdown');
  if(!root) return;
  _assignedMO?.disconnect();
  _assignedMO=new MutationObserver(muts=>{
    if(muts.some(m=>m.type==='childList'&&(m.addedNodes.length||m.removedNodes.length))){
      _sessionChanged=true;
    }
  });
  _assignedMO.observe(root,{childList:true,subtree:true});
};

/** Stops the MutationObserver for assigned changes. */
function stopAssignedChangeTracking(){ _assignedMO?.disconnect(); _assignedMO=null; };

/** Returns true if the inline subtask edit field is open. */
function isInlineSubtaskEditOpen(){ return !!document.getElementById('change-subtask-input'); }

/** Warns the user to finish inline subtask editing. */
function warnInlineSubtaskEdit(){ showEditConfirm('Please change the subtask and confirm with ✓ or Enter','warn'); }

/** Computes a PATCH diff between current and changed fields. */
function computePatch(cur,ch){
  const s=_s, p={};
  if(s(ch.title)!==s(cur.title)&&s(ch.title)) p.title=s(ch.title);
  if(s(ch.description)!==s(cur.description)&&s(ch.description)) p.description=s(ch.description);
  if(s(ch.dueDate)!==s(cur.dueDate)&&s(ch.dueDate)) p.dueDate=s(ch.dueDate);
  if(s(ch.prio)!==s(cur.prio)&&s(ch.prio)) p.prio=s(ch.prio);
  return p;
}

/** Applies a PATCH and closes with success toast. */
async function persistAndClose(url,patch){
  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});
  showEditConfirm('Changes saved','ok'); _sessionChanged=false; closeOverlay(); loadTasks();
}

/** Closes overlay when only session changes occurred. */
function closeIfSessionChanged(){
  if(_sessionChanged){
    showEditConfirm('Changes saved','ok');
    _sessionChanged=false; closeOverlay(); loadTasks();
    return true;
  }
  return false;
}

/** Saves edit overlay changes to Firebase without logic changes. */
async function saveEdit(id){
  if(isInlineSubtaskEditOpen()){ warnInlineSubtaskEdit(); return; }
  id=await findKey(id); const url=`${BASE_URL}/tasks/${id}.json`;
  const cur=await loadTaskWithID(id), ch=generateChangeTask({...cur});
  if(assignedChanged()) _sessionChanged=true;
  const patch=computePatch(cur,ch);
  if(Object.keys(patch).length){ await persistAndClose(url,patch); return; }
  if(closeIfSessionChanged()) return;
  showEditConfirm('Nothing changed – task closed','x'); closeOverlay();
}

/** Toggles a subtask status and saves silently. */
async function changeStatusSubtask(displayId,subIndex,status){
  const key=await findKey(displayId-1);
  const url=`${BASE_URL}/tasks/${key}.json`;
  const task=await fetch(url).then(r=>r.json())||{};
  const subs=normalizeSubtasks(task.subtasks);
  const nowDone=status!=='done';
  if(subs[subIndex]) subs[subIndex].status=nowDone?'done':'not done';
  _sessionChanged=true;
  await applySubtaskStatus(key,task,subs,url);
};

/** Persists new subtask list and refreshes UI silently. */
async function applySubtaskStatus(key,task,subs,url){
  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({subtasks:subs})});
  await renderOverlayEditSubtasks(key);
  if(document.getElementById('subtasks-overlay') && typeof renderOverlaySubtasks==='function'){
    renderOverlaySubtasks({id:task.id,subtasks:subs});
  }
  updateBoardSubtaskProgressUI(task.id,subs);
  const done=subs.filter(s=>s.status==='done').length;
  showSubtaskToast(done,subs.length);
};

/** Toggles the assigned dropdown visibility in the overlay. */
function openDropdownAssigned(){
  const dd=document.getElementById('selected-user-dropdown');
  const arr=document.getElementById('arrow-dropdown');
  const box=document.getElementById('user-names-edit-overlay');
  if(!dd||!arr||!box) return;
  const open=dd.className==='d-none';
  dd.classList.toggle('d-none',!open);
  dd.classList.toggle('d_block',open);
  arr.src=open?'./assets/icons/arrow_drop_down_top.png':'./assets/icons/arrow_drop_down.png';
  box.classList.toggle('d-none',open);
};

/** Switches subtask input area between plus and icons. */
function editMode(id){
  const c=document.getElementById('create-subtask-overlay');
  const isAdd=document.getElementById('add-subtask-overlay-edit')
    .getAttribute('src')==="./assets/icons/add_subtask.png";
  c.innerHTML=isAdd?getSubtaskOverlayIcons(id):getSubtaskOverlayAddIcon();
};

/** Creates a new subtask from the overlay input. */
async function createSubtaskOverlay(idOrKey){
  const input=document.getElementById('subtask-edit');
  const title=_s(input?.value||'');
  const key=await resolveKey(idOrKey);
  if(!title){
    showEditConfirm('Please enter a subtask title','warn');
    renderOverlayEditSubtasks(key); return clearSubtaskInput();
  }
  await saveNewSubtask(key,title);
};

/** Saves a newly added subtask and updates UI. */
async function saveNewSubtask(key,title){
  const url=`${BASE_URL}/tasks/${key}.json`;
  const task=await fetch(url).then(r=>r.json())||{};
  const subs=normalizeSubtasks(task.subtasks);
  subs.push({title:_s(title),status:'not done'});
  _sessionChanged=true;
  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({subtasks:subs})});
  clearSubtaskInput();
  await renderOverlayEditSubtasks(key);
  updateBoardSubtaskProgressUI(task.id,subs);
  showSubtaskToast(subs.filter(s=>s.status==='done').length,subs.length);
};

/** Clears the subtask edit input field. */
function clearSubtaskInput(){
  const i=document.getElementById('subtask-edit');
  if(i) i.value="";
};

/** Renders all subtasks into the edit overlay list. */
async function renderOverlayEditSubtasks(id){
  const t=await loadTaskWithID(id);
  const box=document.getElementById('subtasks-overlay-edit');
  if(!box) return;
  if(!Array.isArray(t.subtasks)){ box.innerHTML=''; return; }
  let html='';
  for(let i=0;i<t.subtasks.length;i++){
    html+=getSubtasksOverlayEdit(t.subtasks[i].title,id,i);
  }
  box.innerHTML=html;
};

/** Switches a single subtask row to inline edit mode. */
async function editSubtask(id,subtask){
  const t=await loadTaskWithID(id);
  const i=findSubtask(t,subtask);
  if(i!=null){
    document.getElementById('list-'+i).innerHTML=getSubtasksOverlayEditInput(t.subtasks[i].title,id);
    const input=document.getElementById('change-subtask-input');
    if(input){ input.dataset.taskKey=id; input.dataset.oldTitle=t.subtasks[i].title; input.focus(); }
  }
};

/** Deletes a subtask and refreshes the overlay list. */
async function deleteSubtask(idOrKey,subtaskName){
  const key=await resolveKey(idOrKey);
  const url=`${BASE_URL}/tasks/${key}.json`;
  const task=await fetch(url).then(r=>r.json())||{};
  const subs=normalizeSubtasks(task.subtasks);
  const i=subs.findIndex(s=>s.title===subtaskName);
  if(i!==-1) subs.splice(i,1);
  _sessionChanged=true;
  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({subtasks:subs})});
  await renderOverlayEditSubtasks(key);
  updateBoardSubtaskProgressUI(task.id,subs);
  showSubtaskToast(subs.filter(s=>s.status==='done').length,subs.length);
};

/** Finds a subtask index by its title. */
function findSubtask(task,subtask){
  if(!Array.isArray(task.subtasks)) return -1;
  for(let i=0;i<task.subtasks.length;i++){
    if(task.subtasks[i].title===subtask) return i;
  }
  return -1;
};

