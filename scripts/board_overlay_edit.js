async function editTask(id, title, description, dueDate, priority) {
    id--;
    let refOverlay = document.getElementById('task-details');
    refOverlay.innerHTML = "";
    refOverlay.innerHTML = getOverlayEdit(id, title, description);
    document.getElementById('due-date-input').defaultValue = dateFormatter(dueDate);
    checkActivePriority(priority);
    selectedUserEdit(id);
    renderOverlayEditSubtasks(id);
    loadContacts(id);
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

async function loadContacts(id) {
    let userAsContact = {
        email: loggedUser.email, 
        id: 0, 
        name: loggedUser.name + " (You)", 
        phone: '000000'
    }
    let activeUser = await loadActiveUser(id);
    let response = await fetch(BASE_URL + "/contacts.json");
    let responseJson = await response.json();
    let activeUserIndex = checkActiveUser(activeUser, responseJson);
    activeUserIndex.sort();
    responseJson.unshift(userAsContact);
    renderOverlayContacts(id, responseJson, activeUserIndex);
}

function renderOverlayContacts(id, responseJson, activeUserIndex) {
    for (let i = 0; i < responseJson.length; i++) {
        let urlIcon = './assets/icons/unchecked_icon.png';
        for (let k = 0; k < activeUserIndex.length; k++) {
            if(activeUserIndex[k] == [i - 1]) {
                urlIcon = './assets/icons/checked_icon.png';
            }
        }
        let color = generateColor();
        let firstLetterFirstName = responseJson[i].name[0];
        let position = responseJson[i].name.indexOf(" ");
        let firstLetterLastName = responseJson[i].name[position + 1];
        document.getElementById('user-dropdown').innerHTML += getContactName(id, responseJson[i].name, color, firstLetterFirstName, firstLetterLastName, urlIcon);
    }
}

async function loadActiveUser(id) {
    let task = await loadTaskWithID(id);
    let activeUser = [];
    for (let i = 0; i < task.assignedTo.length; i++) {
        let name = task.assignedTo[i].firstName + " " + task.assignedTo[i].lastName;
        activeUser.push(name);
    }
    return activeUser;
}

function checkActiveUser(activeUser, responseJson) {
    let allContacts = [];
    let activeUserIndex = [];
    for (let i = 0; i < responseJson.length; i++) {    
        allContacts.push(responseJson[i].name);
    }
    for (let i = 0; i < allContacts.length; i++) {
        if(allContacts.indexOf(activeUser[i]) != -1) {
            activeUserIndex.push(allContacts.indexOf(activeUser[i]));
        }
    }
    return activeUserIndex;
}

async function updateAssignedStatusInFirebase(id, name, isAssigned) {
    let task = await loadTaskWithID(id);

    // Initialisiere die Struktur, falls nicht vorhanden
    if (!task.assignedTo || typeof task.assignedTo !== "object") {
        task.assignedTo = {};
    }

    if (isAssigned) {
        // Füge einen neuen Nutzer hinzu
        let [firstName, lastName] = name.split(" ");
        if (!firstName || !lastName) {
            console.error("Name konnte nicht korrekt aufgeteilt werden:", name);
            return;
        }

        // Prüfe, ob der Nutzer bereits existiert
        let userExists = Object.values(task.assignedTo).some(
            user => user.firstName === firstName && user.lastName === lastName
        );

        if (!userExists) {
            // Nächsten freien Schlüssel finden
            let newKey = Object.keys(task.assignedTo).length;
            task.assignedTo[newKey] = {
                firstName,
                lastName,
                color: generateColor() // Farbe zufügen
            };
        }
    } else {
        // Entferne den Nutzer
        for (let key in task.assignedTo) {
            let user = task.assignedTo[key];
            if (`${user.firstName} ${user.lastName}` === name) {
                delete task.assignedTo[key];
                break;
            }
        }

        // Schlüssel neu nummerieren, um Lücken zu vermeiden
        let reassigned = {};
        let index = 0;
        for (let key in task.assignedTo) {
            reassigned[index++] = task.assignedTo[key];
        }
        task.assignedTo = reassigned;
    }

    // Daten in Firebase speichern
    let response = await fetch(`${BASE_URL}/tasks/${id}.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(task)
    });

    if (!response.ok) {
        console.error("Fehler beim Speichern der Daten in Firebase:", response.statusText);
    }
}

async function toggleAssignedTo(id, name, iconElement) {
    let isChecked = iconElement.src.includes('checked_icon');

    // Icon ändern und Daten aktualisieren
    if (isChecked) {
        iconElement.src = './assets/icons/unchecked_icon.png';
        await updateAssignedStatusInFirebase(id, name, false);
    } else {
        iconElement.src = './assets/icons/checked_icon.png';
        await updateAssignedStatusInFirebase(id, name, true);
    }

    // Ansicht neu laden
    let task = await loadTaskWithID(id);
    let activeUser = loadActiveUser(task);
    let activeUserIndex = activeUserIndex(activeUser, task);
    renderOverlayContacts(id, task.assignedTo, activeUserIndex);
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

function closeDropdownAssigned(event) {
    if (event.target.closest('#assigned-container')) {
        event.stopPropagation();
        return;
    }

    document.getElementById('arrow-dropdown').setAttribute("src", "./assets/icons/arrow_drop_down_top.png");
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
    renderOverlayEditUser(usersFirstLetters, colors)
}

function renderOverlayEditUser(usersFirstLetters, colors) {
    if(usersFirstLetters.length >= 8) {
        for (let i = 0; i < 8; i++) {
            document.getElementById('user-names-edit-overlay').innerHTML += getUserInititalsOverlayEdit(colors[i], usersFirstLetters[i]);
        }
        let userslength = usersFirstLetters.length - 8;
        document.getElementById('user-names-edit-overlay').innerHTML += getMoreUserOverlayEdit(userslength);
    } else {
        for (let i = 0; i < usersFirstLetters.length; i++) {
            document.getElementById('user-names-edit-overlay').innerHTML += getUserInititalsOverlayEdit(colors[i], usersFirstLetters[i]);
        }
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

async function deleteSubtask(taskId, subtaskName) {
    let task = await loadTaskWithID(taskId);
    let subtaskIndex = findSubtask(task, subtaskName);
    if (subtaskIndex !== -1) {
        task.subtasks.splice(subtaskIndex, 1);
        await fetch(BASE_URL + "/tasks/" + taskId + ".json", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });
    }
    renderOverlayEditSubtasks(taskId);
}

function findSubtask(task, subtask) {
    let subtaskId;
    for (let i = 0; i < task.subtasks.length; i++) {
        if (task.subtasks[i].title == subtask) {
            subtaskId = i;
        }        
    }
    return subtaskId;
}

async function saveEditSubtask(id, subtask) {
    let task = await loadTaskWithID(id);
    let subtaskId = findSubtask(task, subtask);
    let inputTitle = document.getElementById('change-subtask-input').value;
    if(inputTitle != "") {
        let newSubtask = {
            status: "not done",
            title: inputTitle
        }
        await fetch(`${BASE_URL}/tasks/${id}/subtasks/${subtaskId}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newSubtask)
        });
    } else {
        document.getElementById('warn-emptyinput-container').innerHTML = getWarningEmptyInput();
    }
    renderOverlayEditSubtasks(id);
}