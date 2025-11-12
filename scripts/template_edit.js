/** Returns image preview markup incl. delete and download actions. */
function getImageMarkup(file, index, taskId) {
  const size = formatBytes(file.size || 0), type = file.type || 'image/jpeg';
  const name = esc(file.name);
  return `
    <button class="delete-btn-edit" onclick="event.stopPropagation(); removeFileFromTask(${taskId}, ${index})">X</button>
    <div class="pdf-preview-wrapper">
      <span class="file-type-label">Type: Image</span>
      <img src="${file.base64}" alt="${name} | ${type} | ${size}" class="edit-file-image"/>
      <button class="download-btn-img" onclick="event.stopPropagation(); downloadFile('${file.base64}', '${name}')">${getDownloadIcon()}</button>
      <div class="file-name">${name}</div>
    </div>`;
};

/** Returns pdf preview markup incl. open and download actions. */
function getPdfMarkup(file, index, taskId) {
  const name = esc(file.name);
  return `
    <button class="delete-btn-edit" onclick="event.stopPropagation(); removeFileFromTask(${taskId}, ${index})">X</button>
    <div class="pdf-preview-wrapper" onclick="openPdfPreview('${file.base64}')">
      <span class="file-type-label">Type: PDF</span>
      <embed src="${file.base64}" type="application/pdf"/>
      <div class="file-controls">
        <button class="preview-btn" onclick="event.stopPropagation(); openPdfPreview('${file.base64}')">${getEyeIcon()}</button>
        <button class="download-btn" onclick="event.stopPropagation(); downloadFile('${file.base64}', '${name}')">${getDownloadIcon()}</button>
      </div>
      <div class="file-name">${name}</div>
    </div>`;
};

/** Returns SVG string for a download icon. */
function getDownloadIcon() {
  return `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
    <path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z"/></svg>`;
};

/** Returns SVG string for an eye (open/preview) icon. */
function getEyeIcon() {
  return `<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"
    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="m11.998 5c-4.078 0-7.742 3.093-9.853 6.483-.096.159-.145.338-.145.517s.048.358.144.517c2.112 3.39 5.776 6.483 9.854 6.483 4.143 0 7.796-3.09 9.864-6.493.092-.156.138-.332.138-.507s-.046-.351-.138-.507c-2.068-3.403-5.721-6.493-9.864-6.493zm8.413 7c-1.837 2.878-4.897 5.5-8.413 5.5-3.465 0-6.532-2.632-8.404-5.5 1.871-2.868 4.939-5.5 8.404-5.5 3.518 0 6.579 2.624 8.413 5.5zm-8.411-4c2.208 0 4 1.792 4 4s-1.792 4-4 4-4-1.792-4-4 1.792-4 4-4zm0 1.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" fill-rule="nonzero"/></svg>`;
};

/** Returns SVG string for a plus (add) icon. */
function getPlusIcon() {
  return `<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"
    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="m12.002 2c5.518 0 9.998 4.48 9.998 9.998 0 5.517-4.48 9.997-9.998 9.997-5.517 0-9.997-4.48-9.997-9.997 0-5.518 4.48-9.998 9.997-9.998zm0 1.5c-4.69 0-8.497 3.808-8.497 8.498s3.807 8.497 8.497 8.497 8.498-3.807 8.498-8.497-3.808-8.498-8.498-8.498zm-.747 7.75h-3.5c-.414 0-.75.336-.75.75s.336.75.75.75h3.5v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5h3.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.5v-3.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fill="currentcolor"/></svg>`;
};

