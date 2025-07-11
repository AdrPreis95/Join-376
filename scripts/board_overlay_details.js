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

// function renderOverlay(responseTaskJson) {
//     let refOverlay = document.getElementById('task-details');
//     refOverlay.style = 'display: flex';
//     refOverlay.innerHTML = "";

//     let classCategory = checkCategory(responseTaskJson.category);
//     let prioIcon = findPrio(responseTaskJson.prio);

//     refOverlay.innerHTML = getOverlayDetails(
//         responseTaskJson.id,
//         classCategory,
//         responseTaskJson.category,
//         responseTaskJson.title,
//         responseTaskJson.description,
//         responseTaskJson.dueDate,
//         responseTaskJson.prio,
//         prioIcon
//     );

//     renderOverlayUser(responseTaskJson);

//     if (responseTaskJson.subtasks != undefined) {
//         renderOverlaySubtasks(responseTaskJson);
//     } else {
//         document.getElementById('subtask-headline-overlay').style = 'display: none';
//     }

//     if (responseTaskJson.files && Array.isArray(responseTaskJson.files)) {
//         responseTaskJson.files.forEach(file => {
//             const base64 = file.base64;
//             const fileName = file.name.toLowerCase();
//             let preview = "";

//             if (fileName.endsWith(".pdf")) {
//                 preview = `
//                 <div class="task-file">
//                     <embed src="${base64}" type="application/pdf" width="100%" height="200px">
//                 </div>`;
//             } else if (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
//                 preview = `
//                 <div class="task-file">
//                     <img src="${base64}" alt="${file.name}" style="max-width: 100px; margin-top: 10px; border-radius: 4px;">
//                 </div>`;
//             } else {
//                 preview = `
//                 <div class="task-file">
//                     <a href="${base64}" download="${file.name}" target="_blank">📎 ${file.name}</a>
//                 </div>`;
//             }

//             refOverlay.innerHTML += preview;
//         });
//     }

// }


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

    // 🟩⬇️ Hier kommt der neue Teil für Image+PDF-Viewer
    if (responseTaskJson.files && Array.isArray(responseTaskJson.files)) {
        let fileContainer = document.createElement("div");
        fileContainer.className = "task-file viewer-gallery"; // wichtig für Viewer.js
        fileContainer.id = `viewer-${responseTaskJson.id}`; // eindeutige ID

        responseTaskJson.files.forEach(file => {
            const base64 = file.base64;
            const fileName = file.name.toLowerCase();
            let preview = "";

            if (fileName.endsWith(".pdf")) {
                preview = `
                    <embed src="${base64}" type="application/pdf" width="100px" height="100px" style="margin: 10px;">
                `;
            } else if (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                preview = `
                    <img src="${base64}" alt="${file.name}" style="max-width: 100px; margin: 10px; border-radius: 4px;">
                `;
            } else {
                preview = `
                    <a href="${base64}" download="${file.name}" target="_blank">📎 ${file.name}</a>
                `;
            }

            fileContainer.innerHTML += preview;
        });

        refOverlay.appendChild(fileContainer);

        // Viewer aktivieren
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

// function createBlobURL(base64, filename) {
//     const byteString = atob(base64.split(',')[1]);
//     const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];

//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//         ia[i] = byteString.charCodeAt(i);
//     }

//     const blob = new Blob([ab], { type: mimeString });
//     return URL.createObjectURL(blob);
// }
