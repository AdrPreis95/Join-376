async function showOverlayDetailsTask(id) {
    id--
    document.getElementById('all-content').style = 'filter: brightness(0.5);';
    let responseTask = await fetch(BASE_URL + "/tasks.json");
    let responseTaskJson = await responseTask.json();
    let tasksArray = Object.values(responseTaskJson);
    tasksArray = tasksArray[id];
    renderOverlay(tasksArray);
}

async function loadTaskWithID(id) {
    let response = await fetch(BASE_URL + "/tasks/" + id + ".json");
    let responseJson = await response.json();
    return responseJson;
}

function closeOverlay() {
    document.getElementById('task-details').style = 'display: none;';
    document.getElementById('all-content').style = 'filter: brightness(1);';
    loadTasks();
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

async function editTask(id, title, description, dueDate, priority) {
    id--;
    let refOverlay = document.getElementById('task-details');
    refOverlay.innerHTML = "";
    refOverlay.innerHTML = getOverlayEdit(id, title, description);
    document.getElementById('due-date-input').defaultValue = dateFormatter(dueDate);
    checkActivePriority(priority);
    selectedUserEdit(id);
    renderOverlayEditSubtasks(id);
    loadContacts();
}

function checkActivePriority(priority) {
    if (priority == 'Urgent') {
        document.getElementById('urgent-label').style.backgroundColor = '#FF3D00';
        document.getElementById('urgent-text').style = 'color: #FFFFFF;';
        document.getElementById('urgent-icon').setAttribute("src", './assets/icons/urgent_icon_active.png');
    } else if (priority == 'Medium') {
        document.getElementById('medium-label').style.backgroundColor = '#FFA800';
        document.getElementById('medium-text').style = 'color: #FFFFFF;';
        document.getElementById('medium-icon').setAttribute("src", './assets/icons/medium_icon_active.png');
    } else if (priority == 'Low') {
        document.getElementById('low-label').style.backgroundColor = '#7AE229';
        document.getElementById('low-text').style = 'color: #FFFFFF;';
        document.getElementById('low-icon').setAttribute("src", './assets/icons/low_icon_active.png');
    }
    activePriority = priority;
}

function changePriority(newPriority) {
    let prioArr = ['urgent', 'medium', 'low'];
    for (let i = 0; i < prioArr.length; i++) {
        document.getElementById(prioArr[i] + '-label').style.backgroundColor = '#FFFFFF';
        document.getElementById(prioArr[i] + '-text').style = 'color: #000000;';
        let pictureUrl = './assets/icons/' + prioArr[i] + '_icon.png'
        document.getElementById(prioArr[i] + '-icon').setAttribute("src", pictureUrl);
    }
    checkActivePriority(newPriority);
}

async function saveEdit(id) {
    id = await findKey(id);
    let responseJson = await loadTaskWithID(id);
    responseJson = generateChangeTask(responseJson);
        let responseTask = await fetch(BASE_URL + "/tasks/" + id + ".json", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(responseJson)
        });
        closeOverlay();
        loadTasks();
}

function generateChangeTask(responseJson) {
    let title = document.getElementById('overlay-title').value;
    let description = document.getElementById('overlay-description').value;
    let dueDate = document.getElementById('due-date-input').value;

    if (title != "") {
        responseJson.title = title;
    }
    if (description != "") {
        responseJson.description = description;
    }
    if (dueDate != "") {
        responseJson.dueDate = convertDateFormat(dueDate);
    }
    responseJson.prio = activePriorityButton();
    return responseJson;
}

function activePriorityButton() {
    let lowLabel = window.getComputedStyle(document.getElementById('low-label')).getPropertyValue("background-color");
    let mediumLabel = window.getComputedStyle(document.getElementById('medium-label')).getPropertyValue("background-color");
    let urgentLabel = window.getComputedStyle(document.getElementById('urgent-label')).getPropertyValue("background-color");
    let activeElement;

    if (lowLabel == "rgb(122, 226, 41)") {
        activeElement = "Low";
    }
    if (mediumLabel == "rgb(255, 168, 0)") {
        activeElement = "Medium";
    }
    if (urgentLabel == "rgb(255, 61, 0)") {
        activeElement = "Urgent";
    }
    return activeElement;
}
async function loadContacts() {
    let userAsContact = {
        email: loggedUser.email, 
        id: 0, 
        name: loggedUser.name + " (You)", 
        phone: '000000'
    }
    let response = await fetch(BASE_URL + "/contacts.json");
    let responseJson = await response.json();
    responseJson.unshift(userAsContact);
    for (let i = 0; i < responseJson.length; i++) {
        document.getElementById('user-dropdown').innerHTML += getContactName(responseJson[i].name);
    }
}

