/**
 * This function loads the selected task using the ID.
 * @param {number} id - The ID is transferred when the function is called so that the correct task can be loaded from Firebase.
 */
async function showOverlayDetailsTask(id) {
    id--
    document.getElementById('all-content').style = 'filter: brightness(0.5);';
    let responseTask = await fetch(BASE_URL + "/tasks.json");
    let responseTaskJson = await responseTask.json();
    let tasksArray = Object.values(responseTaskJson);
    tasksArray = tasksArray[id];
    renderOverlay(tasksArray);
}



function renderOverlay(responseTaskJson) {
    let refOverlay = document.getElementById('task-details');
    refOverlay.style = 'display: flex';
    refOverlay.innerHTML = "";

    let classCategory = checkCategory(responseTaskJson.category);
    let prioIcon = findPrio(responseTaskJson.prio);

    refOverlay.innerHTML = getOverlayDetails(
        responseTaskJson.id,
        classCategory,
        responseTaskJson.category,
        responseTaskJson.title,
        responseTaskJson.description,
        responseTaskJson.dueDate,
        responseTaskJson.prio,
        prioIcon
    );

    renderOverlayUser(responseTaskJson);

    if (responseTaskJson.subtasks != undefined) {
        renderOverlaySubtasks(responseTaskJson);
    } else {
        document.getElementById('subtask-headline-overlay').style = 'display: none';
    }

    if (Array.isArray(responseTaskJson.files) && responseTaskJson.files.length > 0) {
        const fileContainer = document.getElementById(`viewer-${responseTaskJson.id}`);
        responseTaskJson.files.forEach(file => {
            const base64 = file.base64;
            const fileName = file.name.toLowerCase();
            const isPDF = fileName.endsWith(".pdf");
            const isIMG = fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg");

            let typeText = isPDF ? "Type: PDF" : isIMG ? "Type: Image" : "Type: File";
            let wrapper = document.createElement("div");
            wrapper.innerHTML = `<div style="font-size: 0.85rem; color: #777;">${typeText}</div>`;

            let preview = "";
            if (isPDF) {
                preview = `
    <div class="pdf-preview-wrapper">
        <embed src="${base64}" type="application/pdf" width="100px" height="100px" style="pointer-events: none; border-radius: 4px; margin-top: 6px;">
        <div class="file-name" style="font-size: 11px; text-align: center; color: #555; margin-top: 6px; word-break: break-word;">${file.name}</div>
    </div>
    <div class="file-controls">
        <button class="preview-btn" onclick="event.stopPropagation(); openPdfPreview('${base64}')">
 <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.998 5c-4.078 0-7.742 3.093-9.853 6.483-.096.159-.145.338-.145.517s.048.358.144.517c2.112 3.39 5.776 6.483 9.854 6.483 4.143 0 7.796-3.09 9.864-6.493.092-.156.138-.332.138-.507s-.046-.351-.138-.507c-2.068-3.403-5.721-6.493-9.864-6.493zm8.413 7c-1.837 2.878-4.897 5.5-8.413 5.5-3.465 0-6.532-2.632-8.404-5.5 1.871-2.868 4.939-5.5 8.404-5.5 3.518 0 6.579 2.624 8.413 5.5zm-8.411-4c2.208 0 4 1.792 4 4s-1.792 4-4 4-4-1.792-4-4 1.792-4 4-4zm0 1.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" fill-rule="nonzero"/></svg>
        </button>
        <button class="download-btn" onclick="event.stopPropagation(); downloadFile('${base64}', '${file.name}')">
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
                <path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z"/>
            </svg>
        </button>
    </div>`;
            }

            else if (isIMG) {
                preview = `
        <img src="${base64}" alt="${file.name}" style="max-width: 100px; border-radius: 4px; margin-top: 6px;">
        <div class="file-controls">
            <button class="download-btn-img" onclick="event.stopPropagation(); downloadFile('${base64}', '${file.name}')">
                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
                    <path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z"/>
                </svg>
            </button>
            <div class="file-name" style="font-size: 11px; text-align: center; color: #555; margin-top: 6px; word-break: break-word;">${file.name}</div>
        </div>
    `;
            }
            else {
                preview = `<a href="${base64}" target="_blank" download="${file.name}">📎 ${file.name}</a>`;
            }

            wrapper.innerHTML += preview;
            fileContainer.appendChild(wrapper);
        });
        new Viewer(fileContainer, {
            navbar: true,
            toolbar: true,
            title: true
        });
    }
}



/**
 * This function renders the first letters of the respective names of the responsible persons. The whole name is also displayed.
 * @param {object} responseTaskJson - The object in which the users are contained.
 */
function renderOverlayUser(responseTaskJson) {
    let names = [];
    let firstLetters = [];
    let colors = [];

    determineUserInfo(responseTaskJson, names, firstLetters, colors);
    if (names.length <= 3) {
        for (let i = 0; i < names.length; i++) {
            document.getElementById('user-names-overlay').innerHTML += getUserNamesOverlay(firstLetters[i], names[i], colors[i]);
        }
    } else {
        for (let i = 0; i < 3; i++) {
            document.getElementById('user-names-overlay').innerHTML += getUserNamesOverlay(firstLetters[i], names[i], colors[i]);
        }
        document.getElementById('more-user-overlay').innerHTML += getMoreUserOverlay(names.length - 3);
    }
}

/**
 * This function determines the first letters of the respective names from the respective task and their creator. The color is also determined.
 * @param {object} responseTaskJson 
 * @param {string} names 
 * @param {string} firstLetters 
 * @param {string} colors 
 * @returns The whole name, the initial letters and the color for the icon are returned.
 */
function determineUserInfo(responseTaskJson, names, firstLetters, colors) {
    if (responseTaskJson.assignedTo != undefined) {
        for (let i = 0; i < responseTaskJson.assignedTo.length; i++) {
            let name = responseTaskJson.assignedTo[i].firstName + " " + responseTaskJson.assignedTo[i].lastName;
            let firstLetter = responseTaskJson.assignedTo[i].firstName[0] + responseTaskJson.assignedTo[i].lastName[0];
            let color = responseTaskJson.assignedTo[i].color;
            names.push(name);
            firstLetters.push(firstLetter.replace("(", ""));
            colors.push(color);
        }
    }
    return names, firstLetters, colors;
}

/**
 * This function renders the subtasks and the corresponding icon, which indicates whether the subtask is completed or open.
 * @param {object} responseTaskJson - The task is transferred to the function as an object in order to determine the subtasks.
 */
async function renderOverlaySubtasks(responseTaskJson) {
    let id = responseTaskJson.id;
    for (let i = 0; i < responseTaskJson.subtasks.length; i++) {
        let subtaskId = [i];
        let title = responseTaskJson.subtasks[i].title;
        let status = responseTaskJson.subtasks[i].status;
        let statusIcon = responseTaskJson.subtasks[i].status;
        if (statusIcon == 'done') {
            statusIcon = './assets/icons/checked_icon.png';
        } else {
            statusIcon = './assets/icons/unchecked_icon.png';
        }
        document.getElementById('subtasks-overlay').innerHTML += getSubtasksOverlay(id, subtaskId, status, title, statusIcon);
    }
}

function openPdfPreview(base64) {
    const modal = document.getElementById('pdf-modal');
    const frame = document.getElementById('pdf-frame');
    frame.src = base64;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('pdf-modal');
    const frame = document.getElementById('pdf-frame');
    modal.style.display = 'none';
    frame.src = '';
}

function downloadFile(base64, filename) {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    link.click();
}
