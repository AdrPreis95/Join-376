

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
              <button class="delete-btn-edit" onclick="event.stopPropagation(); removeFileFromTask(${task.id}, ${i})">X</button>
                <div class="pdf-preview-wrapper">
    
                    <span class="file-type-label">Type: Image</span>
                    <img src="${f.base64}" alt="${f.name}" class="edit-file-image" />
                    <button class="download-btn-img" onclick="event.stopPropagation(); downloadFile('${f.base64}', '${f.name}')">
                        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
                            <path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z"/>
                        </svg>
                    </button>
                    <div class="file-name">${f.name}</div>
                </div>`;
        }

        else if (isPDF) {
            wrapper.innerHTML = `
             <button class="delete-btn-edit" onclick="event.stopPropagation(); removeFileFromTask(${task.id}, ${i})">X</button>
                <div class="pdf-preview-wrapper" onclick="openPdfPreview('${f.base64}')">
                 
                    <span class="file-type-label">Type: PDF</span>
                    <embed src="${f.base64}" type="application/pdf" />
                    <div class="file-controls">
                        <button class="preview-btn" onclick="event.stopPropagation(); openPdfPreview('${f.base64}')">
                        <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.998 5c-4.078 0-7.742 3.093-9.853 6.483-.096.159-.145.338-.145.517s.048.358.144.517c2.112 3.39 5.776 6.483 9.854 6.483 4.143 0 7.796-3.09 9.864-6.493.092-.156.138-.332.138-.507s-.046-.351-.138-.507c-2.068-3.403-5.721-6.493-9.864-6.493zm8.413 7c-1.837 2.878-4.897 5.5-8.413 5.5-3.465 0-6.532-2.632-8.404-5.5 1.871-2.868 4.939-5.5 8.404-5.5 3.518 0 6.579 2.624 8.413 5.5zm-8.411-4c2.208 0 4 1.792 4 4s-1.792 4-4 4-4-1.792-4-4 1.792-4 4-4zm0 1.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" fill-rule="nonzero"/></svg>
                        </button>
                        <button class="download-btn" onclick="event.stopPropagation(); downloadFile('${f.base64}', '${f.name}')">
                            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
                                <path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z"/>
                            </svg>
                        </button>
                      
                    </div>
                    <div class="file-name">${f.name}</div>
                </div>`;
        }

        viewer.appendChild(wrapper);
    });

   container.innerHTML += `
    <div style="margin-top: 20px; display: flex; align-items: center; gap: 8px;">
        <label for="edit-file-upload" style="cursor: pointer;">
            <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"
                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path d="m12.002 2c5.518 0 9.998 4.48 9.998 9.998 0 5.517-4.48 9.997-9.998 9.997-5.517 0-9.997-4.48-9.997-9.997 0-5.518 4.48-9.998 9.997-9.998zm0 1.5c-4.69 0-8.497 3.808-8.497 8.498s3.807 8.497 8.497 8.497 8.498-3.807 8.498-8.497-3.808-8.498-8.498-8.498zm-.747 7.75h-3.5c-.414 0-.75.336-.75.75s.336.75.75.75h3.5v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5h3.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.5v-3.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75z"
                    fill="currentcolor" />
            </svg>
        </label>
        <input type="file" id="edit-file-upload" multiple accept=".jpg,.jpeg,.png,.pdf"
            style="display:none;" onchange="handleEditFileUpload(event, ${task.id})">
    </div>
`;


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


