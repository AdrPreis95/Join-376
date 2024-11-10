let priority = '';
let subtasksArray = [];
let allContacts = [];
let selectedContacts = [];

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

function extractIDs(tasksData) {
    let ids = Object.keys(tasksData).map(key => parseInt(tasksData[key].id));
    return ids.filter(Number.isInteger);
}

async function generateNewID() {
    let existingIDs = await getAllTaskIDs();
    return Math.max(...existingIDs, 0) + 1;
}

function setPriority(prio) {
    priority = prio;
}

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
    let newID = await generateNewID();
    let newTask = buildNewTask(newID, title, description, dueDate, category);
    await saveTask(newTask);
    loadTasks();
}

function prepareSubtasksAndContacts() {
    subtasksArray = subtasksArray.map(subtask => ({
        ...subtask,
        status: subtask.status || 'not done'
    }));
    selectedContacts = selectedContacts.map(contact => ({
        firstName: contact.firstName ? contact.firstName : '',
        lastName: contact.lastName ? contact.lastName : ''
    }));
}

function getTaskInputs() {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dateInput = document.getElementById('due-date-input') || document.getElementById('date-div');
    let dueDate = dateInput.value || dateInput.textContent;
    let category = document.getElementById('selectcategory').value;
    return { title, description, dueDate, category };
}

function buildNewTask(id, title, description, dueDate, category) {
    return {
        id,
        title,
        description,
        dueDate,
        prio: priority,
        category,
        list: "to-do",
        subtasks: subtasksArray,
        assignedTo: selectedContacts
    };
}

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
        }, 3000);
    } else {
        console.error('Element mit der ID "success-overlay" wurde nicht gefunden.');
    }
}

function fillCurrentDate() {
    let dateInput = document.getElementById('due-date-input');
    dateInput.value = getFormattedTodayDate();
}

function getFormattedTodayDate() {
    let today = new Date();
    let day = String(today.getDate()).padStart(2, '0');
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let year = today.getFullYear();
    return `${day}/${month}/${year}`;
}

function handleDateInput(event) {
    let value = formatDateInput(event.target.value);
    event.target.value = value;

    if (value.length === 10) {
        if (validateDate(value)) {
            preventPastDate(value);
        } else {
            event.target.value = '';
            alert("Bitte geben Sie ein gültiges Datum ein.");
        }
    }
}

function formatDateInput(value) {
    value = value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    return value;
}

function validateDate(value) {
    let inputDateParts = value.split('/');
    return inputDateParts.length === 3 && isValidDayAndMonth(inputDateParts);
}

function isValidDayAndMonth(inputDateParts) {
    let day = parseInt(inputDateParts[0], 10);
    let month = parseInt(inputDateParts[1], 10);
    return day >= 1 && day <= 31 && month >= 1 && month <= 12;
}

function preventPastDate(value) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let enteredDate = getEnteredDate(value);
    let dateInput = document.getElementById('due-date-input');

    if (enteredDate < today) {
        fillCurrentDate();
        dateInput.classList.add('error-border');
    } else {
        dateInput.classList.remove('error-border');
    }
}

function getEnteredDate(value) {
    let inputDateParts = value.split('/');
    return new Date(`${inputDateParts[2]}-${inputDateParts[1]}-${inputDateParts[0]}`);
}

function resetPriorityButtons() {
    resetButton('prio-red');
    resetButton('prio-orange');
    resetButton('prio-green');
}

function resetButton(buttonId) {
    let button = document.getElementById(buttonId);
    button.style.backgroundColor = '';
    button.style.color = '';
    let img = button.querySelector('img');
    img.style.filter = '';
}

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

function applyButtonColor(element, color) {
    element.style.backgroundColor = color;
    element.style.color = '#FFFFFF';
    let img = element.querySelector('img');
    img.style.filter = 'brightness(0) invert(1)';
}

function addSubtask() {
    toggleShowIcons(true);
    toggleAddSubtaskButton(false);
}

function toggleShowIcons(show) {
    let showIcons = document.getElementById('show-icons');
    if (showIcons) showIcons.style.display = show ? "flex" : "none";
}

