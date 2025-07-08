/**
 * @type {string}
 * @description This parameter sets the default priority to "Medium". 
 * It ensures that the priority button starts with "Medium" as the selected state
 * unless explicitly changed by the user.
 */
let currentPriority = 'Medium';
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

    let { title, description, dueDate, category, color } = getTaskInputs();
    const isTitleValid = title.trim() !== "";
    const isDescriptionValid = description.trim() !== "";
    const isDueDateValid = dueDate.match(/^\d{2}\/\d{2}\/\d{4}$/);
    const isCategoryValid = category !== "";

    if (!isTitleValid || !isDueDateValid || !isCategoryValid) {
        return;
    }

    prepareSubtasksAndContacts();
    let newID = await generateNewID();

    const fileInput = document.getElementById("file-select");
    const file = fileInput?.files?.[0];
    let fileData = { base64: "", name: "" };

    if (file) {
        if (!isValidFileType(file)) {
            alert(" Ungültiges Dateiformat. Nur PNG, JPG, JPEG oder PDF erlaubt!!!");
            return;
        }

        if (file.type.startsWith("image/")) {
            fileData = await resizeAndConvertImage(file, 1024, 1024, 0.8); 
        } else if (file.type === "application/pdf") {
            fileData = await convertToBase64(file);
        }
    }


    let newTask = buildNewTask(newID, title, description, dueDate, category, color, fileData);
    await saveTask(newTask);

    console.log("Gewählter Dateiname:", file?.name);
    console.log("Base64 vorhanden:", fileData.base64.length > 0);

}


/**
 * Converts a File object to a Base64 string.
 * @param {File} file - The file to convert.
 * @returns {Promise<Object>} Object with base64 and name
 */
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf']; // beliebig erweiterbar
        const maxSize = 1 * 1024 * 1024; // max. 1 MB

        if (!allowedTypes.includes(file.type)) {
            alert(`Dateityp ${file.type} wird nicht unterstützt.`);
            return resolve({ base64: "", name: file.name });
        }

        if (file.size > maxSize) {
            alert("Datei ist zu groß. Maximal erlaubt: 1 MB.");
            return resolve({ base64: "", name: file.name });
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            resolve({ base64: reader.result, name: file.name });
        };

        reader.onerror = (error) => {
            console.error("Fehler beim Einlesen der Datei:", error);
            resolve({ base64: "", name: file.name });
        };
    });
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


function buildNewTask(id, title, description, dueDate, category, color, file = { base64: "", name: "" }) {
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
        assignedTo: selectedContacts,
        file
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

    try {
        await fetch(`${BASE_URL}/tasks/${newTask.id - 1}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask),
        });

        // Erfolgsmeldung anzeigen
        const successOverlay = document.getElementById('success-overlay');
        if (successOverlay) {
            successOverlay.style.display = 'flex';
            successOverlay.style.justifyContent = 'center';
            successOverlay.style.alignItems = 'center';

            setTimeout(() => {
                successOverlay.style.display = 'none';
                if (document.body.id === "overlay-mode") {
                    console.log("Overlay mode detected. Clearing inputs and closing overlay.");
                    // Inputs zurücksetzen und Overlay schließen
                    clearInputsAndCloseOverlay();
                } else {
                    console.log("Main page detected. Redirecting to board.");
                    window.location.href = 'board.html'; // Weiterleitung zur Board-Seite
                }
            }, 3000);
        } else {
            console.error('Element mit der ID "success-overlay" wurde nicht gefunden.');
        }
    } catch (error) {
        console.error("Fehler beim Speichern des Tasks:", error);
    }
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
window.addEventListener('DOMContentLoaded', function () {
    const defaultButton = document.getElementById('prio-orange');
    if (defaultButton) {
        changeColor(defaultButton, 'orange');
        setPriority('Medium');
    }
});

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
    let subtaskMessage = document.getElementById('subtask-limit-message');
    if (subtaskCount >= 3) {
        subtaskMessage.classList.add('blink');
        subtaskMessage.style.display = "block";
        setTimeout(() => {
            subtaskMessage.classList.remove('blink');
            subtaskMessage.style.display = "none";
        }, 2000);
        return;
    }
    subtaskMessage.style.display = "none";
    let subtaskValue = document.getElementById('addsubtasks').value.trim();
    if (subtaskValue !== "") {
        addSubtaskToList(subtaskList, subtaskValue);
    }
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
    subtaskText.addEventListener('input', function () {
        if (subtaskText.textContent.length > 36) {
            subtaskText.textContent = subtaskText.textContent.slice(0, 36);
        }
    });
    subtaskText.addEventListener('keydown', function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            subtaskText.blur();
        }
    });

    /**This Function is for the updated subtask,if the subtask dont get entered,the value of the old subtask get filled in */
    subtaskText.addEventListener('blur', function () {
        let newText = subtaskText.textContent.trim();
        if (newText === "") {
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


function isValidFileType(file) {
    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf"
    ];
    const validExtension = /\.(png|jpg|jpeg|pdf)$/i.test(file.name);

    return allowedTypes.includes(file.type) && validExtension;
}


function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ base64: reader.result, name: file.name });
        reader.onerror = error => reject(error);
    });
}

function createBlobURL(base64, mimeType) {
    const byteString = atob(base64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([intArray], { type: mimeType });
    return URL.createObjectURL(blob);
}
function resizeAndConvertImage(file, maxWidth, maxHeight, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Proportional skalieren
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    } else {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL("image/jpeg", quality);
                resolve({ base64, name: file.name });
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
}



