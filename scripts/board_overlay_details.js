/** Shows overlay for the given task id and renders its details. */
async function showOverlayDetailsTask(id) {
  id--;
  const all = document.getElementById('all-content');
  const blocker = document.getElementById('overlay-blocker');
  if (all) all.style.filter = 'brightness(0.5)';
  blocker?.classList.remove('hidden');
  const res = await fetch(BASE_URL + "/tasks.json");
  const json = await res.json();
  const arr = Array.isArray(json) ? json : Object.values(json || {});
  const task = arr[id];
  if (!task) return;
  renderOverlay(task);
}

/** Escapes HTML special characters to prevent XSS. */
function esc(s) {
  return String(s || '').replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}

/** Returns normalized subtasks array from a task object. */
function subsOf(t) {
  return Array.isArray(t.subtasks) ? t.subtasks : Object.values(t.subtasks || {});
}

/** Builds HTML for a single subtask list item. */
function subItemHTML(id, i, st) {
  const d = st.status === 'done';
  const ic = d ? CHECKED : UNCHECKED;
  return `
    <li class="subtask-item ${d ? 'done' : ''}" data-sub-index="${i}">
      <button class="subtask-toggle" type="button" aria-pressed="${d}" onclick="toggleSubtaskFromDetails(${id},${i})">
        <img class="subtask-check" src="${ic}" alt="">
      </button>
      <span class="subtask-title" onclick="toggleSubtaskFromDetails(${id},${i})">
        ${esc(st.title)}
      </span>
    </li>
  `;
}

/** Re-renders subtasks section using available renderer. */
function rerender(tid, subs) {
  if (typeof renderOverlaySubtasks === 'function') {
    renderOverlaySubtasks({ id: tid, subtasks: subs });
  } else {
    simpleRenderOverlaySubtasks({ id: tid, subtasks: subs });
  }
}

/** Updates board progress UI for subtasks. */
function board(tid, subs) {
  if (typeof updateBoardSubtaskProgressUI === 'function') {
    updateBoardSubtaskProgressUI(tid, subs);
  }
}

/** Shows a toast with current subtask completion status. */
function toast(subs) {
  if (typeof showSubtaskToast === 'function') {
    showSubtaskToast(subs.filter(s => s.status === 'done').length, subs.length);
  }
}

/** Renders contact list with checked state into the overlay. */
function renderOverlayContacts(id, responseJson, activeUserIndex) {
  const checkedIdx = new Set((activeUserIndex || []).filter(i => i >= 0).map(i => i + 1));
  let html = '';
  for (let i = 0; i < responseJson.length; i++) {
    const c = responseJson[i];
    const pos = c.name.indexOf(' ');
    const icon = checkedIdx.has(i) ? './assets/icons/checked_icon.png' : './assets/icons/unchecked_icon.png';
    html += getContactName(id, c.name, generateColor(), c.name[0], c.name[pos + 1] || '', icon);
  }
  document.getElementById('user-dropdown').innerHTML = html;
}

/** Renders the overlay base and then users/subtasks/files. */
function renderOverlay(responseTaskJson) {
  const box = document.getElementById('task-details');
  if (!box) return;
  box.style.display = 'flex';
  box.innerHTML = '';
  const cls = checkCategory(responseTaskJson.category);
  const prio = findPrio(responseTaskJson.prio);
  box.innerHTML = getOverlayDetails(
    responseTaskJson.id, cls, responseTaskJson.category,
    responseTaskJson.title, responseTaskJson.description,
    responseTaskJson.dueDate, responseTaskJson.prio, prio
  );
  renderOverlayUser(responseTaskJson);
  renderOverlayExtras(responseTaskJson);
}

/** Renders extra sections (subtasks/files) or hides when absent. */
function renderOverlayExtras(responseTaskJson) {
  if (Array.isArray(responseTaskJson.subtasks)) {
    if (typeof renderOverlaySubtasks === 'function') renderOverlaySubtasks(responseTaskJson);
    else simpleRenderOverlaySubtasks(responseTaskJson);
  } else {
    const h = document.getElementById('subtask-headline-overlay');
    if (h) h.style.display = 'none';
  }
  renderOverlayFiles(responseTaskJson);
}

