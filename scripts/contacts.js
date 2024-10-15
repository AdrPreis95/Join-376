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
    const clone = template.content.cloneNode(true);
    clone.querySelector('.initials-circle').textContent = initials;
    clone.querySelector('.initials-circle').style.backgroundColor = bgColor;
    clone.querySelector('.contact-name').textContent = contact.name;
    clone.querySelector('.contact-email').innerHTML = contact.email 
        ? `<a style="color: #007cee;"href="mailto:${contact.email}">${contact.email}</a>` 
        : 'No email available';
    container.appendChild(clone);
}


function displayContacts(contacts) {
    const container = document.querySelector('.createdContacts');
    const template = document.getElementById('contact-template');
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

fetchContacts().then(displayContacts);
