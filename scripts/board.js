
let BASE_URL = 'https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/';
let currentDraggedElement;

async function loadTasks() {
    let tasks = await fetch(BASE_URL + "/tasks.json")
    let tasksJson = await tasks.json();
    clearLists();
    renderTasks(tasksJson);
}

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
        calculateSubtaskProgress(tasksJson[i].subtasks, id);
        renderFirstLetter(tasksJson[i].assignedTo, id);
    }
    checkEmptyList();
}

async function saveTasksInArray() {
    let [titles, descriptions, categorys] = [[], [], []];
        let tasks = await fetch(BASE_URL + "/tasks.json")
        let tasksJson = await tasks.json();
        for (let i = 0; i < tasksJson.length; i++) {
            let title = tasksJson[i].title
            let description = tasksJson[i].description
            let category = tasksJson[i].category
            titles.push(title), descriptions.push(description), categorys.push(category);
        }
    return {titles, descriptions, categorys};
}

async function searchTask(titles, descriptions, categorys) {
    let userInput = document.getElementById('find-task').value;
    if(userInput.length > 3) {
        let {titles, descriptions, categorys} = await saveTasksInArray();
        let title = titles.filter((userInput) => titles);
        console.log(title)
    }
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
}

function renderOverlay(responseTaskJson) {
    let refOverlay = document.getElementById('task-details');
    refOverlay.style = 'display: flex';
    refOverlay.innerHTML = "";

    let classCategory = checkCategory(responseTaskJson.category);
    let prioIcon = findPrio(responseTaskJson.prio)

    refOverlay.innerHTML = getOverlayDetails(responseTaskJson.id, classCategory, responseTaskJson.category, responseTaskJson.title, responseTaskJson.description, responseTaskJson.dueDate, responseTaskJson.prio, prioIcon);
    renderOverlayUser(responseTaskJson);
    renderOverlaySubtasks(responseTaskJson);
}

function renderOverlayUser(responseTaskJson) {
    for (let i = 0; i < responseTaskJson.assignedTo.length; i++) {
        let name = responseTaskJson.assignedTo[i].firstName + " " + responseTaskJson.assignedTo[i].lastName;
        document.getElementById('user-names-overlay'). innerHTML += getUserNamesOverlay(name);
        let firstLetters = responseTaskJson.assignedTo[i].firstName[0] + responseTaskJson.assignedTo[i].lastName[0];
        document.getElementById('assigned-user-overlay').innerHTML = getFirstLetterOverlay(firstLetters);
    }
}

function renderOverlaySubtasks(responseTaskJson) {
    for (let i = 0; i < responseTaskJson.subtasks.length; i++) {
        let title = responseTaskJson.subtasks[i].title;
        let status = responseTaskJson.subtasks[i].status;
        if(status == 'done') {
            status = './assets/icons/checked_icon.png';
        } else {
            status = './assets/icons/unchecked_icon.png';
        }
        document.getElementById('subtasks-overlay').innerHTML += getSubtasksOverlay(title, status);
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

async function editTask(id, title, description, dueDate) {
    id--;
    let refOverlay = document.getElementById('task-details');
    refOverlay.innerHTML = "";
    refOverlay.innerHTML = getOverlayEdit(title, description);
    document.getElementById('due-date-input').defaultValue = dueDate;
}