/** Renders subtasks list in overlay using simple template. */
function simpleRenderOverlaySubtasks(task) {
  const box = document.getElementById('subtasks-overlay'); if (!box) return;
  const subs = subsOf(task);
  if (!subs.length) return hideSubtasksSection(box);
  box.innerHTML = buildSubtasksListHTML(task.id, subs);
}

/** Hides subtask section headline and clears content. */
function hideSubtasksSection(box) {
  const h = document.getElementById('subtask-headline-overlay');
  if (h) h.style.display = 'none';
  box.innerHTML = '';
}

/** Builds the full HTML list string for all subtasks. */
function buildSubtasksListHTML(id, subs) {
  let html = '<ul class="subtasks-list">';
  for (let i = 0; i < subs.length; i++) html += subItemHTML(id, i, subs[i] || {});
  return html + '</ul>';
}

/** Renders file previews and initializes Viewer.js. */
function renderOverlayFiles(responseTaskJson) {
  const files = responseTaskJson.files; if (!Array.isArray(files) || !files.length) return;
  const wrap = document.getElementById(`viewer-${responseTaskJson.id}`); if (!wrap) return;
  const frag = document.createDocumentFragment();
  files.forEach(file => frag.appendChild(buildFilePreviewBlock(file)));
  wrap.appendChild(frag);
  new Viewer(wrap, { navbar: true, toolbar: true, title: true });
}

/** Builds a file preview block container. */
function buildFilePreviewBlock(file) {
  const div = document.createElement('div');
  div.appendChild(fileInfoLabel(file));
  div.insertAdjacentHTML('beforeend', filePreviewHTML(file));
  return div;
}

/** Creates a tiny label describing the file type. */
function fileInfoLabel(file) {
  const n = (file.name || '');
  const isPDF = /\.pdf$/i.test(n);
  const isIMG = /\.(png|jpe?g)$/i.test(n);
  const t = isPDF ? 'Type: PDF' : isIMG ? 'Type: Image' : 'Type: File';
  const info = document.createElement('div');
  info.style.cssText = 'font-size:.85rem;color:#777;';
  info.textContent = t;
  return info;
}

/** Returns preview HTML for file (image/PDF/link fallback). */
function filePreviewHTML(file) {
  const base64 = file.base64;
  const name = (file.name || '').toLowerCase();
  const isPDF = /\.pdf$/i.test(name), isIMG = /\.(png|jpe?g)$/i.test(name);
  if (isPDF) return pdfPreviewHTML(base64, file.name);
  if (isIMG) return imagePreviewHTML(base64, file);
  return `<a href="${base64}" target="_blank" download="${file.name}">📎 ${file.name}</a>`;
}

/** Builds the HTML snippet for a PDF preview with controls. */
function pdfPreviewHTML(base64, filename) {
  return `
  <div class="pdf-preview-wrapper">
    <embed src="${base64}" type="application/pdf" width="100" height="100" style="pointer-events:none;border-radius:4px;margin-top:6px;">
    <div class="file-name" style="font-size:11px;text-align:center;color:#555;margin-top:6px;word-break:break-word;">${filename}</div>
  </div>
  <div class="file-controls">
    <button class="preview-btn" onclick="event.stopPropagation(); openPdfPreview('${base64}')">👁️</button>
    <button class="download-btn" onclick="event.stopPropagation(); downloadFile('${base64}','${filename}')">⬇️</button>
  </div>`;
}

/** Builds the HTML snippet for an image preview with controls. */
function imagePreviewHTML(base64, file) {
  return `
  <img src="${base64}" alt="${file.name} | ${file.type} | ${formatBytes(file.size)}" style="max-width:100px;border-radius:4px;margin-top:6px;">
  <div class="file-controls">
    <button class="download-btn-img" onclick="event.stopPropagation(); downloadFile('${base64}','${file.name}')">⬇️</button>
    <div class="file-name" style="font-size:11px;text-align:center;color:#555;margin-top:6px;word-break:break-word;">${file.name}</div>
  </div>`;
}

/** Formats byte counts into human-readable units. */
function formatBytes(bytes) {
  const s = ['Bytes', 'KB', 'MB', 'GB']; if (!bytes) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + s[i];
}

