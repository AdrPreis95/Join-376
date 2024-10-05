
let BASE_URL = 'https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/';

async function loadTasks() {
    let tasks = await fetch(BASE_URL + "/tasks.json")
    let tasksJson = await tasks.json();
    // document.getElementById('in-progress', 'await-feedback', 'done').innerHTML = "";
    
    for (let i = 0; i < tasksJson.length; i++) {
        console.log(tasksJson[i]);
        let category = tasksJson[i].category;
        let classCategory = checkCategory(category);
        let title = tasksJson[i].title;
        let description = tasksJson[i].description;
        let list = tasksJson[i].list;
        let assignedTo = tasksJson[i].assignedTo;
        let firstLetterNames = findFirstNameLetter(assignedTo);
        console.log(assignedTo);
        document.getElementById(`${list}`).innerHTML += getTask(category, classCategory, title, description, firstLetterNames);        
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

function toggleSubtask() {
    let refIcon = document.getElementById('click-subtaks');
    let refSubtask = document.getElementById('subtasks');  

    if(refIcon.getAttribute('src') == './assets/icons/priority_open_down_icon.png') {
        refIcon.setAttribute('src', './assets/icons/urgent_icon.png');
        refSubtask.innerHTML = getSubtask();
    } else if(refIcon.getAttribute('src') == './assets/icons/urgent_icon.png') {
        refIcon.setAttribute('src', './assets/icons/priority_open_down_icon.png');
        refSubtask.innerHTML = "";
    }
}