
let BASE_URL = 'https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/';
let currentDraggedElement;
let activePriority = '';
let titles = [];
let descriptions = [];

/**
 * This function loads all tasks from Firebase at the start and renders them into the HTML template.
 */
async function loadTasks() {
    let tasks = await fetch(BASE_URL + "/tasks.json")
    let tasksJson = await tasks.json();
    clearLists();
    renderTasks(tasksJson);
    saveInArray(tasksJson);
}

/**
 * This function uses the index to search for the ID of the object in order to load the correct data from Firebase.
 * @param {number} id 
 * @returns Returns the ID of the object
 */
async function findKey(id) {
    let response = await fetch(BASE_URL + "/tasks.json");
    let responseJson = await response.json();
    let keys = Object.keys(responseJson);
    let key = keys[id];
    return key;
}

/**
 * This function saves the title and description of the tasks in an array for the search function.
 * @param {object} tasksJson - The tasks are all transferred in this object.
 */
function saveInArray(tasksJson) {
    for (let i = 0; i < tasksJson.length; i++) {
        titles.push(tasksJson[i].title);
        descriptions.push(tasksJson[i].description);
    }
}

/**
 * The function searches for a match in the title or description and then renders the task found.
 */
async function searchTask() {
    let keyword = document.getElementById('find-task').value;
    let titleIndex = titles.findIndex(element => element.toLowerCase().includes(keyword.toLowerCase()));
    let id = await findKey(titleIndex);
    // let descriptionIndex = descriptions.findIndex(element => element.toLowerCase().includes(keyword.toLowerCase()));
    let response = await fetch(BASE_URL + "/tasks/" + id + ".json")
    let responseJson = await response.json();
    renderTasks(responseJson);
    document.getElementById('find-task').value = "";
}

/**
 * This function initially empties all lists.
 */
function clearLists() {
    document.getElementById('to-do').innerHTML = "";
    document.getElementById('in-progress').innerHTML = "";
    document.getElementById('await-feedback').innerHTML = "";
    document.getElementById('done').innerHTML = "";
}

/**
 * This function renders the tasks in the HTML template.
 * @param {object} tasksJson - The tasks are all transferred in this object.
 */
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

/**
 * This function checks whether a list is empty. If this is the case, a placeholder is rendered.
 */
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

/**
 * This function checks which category a task belongs to in order to display the label correctly.
 */
function checkCategory(category) {
    if (category == 'Technical Task') {
        classCategory = 'technical-task';
    } else {
        classCategory = 'user-story';
    }
    return classCategory;
}

/**
 * This function calculates the progress of the processing of the individual subtasks and renders them.
 * @param {array} subtasks - The subtasks are transferred to calculate the progress.
 * @param {number} id - The Id shows which subtasks belong to which task.
 */
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

/**
 * This function searches for the first letter of the first name and the last name and renders these letters respectively.
 * @param {array} user - All users are transferred in an array.
 * @param {number} id - The Id to render the correct letters.
 */
function renderFirstLetter(user, id) {
    let firstLetters = [];
    let colors = [];

    for (let i = 0; i < user.length; i++) {
        let firstName = user[i].firstName[0];
        let lastName = user[i].lastName[0];
        let color = user[i].color;
        let firstLetter = firstName + lastName;
        firstLetters.push(firstLetter);
        colors.push(color);
    }
    if (firstLetters.length <= 5) {
        for (let j = 0; j < firstLetters.length; j++) {
            document.getElementById('assigned-user-' + id).innerHTML += getFirstLetterName(firstLetters[j], colors[j]);
        }
    } else {
        for (let j = 0; j < 5; j++) {
            document.getElementById('assigned-user-' + id).innerHTML += getFirstLetterName(firstLetters[j]);
        }
        document.getElementById('more-user-' + id).innerHTML = getMoreUser(firstLetters.length - 5);
    }
}

/**
 * This function determines the priority and then returns the URL for the correct icon.
 * @param {string} priority - The priority of the task.
 * @returns URL from the priority icon.
 */
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

/**
 * This function saves the task to be moved and adds a CSS class to high-light the task.
 * @param {number} id - The Id of the element to be moved.
 */
function startDragging(id) {
    currentDraggedElement = id;
    document.getElementById(currentDraggedElement).classList.add('drag-area-highlight');
}

function removeDragging(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

/**
 * This function allows you to move the div-container.
 * @param {event} ev - This is the event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * This function saves the new list in Firebase.
 * @param {*} list - The current list is transferred here.
 */
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

/**
 * This function deletes a task.
 * @param {number} id - Transfers the ID of the task to be deleted.
 */
async function deleteTask(id) {
    let tasks = await fetch(BASE_URL + "/tasks.json");
    let tasksJson = await tasks.json();
    tasksJson = Array.isArray(tasksJson) ? tasksJson : Object.values(tasksJson);
    const removeTaskById = (tasksJson, id) =>
    tasksJson.filter(task => task.id !== id);
    let updatedTasks = removeTaskById(tasksJson, id);
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
