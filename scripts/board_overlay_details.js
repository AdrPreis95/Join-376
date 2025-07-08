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

   
    if (responseTaskJson.file && responseTaskJson.file.base64) {
       const base64 = responseTaskJson.file.base64;
const mimeType = base64.split(';')[0].replace('data:', '');

const filePreviewHTML = mimeType.startsWith("image/")
    ? `<div class="task-file"><img src="${base64}" alt="${responseTaskJson.file.name}" style="max-width: 100px; margin-top: 10px; border-radius: 4px;"></div>`
    : mimeType === "application/pdf"
        ? `<div class="task-file"><embed src="${base64}" type="application/pdf" width="100%" height="200px"></div>`
        : `<div class="task-file"><a href="${base64}" download="${responseTaskJson.file.name}" target="_blank">📎 ${responseTaskJson.file.name}</a></div>`;


        refOverlay.innerHTML += filePreviewHTML;
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
