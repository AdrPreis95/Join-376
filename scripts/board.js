
let BASE_URL = 'https://join376-5c0e7-default-rtdb.europe-west1.firebasedatabase.app/';
let currentDraggedElement;
let activePriority = '';
let titles = [];
let descriptions = [];
let loadedTasks = [];

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
    loadedTasks = tasksJson;
    for (let i = 0; i < tasksJson.length; i++) {
        titles.push(tasksJson[i].title);
        descriptions.push(tasksJson[i].description);
    }
}

/**
 * The function searches for a match in the title or description and then renders the task found.
 */
async function searchTask(type, e) {
    var keynum = pressedKey(e); // To check if the backspace key is pressed  
    let keyword = getKeyWord(type);
    let response = await fetch(BASE_URL + "/tasks.json");
    let responseJson = await response.json();

    const matchedTasks = responseJson.filter((task) => (task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword)));

    showSearchResults(matchedTasks, responseJson, keynum);
}

/**
 * This function checks which button has been pressed and returns the key code.
 * @param {event} e - The event object is transferred.
 * @returns The function returns the key code (keynum) of the key pressed.
 */
function pressedKey(e) {
    if (window.e) { // IE                  
        return keynum = e.keyCode;
    } else if (e.which) { // Netscape/Firefox/Opera                 
        return keynum = e.which;
    }
}

/**
 * The function synchronizes the value of two input fields and returns the entered text as lower case letters. 
 * @param {string} type 
 * @returns The function returns the text of the relevant input field in lower case.
 */
function getKeyWord(type) {
    if (type == "responsive") {
        document.getElementById('find-task').value = document.getElementById('find-task-responsive').value;
        return document.getElementById('find-task-responsive').value.toLowerCase();
    } else {
        document.getElementById('find-task-responsive').value = document.getElementById('find-task').value;
        return keyword = document.getElementById('find-task').value.toLowerCase();
    }
}

/**
 * The function processes and displays search results based on an input. It checks whether there are matches to a search and renders either the filtered results or the entire list, depending on the input.
 * @param {string} matchedTasks 
 * @param {object} responseJson 
 * @param {number} keynum 
 */
function showSearchResults(matchedTasks, responseJson, keynum) {
    if (matchedTasks.length > 0 && keynum != 8) {
        clearLists();
        renderTasks(matchedTasks);
    } else {
        clearLists();
        renderTasks(responseJson);
        if (keyword != "" && keynum != 8)
            noResults();
    }
}

/**
 * This function provides user feedback if no results were found for the entry.
 */
function noResults() {
    let popUp = document.getElementById("search-notification");
    popUp.classList.remove("d-none");
    setTimeout(() => {
        popUp.classList.add("d-none");
    }, "1500");
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
        let selectList = document.getElementById(`${list}`);
        if (selectList)
            selectList.innerHTML += getTask(id, category, classCategory, title, description, prioIcon);

        if (tasksArray[i].subtasks != undefined) {
            calculateSubtaskProgress(tasksArray[i].subtasks, id);
        }
        getFirstLetter(tasksArray[i].assignedTo, id);
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
 * This function searches for the first letter of the first name and the last name.
 * @param {array} user - All users are transferred in an array.
 * @param {number} id - The Id to render the correct letters.
 */
function getFirstLetter(user, id) {
    let firstLetters = [];
    let colors = [];
    if (user !== undefined) {
        for (let i = 0; i < user.length; i++) {
            let firstName = user[i].firstName[0];
            let lastName = user[i].lastName[0];
            let color = user[i].color;
            let firstLetter = firstName + lastName;
            firstLetters.push(firstLetter);
            colors.push(color);
        }
    }
    renderFirstLetter(firstLetters, colors, id);
}

/**
 * This function renders the initial letters of the names in the map.
 */
function renderFirstLetter(firstLetters, colors, id) {
    if (firstLetters.length <= 5) {
        for (let j = 0; j < firstLetters.length; j++) {
            document.getElementById('assigned-user-' + id).innerHTML += getFirstLetterName(firstLetters[j], colors[j]);
        }
    } else {
        for (let j = 0; j < 5; j++) {
            document.getElementById('assigned-user-' + id).innerHTML += getFirstLetterName(firstLetters[j], colors[j]);
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

/**
 * Opens the "Add Task" overlay, allowing the user to add a new task to the list.
 * 
 * This function performs the following actions:
 * 1. Displays the overlay where the "Add Task" interface is presented.
 * 2. Adjusts the styles of the overlay for proper positioning and layout.
 * 3. Hides unnecessary elements (e.g., `aside`, `footer`, `header`) within the iframe context 
 *    to ensure a clean and focused user interface.
 * 
 * @function openAddTask
 * @returns {void}
 */
function openAddTask() {
    showOverlay(); // Displays the overlay.
    setOverlayStyles(); // Configures styles for the overlay.
    hideUnnecessaryElementsInIframe(); // Hides irrelevant elements in the iframe.
}



/**
 * This Function opens the overlay, activates the overlay class, and sets the overlay mode.
 */
function openOverlay() {
    const overlay = document.getElementById('overlayContent');
    if (overlay) {
        overlay.classList.add('overlay-active'); // Adds the active class to the overlay
        setOverlayMode(); // Sets the overlay mode
    }
}

/**
 * This Function close the task overlay, removes the overlay class, and resets the mode to the main page.
 */
function closeTaskOverlay() {
    const overlay = document.getElementById('taskoverlay');
    if (overlay) {
        overlay.classList.remove('overlay-active');
        resetToMainPage();
    }
}

/**
 * This Function activate the overlay mode by setting the <body> element ID inside the iframe to "overlay-mode".
 */
function setOverlayMode() {
    const iframe = document.getElementById("overlayContent");
    if (iframe) {
        iframe.onload = function () {
            setTimeout(() => {
                const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDocument) {
                    const body = iframeDocument.body;
                    if (body) {
                        console.log("Changing body ID to 'overlay-mode'");
                        body.id = "overlay-mode"; // Sets the ID to indicate overlay mode
                    }
                }
            }, 100); // Delay to ensure iframe content has loaded
        };
    }
}

/**
 * This Function resets the state inside the iframe to the main page by setting the `<body>` element ID to "main-page".
 */
function resetToMainPage() {
    const iframe = document.getElementById('overlayContent');
    if (iframe) {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDocument) {
            const body = iframeDocument.body;
            if (body) {
                console.log("Resetting body ID to 'main-page'");
                body.id = 'main-page'; // Resets the ID to indicate the main page mode
            }
        }
    }
}
