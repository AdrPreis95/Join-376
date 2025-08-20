/**saves all contacts from the server and updates the global `contacts` array.*/
let contacts = [];

/**Fetches all contacts from the server and updates the global `contacts` array. */
function fetchContacts() {
    return fetch(BASE_URL + 'contacts.json')
        .then(response => response.json())
        .then(data => {
            contacts = Object.values(data).filter(contact => contact && contact.name);
            return contacts;});
}

/**Sorts the global `contacts` array alphabetically by contact name. */
function sortContacts() {
    contacts.sort((a, b) => a.name.localeCompare(b.name));
}

/**Adds a contact card to the specified container using the provided template. */
function addContactToContainer(container, contact, initials, bgColor, template) {
    if (!template || !template.content) return;
    const clone = template.content.cloneNode(true);
    const contactWrapper = clone.querySelector('.contactWrapper');
    clone.querySelector('.initialsCircle').textContent = initials;
    clone.querySelector('.initialsCircle').style.backgroundColor = bgColor;
    clone.querySelector('.contactName').textContent = contact.name;
    clone.querySelector('.contactEmail').innerHTML = contact.email
        ? `<a style="color: #007cee;" href="#">${contact.email}</a>`
        : 'No email available';
    contactWrapper.setAttribute('onclick', `loadContactDetails(this, ${JSON.stringify(contact)}, '${initials}', '${bgColor}'); toggleDetails();`);
    container.appendChild(clone);
}

/**Displays the list of contacts in the DOM, grouped alphabetically. */
function displayContacts(contacts) {
    const container = document.querySelector('.createdContacts');
    const template = document.getElementById('contactTemplate');
    let currentLetter = '';
    contacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            if (container)
                addLetterHeader(container, currentLetter);}
        addContactToContainer(container, contact, getInitials(contact.name), getRandomColor(), template);});
}

/**Loads contact details into the details section and updates the UI state. */
function loadContactDetails(contactWrapper, contact, initials, bgColor) {
    const detailsSection = document.getElementById('selectedContactDetails');
    detailsSection.classList.add('visible');
    setTimeout(() => {
        detailsSection.classList.add('active');
    }, 10);
    updateContactDetails(contact, initials, bgColor);
    document.querySelectorAll('.contactWrapper').forEach(wrapper => wrapper.classList.remove('activeSideContacts'));
    contactWrapper.classList.add('activeSideContacts');
    updateEditContactForm(contact, initials, bgColor);
}

/**Updates the contact details section in the DOM with the provided contact information. */
function updateContactDetails(contact, initials, bgColor) {
    const detailsInitials = document.getElementById('detailsInitials');
    detailsInitials.textContent = initials;
    detailsInitials.style.backgroundColor = bgColor;
    document.getElementById('contactId').innerHTML = contact.id;
    document.getElementById('detailsName').textContent = contact.name;
    document.getElementById('detailsEmail').innerHTML = contact.email
        ? `<a style="color: #007cee;" href="mailto:${contact.email}">${contact.email}</a>`
        : 'No email available';
    document.getElementById('detailsPhone').textContent = contact.phone ? contact.phone : 'No phone available';
}

/**Creates a new contact and updates the server and UI.
 * checks the form validation for Name,Phone and Email */
function createContact() {
    const name = getInputValue('addName');
    const email = getInputValue('addEmail');
    const phone = getInputValue('addPhone');
    resetAddErrorStyles();

    if (!isValidName(name)) return markAddInvalid('addName', 'Please enter a valid name<br>Min. 2 letters');
    if (!isValidEmail(email)) return markAddInvalid('addEmail', 'Please enter a valid email address<br>Example: name@example.com');
    if (!isValidPhone(phone)) return markAddInvalid('addPhone', 'Please enter a valid phone number<br>Starts with +, 00 or 0 (min. 10 digits)');

    const newContact = { name, email, phone };
    const newId = getNewContactId();
    saveContactToFirebase(newContact, newId);
}

/**checks for valid name Input */
function isValidName(name) {
    return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ '\-]{1,}$/.test(name);
}

/**checks for valid Mail Input */
function isValidEmail(email) {
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/.test(email);
}

/**checks for valid Phone Number Input */
function isValidPhone(phone) {
    return /^(?:0|\+|00)[0-9]{9,19}$/.test(phone);
}

/**Shows Invalid Message for Inputs*/
function markAddInvalid(id, msg) {
    const input = document.getElementById(id);
    input.classList.add('input-error');
    const box = document.getElementById(`error-${id}`);
    if (box) {
        box.innerHTML = msg;
        box.style.display = 'block';}
    input.focus();
}

