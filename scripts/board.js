
let BASE_URL = 'https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/';
let currentDraggedElement;
let activePriority = '';
let titles = [];
let description = [];

async function loadTasks() {
    let tasks = await fetch(BASE_URL + "/tasks.json")
    let tasksJson = await tasks.json();
    saveInArray(tasksJson);
    clearLists();
    renderTasks(tasksJson);
}

function saveInArray(tasksJson) {
    for (let i = 0; i < tasksJson.length; i++) {
        titles.push(tasksJson[i].title);
        description.push(tasksJson[i].description);
    }
}

// function searchTask() {
//     let refSearchBarInput = document.getElementById('find-task');
//     let keyword = refSearchBarInput.value;
//     let searchResultTitleId = titles.findIndex(title => title.toLowerCase().includes(keyword));
//     refSearchBarInput.value = "";
//     loadSearchResults(searchResultTitleId);
// }

// async function loadSearchResults(searchResultTitleId) {
//     clearLists();
//     let resultTask = await fetch(BASE_URL + "/tasks/" + searchResultTitleId + ".json");
//     let resultTaskJson = await resultTask.json();
//     console.log(resultTaskJson);
//     renderTasks(resultTaskJson);
// }

function clearLists() {
    document.getElementById('to-do').innerHTML = "";
    document.getElementById('in-progress').innerHTML = "";
    document.getElementById('await-feedback').innerHTML = "";
    document.getElementById('done').innerHTML = "";
}

function renderTasks(tasksJson) {
    for (let i = 0; i < Object.keys(tasksJson).length; i++) {
        let tasksArray = Object.values(tasksJson);
        let id = tasksArray[i].id;
        let list = tasksArray[i].list;
        let category = tasksArray[i].category;
        let classCategory = checkCategory(category);
        let title = tasksArray[i].title;
        let description = tasksArray[i].description;
        let prioIcon = findPrio(tasksArray[i].prio);
        document.getElementById(`${list}`).innerHTML += getTask(id, category, classCategory, title, description, prioIcon);
        if (tasksArray[i].subtasks != undefined) {
            calculateSubtaskProgress(tasksArray[i].subtasks, id);
        }
        renderFirstLetter(tasksArray[i].assignedTo, id);
    }
    checkEmptyList();
}

function checkEmptyList() {
    let toDoRef = document.getElementById('to-do');
    let inProgressRef = document.getElementById('in-progress');
    let awaitFeedbackRef = document.getElementById('await-feedback');
    let doneRef = document.getElementById('done');
    let ref = [toDoRef, inProgressRef, awaitFeedbackRef, doneRef];
    let listNames = ['to do', 'in progress', 'await feedback', 'done']

    for (let i = 0; i < ref.length; i++) {
        if (ref[i].innerHTML == '') {
            ref[i].innerHTML = getClearList(listNames[i]);
        }
    }
}

function checkCategory(category) {
    if (category == 'Technical Task') {
        classCategory = 'technical-task';
    } else {
        classCategory = 'user-story';
    }
    return classCategory;
}

function calculateSubtaskProgress(subtasks, id) {
    let allSubtasks = subtasks.length;
    let doneTasks = 0;
    let notDoneTasks = 0;

    for (let i = 0; i < subtasks.length; i++) {
        if (subtasks[i].status == 'done') {
            doneTasks++;
        } else if (subtasks[i].status == 'not done') {
            notDoneTasks++;
        }
    }
    let progress = doneTasks / allSubtasks * 100;
    document.getElementById('subtask-' + id).innerHTML = getSubtask(doneTasks, allSubtasks, progress)
}

function renderFirstLetter(user, id) {
    let firstLetters = [];
    if (user != undefined) {
        for (let i = 0; i < user.length; i++) {
            let firstName = user[i].firstName[0];
            let lastName = user[i].lastName[0];
            let firstLetter = firstName + lastName;
            firstLetters.push(firstLetter.replace("(", ""));
        }
    }
    
    for (let j = 0; j < firstLetters.length; j++) {
        document.getElementById('assigned-user-' + id).innerHTML += getFirstLetterName(firstLetters[j]);
    }
}

