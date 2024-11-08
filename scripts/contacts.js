let contacts = [];

function fetchContacts() {
    return fetch(BASE_URL + 'contacts.json')
        .then(response => response.json())
        .then(data => {
            contacts = Object.values(data).filter(contact => contact && contact.name);
            return contacts;
        });
}

function sortContacts() {
    contacts.sort((a, b) => a.name.localeCompare(b.name));
}

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

function getNewContactId() {
    return contacts.length;
}

async function deleteContact(del) {
    let id = + document.getElementById('contactId').innerHTML;

    const removeContactById = (contactsJson, id) =>
    contactsJson.filter(c => c.id !== id);

    let updatedContacts = removeContactById(contacts, id);
    var newId = 1;
    for (var i in updatedContacts) {
        updatedContacts[i].id = newId;
        newId++;
    }

    let responseContact = await fetch(BASE_URL + 'contacts.json', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedContacts)
    });

    contacts = updatedContacts;

    updateContactDisplay();
    closeContactDetails();
    if (window.innerWidth < 1250) hideDetails();
    if(del == "editForm") {
        closeEditContactForm();
    }
}

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

function getInitials(name) {
    const nameParts = name.split(' ');
    return nameParts[0][0].toUpperCase() + (nameParts[1] ? nameParts[1][0].toUpperCase() : '');
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

fetchContacts().then(() => {
    sortContacts();
    displayContacts(contacts);
});