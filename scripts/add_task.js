/**
 * Global variables to manage priorities, subtasks, and contacts.
 * @type {string}
 */
let priority = '';
/** @type {Array<Object>} */
let subtasksArray = [];
/** @type {Array<Object>} */
let allContacts = [];
/** @type {Array<Object>} */
let selectedContacts = [];

/**
 * Fetches all task IDs from the backend.
 * @async
 * @returns {Promise<number[]>} Array of task IDs.
 */
async function getAllTaskIDs() {
    try {
        let response = await fetch(`${BASE_URL}/tasks.json`);
        let tasksData = await response.json();
        return tasksData ? extractIDs(tasksData) : [];
    } catch (error) {
        console.error("Fehler beim Abrufen der Task-IDs:", error);
        return [];
    }
}

/**
 * Extracts IDs from the tasks data object.
 * @param {Object} tasksData - Tasks data from backend.
 * @returns {number[]} Array of task IDs.
 */
function extractIDs(tasksData) {
    let ids = Object.keys(tasksData).map(key => parseInt(tasksData[key].id));
    return ids.filter(Number.isInteger);
}

/**
 * Generates a new task ID.
 * @async
 * @returns {Promise<number>} The new task ID.
 */
async function generateNewID() {
    let existingIDs = await getAllTaskIDs();
    return Math.max(...existingIDs, 0) + 1;
}

/**
 * Sets the priority for the task.
 * @param {string} prio - The priority level.
 */
function setPriority(prio) {
    priority = prio;
}

/**
 * Creates a new task with all inputs and saves it to the backend.
 * @async
 * @returns {Promise<void>}
 */
async function createTask() {
    validateInput();
    validateDateInput();
    validateSelectCategory();

    let { title, description, dueDate, category } = getTaskInputs();
    const isTitleValid = title.trim() !== "";
    const isDescriptionValid = description.trim() !== "";
    const isDueDateValid = dueDate.match(/^\d{2}\/\d{2}\/\d{4}$/);
    const isCategoryValid = category !== "";

    if (!isTitleValid || !isDueDateValid || !isCategoryValid) {
        return;
    }
    prepareSubtasksAndContacts();
    let newID = await generateNewID();
    let newTask = buildNewTask(newID, title, description, dueDate, category);
    await saveTask(newTask);
}

/**
 * Prepares subtasks and contacts for saving.
 */
function prepareSubtasksAndContacts() {
    subtasksArray = subtasksArray.map(subtask => ({
        ...subtask,
        status: subtask.status || 'not done'
    }));
    selectedContacts = selectedContacts.map(contact => ({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        color: generateColor()
    }));
}

/**
 * Gathers inputs from the task form.
 * @returns {Object} Task input values.
 */
function getTaskInputs() {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dateInput = document.getElementById('due-date-input') || document.getElementById('date-div');
    let dueDate = dateInput.value || dateInput.textContent;
    let category = document.getElementById('selectcategory').value;
    let color = getRandomColor();
    return { title, description, dueDate, category, color };
}

/**
 * Builds a new task object.
 * @param {number} id - Task ID.
 * @param {string} title - Task title.
 * @param {string} description - Task description.
 * @param {string} dueDate - Task due date.
 * @param {string} category - Task category.
 * @param {string} color - Task color.
 * @returns {Object} The new task object.
 */
function buildNewTask(id, title, description, dueDate, category, color) {
    return {
        id,
        title,
        description,
        dueDate,
        color,
        prio: priority,
        category,
        list: "to-do",
        subtasks: subtasksArray,
        assignedTo: selectedContacts
    };
}

/**
 * Saves the task to the backend.
 * @async
 * @param {Object} newTask - The task object to save.
 * @returns {Promise<void>}
 */
