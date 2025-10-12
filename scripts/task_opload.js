/**Validates file type and extension.*/
function isValidFileType(file) {
  const allowedTypes = ["image/png","image/jpeg","image/jpg","application/pdf"];
  const validExtension = /\.(png|jpg|jpeg|pdf)$/i.test(file.name);
  return allowedTypes.includes(file.type) && validExtension;
}

/**Converts a file to base64 with metadata.*/
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({
      base64: reader.result, name: file.name, size: file.size, type: file.type
    });
    reader.onerror = err => reject(err);
  });
}

/**Renders file preview in edit mode (image or PDF).*/
function renderEditFile(task) {
  const c = document.getElementById('edit-overlay-file-preview');
  c.innerHTML = "";
  if (!task?.file?.base64 || !task?.file?.name) return;
  const name = task.file.name.toLowerCase();
  if (name.endsWith(".pdf")) return renderEditPDF(c, task);
  if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg"))
    return renderEditImage(c, task);
}
function renderEditPDF(c, task){
  c.innerHTML = `
    <object data="${task.file.base64}" type="application/pdf" width="100%" height="300px">
      <p>PDF cannot showed. <a href="${task.file.base64}" target="_blank">PDF öffnen</a></p>
    </object>
    <button onclick="removeFileFromTask(${task.id})">delete</button>`;
}
function renderEditImage(c, task){
  c.innerHTML = `
    <img src="${task.file.base64}" alt="${task.file.name}" style="max-width:100%;max-height:300px;">
    <button onclick="removeFileFromTask(${task.id})">delete</button>`;
}

/**Resizes and converts an image to base64 with compression.*/
function resizeAndConvertImage(file, maxWidth, maxHeight, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) return reject(new TypeError("Kein gültiges File-Objekt übergeben"));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => handleImageLoad(e, file, maxWidth, maxHeight, quality, resolve, reject);
    reader.onerror = (err) => reject(err);
  });
}

/**Handles image load, resizes it and returns base64 data.*/
function handleImageLoad(event, file, maxWidth, maxHeight, quality, resolve, reject) {
  const img = new Image();
  img.src = event.target.result;
  img.onload = () => {
    const { canvas, width, height } = createResizedCanvas(img, maxWidth, maxHeight);
    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
    const base64 = canvas.toDataURL("image/jpeg", quality);
    const newName = file.name.replace(/\.(png|jpeg|jpg)$/i, '.jpg');
    resolve({ base64, name: newName, size: Math.round((base64.length * 3) / 4), type: "image/jpeg" });
  };
  img.onerror = (err) => reject(err);
}

/**Creates a resized canvas based on max dimensions while keeping aspect ratio.*/
function createResizedCanvas(img, maxWidth, maxHeight) {
  let { width, height } = img;
  if (width > maxWidth || height > maxHeight) {
    if (width > height) { height = height * (maxWidth / width); width = maxWidth; }
    else { width = width * (maxHeight / height); height = maxHeight; }
  }
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  return { canvas, width, height };
}

/**Handles new file uploads: validates and adds images or PDFs to uploadedFiles.*/
async function handleNewFiles(newFiles) {
  for (let file of newFiles) await processNewFile(file);
}
async function processNewFile(file){
  const isPDF = file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/');
  const pdfCount = uploadedFiles.filter(f => f.name.toLowerCase().endsWith('.pdf')).length;
  const imageCount = uploadedFiles.filter(f => f.type.startsWith('image/')).length;
  if (uploadedFiles.some(f => f.name === file.name)) return;
  if (!isValidFileType(file)) return warnInvalidType(file);
  if (isPDF && pdfCount < MAX_PDFS) uploadedFiles.push(await convertToBase64(file));
  else if (isImage && imageCount < MAX_IMAGES) uploadedFiles.push(await resizeAndConvertImage(file, 800, 800, 0.8));
}
function warnInvalidType(file){
  const extMatch = file.name.match(/\.\w+$/);
  showFileTypeWarning(extMatch ? extMatch[0] : "unknown");
}

/**Renders file previews (images and PDFs) and initializes image viewer.*/
function renderUploadPreview() {
  const container = document.getElementById('file-preview-container');
  container.innerHTML = '';
  const imageReaders = [];
  uploadedFiles.forEach((file, index) => {
    if (file.type === 'application/pdf') renderPDFPreview(file, index, container);
    else if (file.type === 'image/jpeg') imageReaders.push(readAndRenderImage(file, index, container));
  });
  finalizeImageViewer(container, imageReaders);
}

/**Renders a single PDF preview with open and delete options.*/
function renderPDFPreview(file, index, container) {
  container.innerHTML += `
    <div class="file-preview">
      <span style="cursor:pointer;" onclick="openPdfViewerAdd('${file.base64}')">📎 ${file.name}</span>
      <button onclick="removePreviewFile(${index})">X</button>
    </div>`;
}

