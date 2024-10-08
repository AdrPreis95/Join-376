
let BASE_URL = 'https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/';

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
        let list = tasksJson[i].list;
        let category = tasksJson[i].category;
        let classCategory = checkCategory(category);
        let title = tasksJson[i].title;
        let description = tasksJson[i].description;
        renderFirstLetter(tasksJson[i].assignedTo);
        let prioIcon = findPrio(tasksJson[i].prio);
        document.getElementById(`${list}`).innerHTML += getTask(category, classCategory, title, description, prioIcon);
    }
    checkEmptyList();
}

function renderFirstLetter(user) {
    for (let i = 0; i < user.length; i++) {
        let firstName = user[i].firstName[0];
        let lastName = user[i].lastName[0];
        let firstLetter = firstName + lastName;
        document.getElementById('assigned-user').innerHTML += getFirstLetterName(firstLetter);
    }
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