async function changeStatusSubtask(id, subtaskId, status) {
    id--;
    id = await findKey(id);
    let responseJson = await loadTaskWithID(id);
    if (status == 'done') {
        responseJson.subtasks[subtaskId].status = 'not done'
    } else if (status == 'not done') {
        responseJson.subtasks[subtaskId].status = 'done';
    }
    await fetch(BASE_URL + "/tasks/" + id + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(responseJson)
    });
    document.getElementById('subtasks-overlay').innerHTML = "";
    renderOverlaySubtasks(responseJson);
}

function openDropdownAssigned() {
    let dropdownRef = document.getElementById('selected-user-dropdown');
    let arrowRef = document.getElementById('arrow-dropdown');
    let assignedUserRef = document.getElementById('user-names-edit-overlay');
    if(dropdownRef.className == 'd-none') {
        dropdownRef.classList.remove('d-none');
        dropdownRef.classList.add('d_block');
        arrowRef.setAttribute("src", "./assets/icons/arrow_drop_down_top.png");
        assignedUserRef.classList.add('d-none');
    } else {
        dropdownRef.classList.add('d-none');
        dropdownRef.classList.remove('d_block');
        arrowRef.setAttribute("src", "./assets/icons/arrow_drop_down.png");
        assignedUserRef.classList.remove('d-none');
    }
}

async function selectedUserEdit(id) {
    let responseJson = await loadTaskWithID(id);
    let usersFirstLetters = [];
    let colors = [];
    for (let i = 0; i < responseJson.assignedTo.length; i++) {
        let firstName = responseJson.assignedTo[i].firstName[0];
        let lastName = responseJson.assignedTo[i].lastName[0];
        let firstLetter = firstName + lastName;
        usersFirstLetters.push(firstLetter);
        colors.push(responseJson.assignedTo[i].color);
    }
    for (let i = 0; i < usersFirstLetters.length; i++) {
        document.getElementById('user-names-edit-overlay').innerHTML += getUserInititalsOverlayEdit(colors[i], usersFirstLetters[i]);
    }
}

function editMode(id) {
    let createContainer = document.getElementById('create-subtask-overlay');
    if (document.getElementById('add-subtask-overlay-edit').getAttribute("src") == "./assets/icons/add_subtask.png") {
        createContainer.innerHTML = getSubtaskOverlayIcons(id);      
    } else {
        createContainer.innerHTML = getSubtaskOverlayAddIcon();
    }
}

async function createSubtaskOverlay(id) {
    let inputRef = document.getElementById('subtask-edit');
    let task = await loadTaskWithID(id);
    if (!task.subtasks) {
        task.subtasks = [];
    }
    let idSubtask = task.subtasks.length;
    if(inputRef.value !== "") {
        let newSubtask = {
            status: "not done",
            title: inputRef.value
        };
        
        await fetch(`${BASE_URL}/tasks/${id}/subtasks/${idSubtask}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newSubtask)
        });
    }
    renderOverlayEditSubtasks(id);
    clearSubtaskInput();
}

function clearSubtaskInput() {
    document.getElementById('subtask-edit').value = "";
}

async function renderOverlayEditSubtasks(id) {
    let responseJson = await loadTaskWithID(id);
    document.getElementById('subtasks-overlay-edit').innerHTML = "";
    if(responseJson.subtasks != undefined) {
        for (let i = 0; i < responseJson.subtasks.length; i++) {
            document.getElementById('subtasks-overlay-edit').innerHTML += getSubtasksOverlayEdit(responseJson.subtasks[i].title, id, i);       
        }
    }
}

async function editSubtask(id, subtask) {
    let task = await loadTaskWithID(id);
    let subtaskId = findSubtask(task, subtask);
    for (let i = 0; i < task.subtasks.length; i++) {
        if(subtaskId == i) {
            document.getElementById('list-' + subtaskId).innerHTML = "";
            document.getElementById('list-' + subtaskId).innerHTML += getSubtasksOverlayEditInput(task.subtasks[i].title, id); 
        }
    }
}

async function deleteSubtask(id, subtask) {
    let task = await loadTaskWithID(id);
    let subtaskId = findSubtask(task, subtask);
    let response = await fetch(BASE_URL + "/tasks/" + id + "/subtasks/" + subtaskId + ".json", {            
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        });
    renderOverlayEditSubtasks(id);    
}

function findSubtask(task, subtask) {
    let subtaskId
    for (let i = 0; i < task.subtasks.length; i++) {
        if (task.subtasks[i].title == subtask) {
            subtaskId = i;
        }        
    }
    return subtaskId;
}