/** Renders assigned users (initials, names, colors) in overlay. */
function renderOverlayUser(responseTaskJson) {
  const names = [], initials = [], colors = [];
  determineUserInfo(responseTaskJson, names, initials, colors);
  const box = document.getElementById('user-names-overlay'); if (!box) return;
  let html = '';
  const n = Math.min(names.length, 3);
  for (let i = 0; i < n; i++) html += getUserNamesOverlay(initials[i], names[i], colors[i]);
  box.innerHTML = html;
  const more = document.getElementById('more-user-overlay');
  if (more) more.innerHTML = names.length > 3 ? getMoreUserOverlay(names.length - 3) : '';
}

/** Collects display info for assigned users into target arrays. */
function determineUserInfo(responseTaskJson, names, firstLetters, colors) {
  const arr = responseTaskJson.assignedTo; if (!Array.isArray(arr)) return;
  arr.forEach(u => {
    const full = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
    const init = (window.getInitials) ? window.getInitials(full) : '?';
    names.push(full); firstLetters.push(init); colors.push(u.color || '#ccc');
  });
}

/** Renders all subtasks in edit overlay for given task key/index. */
async function renderOverlayEditSubtasks(idOrKey) {
  const key = await resolveKey(idOrKey);
  const t = await fetch(`${BASE_URL}/tasks/${key}.json`).then(r => r.json()) || {};
  const subs = normalizeSubtasks(t.subtasks);
  const box = document.getElementById('subtasks-overlay-edit'); if (!box) return;
  box.innerHTML = buildEditSubtasksListHTML(t, subs, key);
  if (typeof t.id === 'number') updateBoardSubtaskProgressUI(t.id, subs);
}

/** Builds the edit-mode subtasks list HTML. */
function buildEditSubtasksListHTML(t, subs, key) {
  let html = '<ul class="subtasks-list">';
  for (let i = 0; i < subs.length; i++) html += editSubtaskItemHTML(t, subs[i], i, key);
  return html + '</ul>';
}

/** Builds the HTML for a single editable subtask row. */
function editSubtaskItemHTML(t, st, i, key) {
  const safeTitle = (st.title || '').replace(/'/g, "\\'");
  const done = st.status === 'done';
  return `
    <li id="list-${i}" class="subtask-item ${done ? 'done' : ''}" data-sub-index="${i}">
      <button class="subtask-toggle" type="button"
              onclick="changeStatusSubtask(${t.id}, ${i}, '${st.status}')">
        <img class="subtask-check" src="${done ? CHECKED : UNCHECKED}" alt="">
      </button>
      <span class="subtask-title" onclick="editSubtask('${key}', '${safeTitle}')">${st.title}</span>
      <button class="subtask-delete" type="button" onclick="deleteSubtask('${key}', '${safeTitle}')">🗑️</button>
    </li>`;
}

/** Toggles a subtask status from details view and updates UI. */
async function toggleSubtaskFromDetails(displayId, subIndex) {
  const key = await findKey(displayId - 1), url = `${BASE_URL}/tasks/${key}.json`;
  const task = await fetch(url).then(r => r.json()) || {};
  const subs = subsOf(task); if (!subs[subIndex]) return;
  subs[subIndex].status = subs[subIndex].status === 'done' ? 'not done' : 'done';
  await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subtasks: subs }) });
  rerender(task.id, subs); board(task.id, subs); toast(subs);
}

/** Opens the PDF modal and sets the iframe source. */
function openPdfPreview(base64) {
  const m = document.getElementById('pdf-modal'); const f = document.getElementById('pdf-frame');
  if (!m || !f) return; f.src = base64; m.style.display = 'flex';
}

/** Closes the PDF modal and clears the iframe source. */
function closeModal() {
  const m = document.getElementById('pdf-modal'); const f = document.getElementById('pdf-frame');
  if (!m || !f) return; m.style.display = 'none'; f.src = '';
}

/** Triggers a download for a given base64 resource. */
function downloadFile(base64, filename) {
  const a = document.createElement('a'); a.href = base64; a.download = filename; a.click();
}

/** Normalizes a subtasks structure to an array. */
function normalizeSubtasks(st) {
  return Array.isArray(st) ? st : Object.values(st || {});
}