async function saveTask(newTask) {
    let [day, month, year] = newTask.dueDate.split('/');
    newTask.dueDate = `${year}-${month}-${day}`;

    await fetch(`${BASE_URL}/tasks/${newTask.id - 1}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
    });
    const successOverlay = document.getElementById('success-overlay');

    if (successOverlay) {
        successOverlay.style.display = 'flex';
        successOverlay.style.justifyContent = 'center';
        successOverlay.style.alignItems = 'center';
        setTimeout(() => {
            successOverlay.style.display = 'none';
            window.location.href = 'board.html';
        }, 3000);
    } else {
        console.error('Element mit der ID "success-overlay" wurde nicht gefunden.');
    }
}

/**
 * Fills the current date into the due date input field.
 */
function fillCurrentDate() {
    let dateInput = document.getElementById('due-date-input');
    dateInput.value = getFormattedTodayDate();
}

/**
 * Resets the styles of all priority buttons.
 */
function resetPriorityButtons() {
    resetButton('prio-red');
    resetButton('prio-orange');
    resetButton('prio-green');
}

/**
 * Resets the styles of a single button.
 * @param {string} buttonId - The ID of the button to reset.
 */
function resetButton(buttonId) {
    let button = document.getElementById(buttonId);
    button.style.backgroundColor = '';
    button.style.color = '';
    let img = button.querySelector('img');
    img.style.filter = '';
}

/**
 * Changes the color of the selected priority button.
 * @param {HTMLElement} element - The priority button element.
 * @param {string} color - The color to apply.
 */
function changeColor(element, color) {
    resetPriorityButtons();
    applyButtonColor(element, color);

    if (element.id === 'prio-red') {
        setPriority('Urgent');
    } else if (element.id === 'prio-orange') {
        setPriority('Medium');
    } else if (element.id === 'prio-green') {
        setPriority('Low');
    }
}

/**
 * Applies styles to the selected priority button.
 * @param {HTMLElement} element - The priority button element.
 * @param {string} color - The color to apply.
 */
function applyButtonColor(element, color) {
    element.style.backgroundColor = color;
    element.style.color = '#FFFFFF';
    let img = element.querySelector('img');
    img.style.filter = 'brightness(0) invert(1)';
}


/**
 * Toggles the visibility of the subtask input and buttons.
 */
function addSubtask() {
    toggleShowIcons(true);
    toggleAddSubtaskButton(false);
}

/**
 * Toggles the visibility of the icons for adding subtasks.
 * @param {boolean} show - Whether to show or hide the icons.
 */
function toggleShowIcons(show) {
    let showIcons = document.getElementById('show-icons');
    if (showIcons) showIcons.style.display = show ? "flex" : "none";
}

/**
 * Toggles the visibility of the "Add Subtask" button.
 * @param {boolean} show - Whether to show or hide the button.
 */
function toggleAddSubtaskButton(show) {
    let addSubtaskButton = document.getElementById('add-subtask');
    if (addSubtaskButton) addSubtaskButton.style.display = show ? "inline-block" : "none";
}

/**
 * Clears the subtask input field.
 */
function clearSubtaskInput() {
    let subtaskInput = document.getElementById('addsubtasks');
    if (subtaskInput) subtaskInput.value = '';
}

/**
 * Validates and confirms a new subtask. Adds it to the subtask list if valid.
 */
function confirmSubtask() {
    let subtaskList = document.getElementById('subtask-list');
    let subtaskCount = subtaskList.getElementsByTagName('li').length;

    if (subtaskCount >= 2) {
        alert("You can only add 2 subtasks.");
        return;
    }

    let subtaskValue = document.getElementById('addsubtasks').value;
    if (!subtaskValue) {
        alert("Please enter a subtask.");
        return;
    }

    addSubtaskToList(subtaskList, subtaskValue);
}

/**
 * Adds a new subtask to the list.
 * @param {HTMLElement} subtaskList - The HTML element containing the subtask list.
 * @param {string} subtaskValue - The value of the new subtask.
 */
function addSubtaskToList(subtaskList, subtaskValue) {
    let li = createSubtaskElement(subtaskValue);
    subtaskList.appendChild(li);
    subtasksArray.push({ title: subtaskValue });
    resetSubtaskInputs();
}

/**
 * Creates an HTML element for a new subtask.
 * @param {string} subtaskValue - The value of the subtask.
 * @returns {HTMLElement} The new subtask element.
 */
function createSubtaskElement(subtaskValue) {
    let li = document.createElement('li');
    li.innerHTML = `<div>
                        <span class="dot">•</span>
                        <span class="subtask-text">${subtaskValue}</span>
                    </div>
                    <div class="icons">
                        <button class="icon-btn" onclick="editSubtask(this)">
                            <img src="./assets/icons/edit_icon.png" alt="EditIcon" style="height:20px;">
                        </button>
                        <div class="ul-icons-seperator"></div>
                        <button class="icon-btn" onclick="deleteSubtask(this)">
                            <img src="./assets/icons/delete_icon.png" alt="DeleteIcon" style="height:20px;">
                        </button>
                    </div>`;
    return li;
}

/**
 * Resets the subtask input field and toggles buttons back to their default state.
 */
function resetSubtaskInputs() {
    document.getElementById('addsubtasks').value = '';
    toggleShowIcons(false);
    toggleAddSubtaskButton(true);
}

/**
 * Edits an existing subtask.
 * @param {HTMLElement} editBtn - The button element used to trigger the edit.
 */
function editSubtask(editBtn) {
    let subtaskText = editBtn.parentElement.previousElementSibling.querySelector('.subtask-text');
    subtaskText.contentEditable = "true";
    subtaskText.focus();
    let originalText = subtaskText.textContent;
    subtaskText.addEventListener('blur', function () {
        let newText = subtaskText.textContent.trim();
        if (newText === "") {
            alert("Unteraufgabe darf nicht leer sein.");
            subtaskText.textContent = originalText;
        } else {
            let subtaskIndex = subtasksArray.findIndex(subtask => subtask.title === originalText);
            if (subtaskIndex !== -1) {
                subtasksArray[subtaskIndex].title = newText;
            }
        }
        subtaskText.contentEditable = "false";
    });
}

/**
 * Deletes a subtask from the list.
 * @param {HTMLElement} deleteBtn - The button element used to trigger the delete.
 */
function deleteSubtask(deleteBtn) {
    let subtaskToDelete = deleteBtn.parentElement.parentElement;
    subtaskToDelete.remove();
}

/**
 * Generates a random color.
 * @returns {string} A randomly generated color.
 */
function getRandomColor() {
    return generateColor();
}

/**
 * Loads all contacts from the backend and processes them.
 * @async
 * @returns {Promise<void>}
 */
async function loadContacts() {
    let userAsContact = createUserAsContact();

    try {
        let response = await fetch(`${BASE_URL}/contacts.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        let contacts = await response.json();
        allContacts = processContacts(contacts, userAsContact);
        displayContacts(allContacts);
    } catch (error) {
        console.error('Fehler beim Laden der Kontakte:', error);
    }
}

