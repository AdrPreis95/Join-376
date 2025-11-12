/** Renders the edit preview area, upload input, and initializes Viewer. */
function renderEditFile(task) {
  const container = document.getElementById('edit-overlay-file-preview');
  if (!container) return;
  if (!Array.isArray(task.files)) task.files = [];
  container.innerHTML = `<div class="task-file viewer-gallery" id="viewer-${task.id}"></div>`;
  const viewer = document.getElementById(`viewer-${task.id}`);
  renderEachFile(task, viewer);
  renderUploadInput(container, task.id);
  initViewer(task.id);
};

/** Appends each file (image/pdf) as markup into a target viewer element. */
function renderEachFile(task, viewer) {
  task.files.forEach((f, i) => {
    const isImage = f.base64?.startsWith('data:image/');
    const isPDF = f.base64?.startsWith('data:application/pdf');
    const wrap = document.createElement('div');
    wrap.innerHTML = isImage ? getImageMarkup(f, i, task.id)
      : isPDF ? getPdfMarkup(f, i, task.id) : '';
    viewer.appendChild(wrap);
  });
};

/** Returns safe string replacing HTML special chars. */
function esc(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
};

/** Formats byte size with unit (Bytes, KB, MB, GB). */
function formatBytes(bytes) {
  const u = ['Bytes','KB','MB','GB'];
  if (!bytes) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + u[i];
};


/** Injects a hidden file input (accepts jpg/jpeg/png/pdf) and label. */
function renderUploadInput(container, taskId) {
  container.innerHTML += `
    <div style="margin-top:20px;display:flex;align-items:center;gap:8px;">
      <label for="edit-file-upload" style="cursor:pointer;">${getPlusIcon()}</label>
      <input type="file" id="edit-file-upload" multiple accept=".jpg,.jpeg,.png,.pdf"
        style="display:none;" onchange="handleEditFileUpload(event, ${taskId})">
    </div>`;
};

/** Initializes Viewer.js on the given viewer element. */
function initViewer(taskId) {
  const el = document.getElementById(`viewer-${taskId}`);
  if (el) new Viewer(el);
};

/** Removes file at index from task, persists to Firebase, and rerenders. */
async function removeFileFromTask(id, index) {
  id--;
  const taskRefUrl = `${BASE_URL}/tasks/${id}.json`;
  const task = await loadTaskWithID(id);
  if (!task?.files || !Array.isArray(task.files)) return console.warn("Data cannot deleted – Error: no Data", task);
  task.files.splice(index, 1);
  await updateTaskInFirebase(taskRefUrl, { files: task.files });
  renderEditFile(task);
};

/** Handles edit-upload: validates, respects limits, saves and warns. */
async function handleEditFileUpload(event, taskId) {
  const files = event.target.files; if (!files?.length) return;
  const id = taskId - 1, task = await loadTaskWithID(id); if (!task) return;
  if (!Array.isArray(task.files)) task.files = [];
  let counters = initCounters(task.files), flags = initFlags();
  await processSelectedFiles({ files, task, id, counters, flags });
  showUploadWarnings(flags.invalidFiles, flags.tooManyImages, flags.tooManyPDFs);
};

/** Returns current images/pdfs counters from an array. */
function initCounters(arr){ 
  return { images: countFilesOfType(arr, 'image/'), pdfs: countFilesOfType(arr, 'application/pdf') };
};

/** Returns initial flags object for upload validations. */
function initFlags(){ 
  return { invalidFiles: [], tooManyImages: false, tooManyPDFs: false };
};

/** Counts files whose base64 starts with given MIME prefix. */
function countFilesOfType(fileArray, typePrefix) {
  return fileArray.filter(f => f.base64?.startsWith(`data:${typePrefix}`)).length;
};

/** Returns true if file must be skipped (invalid type/limits reached). */
function shouldSkipFile(file, counters, flags) {
  const fn = file.name.toLowerCase(), mt = file.type;
  const extOk = /\.(png|jpe?g|pdf)$/.test(fn);
  const mimeOk = ['image/png','image/jpeg','application/pdf'].includes(mt);
  const isImg = mt.startsWith('image/'), isPdf = mt === 'application/pdf';
  if (!extOk || !mimeOk) { flags.invalidFiles.push(file.name); return true; }
  if (isImg && counters.images >= 4) return (flags.tooManyImages = true);
  if (isPdf && counters.pdfs >= 2) return (flags.tooManyPDFs = true);
  return false;
};

/** Processes selected files, saves valid ones, and updates counters. */
async function processSelectedFiles({ files, task, id, counters, flags }) {
  for (let file of files) {
    if (shouldSkipFile(file, counters, flags)) continue;
    await readAndSaveFile(file, task, id);
    if (file.type.startsWith('image/')) counters.images++;
    if (file.type === 'application/pdf') counters.pdfs++;
  }
};

/** Converts to base64, patches Firebase, and rerenders the preview. */
async function readAndSaveFile(file, task, id) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = async (e) => {
      const base64 = e.target.result;
      task.files.push({ name: file.name, base64, size: file.size, type: file.type });
      await updateTaskInFirebase(`${BASE_URL}/tasks/${id}.json`, { files: task.files });
      renderEditFile(task); resolve();
    };
    r.readAsDataURL(file);
  });
};

/** Shows overlays for invalid types or exceeded image/PDF limits. */
function showUploadWarnings(invalidFiles, tooManyImages, tooManyPDFs) {
  if (invalidFiles.length) showUploadWarningOverlay(`Invalid file format – not allowed: ${invalidFiles.join(', ')}`);
  if (tooManyImages) showUploadWarningOverlay(`Maximum of 4 images reached!!!`);
  if (tooManyPDFs) showUploadWarningOverlay(`Maximum of 2 PDFs reached!!!`);
};

/** Shows and auto-hides the upload warning overlay with a message. */
function showUploadWarningOverlay(message) {
  const overlay = document.getElementById('upload-warning-overlay');
  const msgEl = document.getElementById('upload-warning-message');
  msgEl.textContent = message;
  overlay.classList.remove('hidden'); overlay.classList.add('show');
  setTimeout(() => { overlay.classList.remove('show'); overlay.classList.add('hidden'); }, 3000);
};

/** PATCHes a partial update to Firebase and returns parsed JSON. */
async function updateTaskInFirebase(ref, partial) {
  const url = (typeof ref === 'string') ? ref : `${BASE_URL}/tasks/${ref}.json`;
  const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(partial) });
  if (!res.ok) { const msg = `Firebase update failed: ${res.status} ${res.statusText}`; console.error(msg, { url, partial }); throw new Error(msg); }
  return res.json();
};

const await_updateTaskInFirebase = updateTaskInFirebase;
