async function showOverlayDetailsTask(id) {
  id--;
  const all = document.getElementById('all-content');
  const blocker = document.getElementById('overlay-blocker');
  if (all) all.style.filter = 'brightness(0.5)';
  blocker?.classList.remove('hidden');
  const res = await fetch(BASE_URL + "/tasks.json");
  const json = await res.json();
  const arr = Array.isArray(json) ? json : Object.values(json||{});
  const task = arr[id]; if (!task) return;
  renderOverlay(task);
}

function renderOverlay(responseTaskJson) {
  const box = document.getElementById('task-details');
  if (!box) return; box.style.display = 'flex'; box.innerHTML = '';
  const cls = checkCategory(responseTaskJson.category);
  const prio = findPrio(responseTaskJson.prio);
  box.innerHTML = getOverlayDetails(responseTaskJson.id, cls, responseTaskJson.category,
    responseTaskJson.title, responseTaskJson.description, responseTaskJson.dueDate,
    responseTaskJson.prio, prio);
  renderOverlayUser(responseTaskJson);
  if (Array.isArray(responseTaskJson.subtasks)) renderOverlaySubtasks(responseTaskJson);
  else { const h = document.getElementById('subtask-headline-overlay'); if (h) h.style.display='none'; }
  renderOverlayFiles(responseTaskJson);
}

function renderOverlayFiles(responseTaskJson){
  const files = responseTaskJson.files; if (!Array.isArray(files)||!files.length) return;
  const wrap = document.getElementById(`viewer-${responseTaskJson.id}`); if(!wrap) return;
  const frag = document.createDocumentFragment();
  files.forEach(file=>{ const div=document.createElement('div'); div.appendChild(fileInfoLabel(file));
    div.insertAdjacentHTML('beforeend', filePreviewHTML(file)); frag.appendChild(div); });
  wrap.appendChild(frag); new Viewer(wrap,{navbar:true,toolbar:true,title:true});
}

function fileInfoLabel(file){
  const isPDF=/\.pdf$/i.test(file.name||''); const isIMG=/\.(png|jpe?g)$/i.test(file.name||'');
  const t=isPDF? 'Type: PDF': isIMG? 'Type: Image': 'Type: File';
  const info=document.createElement('div'); info.style.cssText='font-size:.85rem;color:#777;';
  info.textContent=t; return info;
}

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

function formatBytes(bytes){
  const s=['Bytes','KB','MB','GB']; if(!bytes) return '0 Bytes';
  const i=Math.floor(Math.log(bytes)/Math.log(1024));
  return (bytes/Math.pow(1024,i)).toFixed(1)+' '+s[i];
}

function renderOverlayUser(responseTaskJson){
  const names=[], initials=[], colors=[]; determineUserInfo(responseTaskJson, names, initials, colors);
  const box=document.getElementById('user-names-overlay'); if(!box) return; let html='';
  const n=Math.min(names.length,3);
  for(let i=0;i<n;i++) html+=getUserNamesOverlay(initials[i], names[i], colors[i]);
  box.innerHTML=html; const more=document.getElementById('more-user-overlay');
  if(more) more.innerHTML = names.length>3? getMoreUserOverlay(names.length-3): '';
}

function determineUserInfo(responseTaskJson, names, firstLetters, colors){
  const arr=responseTaskJson.assignedTo; if(!Array.isArray(arr)) return;
  arr.forEach(u=>{ const full=u.name || `${u.firstName||''} ${u.lastName||''}`.trim();
    const init=(window.getInitials)? window.getInitials(full):'?';
    names.push(full); firstLetters.push(init); colors.push(u.color||'#ccc');
  });
}

async function renderOverlaySubtasks(responseTaskJson){
  const box=document.getElementById('subtasks-overlay'); if(!box) return; let html='';
  for(let i=0;i<responseTaskJson.subtasks.length;i++){
    const st=responseTaskJson.subtasks[i]; const icon= st.status==='done'? './assets/icons/checked_icon.png':'./assets/icons/unchecked_icon.png';
    html+= getSubtasksOverlay(responseTaskJson.id, [i], st.status, st.title, icon);
  } box.innerHTML += html;
}

function openPdfPreview(base64){
  const m=document.getElementById('pdf-modal'); const f=document.getElementById('pdf-frame');
  if (!m||!f) return; f.src=base64; m.style.display='flex';
}

function closeModal(){
  const m=document.getElementById('pdf-modal'); const f=document.getElementById('pdf-frame');
  if (!m||!f) return; m.style.display='none'; f.src='';
}

function downloadFile(base64, filename){
  const a=document.createElement('a'); a.href=base64; a.download=filename; a.click();
}
