function fetchContacts() {
    return fetch('https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/contacts.json')
        .then(response => response.json())
        .then(data => Object.values(data).slice(0, 10).sort((a, b) => a.name.localeCompare(b.name)));
}

function getInitials(name) {
    const nameParts = name.split(' ');
    return nameParts[0][0].toUpperCase() + (nameParts[1] ? nameParts[1][0].toUpperCase() : '');
}

function getRandomColor() {
    const colors = ['#ff7a00', '#9327ff', '#6e52ff', '#fc71ff', '#ffbb2b', '#1fd7c1', '#462f8a', '#ff4646', '#00bee8'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function addLetterHeader(container, letter) {
    container.innerHTML += `<div class="contact-header">${letter}</div>`;
}

function addContactToContainer(container, contact, initials, bgColor, template) {
    if (!template || !template.content) return;
    const clone = template.content.cloneNode(true);
    const contactWrapper = clone.querySelector('.contactWrapper');
    clone.querySelector('.initialsCircle').textContent = initials;
    clone.querySelector('.initialsCircle').style.backgroundColor = bgColor;
    clone.querySelector('.contactName').textContent = contact.name;
    clone.querySelector('.contactEmail').innerHTML = contact.email 
        ? `<a style="color: #007cee;" href="mailto:${contact.email}">${contact.email}</a>` 
        : 'No email available';
    contactWrapper.setAttribute('onclick', `loadContactDetails(this, ${JSON.stringify(contact)}, '${initials}', '${bgColor}')`);
    container.appendChild(clone);
}

function loadContactDetails(contactWrapper, contact, initials, bgColor) {
    const detailsSection = document.getElementById('selectedContactDetails');
    detailsSection.classList.add('visible');
    setTimeout(() => {
        detailsSection.classList.add('active');
    }, 10);
    const detailsInitials = document.getElementById('detailsInitials');
    detailsInitials.textContent = initials;
    detailsInitials.style.backgroundColor = bgColor;
    document.getElementById('detailsName').textContent = contact.name;
    document.getElementById('detailsEmail').innerHTML = contact.email 
        ? `<a style="color: #007cee;" href="mailto:${contact.email}">${contact.email}</a>` 
        : 'No email available';
    document.getElementById('detailsPhone').textContent = contact.phone ? contact.phone : 'No phone available';
    document.querySelectorAll('.contactWrapper').forEach(wrapper => wrapper.classList.remove('activeSideContacts'));
    contactWrapper.classList.add('activeSideContacts');
    updateEditContactFormInitials(initials, bgColor);
    document.getElementById('editName').value = contact.name;
    document.getElementById('editEmail').value = contact.email || '';
    document.getElementById('editPhone').value = contact.phone || '';
}


function updateEditContactFormInitials(initials, bgColor) {
    const editInitialsCircle = document.getElementById('editDetailsInitials');
    editInitialsCircle.textContent = initials;
    editInitialsCircle.style.backgroundColor = bgColor;
}

function hideContactDetails() {
    const detailsSection = document.getElementById('selectedContactDetails');
    detailsSection.classList.remove('active');
    
    setTimeout(() => {
        detailsSection.classList.remove('visible');
    }, 700); 
}

function displayContacts(contacts) {
    const container = document.querySelector('.createdContacts');
    const template = document.getElementById('contactTemplate');
    let currentLetter = '';
    container.innerHTML = '';
    contacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            addLetterHeader(container, currentLetter);
        }
        addContactToContainer(container, contact, getInitials(contact.name), getRandomColor(), template);
    });
}

function formatPhoneInput() {
    let phoneInput = document.getElementById('editPhone');
    let cleanedValue = phoneInput.value.replace(/[^\d+]/g, '');
    if (!cleanedValue.startsWith('+')) {
        cleanedValue = '+' + cleanedValue;
    }
    let formattedValue = cleanedValue.replace('+', '');
    if (formattedValue.startsWith('49')) {
        formattedValue = formattedValue.replace(/^(\d{2})(\d{4})(\d{3})(\d*)$/, '+$1 $2 $3 $4');
    } else {
        formattedValue = '+' + formattedValue;
    }
    phoneInput.value = formattedValue.trim();
    if (phoneInput.value.length > 20) {
        phoneInput.value = phoneInput.value.slice(0, 20);
    }
}

function validateEmailInput() {
    let emailInput = document.getElementById('editEmail');
    let value = emailInput.value;
    let atSymbolCount = (value.match(/@/g) || []).length;
    if (atSymbolCount > 1) {
        emailInput.value = value.slice(0, -1);
        return;
    }
    if (value.startsWith('@') || value.endsWith('@')) {
        emailInput.value = value.slice(0, -1);
    }
    emailInput.value = value.replace(/\s+/g, '');
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

function closeAddContactForm() {
    const addContactForm = document.getElementById('addContactForm');
    addContactForm.style.opacity = '0';

    setTimeout(() => {
        addContactForm.classList.remove('visible');
        addContactForm.style.display = 'none'; 
    }, 700);
}

function openAddContactForm() {
    const addContactForm = document.getElementById('addContactForm');
    addContactForm.style.display = 'flex';
    setTimeout(() => {
        addContactForm.classList.add('visible');
        addContactForm.style.opacity = '1'; 
    }, 10);
}

fetchContacts().then(displayContacts);