function findPrio(priority) {
    if (priority == 'Urgent') {
        prioIcon = './assets/icons/urgent_icon.png';
    } else if (priority == 'Low') {
        prioIcon = './assets/icons/low_icon.png';
    } else if (priority == 'Medium') {
        prioIcon = './assets/icons/medium_icon.png';
    }
    return prioIcon;
}

function startDragging(id) {
    currentDraggedElement = id;
    document.getElementById(currentDraggedElement).classList.add('drag-area-highlight');
}

function allowDrop(ev) {
    ev.preventDefault();
}

async function changeList(list) {
    currentDraggedElement--;
    currentDraggedElement = await findKey(currentDraggedElement);
    let task = await fetch(BASE_URL + "/tasks/" + currentDraggedElement + ".json")
    let taskJson = await task.json();
    taskJson.list = list;
    let newList = await fetch(BASE_URL + "/tasks/" + currentDraggedElement + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(taskJson)
    });
    loadTasks();
}

async function showOverlayDetailsTask(id) {
    id--
    document.getElementById('all-content').style = 'filter: brightness(0.5);';
    let responseTask = await fetch(BASE_URL + "/tasks.json");
    let responseTaskJson = await responseTask.json();
    let tasksArray = Object.values(responseTaskJson);
    tasksArray = tasksArray[id];
    renderOverlay(tasksArray);
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
    if (responseTaskJson.assignedTo != undefined) {
        for (let i = 0; i < responseTaskJson.assignedTo.length; i++) {
            let name = responseTaskJson.assignedTo[i].firstName + " " + responseTaskJson.assignedTo[i].lastName;
            let firstLetter = responseTaskJson.assignedTo[i].firstName[0] + responseTaskJson.assignedTo[i].lastName[0];
            names.push(name);
            firstLetters.push(firstLetter.replace("(", ""));
        }
    }
    
    for (let i = 0; i < names.length; i++) {
        document.getElementById('user-names-overlay').innerHTML += getUserNamesOverlay(firstLetters[i], names[i])
    }
}

async function renderOverlaySubtasks(responseTaskJson) {
    let id = responseTaskJson.id
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

async function deleteTask(id) {
    let tasks = await fetch(BASE_URL + "/tasks.json");
    let tasksJson = await tasks.json();

    // If tasksJson is an object, convert it to an array
    tasksJson = Array.isArray(tasksJson) ? tasksJson : Object.values(tasksJson);

    /* Takes a list of tasks, and an ID to remove */
    const removeTaskById = (tasksJson, id) =>
    tasksJson.filter(task => task.id !== id);

    let updatedTasks = removeTaskById(tasksJson, id);

    /* Updating ID's */
    var newId = 1;
    for (var i in updatedTasks) {
        updatedTasks[i].id = newId;
        newId++;
    }

    let responseTask = await fetch(BASE_URL + "/tasks.json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTasks)
    });
    closeOverlay();
    loadTasks();
}

async function editTask(id, title, description, dueDate, priority) {
    id--;
    let refOverlay = document.getElementById('task-details');
    refOverlay.innerHTML = "";
    refOverlay.innerHTML = getOverlayEdit(id, title, description);
    document.getElementById('due-date-input').defaultValue = dueDate;
    checkActivePriority(priority);
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
    let changeTask = await fetch(BASE_URL + "/tasks/" + id + ".json");
    let changeTaskJson = await changeTask.json();
    changeTaskJson = generateChangeTask(changeTaskJson);
    let responseTask = await fetch(BASE_URL + "/tasks/" + id + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(changeTaskJson)
    });
    closeOverlay();
    loadTasks();
}

function generateChangeTask(changeTaskJson) {
    let title = document.getElementById('overlay-title').value;
    let description = document.getElementById('overlay-description').value;
    let dueDate = document.getElementById('due-date-input').value;

    if (title != "") {
        changeTaskJson.title = title;
    }
    if (description != "") {
        changeTaskJson.description = description;
    }
    if (dueDate != "") {
        changeTaskJson.dueDate = convertDateFormat(dueDate);
    }

    changeTaskJson.prio = activePriority;

    return changeTaskJson;
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
        document.getElementById('assigned-to').innerHTML += getContactName(responseJson[i].name);
    }
}

async function changeStatusSubtask(id, subtaskId, status) {
    id--;
    id = await findKey(id);
    let response = await fetch(BASE_URL + "/tasks/" + id + ".json");
    let responseJson = await response.json();
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