/**
 * Creates a contact representation for the logged-in user.
 * @returns {Object} The logged-in user as a contact object.
 */
function createUserAsContact() {
    return {
        email: loggedUser.email,
        id: 0,
        firstName: loggedUser.name.split(' ')[0],
        lastName: loggedUser.name.split(' ').slice(1).join(' ') || '(You)',
        phone: '000000'
    };
}

/**
 * Formats a contact object by splitting the name into first and last names.
 * @param {Object} contact - The contact object to format.
 * @returns {Object} The formatted contact object.
 */
function formatContact(contact) {
    let firstName = '';
    let lastName = '';
    if (contact.name) {
        const nameParts = contact.name.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
    } else {
        firstName = contact.firstName || '';
        lastName = contact.lastName || '';
    }
    return { ...contact, firstName, lastName };
}

/**
 * Generates initials for a contact.
 * @param {Object} contact - The contact object.
 * @returns {string} The initials of the contact.
 */
function getInitials(contact) {
    let initials = '';
    if (contact.firstName) initials += contact.firstName.charAt(0);
    if (contact.lastName) initials += contact.lastName.charAt(0);
    if (!initials && contact.name) initials = contact.name.charAt(0);
    return initials;
}

/**
 * Gets the full name of a contact.
 * @param {Object} contact - The contact object.
 * @returns {string} The full name of the contact.
 */
