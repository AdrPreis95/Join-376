
let BASE_URL = 'https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/';
let currentDraggedElement;
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
    for (let i = 0; i < tasksJson.length; i++) {
        let id = tasksJson[i].id;
        let list = tasksJson[i].list;
        let category = tasksJson[i].category;
        let classCategory = checkCategory(category);
        let title = tasksJson[i].title;
        let description = tasksJson[i].description;
        let prioIcon = findPrio(tasksJson[i].prio);
        document.getElementById(`${list}`).innerHTML += getTask(id, category, classCategory, title, description, prioIcon);
        if(tasksJson[i].subtasks != undefined) {
            console.log(tasksJson[i].subtasks)
            calculateSubtaskProgress(tasksJson[i].subtasks, id);
        }
        renderFirstLetter(tasksJson[i].assignedTo, id);
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
        if(ref[i].innerHTML == '') {
            ref[i].innerHTML = getClearList(listNames[i]);
        }
    }
}

function checkCategory(category) {
    if(category == 'Technical Task') {
        classCategory = 'technical-task';
    } else {
        classCategory = 'user-story';
    }
    return classCategory;
}

function calculateSubtaskProgress(subtasks, id) {
    let allSubtasks = subtasks.length
    let doneTasks = 0;
    let notDoneTasks = 0;

    for (let i = 0; i < subtasks.length; i++) {
        if(subtasks[i].status == 'done') {
            doneTasks++;
        } else if(subtasks[i].status == 'not done') {
            notDoneTasks++;
        }
    }
    let progress = doneTasks / allSubtasks * 100;
    document.getElementById('subtask-' + id).innerHTML = getSubtask(doneTasks, allSubtasks, progress)    
}

function renderFirstLetter(user, id) {
    let firstLetters = [];

    for (let i = 0; i < user.length; i++) {
        let firstName = user[i].firstName[0];
        let lastName = user[i].lastName[0];
        let firstLetter = firstName + lastName;
        firstLetters.push(firstLetter);
    }
    for (let j = 0; j < firstLetters.length; j++) {
        document.getElementById('assigned-user-' + id).innerHTML += getFirstLetterName(firstLetters[j]);
    }
}

function findPrio(priority) {
    if(priority == 'Urgent') {
        prioIcon = './assets/icons/urgent_icon.png';
    } else if(priority == 'Low') {
        prioIcon = './assets/icons/low_icon.png';
    } else if(priority == 'Medium') {
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
    let task = await fetch(BASE_URL + "/tasks/" + currentDraggedElement + ".json")
    let taskJson = await task.json();
    taskJson.list = list
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
    id--;
    document.getElementById('all-content').style = 'filter: brightness(0.5);';
    let responseTask = await fetch(BASE_URL + "/tasks/" + id + ".json");
    let responseTaskJson = await responseTask.json();
    renderOverlay(responseTaskJson);
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
    if(responseTaskJson.subtasks != undefined) {
        renderOverlaySubtasks(responseTaskJson);
    } else {
        document.getElementById('subtask-headline-overlay').style = 'display: none';
    }
}

function renderOverlayUser(responseTaskJson) {
    let names = [];
    let firstLetters = [];
    for (let i = 0; i < responseTaskJson.assignedTo.length; i++) {
        let name = responseTaskJson.assignedTo[i].firstName + " " + responseTaskJson.assignedTo[i].lastName;
        let firstLetter = responseTaskJson.assignedTo[i].firstName[0] + responseTaskJson.assignedTo[i].lastName[0];
        names.push(name);
        firstLetters.push(firstLetter);
    }
    for (let i = 0; i < names.length; i++) {
        document.getElementById('user-names-overlay').innerHTML += getUserNamesOverlay(firstLetters[i], names[i])        
    }
}

function renderOverlaySubtasks(responseTaskJson) {
    let id = responseTaskJson.id
    for (let i = 0; i < responseTaskJson.subtasks.length; i++) {
        let subtaskId = [i];
        let title = responseTaskJson.subtasks[i].title;
        let status = responseTaskJson.subtasks[i].status;
        let statusIcon = responseTaskJson.subtasks[i].status;
        if(statusIcon == 'done') {
            statusIcon = './assets/icons/checked_icon.png';
        } else {
            statusIcon = './assets/icons/unchecked_icon.png';
        }
        document.getElementById('subtasks-overlay').innerHTML += getSubtasksOverlay(id, subtaskId, status, title, statusIcon);
    }
}

async function deleteTask(id) {
    id--;
    let responseTask = await fetch(BASE_URL + "/tasks/" + id + ".json", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        }
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
    loadContacts()
    if(priority == 'Urgent') {
        document.getElementById('urgent-label').style.backgroundColor = '#FF3D00';
        document.getElementById('urgent-text').style = 'color: #FFFFFF;';
    } else if(priority == 'Medium') {
        document.getElementById('medium-label').style.backgroundColor = '#FFA800';
    } else if(priority == 'Low') {
        document.getElementById('low-label').style.backgroundColor = '#7AE229';
    }
}

async function saveEdit(id) {
    let changeTask = await fetch(BASE_URL + "/tasks/" + id + ".json");
    let changeTaskJson = await changeTask.json();
    changeTaskJson.title = document.getElementById('overlay-title').value;
    changeTaskJson.description = document.getElementById('overlay-description').value;
    changeTaskJson.dueDate = document.getElementById('due-date-input').value;
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

async function loadContacts() {
    let response = await fetch(BASE_URL + "/contacts.json");
    let responseJson = await response.json();
    for (let i = 0; i < responseJson.length; i++) {
        document.getElementById('assigned-to').innerHTML += getContactName(responseJson[i].name);        
    }
}

async function changeStatusSubtask(id, subtaskId, status) {
    id--;
    let response = await fetch(BASE_URL + "/tasks/" + id + ".json");
    let responseJson = await response.json();
    if(status == 'done') {
        responseJson.subtasks[subtaskId].status = 'not done'
    } else if(status == 'not done') {
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