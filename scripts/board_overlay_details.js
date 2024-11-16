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
    let prioIcon = findPrio(responseTaskJson.prio)

    refOverlay.innerHTML = getOverlayDetails(responseTaskJson.id, classCategory, responseTaskJson.category, responseTaskJson.title, responseTaskJson.description, responseTaskJson.dueDate, responseTaskJson.prio, prioIcon);
    renderOverlayUser(responseTaskJson);    
    if (responseTaskJson.subtasks != undefined) {
        renderOverlaySubtasks(responseTaskJson);
    } else {
        document.getElementById('subtask-headline-overlay').style = 'display: none';
    }
}

function renderOverlayUser(responseTaskJson) {
    let names = [];
    let firstLetters = [];
    let colors = [];

    determineUserInfo(responseTaskJson, names, firstLetters, colors);
    if (names.length <= 4) {
        for (let i = 0; i < names.length; i++) {
            document.getElementById('user-names-overlay').innerHTML += getUserNamesOverlay(firstLetters[i], names[i], colors[i]);
        } 
    } else {
        for (let i = 0; i < 4; i++) {
        document.getElementById('user-names-overlay').innerHTML += getUserNamesOverlay(firstLetters[i], names[i], colors[i]);
        }
        document.getElementById('more-user-overlay').innerHTML += getMoreUserOverlay(names.length - 4);
    }
}

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