/**Resets the Error Borders of Inputs */
function resetAddErrorStyles() {
    ['addName', 'addEmail', 'addPhone'].forEach(id => {
        const input = document.getElementById(id);
        input.classList.remove('input-error');
        const box = document.getElementById(`error-${id}`);
        if (box) box.style.display = 'none';});
}

/**checks InputValue*/
function getInputValue(id) {
    return document.getElementById(id).value.trim();
}

/**Saves added Contacts in Firebase*/
function saveContactToFirebase(contact, id) {
    fetch(`${BASE_URL}contacts/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contact, id: id + 1 })
    }).then(() => {
        contact.id = id + 1;
        contacts.push(contact);
        updateContactDisplay();
        closeAddContactForm(true);
        if (window.innerWidth < 1250) showFooter();});
}

/**Updates the UI to reflect the current state of the `contacts` array. */
function updateContactDisplay() {
    sortContacts();
    const container = document.querySelector('.createdContacts');
    container.innerHTML = getTemplateContacts();
    const template = document.getElementById('contactTemplate');
    let currentLetter = '';
    contacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            if (container)
                addLetterHeader(container, currentLetter);}
        const initials = getInitials(contact.name);
        const bgColor = getRandomColor();
        addContactToContainer(container, contact, initials, bgColor, template);});
}

/**Generates a new contact ID based on the current length of the `contacts` array. */
function getNewContactId() {
    return contacts.length;
}

/**Deletes a contact by ID and updates the server and UI. */
async function deleteContact(del) {
    let id = + document.getElementById('contactId').innerHTML;
    let updatedContacts = removeContactById(contacts, id);
    updatedContacts = updateID(updatedContacts);
    let responseContact = await fetch(BASE_URL + 'contacts.json', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",},
        body: JSON.stringify(updatedContacts)});
        contacts = updatedContacts;
    updateDelChanges(del);
}

/**Removes a contact from an array by its ID. */
function removeContactById(contactsJson, id) {
    return contactsJson.filter(c => c.id !== id);
}

/**Reassigns sequential IDs to the given contacts. */
function updateID(updatedContacts) {
    var newId = 1;
    for (var i in updatedContacts) {
        updatedContacts[i].id = newId;
        newId++;}
    return updatedContacts;
}

/**Updates the UI after a contact is deleted. */
function updateDelChanges(del) {
    updateContactDisplay();
    closeContactDetails();
    if (window.innerWidth < 1250) hideDetails();
    if (del == "editForm") {
        closeEditContactForm();}
}

/**Saves changes made to a contact and updates the server and UI. */
async function saveEditChanges() {
    const id = +contactId.innerText, name = editName.value.trim();
    const email = editEmail.value.trim(), phone = editPhone.value.trim();
    resetErrorStyles();
    const nameOk = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ '\-]{1,}$/;
    const mailOk = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/;
    const phoneOk = /^(?:\+|00|0)[0-9]{9,19}$/;

    if (!nameOk.test(name)) return markInvalid(editName, " Please enter a valid name<br>Min. 2 letters, no numbers");
    if (!mailOk.test(email)) return markInvalid(editEmail, " Please enter a valid email address<br>Example: name@example.com");
    if (!phoneOk.test(phone)) return markInvalid(editPhone, " Please enter a valid phone number<br>Starts with +, 00 or 0 (min. 10 digits)");

    const updated = { id, name, email, phone };
    contacts = contacts.map(c => c.id === id ? updated : c);
    await fetch(`${BASE_URL}contacts/${id - 1}.json`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    }); updateContactDetails(updated, getInitials(name), getRandomColor());
    closeEditContactForm(); updateContactDisplay(); if (innerWidth < 1250) showFooter();
}

/**displays invalid  border (Inputs)*/
function markInvalid(input, msg) {
    input.classList.add('input-error');
    const errorBox = document.getElementById(`error-${input.id}`);
    if (errorBox) {
        errorBox.innerHTML = msg;
        errorBox.style.display = 'block';}
    input.focus();
}

/**Resets the Error Styles */
function resetErrorStyles() {
    [editName, editEmail, editPhone].forEach(i => {
        i.classList.remove('input-error');
        const msg = document.getElementById(`error-${i.id}`);
        if (msg) msg.style.display = 'none';});
}


/**Updates the edit contact form with the given contact details. */
function updateEditContactForm(contact, initials, bgColor) {
    document.getElementById('editName').value = contact.name;
    document.getElementById('editEmail').value = contact.email || '';
    document.getElementById('editPhone').value = contact.phone || '';
    const editInitialsCircle = document.getElementById('editDetailsInitials');
    editInitialsCircle.textContent = initials;
    editInitialsCircle.style.backgroundColor = bgColor;
}

/**cloes the Contacrform Edit Overlay*/
function closeEditContactForm() {
    const editContactForm = document.getElementById('editContactForm');
    editContactForm.style.opacity = '0';
    setTimeout(() => {
        editContactForm.classList.remove('visible');
        editContactForm.style.display = 'none';
    }, 700);
}

/**Open the Contacrform Edit Overlay*/
function openEditContactForm() {
    const editContactForm = document.getElementById('editContactForm');
    editContactForm.style.display = 'flex';
    setTimeout(() => {
        editContactForm.classList.add('visible');
        editContactForm.style.opacity = '1';
    }, 10);
    initEditInputValidation();
}

/**closes the Add-Contactform Overlay*/
function closeAddContactForm(contactCreated = false) {
    const form = document.getElementById('addContactForm');
    const overlay = document.getElementById('successfullycreatedContactOverlay');
    if (contactCreated) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        setTimeout(() => overlay.style.display = 'none', 1000);
    }
    form.style.opacity = '0';
    setTimeout(() => {
        form.classList.remove('visible');
        form.style.display = 'none';
        ['addName', 'addPhone', 'addEmail'].forEach(id => document.getElementById(id).value = '');
    }, 1000);
}

/**Open the Add-Contactform Overlay*/
function openAddContactForm() {
    const addContactForm = document.getElementById('addContactForm');
    addContactForm.style.display = 'flex';
    setTimeout(() => {
        addContactForm.classList.add('visible');
        addContactForm.style.opacity = '1';
    }, 10);
}

/**Hides the Footer for Responsiveness*/
function hideFooter() {
    const footer = document.querySelector('.responsive-footer');
    if (footer) {
        footer.classList.add('hide-contacts');}
}

/**Shows the Footer for Responsiveness*/
function showFooter() {
    const footer = document.querySelector('.responsive-footer');
    if (footer) {
        footer.classList.remove('hide-contacts');
        footer.classList.add('show-details');}
}

/**Styles for Contacts Responsiveness*/
function toggleDetails() {
    if (window.innerWidth < 1250) {
        const detailsContainer = document.querySelector('.detailsContainer');
        const contactsContainer = document.querySelector('.contactsSection');
        const backArrow = document.querySelector('.backArrow');
        detailsContainer.classList.toggle('show-details');
        contactsContainer.classList.toggle('hide-contacts');

        if (detailsContainer.classList.contains('show-details')) {
            backArrow.classList.add('show-details');
        } else {
            backArrow.classList.remove('show-details');}}
}

/**Toggles Contact Details*/
function toggleContactDetails() {
    const detailsButtons = document.querySelector('.responsiveContactDetailsButtons');

    if (detailsButtons.classList.contains('hide-contacts')) {
        detailsButtons.classList.remove('hide-contacts');
        detailsButtons.classList.add('show-details');
    } else if (detailsButtons.classList.contains('show-details')) {
        detailsButtons.classList.remove('show-details');
        detailsButtons.classList.add('hide-contacts');
    }
}

/**Hides Contact Details after Edit*/
function hideDetails() {
    const detailsContainer = document.querySelector('.detailsContainer');
    const contactsContainer = document.querySelector('.contactsSection');
    const backArrow = document.querySelector('.backArrow');
    detailsContainer.classList.remove('show-details');
    contactsContainer.classList.remove('hide-contacts');
    backArrow.classList.add('show-details');
}

/**Function for the Letter in the User/Contact Avatar-Container*/
function addLetterHeader(container, letter) {
    container.innerHTML += `
        <div class="contactHeaderWrapper">
            <div class="contactHeader">${letter}</div>
        </div>`;
}
window.getInitials = function(name) {
    if (!name || typeof name !== 'string') return '';
    const nameParts = name.trim().split(' ');
    return nameParts[0]?.[0]?.toUpperCase() + (nameParts[1]?.[0]?.toUpperCase() || '');
};

/**Adds a Random Color for thew Contact Avatar Background*/
function getRandomColor() {
    const colors = ['#ff7a00', '#9327ff', '#6e52ff', '#fc71ff', '#ffbb2b', '#1fd7c1', '#462f8a', '#ff4646', '#00bee8'];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**Closes the Contact Deatils*/
function closeContactDetails() {
    const detailsSection = document.getElementById('selectedContactDetails');
    detailsSection.classList.remove('visible');
    detailsSection.classList.remove('active');
}

/**Fetches and displays the contacts when the page is loaded. */
fetchContacts().then(() => {
    sortContacts();
    displayContacts(contacts);
});

/**checks the validation of the inputs. */
function initEditInputValidation() {
    ['editName', 'editEmail', 'editPhone'].forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener('input', () => {
            input.classList.remove('input-error');
            const msg = document.getElementById(`error-${input.id}`);
            if (msg) msg.style.display = 'none';});
    });
}
