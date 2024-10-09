
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
        document.getElementById(`${list}`).innerHTML += getTask(id, category, classCategory, title, description, prioIcon, list);
        calculateSubtaskProgress(tasksJson[i].subtasks, id);
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
    let listNames = ['To do', 'In progress', 'Await feedback', 'Done']

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
