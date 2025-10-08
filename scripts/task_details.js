/**This Function Checks the Color Value of any User*/
function ensureColor(contact){
  if(!contact) return;
  contact.color = contact.color || getRandomColor(contact);
  return contact.color;
}

/**Displays the list of contacts in the dropdown menu.*/
function displayContacts(contacts) {
  const dropdown = document.getElementById('dropdown-user');
  dropdown.innerHTML = '';
  contacts.forEach(c => { ensureColor(c); createContactElement(dropdown, c); });
}


/**Processes the contacts by formatting them and adding the current user as a contact. */
function processContacts(contacts, userAsContact) {
    let formattedContacts = contacts.filter(contact => contact).map(formatContact);
    formattedContacts.unshift(userAsContact);
    return formattedContacts;
}

/**Creates a checkbox for a contact and synchronizes its state with the selected contacts. */
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
        updatePickedUserAvatars();});
     return checkbox;
}

/**Synchronizes the checkboxes in the dropdown with the selected contacts.*/
function synchronizeCheckboxes() {
    let checkboxes = document.querySelectorAll('#dropdown-user input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        let userContainer = checkbox.closest('.user-container');
        let contact = allContacts.find(contact => {
            let userName = userContainer.querySelector('.user-name').innerText.trim();
            return `${contact.firstName} ${contact.lastName}` === userName; });
            
        if (contact) {
            checkbox.checked = selectedContacts.some(selected => selected.email === contact.email);
            if (checkbox.checked) {
                userContainer.classList.add('selected');
            } else {
                userContainer.classList.remove('selected'); }}
    });
}

/**Creates an HTML element for a contact in the dropdown. */
function createContactElement(dropdown, contact) {
    if (!contact) return;
let userContainer = document.createElement('div');
    userContainer.classList.add('user-container');
const isSelected = selectedContacts.some(c => c.email === contact.email);
    if (isSelected) {
        userContainer.classList.add('selected'); }
let avatarContainer = createAvatarContainer(contact);
    let checkbox = createCheckbox(contact);
 userContainer.appendChild(avatarContainer);
    userContainer.appendChild(checkbox);

    userContainer.addEventListener('click', function (event) {
        if (event.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        }
    });

    dropdown.appendChild(userContainer);
}

/**Creates an avatar container for a contact.*/
function createAvatarContainer(contact) {
  let avatarSpanContainer = document.createElement('div');
  avatarSpanContainer.classList.add('avatar-span-container');

  let avatar = document.createElement('div');
  avatar.classList.add('avatar');

  const color = contact?.color || getRandomColor(contact);
  avatar.style.backgroundColor = color;

  avatar.innerText = getInitials(contact).toUpperCase();

  let userName = document.createElement('span');
  userName.classList.add('user-name');
  userName.innerText = getFullName(contact);

  avatarSpanContainer.appendChild(avatar);
  avatarSpanContainer.appendChild(userName);
  return avatarSpanContainer;
}

/**Updates the selected contacts array. */
function updateSelectedContacts(isChecked, contact) {
  ensureColor(contact);
  if (isChecked) {
    if (!selectedContacts.some(c => c.email === contact.email)) {
      selectedContacts.push(contact); // gleiche Instanz behalten
    }
  } else {
    selectedContacts = selectedContacts.filter(c => c.email !== contact.email);
  }
}

/**Updates the display of picked user avatars. */
function updatePickedUserAvatars() {
  const wrap = document.getElementById('picked-user-avatar');
  wrap.innerHTML = '';
  const max = 5;

  selectedContacts.slice(0, max).forEach((contact, i) => {
    contact.color = contact.color || getRandomColor(contact); // 🔒 Farbe fixen
    wrap.appendChild(createPickedUserElement(contact));
  });

  if (selectedContacts.length > max) {
    const more = document.createElement('div');
    more.classList.add('more-contacts-info');
    more.textContent = `+${selectedContacts.length - max}`;
    wrap.appendChild(more);
  }
}

/**Creates a user element for the picked user avatar display. */
function createPickedUserElement(contact, index) {
    let userInfoContainer = document.createElement('div');
    userInfoContainer.classList.add('picked-user-info');
    userInfoContainer.appendChild(createDeleteButton(index));
    userInfoContainer.appendChild(createAvatarDiv(contact));
    userInfoContainer.appendChild(createNameSpan(contact));

    return userInfoContainer;
}

/**Creates a delete button for a picked user avatar.*/
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

/**Creates an avatar div for a picked user avatar. */
function createAvatarDiv(contact) {
  const avatarDiv = document.createElement('div');
  avatarDiv.classList.add('avatar');
  avatarDiv.style.backgroundColor = ensureColor(contact);
  avatarDiv.innerText = getInitials(contact).toUpperCase();
  return avatarDiv;
}

