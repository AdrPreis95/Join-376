
let BASE_URL = 'https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/';

async function loadTasks() {
    let tasks = await fetch(BASE_URL + "/tasks.json")
    let tasksJson = await tasks.json();
    document.getElementById('to-do').innerHTML = "";
    document.getElementById('in-progress').innerHTML = "";
    document.getElementById('await-feedback').innerHTML = "";
    document.getElementById('done').innerHTML = "";
    renderTasks(tasksJson);
}

function renderTasks(tasksJson) {
    for (let i = 0; i < tasksJson.length; i++) {
        let list = tasksJson[i].list;
        let category = tasksJson[i].category;
        let classCategory = checkCategory(category);
        let title = tasksJson[i].title;
        let description = tasksJson[i].description;
        let assignedTo = tasksJson[i].assignedTo;
        let firstLetterNames = findFirstNameLetter(assignedTo);
        let prioIcon = findPrio(tasksJson[i].prio);
        document.getElementById(`${list}`).innerHTML += getTask(category, classCategory, title, description, firstLetterNames, prioIcon);
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

// function calcSubtask(subtaskJson) {
//     let length = subtaskJson.length;
//     let doneTasks = 0;
//     if(subtaskJson[0].status == 'done') {
//         doneTasks++;
//     }
//     if(subtaskJson[1].status == 'done') {
//         doneTasks++;
//     }
//     let progressSubtasks = doneTasks / length * 100;
//     return length, doneTasks, progressSubtasks;
// }

function findFirstNameLetter(assignedTo) {
    for (let i = 0; i < assignedTo.length; i++) {
        let firstName = assignedTo[i].firstName;
        firstName = firstName[0];

        let lastName = assignedTo[i].lastName;
        lastName = lastName[0];

        let firstLetterNames = firstName + lastName;
        return firstLetterNames;
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