/**Reads an image file and renders its preview in the container.*/
function readAndRenderImage(file, index, container) {
  const size = formatBytes(file.size), type = file.type;
  container.innerHTML += `
    <div class="file-preview">
      <img src="${file.base64}" alt="${file.name} | ${type} | ${size}" class="viewer-image" style="max-width:100px;cursor:pointer;">
      <button onclick="removePreviewFile(${index})">X</button>
    </div>`;
  return Promise.resolve();
}

/**
 * Converts a byte value into a human-readable string using appropriate units (Bytes, KB, MB, GB).
 * formatBytes(0); // "0 Bytes"
 * formatBytes(1024); // "1.0 KB"
 * formatBytes(1048576); // "1.0 MB"
 */
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

/**Initializes the image viewer after all image previews are rendered.*/
function finalizeImageViewer(container, imageReaders) {
  Promise.all(imageReaders).then(() => {
    container.viewer = new Viewer(container, { toolbar: true, navbar: false, title: true, tooltip: true });
  });
}

/**Updates the file upload warning message if image or PDF limits are exceeded.
 * Displays current limit status in the warning container.*/
function updateUploadWarnings() {
  const warningContainer = document.getElementById('file-limit-warning');
  const pdfs = uploadedFiles.filter(f => f.name.toLowerCase().endsWith('.pdf')).length;
  const imgs = uploadedFiles.filter(f => f.type.startsWith('image/')).length;
  let warnings = [];
  if (imgs >= MAX_IMAGES) warnings.push(`Maximum ${MAX_IMAGES} images allowed`);
  if (pdfs >= MAX_PDFS) warnings.push(`Maximum ${MAX_PDFS} PDFs allowed`);
  warningContainer.innerText = warnings.join(' • ');
}

/** Maximum number of allowed image uploads. */
const MAX_IMAGES = 4;
/** Maximum number of allowed PDF uploads. */
const MAX_PDFS = 2;

/**Processes newly selected files, renders their preview, */
async function showUploadPreview(newFiles) {
  const container = document.getElementById('file-preview-container');
  if (container.viewer) container.viewer.destroy();
  container.innerHTML = '';
  await handleNewFiles(newFiles);
  renderUploadPreview();
  updateUploadWarnings();
}

/**Removes a file from the uploaded list by index and updates the preview.*/
function removePreviewFile(index) {
  uploadedFiles.splice(index, 1);
  showUploadPreview([]);
}

/**Processes selected files by validating, compressing images and converting to base64.*/
async function processFiles(files) {
  if (!(files[0] instanceof File)) return files;
  const images = [], pdfs = [];
  for (let file of files) await accumulateProcessed(files, file, images, pdfs);
  return [...images, ...pdfs];
}
async function accumulateProcessed(all, file, images, pdfs){
  if (!isValidFileType(file)) { alert(`${file.name} hat ein ungültiges Format.`); return; }
  if (file.type.startsWith('image/') && images.length < 4) images.push(await resizeAndConvertImage(file, 800, 800));
  else if (file.type === 'application/pdf' && pdfs.length < 2) pdfs.push(await convertToBase64(file));
}

/**Validates max allowed number of image and PDF files.*/
function validateFileLimits(files) {
  const imageCount = files.filter(f => f.type.startsWith('image/')).length;
  const pdfCount = files.filter(f => f.type === 'application/pdf').length;
  if (imageCount > 4) { alert("Maximum 4 Images allowed."); return false; }
  if (pdfCount > 2) { alert("Maximum 2 PDFs allowed."); return false; }
  return true;
}

/**Opens a modal to preview a PDF file using a base64 URL.*/
function openPdfViewerAdd(base64Url) {
  const modal = document.getElementById("pdf-modal-add");
  const iframe = document.getElementById("pdf-frame-add");
  iframe.src = base64Url; modal.style.display = "flex";
}

/**Closes the PDF modal and resets the iframe.
 * Reinitializes the image viewer if images are present in the preview container.*/
function closePdfModalAdd() {
  const modal = document.getElementById("pdf-modal-add");
  const iframe = document.getElementById("pdf-frame-add");
  iframe.src = ""; modal.style.display = "none";
  const container = document.getElementById('file-preview-container');
  const images = container.querySelectorAll('img.viewer-image');
  if (images.length > 0) rebuildViewer(container);
}
function rebuildViewer(container){
  if (container.viewer) container.viewer.destroy();
  setTimeout(() => {
    container.viewer = new Viewer(container, { toolbar: true, navbar: false, title: true, tooltip: true });
  }, 10);
}

/**Displays a temporary overlay warning when a user selects an unsupported file type. */
function showFileTypeWarning(extension) {
  const overlay = document.getElementById('filetype-warning-overlay');
  const typeSpan = document.getElementById('rejected-filetype');
  typeSpan.textContent = extension.toLowerCase();
  overlay.classList.add('show');
  setTimeout(() => overlay.classList.remove('show'), 3000);
}

/**Adds or removes the 'full' class on the preview container 
 * depending on the number of uploaded file previews.*/
const container = document.getElementById('file-preview-container');
const previews = container.querySelectorAll('.file-preview');
if (previews.length >= 4) container.classList.add('full');
else container.classList.remove('full');
