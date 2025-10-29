/** Base URL and globals for board state. */
let BASE_URL = 'https://join376-5c0e7-default-rtdb.europe-west1.firebasedatabase.app/';
let currentDraggedElement; let activePriority = '';
let titles = []; let descriptions = []; let loadedTasks = [];
window.closeTaskOverlay = closeTaskOverlay;

/** Loads all tasks from Firebase and renders them. */
async function loadTasks() {
  const res = await fetch(BASE_URL + "/tasks.json");
  const tasksJson = await res.json();
  clearLists(); renderTasks(tasksJson); saveInArray(tasksJson);
}

/** Resolves Firebase key by zero-based index. */
async function findKey(id) {
  const res = await fetch(BASE_URL + "/tasks.json");
  const json = await res.json(); const keys = Object.keys(json);
  return keys[id];
}

/** Caches titles/descriptions for search suggestions. */
function saveInArray(tasksJson) {
  loadedTasks = tasksJson; titles.length = 0; descriptions.length = 0;
  for (let i = 0; i < tasksJson.length; i++) {
    titles.push(tasksJson[i].title); descriptions.push(tasksJson[i].description);
  }
}

/** Searches tasks by keyword in title/description. */
async function searchTask(type, e) {
  const keynum = pressedKey(e); const kw = getKeyWord(type);
  const res = await fetch(BASE_URL + "/tasks.json"); const json = await res.json();
  const matched = json.filter(t => (t.title.toLowerCase().includes(kw) || t.description.toLowerCase().includes(kw)));
  showSearchResults(matched, json, keynum);
}

/** Returns key code for pressed key. */
function pressedKey(e) {
  if (window.e) return keynum = e.keyCode;
  else if (e.which) return keynum = e.which;
}

/** Syncs search inputs and returns lowercase keyword. */
function getKeyWord(type) {
  if (type == "responsive") {
    document.getElementById('find-task').value = document.getElementById('find-task-responsive').value;
    return document.getElementById('find-task-responsive').value.toLowerCase();
  } else {
    document.getElementById('find-task-responsive').value = document.getElementById('find-task').value;
    return keyword = document.getElementById('find-task').value.toLowerCase();
  }
}

/** Renders search results or full list and shows no-result notice. */
function showSearchResults(matchedTasks, responseJson, keynum) {
  if (matchedTasks.length > 0 && keynum != 8) { clearLists(); renderTasks(matchedTasks); }
  else { clearLists(); renderTasks(responseJson); if (keyword != "" && keynum != 8) noResults(); }
}

/** Shows a transient 'no results' notification. */
function noResults() {
  const pop = document.getElementById("search-notification");
  pop.classList.remove("d-none");
  setTimeout(() => pop.classList.add("d-none"), 1500);
}

/** Clears all lists before re-render. */
function clearLists() {
  document.getElementById('to-do').innerHTML = "";
  document.getElementById('in-progress').innerHTML = "";
  document.getElementById('await-feedback').innerHTML = "";
  document.getElementById('done').innerHTML = "";
}

/** Renders all tasks into their respective lists. */
function renderTasks(tasksJson) {
  const arr = Object.values(tasksJson);
  for (let i = 0; i < arr.length; i++) renderTaskCard(arr[i]);
  checkEmptyList();
}

/** Renders a single task card and its extras. */
function renderTaskCard(t) {
  const id = t.id, list = t.list, prioIcon = findPrio(t.prio);
  const cls = checkCategory(t.category); const el = document.getElementById(`${list}`);
  if (el) el.innerHTML += getTask(id, t.category, cls, t.title, t.description, prioIcon);
  if (t.subtasks != undefined) calculateSubtaskProgress(t.subtasks, id);
  getFirstLetter(t.assignedTo, id);
}

/** Renders placeholders for empty lists. */
function checkEmptyList() {
  const refs = [document.getElementById('to-do'), document.getElementById('in-progress'),
    document.getElementById('await-feedback'), document.getElementById('done')];
  const names = ['to do', 'in progress', 'await feedback', 'done'];
  for (let i = 0; i < refs.length; i++) if (refs[i].innerHTML == '') refs[i].innerHTML = getClearList(names[i]);
}

/** Maps category to CSS class for label styling. */
function checkCategory(category) {
  let classCategory;
  if (category == 'Technical Task') classCategory = 'technical-task';
  else classCategory = 'user-story';
  return classCategory;
}

/** Calculates and renders subtask progress for a card. */
function calculateSubtaskProgress(subtasks, id) {
  const all = subtasks.length;
  let done = 0, notDone = 0;
  for (let i = 0; i < subtasks.length; i++) {
    if (subtasks[i].status == 'done') done++; else if (subtasks[i].status == 'not done') notDone++;
  }
  const progress = (done / all) * 100;
  document.getElementById('subtask-' + id).innerHTML = getSubtask(done, all, progress);
}

/** Collects initials/colors of assigned users and renders them. */
function getFirstLetter(user, id) {
  const firstLetters = [], colors = [];
  if (Array.isArray(user)) {
    for (let i = 0; i < user.length; i++) {
      const full = user[i].name || `${user[i].firstName || ''} ${user[i].lastName || ''}`.trim();
      const initials = window.getInitials(full); const color = user[i].color || '#cccccc';
      firstLetters.push(initials); colors.push(color);
    }
  }
  renderFirstLetter(firstLetters, colors, id);
}

