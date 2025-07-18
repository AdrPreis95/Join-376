function isValidFileType(file) {
    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf"
    ];
    const validExtension = /\.(png|jpg|jpeg|pdf)$/i.test(file.name);

    return allowedTypes.includes(file.type) && validExtension;
}


function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ base64: reader.result, name: file.name });
        reader.onerror = error => reject(error);
    });
}
function renderEditFile(task) {
    const container = document.getElementById('edit-overlay-file-preview');
    container.innerHTML = "";

    if (!task?.file?.base64 || !task?.file?.name) return;

    const fileName = task.file.name.toLowerCase();

    if (fileName.endsWith(".pdf")) {
        container.innerHTML = `
            <object data="${task.file.base64}" type="application/pdf" width="100%" height="300px">
                <p>PDF cannot showed. <a href="${task.file.base64}" target="_blank">PDF öffnen</a></p>
            </object>
            <button onclick="removeFileFromTask(${task.id})">Anhang entfernen</button>
        `;
    } else if (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        container.innerHTML = `
            <img src="${task.file.base64}" alt="${task.file.name}" style="max-width: 100%; max-height: 300px;">
            <button onclick="removeFileFromTask(${task.id})">Anhang entfernen</button>
        `;
    }
}

function resizeAndConvertImage(file, maxWidth, maxHeight, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;


                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    } else {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL("image/jpeg", quality);
                resolve({ base64, name: file.name });
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
}

function handleNewFiles(newFiles) {
    for (let file of newFiles) {
        const isPDF = file.name.toLowerCase().endsWith('.pdf');
        const isImage = file.type.startsWith('image/');

        const pdfCount = uploadedFiles.filter(f => f.name.toLowerCase().endsWith('.pdf')).length;
        const imageCount = uploadedFiles.filter(f => f.type.startsWith('image/')).length;

        const alreadyExists = uploadedFiles.some(f => f.name === file.name);
        if (alreadyExists) continue;

        if (!isValidFileType(file)) {
            const extMatch = file.name.match(/\.\w+$/);
            const extension = extMatch ? extMatch[0] : "unknown";
            showFileTypeWarning(extension);
            continue;
        }

        if (isPDF && pdfCount < MAX_PDFS) {
            uploadedFiles.push(file);
        } else if (isImage && imageCount < MAX_IMAGES) {
            uploadedFiles.push(file);
        }
    }
}

function renderUploadPreview() {
    const container = document.getElementById('file-preview-container');
    container.innerHTML = '';

    const imageReaders = [];

    uploadedFiles.forEach((file, index) => {
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.pdf')) {
            container.innerHTML += `
                <div class="file-preview">
                    <span style="cursor:pointer;" onclick="openPdfViewerAdd('${URL.createObjectURL(file)}')">📎 ${file.name}</span>
                    <button onclick="removePreviewFile(${index})">X</button>
                </div>`;
        } else if (fileName.match(/\.(png|jpe?g)$/)) {
            const reader = new FileReader();

            const readPromise = new Promise((resolve) => {
                reader.onload = () => {
                    container.innerHTML += `
                        <div class="file-preview">
                            <img src="${reader.result}" alt="${file.name}" class="viewer-image" style="max-width: 100px; cursor: pointer;">
                            <button onclick="removePreviewFile(${index})">X</button>
                        </div>`;
                    resolve();
                };
            });

            reader.readAsDataURL(file);
            imageReaders.push(readPromise);
        }
    });

    // Jetzt warten wir auf alle Bilder – DANN wird Viewer initialisiert
    Promise.all(imageReaders).then(() => {
        container.viewer = new Viewer(container, {
            toolbar: true,
            navbar: false,
            title: true,
            tooltip: true
        });
    });
}


function updateUploadWarnings() {
    const warningContainer = document.getElementById('file-limit-warning');
    const pdfs = uploadedFiles.filter(f => f.name.toLowerCase().endsWith('.pdf')).length;
    const imgs = uploadedFiles.filter(f => f.type.startsWith('image/')).length;

    let warnings = [];
    if (imgs >= MAX_IMAGES) warnings.push(`Maximum ${MAX_IMAGES} images allowed`);
    if (pdfs >= MAX_PDFS) warnings.push(`Maximum ${MAX_PDFS} PDFs allowed`);

    warningContainer.innerText = warnings.join(' • ');
}

const MAX_IMAGES = 4;
const MAX_PDFS = 2;

function showUploadPreview(newFiles) {
    const container = document.getElementById('file-preview-container');
    if (container.viewer) {
        container.viewer.destroy();
    }
    container.innerHTML = '';

    handleNewFiles(newFiles);
    renderUploadPreview();
    updateUploadWarnings();
}



function removePreviewFile(index) {
    uploadedFiles.splice(index, 1);
    showUploadPreview([]); 
}


async function processFiles(files) {
    const images = [];
    const pdfs = [];

    for (let file of files) {
        if (!isValidFileType(file)) {
            alert(`${file.name} hat ein ungültiges Format.`);
            continue;
        }

        if (file.type.startsWith('image/') && images.length < 4) {
            const img = await resizeAndConvertImage(file, 800, 800);
            images.push(img);
        } else if (file.type === 'application/pdf' && pdfs.length < 2) {
            const pdf = await convertToBase64(file);
            pdfs.push(pdf);
        }
    }

    return [...images, ...pdfs];
}


function validateFileLimits(files) {
    const imageCount = files.filter(f => f.type.startsWith('image/')).length;
    const pdfCount = files.filter(f => f.type === 'application/pdf').length;

    if (imageCount > 4) {
        alert("Maximum 4 Images allowed.");
        return false;
    }

    if (pdfCount > 2) {
        alert("Maximum 2 PDFs allowed.");
        return false;
    }

    return true;
}


function validateFileLimits(files) {
    const images = files.filter(file => file.type.startsWith('image/'));
    const pdfs = files.filter(file => file.type === 'application/pdf');

    if (images.length > 4) {
        alert("Maximum 4 Images allowed!");
        return false;
    }

    if (pdfs.length > 2) {
        alert("Maximum 2 PDFs allowed!");
        return false;
    }

    return true;
}


function openPdfViewerAdd(base64Url) {
    const modal = document.getElementById("pdf-modal-add");
    const iframe = document.getElementById("pdf-frame-add");
    iframe.src = base64Url;
    modal.style.display = "flex";
}


function closePdfModalAdd() {
    const modal = document.getElementById("pdf-modal-add");
    const iframe = document.getElementById("pdf-frame-add");
    iframe.src = "";
    modal.style.display = "none";
    const container = document.getElementById('file-preview-container');
    const images = container.querySelectorAll('img.viewer-image');
    if (images.length > 0) {
        if (container.viewer) {
            container.viewer.destroy();
        }
        setTimeout(() => {
            container.viewer = new Viewer(container, {
                toolbar: true,
                navbar: false,
                title: true,
                tooltip: true
            });
        }, 10);
    }
}


function showFileTypeWarning(extension) {
    const overlay = document.getElementById('filetype-warning-overlay');
    const typeSpan = document.getElementById('rejected-filetype');

    typeSpan.textContent = extension.toLowerCase();
    overlay.classList.add('show');

    setTimeout(() => {
        overlay.classList.remove('show');
    }, 3000);
}

const container = document.getElementById('file-preview-container');
const previews = container.querySelectorAll('.file-preview');

if (previews.length >= 4) { 
  container.classList.add('full');
} else {
  container.classList.remove('full');
}