function toggleAddSubtaskButton(show) {
    let addSubtaskButton = document.getElementById('add-subtask');
    if (addSubtaskButton) addSubtaskButton.style.display = show ? "inline-block" : "none";
}

function clearSubtaskInput() {
    let subtaskInput = document.getElementById('addsubtasks');
    if (subtaskInput) subtaskInput.value = '';
}

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

function addSubtaskToList(subtaskList, subtaskValue) {
    let li = createSubtaskElement(subtaskValue);
    subtaskList.appendChild(li);
    subtasksArray.push({ title: subtaskValue });
    resetSubtaskInputs();
}

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

function resetSubtaskInputs() {
    document.getElementById('addsubtasks').value = '';
    toggleShowIcons(false);
    toggleAddSubtaskButton(true);
}

function editSubtask(editBtn) {
    let subtaskText = editBtn.parentElement.previousElementSibling;
    let newSubtask = prompt("Edit subtask:", subtaskText.textContent);
    if (newSubtask) subtaskText.textContent = newSubtask;
}

function deleteSubtask(deleteBtn) {
    let subtaskToDelete = deleteBtn.parentElement.parentElement;
    subtaskToDelete.remove();
}

function getRandomColor() {
    return generateColor();
}

function generateColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

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

function createUserAsContact() {
    return {
        email: loggedUser.email,
        id: 0,
        firstName: loggedUser.name.split(' ')[0],
        lastName: loggedUser.name.split(' ').slice(1).join(' ') || '(You)',
        phone: '000000'
    };
}

function processContacts(contacts, userAsContact) {
    let formattedContacts = contacts.filter(contact => contact).map(formatContact);
    formattedContacts.unshift(userAsContact);
    return formattedContacts;
}

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

function displayContacts(contacts) {
    let dropdown = document.getElementById('dropdown-user');
    dropdown.innerHTML = '';
    contacts.forEach(contact => createContactElement(dropdown, contact));
}

function createContactElement(dropdown, contact) {
    if (!contact) return;

    let userContainer = document.createElement('div');
    userContainer.classList.add('user-container');
    userContainer.appendChild(createAvatarContainer(contact));
    userContainer.appendChild(createCheckbox(contact));

    dropdown.appendChild(userContainer);
}

function createAvatarContainer(contact) {
    let avatarSpanContainer = document.createElement('div');
    avatarSpanContainer.classList.add('avatar-span-container');

    let avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.style.backgroundColor = getRandomColor();
    avatar.innerText = getInitials(contact).toUpperCase();

    let userName = document.createElement('span');
    userName.classList.add('user-name');
    userName.innerText = getFullName(contact);

    avatarSpanContainer.appendChild(avatar);
    avatarSpanContainer.appendChild(userName);

    return avatarSpanContainer;
}

function createCheckbox(contact) {
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', function () {
        updateSelectedContacts(this.checked, contact);
        updatePickedUserAvatars();
    });
    return checkbox;
}

function updateSelectedContacts(isChecked, contact) {
    if (isChecked) {
        selectedContacts.push(contact);
    } else {
        selectedContacts = selectedContacts.filter(c => c !== contact);
    }
}

function getInitials(contact) {
    let initials = '';
    if (contact.firstName) initials += contact.firstName.charAt(0);
    if (contact.lastName) initials += contact.lastName.charAt(0);
    if (!initials && contact.name) initials = contact.name.charAt(0);
    return initials;
}

function getFullName(contact) {
    return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
}

function updatePickedUserAvatars() {
    let pickedUserAvatarContainer = document.getElementById('picked-user-avatar');
    pickedUserAvatarContainer.innerHTML = '';

    selectedContacts.forEach((contact, index) => {
        pickedUserAvatarContainer.appendChild(createPickedUserElement(contact, index));
    });
}

function createPickedUserElement(contact, index) {
    let userInfoContainer = document.createElement('div');
    userInfoContainer.classList.add('picked-user-info');
    userInfoContainer.appendChild(createDeleteButton(index));
    userInfoContainer.appendChild(createAvatarDiv(contact));
    userInfoContainer.appendChild(createNameSpan(contact));

    return userInfoContainer;
}