function getFullName(contact) {
    return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
}

/**
 * Toggles the dropdown for user selection.
 */
function openDropdown() {
    let dropdown = document.getElementById('dropdown-user');
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";

    if (dropdown.style.display === "flex") {
        loadContacts().then(() => {
            synchronizeCheckboxes();
        });
    }
}

/**
 * Closes the dropdown when clicking outside.
 * @param {Event} event - The click event.
 */
function closeDropdownOnClickOutside(event) {
    const dropdown = document.getElementById('dropdown-user');
    const container = document.querySelector('.dropdown');
    if (dropdown && container && !container.contains(event.target)) {
        dropdown.style.display = 'none';
    }
}
document.addEventListener('click', closeDropdownOnClickOutside);

/**
 * Clears all task-related inputs and resets the form.
 */
function clearTask() {
    clearInputs();
    clearSubtaskList();
    resetPriorityButtons();
    displayContacts(allContacts);
}

/**
 * Clears the input fields for the task.
 */
function clearInputs() {
    document.getElementById("title").value = '';
    document.getElementById("description").value = '';
    document.getElementById("due-date-input").value = '';
    document.getElementById("selectcategory").value = '';
}

/**
 * Clears the subtask list and resets the array.
 */
function clearSubtaskList() {
    document.getElementById("subtask-list").innerHTML = '';
    subtasksArray = [];
    selectedContacts = [];
}

/**
 * Validates the title input field.
 */
function validateInput() {
    const input = document.getElementById('title');
    const errorMessage = document.getElementById('error-message');

    if (input.value.trim() === "") {
        input.classList.add('error');
        input.style.border = '2px solid red';
        errorMessage.style.display = 'block';
    } else {
        input.classList.remove('error');
        input.style.border = 'none';
        errorMessage.style.display = 'none';
    }
}

/**
 * Validates the category selection input.
 */
function validateSelectCategory() {
    const selectCategory = document.getElementById('selectcategory');
    const categoryErrorMessage = document.getElementById('category-error-message');

    if (isCategoryEmpty(selectCategory)) {
        showCategoryError(selectCategory, categoryErrorMessage);
    } else {
        hideCategoryError(selectCategory, categoryErrorMessage);
    }
}

/**
 * Checks if the category selection is empty.
 * @param {HTMLElement} selectCategory - The category selection element.
 * @returns {boolean} True if the category is empty, otherwise false.
 */
function isCategoryEmpty(selectCategory) {
    return selectCategory.value === "";
}

/**
 * Displays an error for the category selection input.
 * @param {HTMLElement} selectCategory - The category selection element.
 * @param {HTMLElement} categoryErrorMessage - The error message element.
 */
function showCategoryError(selectCategory, categoryErrorMessage) {
    selectCategory.classList.add('error');
    selectCategory.style.border = '2px solid red';
    categoryErrorMessage.style.display = 'block';
}

/**
 * Hides the error for the category selection input.
 * @param {HTMLElement} selectCategory - The category selection element.
 * @param {HTMLElement} categoryErrorMessage - The error message element.
 */
function hideCategoryError(selectCategory, categoryErrorMessage) {
    selectCategory.classList.remove('error');
    selectCategory.style.border = 'none';
    categoryErrorMessage.style.display = 'none';
}

/**
 * Sets the page mode based on whether it's in an overlay or not.
 */
document.addEventListener('DOMContentLoaded', function () {
    if (window !== window.top) {
        document.body.id = 'overlay-mode';
    } else {
        document.body.id = 'main-page';
    }
});
