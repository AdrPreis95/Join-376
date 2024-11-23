function displayContacts(contacts) {
    let dropdown = document.getElementById('dropdown-user');
    dropdown.innerHTML = '';
    contacts.forEach(contact => createContactElement(dropdown, contact));
}
function processContacts(contacts, userAsContact) {
    let formattedContacts = contacts.filter(contact => contact).map(formatContact);
    formattedContacts.unshift(userAsContact);
    return formattedContacts;
}


function createCheckbox(contact) {
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';


    checkbox.checked = selectedContacts.some(selected => selected.email === contact.email);


    checkbox.addEventListener('change', function () {
        if (this.checked) {

            updateSelectedContacts(true, contact);
        } else {

            updateSelectedContacts(false, contact);
        }

        updatePickedUserAvatars();
    });

    return checkbox;
}

function synchronizeCheckboxes() {
    let checkboxes = document.querySelectorAll('#dropdown-user input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        let userContainer = checkbox.closest('.user-container');
        let contact = allContacts.find(contact => {
            let userName = userContainer.querySelector('.user-name').innerText.trim();
            return `${contact.firstName} ${contact.lastName}` === userName;
        });
        if (contact) {
            checkbox.checked = selectedContacts.some(selected => selected.email === contact.email);
            if (checkbox.checked) {
                userContainer.classList.add('selected');
            } else {
                userContainer.classList.remove('selected');
            }
        }
    });
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


    checkbox.checked = selectedContacts.some(selected => selected.email === contact.email);


    checkbox.addEventListener('change', function () {
        let userContainer = checkbox.closest('.user-container');
        if (this.checked) {
            updateSelectedContacts(true, contact);
            if (userContainer) userContainer.classList.add('selected');
        } else {
            updateSelectedContacts(false, contact);
            if (userContainer) userContainer.classList.remove('selected');
        }
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
function updatePickedUserAvatars() {
    let pickedUserAvatarContainer = document.getElementById('picked-user-avatar');
    pickedUserAvatarContainer.innerHTML = '';
    const maxVisibleContacts = 5;
    selectedContacts.slice(0, maxVisibleContacts).forEach((contact, index) => {
        pickedUserAvatarContainer.appendChild(createPickedUserElement(contact, index));
    });
    if (selectedContacts.length > maxVisibleContacts) {
        let remainingContacts = selectedContacts.length - maxVisibleContacts;
        let moreContactsDiv = document.createElement('div');
        moreContactsDiv.classList.add('more-contacts-info');
        moreContactsDiv.textContent = `+${remainingContacts}`;
        pickedUserAvatarContainer.appendChild(moreContactsDiv);
    }
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


function validateDateInput() {
    const dateInput = document.getElementById('due-date-input');
    const dateErrorMessage = document.getElementById('date-error-message');
    const validationResult = validateDateFormatAndFuture(dateInput.value);
    if (!validationResult.isValid) {
        dateInput.classList.add('error');
        dateInput.style.border = '2px solid red';
        dateErrorMessage.textContent = validationResult.message;
        dateErrorMessage.style.display = 'block';
    } else {
        dateInput.value = validationResult.correctedDate || dateInput.value;
        dateInput.classList.remove('error');
        dateInput.style.border = 'none';
        dateInput.style.filter = 'drop-shadow(0px 0px 4px #D1D1D1)';
        dateErrorMessage.style.display = 'none';
    }
}

function validateDateFormatAndFuture(dateValue) {
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateValue.match(datePattern)) {
        return {
            isValid: false,
            message: 'Please select a Date'
        };
    }
    const [day, month, year] = dateValue.split('/');
    const enteredDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (enteredDate < today) {
        return {
            isValid: true,
            correctedDate: getFormattedTodayDate()
        };
    }

    return { isValid: true };
}
function getFormattedTodayDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}

function initializeDateInput() {
    const dateInput = document.getElementById('due-date-input');
    dateInput.addEventListener('input', function (event) {
        const inputField = event.target;
        inputField.value = inputField.value.replace(/[^0-9/]/g, '');
    });
}
document.addEventListener('DOMContentLoaded', initializeDateInput);

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