/**Creates a name span for a picked user avatar.*/
function createNameSpan(contact) {
    let nameSpan = document.createElement('span');
    nameSpan.classList.add('picked-user-name');
    nameSpan.innerText = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    return nameSpan;
}

/**Filters the contacts displayed in the dropdown based on the search input. */
function filterContacts() {
    let input = document.getElementById('dropdown-input').value.toLowerCase().trim();
    console.log("Eingegebener Text:", input);
    if (input.length === 0) {
        displayContacts(allContacts);
        return;
    }
    let initial = input[0];
    console.log("Erster Buchstabe der Eingabe:", initial);
    let filteredContacts = allContacts.filter(contact => {
        let contactName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
        return contactName.toLowerCase().startsWith(initial);
    });
    console.log("Gefilterte Kontakte:", filteredContacts);
    if (filteredContacts.length === 0) {
        displayNoResults();
    } else {
        displayContacts(filteredContacts);
    }
}

/**Displays the No Results Overlay */
function displayNoResults() {
    let dropdown = document.getElementById('dropdown-user');
    dropdown.innerHTML = '';

    let noResultsMessage = document.createElement('div');
    noResultsMessage.classList.add('no-results');
    noResultsMessage.textContent = '"No results found"';
    dropdown.appendChild(noResultsMessage);
}


/**Checks the Current Date */
function fillCurrentDate() {
    let dateInput = document.getElementById('due-date-input');
    dateInput.focus();
    dateInput.click();}

    document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#due-date-input", { dateFormat: "d/m/Y" });});

    document.getElementById('dateimg').addEventListener('click', function () {
    document.getElementById('due-date-input')._flatpickr.open();});

    document.addEventListener('DOMContentLoaded', function () {
    window.flatpickrInstance = flatpickr("#due-date-input", {
        dateFormat: "d/m/Y",
        allowInput: false,
        minDate: "today",});
});

/**Displays The Flatpickr Date Overlay */
function openFlatpickr() {
    if (window.flatpickrInstance) {
        window.flatpickrInstance.open();
    }
}

/**Flatpickr Forms */
flatpickr("#due-date-input", {
    dateFormat: "d/m/Y",
    minDate: "today",
    altInput: true,
    altFormat: "F j, Y",
    disableMobile: "true",
});

/**Gets the Formatted Date from the Day(right now)*/
function getFormattedTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**Validates the date input and ensures it is in the correct format and not in the past.*/
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
        dateInput.style.border = '';
        dateInput.style.filter = '';
        dateErrorMessage.style.display = 'none';}
}
document.getElementById('due-date-input').addEventListener('input', validateDateInput);

/**Validates the date format and ensures it is not in the past.*/
function validateDateFormatAndFuture(dateValue) {
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateValue.match(datePattern)) {
        return {
            isValid: false,
            message: 'Please select a Date'};
    }
    const [day, month, year] = dateValue.split('/');
    const enteredDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (enteredDate < today) {
        return {
            isValid: true,
            correctedDate: getFormattedTodayDate()};
    }
     return { isValid: true };
}

/**Initializes the date input to ensure proper formatting.*/
function initializeDateInput() {
    const dateInput = document.getElementById('due-date-input');
    dateInput.addEventListener('input', function (event) {
        const inputField = event.target;
        inputField.value = inputField.value.replace(/[^0-9/]/g, '');
    });
}
document.addEventListener('DOMContentLoaded', initializeDateInput);

/**Handles changes in the date input field to ensure proper formatting and validation.*/
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

/**Formats the date input to add slashes automatically.*/
function formatDateInput(value) {
    value = value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    return value;
}

/**Validates if the date is in the correct format and range.*/
function validateDate(value) {
    let inputDateParts = value.split('/');
    return inputDateParts.length === 3 && isValidDayAndMonth(inputDateParts);
}

/**Checks if the day and month are valid.*/
function isValidDayAndMonth(inputDateParts) {
    let day = parseInt(inputDateParts[0], 10);
    let month = parseInt(inputDateParts[1], 10);
    return day >= 1 && day <= 31 && month >= 1 && month <= 12;
}

/**Prevents past dates from being entered in the date input field.*/
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

/**Parses the entered date string into a Date object.*/
function getEnteredDate(value) {
    let inputDateParts = value.split('/');
    return new Date(`${inputDateParts[2]}-${inputDateParts[1]}-${inputDateParts[0]}`);
}

/**Redirect to ther Board after adding a new Task */
function handleTaskCreation() {
    createTask(() => {
        if (document.body.id === "overlay-mode") {
            console.log("Overlay mode detected. Closing overlay.");
            closeOverlay(); 
        } else {
            window.location.href = "board.html"; 
        }
    });
}

/**Overlay for the Users to add assigned to  */
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('dropdown-user');
    const input = document.getElementById('dropdown-input');

    if (!dropdown || dropdown.style.display !== 'flex') return;
    if (dropdown.contains(event.target) || input.contains(event.target)) return;
    dropdown.style.display = 'none';
});

