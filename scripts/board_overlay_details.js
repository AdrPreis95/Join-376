/**Shows the task overlay with details for the given task ID and renders it. */
async function showOverlayDetailsTask(id) {
  id--;
  const all = document.getElementById('all-content');
  const blocker = document.getElementById('overlay-blocker');
  if (all) all.style.filter = 'brightness(0.5)';
  blocker?.classList.remove('hidden');
  const res = await fetch(BASE_URL + "/tasks.json");
  const json = await res.json();
  const arr = Array.isArray(json) ? json : Object.values(json||{});
  const task = arr[id];
  if (!task) return;
  renderOverlay(task);
}

/*Escapes special HTML characters to prevent XSS injection.*/
function esc(s) {
  return String(s || '').replace(/[&<>"']/g, m =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m])
  );
}

/*Normalizes the subtasks of a given task into an array.
 *Handles both arrays and object-based subtasks.*/
function subsOf(t) {
  return Array.isArray(t.subtasks) ? t.subtasks : Object.values(t.subtasks || {});
}

/*Creates the HTML string for a single subtask list item.*/
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

/*Re-renders subtasks inside the overlay view.
 *Chooses the correct renderer depending on availability.*/
function rerender(tid, subs) {
  if (typeof renderOverlaySubtasks === 'function') {
    renderOverlaySubtasks({ id: tid, subtasks: subs });
  } else {
    simpleRenderOverlaySubtasks({ id: tid, subtasks: subs });
  }
}

/*Updates the board UI with the current subtask progress. */
function board(tid, subs) {
  if (typeof updateBoardSubtaskProgressUI === 'function') {
    updateBoardSubtaskProgressUI(tid, subs);
  }
}

/*Shows a toast notification for subtask completion progress.*/
function toast(subs) {
  if (typeof showSubtaskToast === 'function') {
    showSubtaskToast(
      subs.filter(s => s.status === 'done').length,
      subs.length
    );
  }
}


/**Renders the contact list inside the overlay including checked state.*/
function renderOverlayContacts(id, responseJson, activeUserIndex) {
  const checkedIdx = new Set((activeUserIndex||[])
    .filter(i => i >= 0)
    .map(i => i + 1));
  let html = '';
  for (let i = 0; i < responseJson.length; i++) {
    const c = responseJson[i];
    const pos = c.name.indexOf(' ');
    const icon = checkedIdx.has(i)
      ? './assets/icons/checked_icon.png'
      : './assets/icons/unchecked_icon.png';
    html += getContactName(
      id, c.name, generateColor(),
      c.name[0], c.name[pos + 1] || '', icon);
  }
  document.getElementById('user-dropdown').innerHTML = html;
}

/**Renders the overlay container with task core data and sub-sections. */
// function renderOverlay(responseTaskJson) {
//   const box = document.getElementById('task-details');
//   if (!box) return;
//   box.style.display = 'flex';
//   box.innerHTML = '';

//   const cls  = checkCategory(responseTaskJson.category);
//   const prio = findPrio(responseTaskJson.prio);

//   box.innerHTML = getOverlayDetails(
//     responseTaskJson.id, cls, responseTaskJson.category,
//     responseTaskJson.title, responseTaskJson.description, responseTaskJson.dueDate,
//     responseTaskJson.prio, prio
//   );

//   renderOverlayUser(responseTaskJson);

//   if (Array.isArray(responseTaskJson.subtasks)) {
//     if (typeof renderOverlaySubtasks === 'function') {
//       renderOverlaySubtasks(responseTaskJson);
//     } else {
//       simpleRenderOverlaySubtasks(responseTaskJson); // Fallback in dieser Datei
//     }
//   } else {
//     const h = document.getElementById('subtask-headline-overlay');
//     if (h) h.style.display = 'none';
//   }

//   renderOverlayFiles(responseTaskJson);
// }
/**
 * Renders the overlay details for a given task.
 * Splits into rendering the base layout and the additional elements. */
function renderOverlay(responseTaskJson) {
  const box = document.getElementById('task-details');
  if (!box) return;
  box.style.display = 'flex';
  box.innerHTML = '';

  const cls  = checkCategory(responseTaskJson.category);
  const prio = findPrio(responseTaskJson.prio);

  box.innerHTML = getOverlayDetails(
    responseTaskJson.id, cls, responseTaskJson.category,
    responseTaskJson.title, responseTaskJson.description,
    responseTaskJson.dueDate, responseTaskJson.prio, prio
  );

  renderOverlayUser(responseTaskJson);
  renderOverlayExtras(responseTaskJson);
}

/*Renders additional sections of the overlay (subtasks, files, etc.). */
function renderOverlayExtras(responseTaskJson) {
  if (Array.isArray(responseTaskJson.subtasks)) {
    if (typeof renderOverlaySubtasks === 'function') {
      renderOverlaySubtasks(responseTaskJson);
    } else {
      simpleRenderOverlaySubtasks(responseTaskJson); // fallback
    }
  } else {
    const h = document.getElementById('subtask-headline-overlay');
    if (h) h.style.display = 'none';
  }

  renderOverlayFiles(responseTaskJson);
}

/**Renders the subtasks list inside the overlay for the given task. */
function simpleRenderOverlaySubtasks(task){
  const box=document.getElementById('subtasks-overlay'); if(!box) return;
  const subs=subsOf(task);
  if(!subs.length){const h=document.getElementById('subtask-headline-overlay'); if(h) h.style.display='none'; box.innerHTML=''; return;}
  let html='<ul class="subtasks-list">'; for(let i=0;i<subs.length;i++) html+=subItemHTML(task.id,i,subs[i]||{});
  box.innerHTML=html+'</ul>';
}

/**Renders file previews (images/PDFs) and initializes Viewer.js. */
function renderOverlayFiles(responseTaskJson){
  const files = responseTaskJson.files; if (!Array.isArray(files)||!files.length) return;
  const wrap = document.getElementById(`viewer-${responseTaskJson.id}`); if(!wrap) return;
  const frag = document.createDocumentFragment();
  files.forEach(file=>{ const div=document.createElement('div'); div.appendChild(fileInfoLabel(file));
    div.insertAdjacentHTML('beforeend', filePreviewHTML(file)); frag.appendChild(div); });
  wrap.appendChild(frag); new Viewer(wrap,{navbar:true,toolbar:true,title:true});
}

/**Creates a simple label element indicating detected file type. */
function fileInfoLabel(file){
  const isPDF=/\.pdf$/i.test(file.name||''); const isIMG=/\.(png|jpe?g)$/i.test(file.name||'');
  const t=isPDF? 'Type: PDF': isIMG? 'Type: Image': 'Type: File';
  const info=document.createElement('div'); info.style.cssText='font-size:.85rem;color:#777;';
  info.textContent=t; return info;
}

/**HTML Template ,Returns minimal HTML preview markup for a file (image/PDF/link fallback).*/
function filePreviewHTML(file){
  const base64=file.base64, name=(file.name||'').toLowerCase();
  const isPDF=/\.pdf$/i.test(name), isIMG=/\.(png|jpe?g)$/i.test(name);
  if (isPDF) return `
  <div class="pdf-preview-wrapper">
    <embed src="${base64}" type="application/pdf" width="100" height="100" style="pointer-events:none;border-radius:4px;margin-top:6px;">
    <div class="file-name" style="font-size:11px;text-align:center;color:#555;margin-top:6px;word-break:break-word;">${file.name}</div>
  </div>
  <div class="file-controls">
    <button class="preview-btn" onclick="event.stopPropagation(); openPdfPreview('${base64}')">👁️</button>
    <button class="download-btn" onclick="event.stopPropagation(); downloadFile('${base64}','${file.name}')">⬇️</button>
  </div>`;
  if (isIMG) return `
  <img src="${base64}" alt="${file.name} | ${file.type} | ${formatBytes(file.size)}" style="max-width:100px;border-radius:4px;margin-top:6px;">
  <div class="file-controls">
    <button class="download-btn-img" onclick="event.stopPropagation(); downloadFile('${base64}','${file.name}')">⬇️</button>
    <div class="file-name" style="font-size:11px;text-align:center;color:#555;margin-top:6px;word-break:break-word;">${file.name}</div>
  </div>`;
  return `<a href="${base64}" target="_blank" download="${file.name}">📎 ${file.name}</a>`;
}

/**Formats byte size numbers into human-readable units. */
function formatBytes(bytes){
  const s=['Bytes','KB','MB','GB']; if(!bytes) return '0 Bytes';
  const i=Math.floor(Math.log(bytes)/Math.log(1024));
  return (bytes/Math.pow(1024,i)).toFixed(1)+' '+s[i];
}

/**Renders assigned users (names, initials, colors) in the overlay. */
function renderOverlayUser(responseTaskJson){
  const names=[], initials=[], colors=[]; determineUserInfo(responseTaskJson, names, initials, colors);
  const box=document.getElementById('user-names-overlay'); if(!box) return; let html='';
  const n=Math.min(names.length,3);
  for(let i=0;i<n;i++) html+=getUserNamesOverlay(initials[i], names[i], colors[i]);
  box.innerHTML=html; const more=document.getElementById('more-user-overlay');
  if(more) more.innerHTML = names.length>3? getMoreUserOverlay(names.length-3): '';
}

/**Extracts user display information from task and populates target arrays. */
function determineUserInfo(responseTaskJson, names, firstLetters, colors){
  const arr=responseTaskJson.assignedTo; if(!Array.isArray(arr)) return;
  arr.forEach(u=>{ const full=u.name || `${u.firstName||''} ${u.lastName||''}`.trim();
    const init=(window.getInitials)? window.getInitials(full):'?';
    names.push(full); firstLetters.push(init); colors.push(u.color||'#ccc');
  });
}

/**Renders all subtasks for the edit overlay. */
async function renderOverlayEditSubtasks(idOrKey) {
  const key = await resolveKey(idOrKey);
  const t = await fetch(`${BASE_URL}/tasks/${key}.json`).then(r=>r.json()) || {};
  const subs = normalizeSubtasks(t.subtasks);

  const box = document.getElementById('subtasks-overlay-edit');
  if (!box) return;

  let html = '<ul class="subtasks-list">';
  for (let i = 0; i < subs.length; i++) {
    const st = subs[i];
    html += `
      <li id="list-${i}" class="subtask-item ${st.status==='done'?'done':''}" data-sub-index="${i}">
        <button class="subtask-toggle" type="button"
                onclick="changeStatusSubtask(${t.id}, ${i}, '${st.status}')">
          <img class="subtask-check" src="${st.status==='done'?CHECKED:UNCHECKED}" alt="">
        </button>
        <span class="subtask-title"
              onclick="editSubtask('${key}', '${st.title.replace(/'/g,"\\'")}')">${st.title}</span>
        <button class="subtask-delete" type="button"
                onclick="deleteSubtask('${key}', '${st.title.replace(/'/g,"\\'")}')">🗑️</button>
      </li>`;
  }
  html += '</ul>';
  box.innerHTML = html;

  
  if (typeof t.id === 'number') updateBoardSubtaskProgressUI(t.id, subs);
}

/***/
async function toggleSubtaskFromDetails(displayId,subIndex){
  const key=await findKey(displayId-1), url=`${BASE_URL}/tasks/${key}.json`;
  const task=await fetch(url).then(r=>r.json())||{};
  const subs=subsOf(task); if(!subs[subIndex]) return;
  subs[subIndex].status=subs[subIndex].status==='done'?'not done':'done';
  await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({subtasks:subs})});
  rerender(task.id,subs); board(task.id,subs); toast(subs);
}

/**Opens the PDF modal and sets the viewer source.*/
function openPdfPreview(base64){
  const m=document.getElementById('pdf-modal'); const f=document.getElementById('pdf-frame');
  if (!m||!f) return; f.src=base64; m.style.display='flex';
}

/**Closes the PDF modal and clears the viewer source. */
function closeModal(){
  const m=document.getElementById('pdf-modal'); const f=document.getElementById('pdf-frame');
  if (!m||!f) return; m.style.display='none'; f.src='';
}

/**Triggers a browser download for the given base64 file. */
function downloadFile(base64, filename){
  const a=document.createElement('a'); a.href=base64; a.download=filename; a.click();
}
