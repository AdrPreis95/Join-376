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
  <div class="pdf-preview-wrapper" onclick="openPdfPreview('${base64}')">
    <embed src="${base64}" type="application/pdf" width="100px" height="100px" style="pointer-events: none; border-radius: 4px; margin-top: 6px;">
    <div class="pdf-hover-icon">👁️</div>
  </div>
  <div class="file-controls">
    <button onclick="event.stopPropagation(); downloadFile('${base64}', '${file.name}')">
    <img src="data:image/svg+xml;base64,PHN2ZyBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtNi44NjQgMy40MjRjLjUwMi0uMzAxIDEuMTM2LjA2MyAxLjEzNi42NDIgMCAuMjY0LS4xMzguNTA5LS4zNjUuNjQ0LTIuNDc2IDEuNDg2LTQuMTM1IDQuMTk3LTQuMTM1IDcuMjkyIDAgNC42OTEgMy44MDggOC40OTggOC40OTggOC40OThzOC40OTctMy44MDcgOC40OTctOC40OThjMC0zLjA5My0xLjY1Ni01LjgwMy00LjEzMS03LjI4OS0uMjI1LS4xMzYtLjM2NC0uMzgtLjM2NC0uNjQ0IDAtLjU4Mi42MzUtLjk0MyAxLjEzNy0uNjQyIDIuOTEgMS43NDggNC44NTggNC45MzYgNC44NTggOC41NzUgMCA1LjUxOS00LjQ3OSA5Ljk5OC05Ljk5NyA5Ljk5OHMtOS45OTgtNC40NzktOS45OTgtOS45OThjMC0zLjY0MSAxLjk1MS02LjgzIDQuODY0LTguNTc4em0uODMxIDguNTgyczIuMDI1IDIuMDIxIDMuNzc5IDMuNzc0Yy4xNDcuMTQ3LjMzOS4yMi41My4yMi4xOTIgMCAuMzg0LS4wNzMuNTMxLS4yMiAxLjc1My0xLjc1MiAzLjc3OS0zLjc3NSAzLjc3OS0zLjc3NS4xNDUtLjE0NS4yMTctLjMzNi4yMTctLjUyNiAwLS4xOTItLjA3NC0uMzg0LS4yMjEtLjUzMS0uMjkyLS4yOTMtLjc2Ni0uMjk0LTEuMDU2LS4wMDRsLTIuNSAyLjQ5OXYtMTAuNjkzYzAtLjQxNC0uMzM2LS43NS0uNzUtLjc1cy0uNzUuMzM2LS43NS43NXYxMC42OTNsLTIuNDk4LTIuNDk4Yy0uMjg5LS4yODktLjc2Mi0uMjg2LTEuMDU0LjAwNi0uMTQ3LjE0Ny0uMjIxLjMzOS0uMjIyLjUzMSAwIC4xOS4wNzEuMzguMjE1LjUyNHoiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==">
    </button>
  </div>
`;

            } else if (isIMG) {
                preview = `<img src="${base64}" alt="${file.name}" style="max-width: 100px; border-radius: 4px; margin-top: 6px;">`;
            } else {
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
