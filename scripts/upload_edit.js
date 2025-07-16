

function renderEditFile(task) {
    const container = document.getElementById('edit-overlay-file-preview');
    if (!container) return;
    if (!Array.isArray(task.files)) task.files = [];

    container.innerHTML = `<div class="task-file viewer-gallery" id="viewer-${task.id}"></div>`;
    const viewer = document.getElementById(`viewer-${task.id}`);

    task.files.forEach((f, i) => {
        const isImage = f.base64?.startsWith('data:image/');
        const isPDF = f.base64?.startsWith('data:application/pdf');
        const wrapper = document.createElement('div');

        if (isImage) {
            wrapper.innerHTML = `
                <div class="pdf-preview-wrapper">
                    <span class="file-type-label">Type: Image</span>
                    <img src="${f.base64}" alt="${f.name}" class="edit-file-image" />
                    <button class="download-btn-img" onclick="event.stopPropagation(); downloadFile('${f.base64}', '${f.name}')">
                        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
                            <path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z"/>
                        </svg>
                    </button>
                    <button class="delete-btn" onclick="event.stopPropagation(); removeFileFromTask(${task.id}, ${i})">🗑</button>
                    <div class="file-name">${f.name}</div>
                </div>`;
        }

        else if (isPDF) {
            wrapper.innerHTML = `
                <div class="pdf-preview-wrapper" onclick="openPdfPreview('${f.base64}')">
                    <span class="file-type-label">Type: PDF</span>
                    <embed src="${f.base64}" type="application/pdf" />
                    <div class="file-controls">
                        <button class="preview-btn" onclick="event.stopPropagation(); openPdfPreview('${f.base64}')">
                            <svg viewBox="0 0 24 24"><path d="M12 5c-4.1 0-7.7 3.1-9.9 6.5a1.1 1.1 0 000 1c2.2 3.4 5.8 6.5 9.9 6.5s7.7-3.1 9.9-6.5a1.1 1.1 0 000-1C19.7 8.1 16.1 5 12 5zm0 10a4 4 0 110-8 4 4 0 010 8z"/></svg>
                        </button>
                        <button class="download-btn" onclick="event.stopPropagation(); downloadFile('${f.base64}', '${f.name}')">
                            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
                                <path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z"/>
                            </svg>
                        </button>
                        <button class="delete-btn" onclick="event.stopPropagation(); removeFileFromTask(${task.id}, ${i})">🗑</button>
                    </div>
                    <div class="file-name">${f.name}</div>
                </div>`;
        }

        viewer.appendChild(wrapper);
    });

    container.innerHTML += `
        <div style="margin-top:20px;">
            <label for="edit-file-upload" style="cursor:pointer;color:#0057ff;text-decoration:underline;">📎 Datei anhängen</label>
            <input type="file" id="edit-file-upload" multiple accept=".jpg,.jpeg,.png,.pdf" style="display:none;" onchange="handleEditFileUpload(event, ${task.id})">
        </div>`;

    if (document.getElementById(`viewer-${task.id}`)) {
        new Viewer(document.getElementById(`viewer-${task.id}`));
    }
}


async function removeFileFromTask(id, index) {
    id--;
    const taskRefUrl = `${BASE_URL}/tasks/${id}.json`;
    const task = await loadTaskWithID(id);

    if (!task || !task.files || !Array.isArray(task.files)) {
        console.warn("Datei konnte nicht entfernt werden – keine gültigen Daten:", task);
        return;
    }

    task.files.splice(index, 1);

    await updateTaskInFirebase(taskRefUrl, { files: task.files });

    renderEditFile(task);
    console.log("Anhang entfernt");
}



async function handleEditFileUpload(event, taskId) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const id = taskId - 1;
    const task = await loadTaskWithID(id);
    if (!task) return;
    if (!Array.isArray(task.files)) task.files = [];

    let images = task.files.filter(f => f.base64?.startsWith('data:image/')).length;
    let pdfs = task.files.filter(f => f.base64?.startsWith('data:application/pdf')).length;

    let invalidFiles = [];
    let tooManyImages = false;
    let tooManyPDFs = false;

    for (let file of files) {
        const fileName = file.name.toLowerCase();
        const mimeType = file.type;


        const isValidExtension = /\.(png|jpe?g|pdf)$/.test(fileName);
        const isValidMime = mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'application/pdf';

        const isImage = mimeType.startsWith('image/');
        const isPDF = mimeType === 'application/pdf';


        if (!isValidExtension || !isValidMime) {
            invalidFiles.push(file.name);
            continue;
        }

        if (isImage && images >= 4) {
            tooManyImages = true;
            continue;
        }

        if (isPDF && pdfs >= 2) {
            tooManyPDFs = true;
            continue;
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            const base64 = e.target.result;
            task.files.push({ name: file.name, base64 });

            await updateTaskInFirebase(`${BASE_URL}/tasks/${id}.json`, { files: task.files });
            renderEditFile(task);
        };
        reader.readAsDataURL(file);

        if (isImage) images++;
        if (isPDF) pdfs++;
    }


    if (invalidFiles.length > 0) {
        showUploadWarningOverlay(`❌ Ungültiges Dateiformat: ${invalidFiles.join(', ')}`);
    }
    if (tooManyImages) {
        showUploadWarningOverlay(`⚠️ Maximal 4 Bilder erlaubt.`);
    }
    if (tooManyPDFs) {
        showUploadWarningOverlay(`⚠️ Maximal 2 PDFs erlaubt.`);
    }
}


function showUploadWarningOverlay(message) {
    const overlay = document.getElementById('upload-warning-overlay');
    const msgContainer = document.getElementById('upload-warning-message');

    msgContainer.textContent = message;
    overlay.classList.remove('hidden');
    overlay.classList.add('show');

    setTimeout(() => {
        overlay.classList.remove('show');
        overlay.classList.add('hidden');
    }, 2000);
}


