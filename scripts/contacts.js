let contacts = [];

/**
 * @typedef {Object} Contact
 * @property {number} id - Unique identifier for the contact.
 * @property {string} name - Name of the contact.
 * @property {string} email - Email address of the contact.
 * @property {string} phone - Phone number of the contact.
 */

/**
 * Fetches all contacts from the server and updates the global `contacts` array.
 * @returns {Promise<Contact[]>} A promise resolving to an array of contact objects.
 */
function fetchContacts() {
    return fetch(BASE_URL + 'contacts.json')
        .then(response => response.json())
        .then(data => {
            contacts = Object.values(data).filter(contact => contact && contact.name);
            return contacts;
        });
}

/**
 * Sorts the global `contacts` array alphabetically by contact name.
 */
function sortContacts() {
    contacts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Adds a contact card to the specified container using the provided template.
 * @param {HTMLElement} container - The container to append the contact card to.
 * @param {Contact} contact - The contact to display.
 * @param {string} initials - Initials of the contact.
 * @param {string} bgColor - Background color for the initials circle.
 * @param {HTMLTemplateElement} template - The template for the contact card.
 */
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

/**
 * Displays the list of contacts in the DOM, grouped alphabetically.
 * @param {Contact[]} contacts - The array of contact objects to display.
 */
function displayContacts(contacts) {
    const container = document.querySelector('.createdContacts');
    const template = document.getElementById('contactTemplate');
    let currentLetter = '';
    contacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            if (container)
                addLetterHeader(container, currentLetter);
        }
        addContactToContainer(container, contact, getInitials(contact.name), getRandomColor(), template);
    });
}

/**
 * Loads contact details into the details section and updates the UI state.
 * @param {HTMLElement} contactWrapper - The wrapper element for the selected contact.
 * @param {Contact} contact - The contact to display details for.
 * @param {string} initials - Initials of the contact.
 * @param {string} bgColor - Background color for the initials circle.
 */
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

/**
 * Updates the contact details section in the DOM with the provided contact information.
 * @param {Contact} contact - The contact to display.
 * @param {string} initials - Initials of the contact.
 * @param {string} bgColor - Background color for the initials circle.
 */
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

/**
 * Creates a new contact and updates the server and UI.
 */
function createContact() {
    const newContact = {
        name: document.getElementById('addName').value,
        email: document.getElementById('addEmail').value,
        phone: document.getElementById('addPhone').value,
    };
    const newId = getNewContactId();
    fetch(BASE_URL + `contacts/${newId}.json`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newContact, id: (newId + 1) })
    }).then(() => {
        newContact.id = newId + 1;
        contacts.push(newContact);
        updateContactDisplay();
        closeAddContactForm(true);
        if (window.innerWidth < 1250) showFooter();
    });
}

/**
 * Updates the UI to reflect the current state of the `contacts` array.
 */
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
            if(container)
                addLetterHeader(container, currentLetter);
        }
        const initials = getInitials(contact.name);
        const bgColor = getRandomColor();
        addContactToContainer(container, contact, initials, bgColor, template);
    });
}

/**
 * Generates a new contact ID based on the current length of the `contacts` array.
 * @returns {number} The new contact ID.
 */
function getNewContactId() {
    return contacts.length;
}

/**
 * Deletes a contact by ID and updates the server and UI.
 * @param {string} del - Context of deletion (e.g., "editForm").
 */
async function deleteContact(del) {
    let id = + document.getElementById('contactId').innerHTML;
    
    let updatedContacts = removeContactById(contacts, id);
    updatedContacts = updateID(updatedContacts);

    let responseContact = await fetch(BASE_URL + 'contacts.json', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedContacts)
    });
    contacts = updatedContacts;

    updateDelChanges(del);
}

/**
 * Removes a contact from an array by its ID.
 * @param {Contact[]} contactsJson - Array of contact objects.
 * @param {number} id - ID of the contact to remove.
 * @returns {Contact[]} Updated array of contacts.
 */
function removeContactById (contactsJson, id) {
    return contactsJson.filter(c => c.id !== id);
}

/**
 * Reassigns sequential IDs to the given contacts.
 * @param {Contact[]} updatedContacts - Array of contact objects to update.
 * @returns {Contact[]} Updated array of contacts with new IDs.
 */
function updateID (updatedContacts) {
    var newId = 1;
    for (var i in updatedContacts) {
        updatedContacts[i].id = newId;
        newId++;
    }
    return updatedContacts;
}

