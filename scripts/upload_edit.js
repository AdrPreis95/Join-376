/**Renders the file preview section in edit mode.*/
function renderEditFile(task) {
    const container = document.getElementById('edit-overlay-file-preview');
    if (!container) return;
    if (!Array.isArray(task.files)) task.files = [];

    container.innerHTML = `<div class="task-file viewer-gallery" id="viewer-${task.id}"></div>`;
    const viewer = document.getElementById(`viewer-${task.id}`);
    renderEachFile(task, viewer);
    renderUploadInput(container, task.id);
    initViewer(task.id);
}

/**Renders each file (image or PDF) into the viewer element.*/
function renderEachFile(task, viewer) {
    task.files.forEach((f, i) => {
        const isImage = f.base64?.startsWith('data:image/');
        const isPDF = f.base64?.startsWith('data:application/pdf');
        const wrapper = document.createElement('div');

        if (isImage) {
            wrapper.innerHTML = getImageMarkup(f, i, task.id);
        } else if (isPDF) {
            wrapper.innerHTML = getPdfMarkup(f, i, task.id);
        }

        viewer.appendChild(wrapper);
    });
}


/**Returns HTML markup for an image file with delete and download options.*/
function getImageMarkup(file, index, taskId) {
    return `
      <button class="delete-btn-edit" onclick="event.stopPropagation(); removeFileFromTask(${taskId}, ${index})">X</button>
      <div class="pdf-preview-wrapper">
          <span class="file-type-label">Type: Image</span>
         <img 
        src="${file.base64}" 
        alt="${file.name} | ${file.type || 'image/jpeg'} | ${formatBytes(file.size || 0)}" 
        class="edit-file-image" />
        <button class="download-btn-img" onclick="event.stopPropagation(); downloadFile('${file.base64}', '${file.name}')">
              ${getDownloadIcon()}
        </button>
        <div class="file-name">${file.name}</div>
      </div>`;
}

/**Format the Size for the uploaded Files*/
function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

/**Returns HTML markup for a PDF file with preview and download options.*/
function getPdfMarkup(file, index, taskId) {
    return `
      <button class="delete-btn-edit" onclick="event.stopPropagation(); removeFileFromTask(${taskId}, ${index})">X</button>
      <div class="pdf-preview-wrapper" onclick="openPdfPreview('${file.base64}')">
          <span class="file-type-label">Type: PDF</span>
          <embed src="${file.base64}" type="application/pdf" />
          <div class="file-controls">
              <button class="preview-btn" onclick="event.stopPropagation(); openPdfPreview('${file.base64}')">
                  ${getEyeIcon()}
              </button>
              <button class="download-btn" onclick="event.stopPropagation(); downloadFile('${file.base64}', '${file.name}')">
                  ${getDownloadIcon()}
              </button>
          </div>
          <div class="file-name">${file.name}</div>
      </div>`;
}


/**Renders a hidden file input with label for uploading images or PDFs in edit mode.*/
function renderUploadInput(container, taskId) {
    container.innerHTML += `
      <div style="margin-top: 20px; display: flex; align-items: center; gap: 8px;">
          <label for="edit-file-upload" style="cursor: pointer;">
              ${getPlusIcon()}
          </label>
          <input type="file" id="edit-file-upload" multiple accept=".jpg,.jpeg,.png,.pdf"
              style="display:none;" onchange="handleEditFileUpload(event, ${taskId})">
      </div>
    `;
}


/**Initializes the Viewer.js instance for a specific task.*/
function initViewer(taskId) {
    const viewerEl = document.getElementById(`viewer-${taskId}`);
    if (viewerEl) new Viewer(viewerEl);
}

/**Returns the SVG markup string for a download icon.*/
function getDownloadIcon() {
    return `
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
        <path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z" />
    </svg>`
}


/**Returns the SVG markup string for a open  icon.*/
function getEyeIcon() {
    return `
    <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"
        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="m11.998 5c-4.078 0-7.742 3.093-9.853 6.483-.096.159-.145.338-.145.517s.048.358.144.517c2.112 3.39 5.776 6.483 9.854 6.483 4.143 0 7.796-3.09 9.864-6.493.092-.156.138-.332.138-.507s-.046-.351-.138-.507c-2.068-3.403-5.721-6.493-9.864-6.493zm8.413 7c-1.837 2.878-4.897 5.5-8.413 5.5-3.465 0-6.532-2.632-8.404-5.5 1.871-2.868 4.939-5.5 8.404-5.5 3.518 0 6.579 2.624 8.413 5.5zm-8.411-4c2.208 0 4 1.792 4 4s-1.792 4-4 4-4-1.792-4-4 1.792-4 4-4zm0 1.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" fill-rule="nonzero" />
    </svg>`
}

/**Returns the SVG markup string for a add icon.*/
function getPlusIcon() {
    return `
    <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"
        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
        <path d="m12.002 2c5.518 0 9.998 4.48 9.998 9.998 0 5.517-4.48 9.997-9.998 9.997-5.517 0-9.997-4.48-9.997-9.997 0-5.518 4.48-9.998 9.997-9.998zm0 1.5c-4.69 0-8.497 3.808-8.497 8.498s3.807 8.497 8.497 8.497 8.498-3.807 8.498-8.497-3.808-8.498-8.498-8.498zm-.747 7.75h-3.5c-.414 0-.75.336-.75.75s.336.75.75.75h3.5v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5h3.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.5v-3.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75z"
            fill="currentcolor" />
    </svg>`
}


