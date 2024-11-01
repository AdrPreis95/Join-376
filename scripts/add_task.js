
let priority = '';
let subtasksArray = [];
let allContacts = [];
let selectedContacts = [];

async function getAllTaskIDs() {
    try {
        let response = await fetch(`${BASE_URL}/tasks.json`);
        let tasksData = await response.json();

        if (tasksData) {
            let ids = Object.keys(tasksData).map(key => parseInt(tasksData[key].id)).filter(Number.isInteger);
            return ids;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Task-IDs:", error);
        return [];
    }
}

async function generateNewID() {
    let existingIDs = await getAllTaskIDs();
    let newID = Math.max(...existingIDs, 0) + 1;
    return newID;
}

function setPriority(prio) {
    priority = prio;
}

async function createTask() {
    subtasksArray = subtasksArray.map(subtask => ({
        ...subtask,
        status: subtask.status || 'not done'
    }));

    let assignedContacts = selectedContacts.map(contact => ({
        firstname: contact.firstName || '',
        lastname: contact.lastName || ''
    }));


    let titleInput = document.getElementById('title');
    let descriptionInput = document.getElementById('description');
    let dateInput = document.getElementById('due-date-input') || document.getElementById('date-div');
    let categoryInput = document.getElementById('selectcategory');

    if (!titleInput || !descriptionInput || !dateInput || !categoryInput) {
        console.error('Ein oder mehrere erforderliche Eingabefelder fehlen.');
        return;
    }

    let title = titleInput.value;
    let description = descriptionInput.value;
    let dueDate = dateInput.value || dateInput.textContent; 
    let category = categoryInput.value;

    if (!title || !description || !dueDate) {
        alert('Bitte füllen Sie alle erforderlichen Felder aus.');
        return;
    }

    let newID = await generateNewID();
    let newTask = {
        id: newID,
        title: title,
        description: description,
        dueDate: dueDate,
        prio: priority,
        category: category,
        list: "to-do",
        subtasks: subtasksArray,
        assignedTo: selectedContacts
    };

    await fetch(`${BASE_URL}/tasks/${newID - 1}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
    });

    alert('Task erfolgreich erstellt!');

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

    if (value.length === 10 && validateDate(value)) {
        preventPastDate(value);
    } else if (value.length === 10 && !validateDate(value)) {
        event.target.value = '';
        alert("Bitte geben Sie ein gültiges Datum ein.");
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
    if (inputDateParts.length !== 3) return false;

    let day = parseInt(inputDateParts[0], 10);
    let month = parseInt(inputDateParts[1], 10);
    return day >= 1 && day <= 31 && month >= 1 && month <= 12;
}

function preventPastDate(value) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let inputDateParts = value.split('/');
    if (inputDateParts[2].length === 4) {
        let enteredDate = new Date(`${inputDateParts[2]}-${inputDateParts[1]}-${inputDateParts[0]}`);
        enteredDate.setHours(0, 0, 0, 0);

        if (enteredDate < today) {
            fillCurrentDate();
            dateInput.classList.add('error-border');
        } else {
            dateInput.classList.remove('error-border');
        }
    }
}
document.getElementById('due-date-input').addEventListener('input', handleDateInput);

function resetPriorityButtons() {
    let redButton = document.getElementById('prio-red');
    redButton.style.backgroundColor = '';
    redButton.style.color = '';
    let redImg = redButton.querySelector('img');
    redImg.style.filter = '';

    let orangeButton = document.getElementById('prio-orange');
    orangeButton.style.backgroundColor = '';
    orangeButton.style.color = '';
    let orangeImg = orangeButton.querySelector('img');
    orangeImg.style.filter = '';

    let greenButton = document.getElementById('prio-green');
    greenButton.style.backgroundColor = '';
    greenButton.style.color = '';
    let greenImg = greenButton.querySelector('img');
    greenImg.style.filter = '';
}

function changeColor(element, color) {
    resetPriorityButtons();
    element.style.backgroundColor = color;
    element.style.color = '#FFFFFF';
    let img = element.querySelector('img');
    img.style.filter = 'brightness(0) invert(1)';

    if (element.id === 'prio-red') {
        setPriority('Urgent');
    } else if (element.id === 'prio-orange') {
        setPriority('Medium');
    } else if (element.id === 'prio-green') {
        setPriority('Low');
    }
}

function addSubtask() {
    let showIcons = document.getElementById('show-icons');
    let addSubtaskButton = document.getElementById('add-subtask');

    if (showIcons) {
        showIcons.style.display = "flex";
    }

    if (addSubtaskButton) {
        addSubtaskButton.style.display = "none";
    }
}

function clearSubtaskInput() {
    let subtaskInput = document.getElementById('addsubtasks');

    if (subtaskInput) {
        subtaskInput.value = '';
    }
}

function confirmSubtask() {
    let subtaskList = document.getElementById('subtask-list');
    let subtaskCount = subtaskList.getElementsByTagName('li').length;

    if (subtaskCount >= 2) {
        alert("You can only add2 subtasks.");
        return;
    }

    let subtaskValue = document.getElementById('addsubtasks').value;

    if (subtaskValue === '') {
        alert("Please enter a subtask.");
        return;
    }

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
        </div>
    `;

    subtaskList.appendChild(li);

    subtasksArray.push({ title: subtaskValue });

    document.getElementById('addsubtasks').value = '';
    document.getElementById('show-icons').style.display = "none";
    document.getElementById('add-subtask').style.display = "inline-block";
}

function editSubtask(editBtn) {
    let subtaskText = editBtn.parentElement.previousElementSibling;
    let newSubtask = prompt("Edit subtask:", subtaskText.textContent);
    if (newSubtask !== null && newSubtask !== '') {
        subtaskText.textContent = newSubtask;
    }
}

function deleteSubtask(deleteBtn) {
    let subtaskToDelete = deleteBtn.parentElement.parentElement;
    subtaskToDelete.remove();
}

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

async function loadContacts() {
    let userAsContact = {
        email: loggedUser.email,
        id: 0,
        name: loggedUser.name + " (You)",
        phone: '000000'
    }

    try {
        let response = await fetch(`${BASE_URL}/contacts.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let contacts = await response.json();
        allContacts = contacts;

        allContacts.unshift(userAsContact);

        displayContacts(allContacts);
    } catch (error) {
        console.error('Fehler beim Laden der Kontakte:', error);
    }
}

function displayContacts(contacts) {
    let dropdown = document.getElementById('dropdown-user');
    dropdown.innerHTML = '';

    contacts.forEach(contact => {
        if (!contact) return;
        let fullName = contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : contact.name;

        let userContainer = document.createElement('div');
        userContainer.classList.add('user-container');

        let avatarSpanContainer = document.createElement('div');
        avatarSpanContainer.classList.add('avatar-span-container');

        let avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.style.backgroundColor = getRandomColor();
        avatar.innerText = fullName[0];

        let userName = document.createElement('span');
        userName.classList.add('user-name');
        userName.innerText = fullName;

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                selectedContacts.push(contact);
            } else {
                selectedContacts = selectedContacts.filter(c => c !== contact);
            }
            updatePickedUserAvatars(); 
        });

        avatarSpanContainer.appendChild(avatar);
        avatarSpanContainer.appendChild(userName);
        userContainer.appendChild(avatarSpanContainer);
        userContainer.appendChild(checkbox);
        dropdown.appendChild(userContainer);
    });
}

function updatePickedUserAvatars() {
    let pickedUserAvatarContainer = document.getElementById('picked-user-avatar');
    pickedUserAvatarContainer.innerHTML = ''; 

    selectedContacts.forEach(contact => {
        let avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.style.backgroundColor = getRandomColor();

        
        let initials = '';
        if (contact.firstName) initials += contact.firstName[0];
        if (contact.lastName) initials += contact.lastName[0];
        if (!initials && contact.name) initials = contact.name[0]; 
        avatarDiv.innerText = initials.toUpperCase();

        
        let nameSpan = document.createElement('span');
        nameSpan.classList.add('picked-user-name');
        nameSpan.innerText = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();

        
        let userInfoContainer = document.createElement('div');
        userInfoContainer.classList.add('picked-user-info');
        userInfoContainer.appendChild(avatarDiv);
        userInfoContainer.appendChild(nameSpan);

        pickedUserAvatarContainer.appendChild(userInfoContainer);
    });
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
    if (dropdown.style.display === "flex") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "flex";
        loadContacts();
    }
}

function clearTask() {
    document.getElementById("title").value = '';
    document.getElementById("description").value = '';
    document.getElementById("due-date-input").value = '';
    document.getElementById("selectcategory").value = '';
    document.getElementById("subtask-list").innerHTML = '';
    subtasksArray = [];
    selectedContacts = [];
    displayContacts(allContacts);
    resetPriorityButtons();
}