/**
 * Updates the UI after a contact is deleted.
 * @param {string} del - Context of deletion (e.g., "editForm").
 */
function updateDelChanges(del) {
    updateContactDisplay();
    closeContactDetails();
    if (window.innerWidth < 1250) hideDetails();
    if(del == "editForm") {
        closeEditContactForm();
    }
}

/**
 * Saves changes made to a contact and updates the server and UI.
 */
async function saveEditChanges() {
    const id = +document.getElementById('contactId').innerHTML;
    const updatedContact = {
        id,
        email: document.getElementById('editEmail').value, 
        name: document.getElementById('editName').value, 
        phone: document.getElementById('editPhone').value
    };
    contacts = contacts.map(contact => contact.id === id ? updatedContact : contact);
    await fetch(`${BASE_URL}contacts/${id - 1}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedContact)
    });
    updateContactDetails(updatedContact, getInitials(updatedContact.name), getRandomColor());
    closeEditContactForm(); updateContactDisplay();
    if (window.innerWidth < 1250) showFooter();
}

/**
 * Updates the edit contact form with the given contact details.
 * @param {Contact} contact - The contact to display.
 * @param {string} initials - Initials of the contact.
 * @param {string} bgColor - Background color for the initials circle.
 */
function updateEditContactForm(contact, initials, bgColor) {
    document.getElementById('editName').value = contact.name;
    document.getElementById('editEmail').value = contact.email || '';
    document.getElementById('editPhone').value = contact.phone || '';
    
    const editInitialsCircle = document.getElementById('editDetailsInitials');
    editInitialsCircle.textContent = initials;
    editInitialsCircle.style.backgroundColor = bgColor;
}

function closeEditContactForm() {
    const editContactForm = document.getElementById('editContactForm');
    editContactForm.style.opacity = '0';

    setTimeout(() => {
        editContactForm.classList.remove('visible');
        editContactForm.style.display = 'none'; 
    }, 700);
}

function openEditContactForm() {
    const editContactForm = document.getElementById('editContactForm');
    editContactForm.style.display = 'flex';
    setTimeout(() => {
        editContactForm.classList.add('visible');
        editContactForm.style.opacity = '1'; 
    }, 10);
}

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

function openAddContactForm() {
    const addContactForm = document.getElementById('addContactForm');
    addContactForm.style.display = 'flex';
    setTimeout(() => {
        addContactForm.classList.add('visible');
        addContactForm.style.opacity = '1'; 
    }, 10);
}

function hideFooter() {
    const footer = document.querySelector('.responsive-footer');
    if (footer) {
      footer.classList.add('hide-contacts');
    }
  }

function showFooter() {
    const footer = document.querySelector('.responsive-footer');
    if (footer) {
        footer.classList.remove('hide-contacts');
        footer.classList.add('show-details');
    }
}

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
            backArrow.classList.remove('show-details');
        }
    }
}

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

function hideDetails() {
    const detailsContainer = document.querySelector('.detailsContainer');
    const contactsContainer = document.querySelector('.contactsSection');
    const backArrow = document.querySelector('.backArrow');

    detailsContainer.classList.remove('show-details');
    contactsContainer.classList.remove('hide-contacts');

    backArrow.classList.add('show-details');
}

function addLetterHeader(container, letter) {
    container.innerHTML += `
        <div class="contactHeaderWrapper">
            <div class="contactHeader">${letter}</div>
        </div>
    `;
}

// function getInitials(name) {
//     const nameParts = name.split(' ');
//     return nameParts[0][0].toUpperCase() + (nameParts[1] ? nameParts[1][0].toUpperCase() : '');
// }

function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    const nameParts = name.trim().split(' ');
    return nameParts[0]?.[0]?.toUpperCase() + (nameParts[1]?.[0]?.toUpperCase() || '');
}


function getRandomColor() {
    const colors = ['#ff7a00', '#9327ff', '#6e52ff', '#fc71ff', '#ffbb2b', '#1fd7c1', '#462f8a', '#ff4646', '#00bee8'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function closeContactDetails(){
    const detailsSection = document.getElementById('selectedContactDetails');
    detailsSection.classList.remove('visible');
    detailsSection.classList.remove('active');
}

/**
 * Fetches and displays the contacts when the page is loaded.
 */
fetchContacts().then(() => {
    sortContacts();
    displayContacts(contacts);
});