/**Removes a file from the given task by index and updates the Firebase entry.*/
async function removeFileFromTask(id, index) {
    id--;
    const taskRefUrl = `${BASE_URL}/tasks/${id}.json`;
    const task = await loadTaskWithID(id);
    if (!task || !task.files || !Array.isArray(task.files)) {
        console.warn("Data cannot deleted – Error: no Data", task);
        return;
    }
    task.files.splice(index, 1);
    await updateTaskInFirebase(taskRefUrl, { files: task.files });
    renderEditFile(task);
}


/**Handles file uploads in edit mode, validates file types and limits,
*updates the task in Firebase, and shows warnings if necessary.*/
async function handleEditFileUpload(event, taskId) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const id = taskId - 1;
    const task = await loadTaskWithID(id);
    if (!task) return;
    if (!Array.isArray(task.files)) task.files = [];

    let images = countFilesOfType(task.files, 'image/');
    let pdfs = countFilesOfType(task.files, 'application/pdf');
    let invalidFiles = [];
    let tooManyImages = false;
    let tooManyPDFs = false;

    await processSelectedFiles({
        files, task, id,
        counters: { images, pdfs },
        flags: { invalidFiles, tooManyImages, tooManyPDFs }});

    showUploadWarnings(invalidFiles, tooManyImages, tooManyPDFs);
}


/**Counts files in an array that match a specific MIME type prefix.*/
function countFilesOfType(fileArray, typePrefix) {
    return fileArray.filter(f => f.base64?.startsWith(`data:${typePrefix}`)).length;
}


/**Filters and processes valid image/PDF files, respecting file type and count limits.
 * Saves each valid file to the task and updates image/PDF counters accordingly.*/
function shouldSkipFile(file, counters, flags) {
    const fileName = file.name.toLowerCase();
    const mimeType = file.type;
    const isValidExt = /\.(png|jpe?g|pdf)$/.test(fileName);
    const isValidMime = ['image/png', 'image/jpeg', 'application/pdf'].includes(mimeType);
    const isImage = mimeType.startsWith('image/');
    const isPDF = mimeType === 'application/pdf';

    if (!isValidExt || !isValidMime) {
        flags.invalidFiles.push(file.name);
        return true;
    }
    if (isImage && counters.images >= 4) return flags.tooManyImages = true;
    if (isPDF && counters.pdfs >= 2) return flags.tooManyPDFs = true;
    return false;
}


/**Filters and processes valid image/PDF files, respecting file type and count limits.
 *Saves each valid file to the task and updates image/PDF counters accordingly.*/
async function processSelectedFiles({ files, task, id, counters, flags }) {
    for (let file of files) {
        if (shouldSkipFile(file, counters, flags)) continue;

        await readAndSaveFile(file, task, id);
        const mime = file.type;
        if (mime.startsWith('image/')) counters.images++;
        if (mime === 'application/pdf') counters.pdfs++;
    }
}


/**Converts file to base64, updates task in Firebase, and re-renders file preview.*/
async function readAndSaveFile(file, task, id) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async function (e) {
            const base64 = e.target.result;
            task.files.push({
                name: file.name,
                base64,
                size: file.size,
                type: file.type});

            await updateTaskInFirebase(`${BASE_URL}/tasks/${id}.json`, { files: task.files });
            renderEditFile(task);
            resolve();};
        reader.readAsDataURL(file);});
}


/**Displays upload warning overlays for invalid files and limit violations.*/
function showUploadWarnings(invalidFiles, tooManyImages, tooManyPDFs) {
    if (invalidFiles.length > 0) {
        showUploadWarningOverlay(`Invalid file format – not allowed: ${invalidFiles.join(', ')}`);
    }
    if (tooManyImages) {
        showUploadWarningOverlay(`Maximum of 4 images reached!!!`);
    }
    if (tooManyPDFs) {
        showUploadWarningOverlay(`Maximum of 2 PDFs reached!!!`);
    }
}

/**Displays upload warning overlays for invalid files and limit violations.*/
function showUploadWarningOverlay(message) {
    const overlay = document.getElementById('upload-warning-overlay');
    const msgContainer = document.getElementById('upload-warning-message');

    msgContainer.textContent = message;
    overlay.classList.remove('hidden');
    overlay.classList.add('show');

    setTimeout(() => {
        overlay.classList.remove('show');
        overlay.classList.add('hidden');
    }, 3000);
}

/**Updates The Task from Firebase async for Displaying the newest Task Updates*/
async function updateTaskInFirebase(ref, partial) {
  const url = (typeof ref === 'string')
    ? ref
    : `${BASE_URL}/tasks/${ref}.json`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial),});

  if (!res.ok) {
    const msg = `Firebase update failed: ${res.status} ${res.statusText}`;
    console.error(msg, { url, partial });
    throw new Error(msg);}
  return res.json();
}

const await_updateTaskInFirebase = updateTaskInFirebase;


