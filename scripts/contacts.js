function fetchContacts() {
    return fetch('https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/contacts.json')
        .then(response => response.json())
        .then(data => {
            return Object.values(data).slice(0, 10).sort((a, b) => {
                return a.name.split(' ')[0].toLowerCase().localeCompare(b.name.split(' ')[0].toLowerCase());
            });
        });
}

function displayContacts(contacts) {
    const container = document.querySelector('.createdContacts');
    const template = document.getElementById('contact-template');
    container.innerHTML = '';
    contacts.forEach(contact => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.contact-name').textContent = contact.name;
        clone.querySelector('.contact-email').textContent = contact.email || 'No email available';
        container.appendChild(clone);
    });
}

fetchContacts().then(displayContacts);