function createDeleteButton(index) {
    let deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-user-button');
    deleteButton.innerHTML = '&times;';
    deleteButton.title = 'Remove User';
    deleteButton.addEventListener('click', () => {
        selectedContacts.splice(index, 1);
        updatePickedUserAvatars();
    });
    return deleteButton;
}

function createAvatarDiv(contact) {
    let avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.style.backgroundColor = getRandomColor();
    avatarDiv.innerText = getInitials(contact).toUpperCase();
    return avatarDiv;
}

function createNameSpan(contact) {
    let nameSpan = document.createElement('span');
    nameSpan.classList.add('picked-user-name');
    nameSpan.innerText = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    return nameSpan;
}

function filterContacts() {
    let input = document.getElementById('dropdown-input').value.toLowerCase();
    let filteredContacts = {};

    for (const key in allContacts) {
        if (allContacts[key].name.toLowerCase().startsWith(input)) {
            filteredContacts[key] = allContacts[key];
        }
    }

    displayContacts(filteredContacts);
}

function openDropdown() {
    let dropdown = document.getElementById('dropdown-user');
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
    if (dropdown.style.display === "flex") loadContacts();
}

function clearTask() {
    clearInputs();
    clearSubtaskList();
    resetPriorityButtons();
    displayContacts(allContacts);
}

function clearInputs() {
    document.getElementById("title").value = '';
    document.getElementById("description").value = '';
    document.getElementById("due-date-input").value = '';
    document.getElementById("selectcategory").value = '';
}

function clearSubtaskList() {
    document.getElementById("subtask-list").innerHTML = '';
    subtasksArray = [];
    selectedContacts = [];
}


function validateInput() {
    const input = document.getElementById('title');
    const errorMessage = document.getElementById('error-message');

    if (input.value.trim() === "") {
        input.classList.add('error');
        input.style.border = '2px solid red';
        input.style.borderStyle = 'solid';
        errorMessage.style.display = 'block';
    } else {
        input.classList.remove('error');
        input.style.border = 'none';
        input.style.filter = 'drop-shadow(0px 0px 4px #D1D1D1)';
        errorMessage.style.display = 'none';
    }
}

function validateDateInput() {
    const dateInput = document.getElementById('due-date-input');
    const dateContainer = document.querySelector('.date-container');
    const dateErrorMessage = document.getElementById('date-error-message');
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;

    if (!dateInput.value.match(datePattern)) {
        dateInput.classList.add('error');
        dateInput.style.border = '2px solid red';
        dateErrorMessage.style.display = 'block';
    } else {
        dateInput.classList.remove('error');
        dateInput.style.border = 'none';
        dateInput.style.filter = 'drop-shadow(0px 0px 4px #D1D1D1)';
        dateErrorMessage.style.display = 'none';
    }
}

function validateSelectCategory() {
    const selectCategory = document.getElementById('selectcategory');
    const categoryErrorMessage = document.getElementById('category-error-message');

    if (selectCategory.value === "") {
        selectCategory.classList.add('error');
        selectCategory.style.border = '2px solid red';
        categoryErrorMessage.style.display = 'block';
    } else {
        selectCategory.classList.remove('error');
        selectCategory.style.border = 'none';
        categoryErrorMessage.style.display = 'none';
    }
}
document.getElementById('title').addEventListener('focus', function () {
    if (!this.classList.contains('error')) {
        this.style.border = '2px solid #29ABE2';
    }
});

document.getElementById('title').addEventListener('blur', validateInput);

document.getElementById('due-date-input').addEventListener('focus', function () {
    if (!this.classList.contains('error')) {
        this.style.border = '2px solid #29ABE2';
    }
});

document.getElementById('due-date-input').addEventListener('blur', validateDateInput);

document.getElementById('selectcategory').addEventListener('focus', function () {
    if (!this.classList.contains('error')) {
        this.style.border = '2px solid #29ABE2';
    }
});

document.getElementById('selectcategory').addEventListener('blur', validateSelectCategory);