/** Renders up to five user initials and optional '+n'. */
function renderFirstLetter(firstLetters, colors, id) {
  const box = document.getElementById('assigned-user-' + id);
  const more = document.getElementById('more-user-' + id);
  if (!box) return;
  const fl = Array.isArray(firstLetters) ? firstLetters : [];
  const col = Array.isArray(colors) ? colors : [];
  const n = Math.min(fl.length, 5);
  for (let j = 0; j < n; j++) box.innerHTML += getFirstLetterName(fl[j], col[j] ?? col[0] ?? '#999');
  if (fl.length > 5 && more) more.innerHTML = getMoreUser(fl.length - 5); else if (more) more.innerHTML = '';
}

/** Returns priority icon path by priority label. */
function findPrio(priority) {
  let prioIcon;
  if (priority == 'Urgent') prioIcon = './assets/icons/urgent_icon.png';
  else if (priority == 'Low') prioIcon = './assets/icons/low_icon.png';
  else if (priority == 'Medium') prioIcon = './assets/icons/medium_icon.png';
  return prioIcon;
}

/** Marks a card as being dragged. */
function startDragging(id) {
  currentDraggedElement = id;
  document.getElementById(currentDraggedElement).classList.add('drag-area-highlight');
}

/** Removes dragging highlight from a card. */
function removeDragging(id) {
  document.getElementById(id).classList.remove('drag-area-highlight');
}

/** Allows dropping by preventing default. */
function allowDrop(ev) { ev.preventDefault(); }

/** Changes a task’s list and persists it. */
async function changeList(list) {
  const idx = parseIndexFromDragged(currentDraggedElement); if (idx == null) return;
  const key = await findKey(Math.max(0, idx - 1)); if (!key) return;
  const taskJson = await loadTaskByKey(key); if (!taskJson) return;
  taskJson.list = list; await saveTaskByKey(key, taskJson); await loadTasks();
}

/** Parses numeric index from currentDraggedElement. */
function parseIndexFromDragged(val) {
  const idx = Number(val); if (!Number.isFinite(idx)) { console.error('changeList: invalid index', val); return null; }
  return idx;
}

/** Loads a task JSON by Firebase key. */
async function loadTaskByKey(key) {
  const res = await fetch(`${BASE_URL}/tasks/${key}.json`);
  return await res.json();
}

/** Saves a full task JSON by Firebase key. */
async function saveTaskByKey(key, taskJson) {
  await fetch(`${BASE_URL}/tasks/${key}.json`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskJson)
  });
}

/** Deletes a task and reindexes remaining tasks. */
async function deleteTask(id) {
  let res = await fetch(BASE_URL + "/tasks.json"); let json = await res.json();
  json = Array.isArray(json) ? json : Object.values(json);
  const updated = json.filter(t => t.id !== id).map((t, i) => ({ ...t, id: i + 1 }));
  await fetch(BASE_URL + "/tasks.json", {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated)
  });
  showDeleteConfirm('Task deleted'); closeOverlay(); loadTasks();
}

/** Shows a temporary delete confirmation overlay. */
function showDeleteConfirm(msg) {
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);z-index:9999;opacity:0;transition:opacity .2s';
  o.innerHTML = `<div style="background:#111;color:#fff;padding:18px 20px;border-radius:12px;display:flex;gap:12px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.3)">
    <div style="width:32px;height:32px;border-radius:50%;background:#ef4444;display:flex;align-items:center;justify-content:center">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </div><span style="font-weight:600">${msg}</span></div>`;
  document.body.appendChild(o); requestAnimationFrame(() => o.style.opacity = '1');
  setTimeout(() => { o.style.opacity = '0'; setTimeout(() => o.remove(), 200); }, 1400);
}

/** Opens the Add Task overlay and prepares styling. */
function openAddTask() { showOverlay(); setOverlayStyles(); hideUnnecessaryElementsInIframe(); }

/** Activates overlay mode inside iframe. */
function openOverlay() {
  const overlay = document.getElementById('overlayContent');
  if (overlay) { overlay.classList.add('overlay-active'); setOverlayMode(); }
}

/** Closes the task overlay and resets to main page mode. */
function closeTaskOverlay() {
  const overlay = document.getElementById('taskoverlay');
  if (overlay) { overlay.classList.remove('overlay-active'); resetToMainPage(); }
}

/** Sets iframe body id to 'overlay-mode' after load. */
function setOverlayMode() {
  const iframe = document.getElementById("overlayContent");
  if (!iframe) return;
  iframe.onload = function () {
    setTimeout(() => {
      const d = iframe.contentDocument || iframe.contentWindow.document;
      const b = d && d.body; if (b) { console.log("Changing body ID to 'overlay-mode'"); b.id = "overlay-mode"; }
    }, 100);
  };
}

/** Resets iframe body id to 'main-page'. */
function resetToMainPage() {
  const iframe = document.getElementById('overlayContent'); if (!iframe) return;
  const d = iframe.contentDocument || iframe.contentWindow.document; const b = d && d.body;
  if (b) { console.log("Resetting body ID to 'main-page'"); b.id = 'main-page'; }
}

/** Opens task detail overlay and blocker. */
function openTaskDetails() {
  document.getElementById('task-details').style.display = 'flex';
  document.getElementById('overlay-blocker').classList.remove('hidden');
}

/** Closes task detail overlay and restores blocker. */
function closeTaskDetails() {
  document.getElementById('task-details').style.display = 'none';
  document.getElementById('overlay-blocker').classList.add('hidden');
}
