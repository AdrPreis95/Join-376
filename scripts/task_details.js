/** Ensures a contact has a color and returns it. */
function ensureColor(contact){
  if(!contact) return;
  contact.color = contact.color || getRandomColor(contact);
  return contact.color;
}

/** Renders all contacts into the dropdown list. */
function displayContacts(contacts) {
  const dropdown = document.getElementById('dropdown-user');
  dropdown.innerHTML = '';
  contacts.forEach(c => { ensureColor(c); createContactElement(dropdown, c); });
}

/** Formats fetched contacts and prepends the current user. */
function processContacts(contacts, userAsContact) {
  let formattedContacts = contacts.filter(contact => contact).map(formatContact);
  formattedContacts.unshift(userAsContact);
  return formattedContacts;
}

/** Creates a checkbox for a contact and wires change handler. */
function createCheckbox(contact) {
  let checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = selectedContacts.some(s => s.email === contact.email);
  checkbox.addEventListener('change', () => handleCheckboxChange(checkbox, contact));
  return checkbox;
}

/** Handles checkbox state change and updates selection + UI. */
function handleCheckboxChange(checkbox, contact){
  let userContainer = checkbox.closest('.user-container');
  if (checkbox.checked) {
    updateSelectedContacts(true, contact);
    if (userContainer) userContainer.classList.add('selected');
  } else {
    updateSelectedContacts(false, contact);
    if (userContainer) userContainer.classList.remove('selected');
  }
  updatePickedUserAvatars();
}

/** Syncs all dropdown checkboxes to the selectedContacts array. */
function synchronizeCheckboxes() {
  let checkboxes = document.querySelectorAll('#dropdown-user input[type="checkbox"]');
  checkboxes.forEach(checkbox => syncOneCheckbox(checkbox));
}

/** Syncs a single checkbox state with selectedContacts. */
function syncOneCheckbox(checkbox){
  let userContainer = checkbox.closest('.user-container');
  let contact = allContacts.find(c => {
    let userName = userContainer.querySelector('.user-name').innerText.trim();
    return `${c.firstName} ${c.lastName}` === userName;
  });
  if (!contact) return;
  checkbox.checked = selectedContacts.some(s => s.email === contact.email);
  userContainer.classList.toggle('selected', checkbox.checked);
}

/** Creates and appends a single contact row in the dropdown. */
function createContactElement(dropdown, contact) {
  if (!contact) return;
  let userContainer = document.createElement('div');
  userContainer.classList.add('user-container');
  const isSelected = selectedContacts.some(c => c.email === contact.email);
  if (isSelected) userContainer.classList.add('selected');
  let avatarContainer = createAvatarContainer(contact);
  let checkbox = createCheckbox(contact);
  userContainer.appendChild(avatarContainer);
  userContainer.appendChild(checkbox);
  attachContainerToggle(userContainer, checkbox);
  dropdown.appendChild(userContainer);
}

/** Allows clicking the row to toggle its checkbox. */
function attachContainerToggle(userContainer, checkbox){
  userContainer.addEventListener('click', (event) => {
    if (event.target !== checkbox) {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    }
  });
}

/** Builds the avatar + name container for a contact row. */
function createAvatarContainer(contact) {
  let wrap = document.createElement('div');
  wrap.classList.add('avatar-span-container');
  let avatar = document.createElement('div');
  avatar.classList.add('avatar');
  const color = contact?.color || getRandomColor(contact);
  avatar.style.backgroundColor = color;
  avatar.innerText = getInitials(contact).toUpperCase();
  let userName = document.createElement('span');
  userName.classList.add('user-name');
  userName.innerText = getFullName(contact);
  wrap.appendChild(avatar); wrap.appendChild(userName);
  return wrap;
}

/** Adds/removes a contact from selectedContacts based on isChecked. */
function updateSelectedContacts(isChecked, contact) {
  ensureColor(contact);
  if (isChecked) {
    if (!selectedContacts.some(c => c.email === contact.email)) selectedContacts.push(contact);
  } else {
    selectedContacts = selectedContacts.filter(c => c.email !== contact.email);
  }
}

/** Re-renders the “picked users” avatar strip. */
function updatePickedUserAvatars() {
  const wrap = document.getElementById('picked-user-avatar');
  wrap.innerHTML = '';
  const max = 5;
  selectedContacts.slice(0, max).forEach((contact, i) => {
    contact.color = contact.color || getRandomColor(contact);
    wrap.appendChild(createPickedUserElement(contact, i));
  });
  if (selectedContacts.length > max) wrap.appendChild(createMoreInfo(selectedContacts.length - max));
}

/** Creates the “+N” overflow badge for extra contacts. */
function createMoreInfo(extra){
  const more = document.createElement('div');
  more.classList.add('more-contacts-info');
  more.textContent = `+${extra}`;
  return more;
}

/** Builds a picked-user row with delete button, avatar and name. */
function createPickedUserElement(contact, index) {
  let c = document.createElement('div');
  c.classList.add('picked-user-info');
  c.appendChild(createDeleteButton(index));
  c.appendChild(createAvatarDiv(contact));
  c.appendChild(createNameSpan(contact));
  return c;
}

/** Creates the small “remove selected user” button. */
function createDeleteButton(index) {
  let btn = document.createElement('button');
  btn.classList.add('delete-user-button');
  btn.innerHTML = '&times;';
  btn.title = 'Remove User';
  btn.addEventListener('click', () => {
    selectedContacts.splice(index, 1);
    updatePickedUserAvatars();
  });
  return btn;
}

/** Creates a colored avatar element for a picked user. */
function createAvatarDiv(contact) {
  const avatarDiv = document.createElement('div');
  avatarDiv.classList.add('avatar');
  avatarDiv.style.backgroundColor = ensureColor(contact);
  avatarDiv.innerText = getInitials(contact).toUpperCase();
  return avatarDiv;
}

/** Creates the name span for a picked user. */
function createNameSpan(contact) {
  let s = document.createElement('span');
  s.classList.add('picked-user-name');
  s.innerText = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  return s;
}

/** Filters contacts by first typed letter and updates dropdown. */
function filterContacts() {
  let input = document.getElementById('dropdown-input').value.toLowerCase().trim();
  if (!input.length) return displayContacts(allContacts);
  let initial = input[0];
  let filtered = allContacts.filter(c => {
    let name = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim();
    return name.toLowerCase().startsWith(initial);
  });
  if (!filtered.length) displayNoResults(); else displayContacts(filtered);
}

/** Shows a “No results found” placeholder in dropdown. */
function displayNoResults() {
  let dropdown = document.getElementById('dropdown-user');
  dropdown.innerHTML = '';
  let noResultsMessage = document.createElement('div');
  noResultsMessage.classList.add('no-results');
  noResultsMessage.textContent = '"No results found"';
  dropdown.appendChild(noResultsMessage);
}

/** Focuses and opens the date picker input. */
function fillCurrentDate() {
  let dateInput = document.getElementById('due-date-input');
  dateInput.focus();
  dateInput.click();
}

/** Opens flatpickr if the global instance is available. */
function openFlatpickr() {
  if (window.flatpickrInstance) window.flatpickrInstance.open();
}

/** Returns today’s date as yyyy-mm-dd. */
function getFormattedTodayDate() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Validates date input; shows error or normalizes value. */
function validateDateInput() {
  const dateInput = document.getElementById('due-date-input');
  const msg = document.getElementById('date-error-message');
  const res = validateDateFormatAndFuture(dateInput.value);
  if (!res.isValid) {
    showDateError(dateInput, msg, res.message);
  } else {
    applyValidDate(dateInput, msg, res.correctedDate);
  }
}

/** Shows a visual error for the date input. */
function showDateError(input, msg, text){
  input.classList.add('error'); input.style.border = '2px solid red';
  msg.textContent = text; msg.style.display = 'block';
}

/** Applies a corrected/valid date and clears the error state. */
function applyValidDate(input, msg, corrected){
  if (corrected) input.value = corrected;
  input.classList.remove('error'); input.style.border = ''; input.style.filter = '';
  msg.style.display = 'none';
}

/** Validates DD/MM/YYYY and ensures the date is not in the past. */
function validateDateFormatAndFuture(dateValue) {
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateValue.match(datePattern)) return { isValid: false, message: 'Please select a Date' };
  const [day, month, year] = dateValue.split('/');
  const enteredDate = new Date(`${year}-${month}-${day}`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (enteredDate < today) return { isValid: true, correctedDate: getFormattedTodayDate() };
  return { isValid: true };
}

/** Adds numeric-only enforcement to the date input. */
function initializeDateInput() {
  const dateInput = document.getElementById('due-date-input');
  dateInput.addEventListener('input', function (e) {
    const f = e.target; f.value = f.value.replace(/[^0-9/]/g, '');
  });
}

/** Normalizes typed date, validates on length 10, prevents past. */
function handleDateInput(event) {
  let value = formatDateInput(event.target.value);
  event.target.value = value;
  if (value.length === 10) {
    if (validateDate(value)) preventPastDate(value);
    else { event.target.value = ''; alert("Bitte geben Sie ein gültiges Datum ein."); }
  }
}

/** Auto-inserts slashes into DDMMYYYY as DD/MM/YYYY. */
function formatDateInput(value) {
  value = value.replace(/\D/g, '');
  if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
  if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
  return value;
}

/** Checks format parts and delegates to day/month validation. */
function validateDate(value) {
  let parts = value.split('/');
  return parts.length === 3 && isValidDayAndMonth(parts);
}

/** Validates plausible day (1–31) and month (1–12). */
function isValidDayAndMonth(parts) {
  let day = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  return day >= 1 && day <= 31 && month >= 1 && month <= 12;
}

/** Prevents past dates by restoring today and marking border. */
function preventPastDate(value) {
  let today = new Date(); today.setHours(0, 0, 0, 0);
  let enteredDate = getEnteredDate(value);
  let dateInput = document.getElementById('due-date-input');
  if (enteredDate < today) { fillCurrentDate(); dateInput.classList.add('error-border'); }
  else dateInput.classList.remove('error-border');
}

/** Parses a DD/MM/YYYY string into a Date object. */
function getEnteredDate(value) {
  let p = value.split('/'); return new Date(`${p[2]}-${p[1]}-${p[0]}`);
}

/** After creating a task, closes overlay or redirects to board. */
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

/** Closes the user dropdown when clicking outside of it. */
function registerDropdownCloser() {
  document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('dropdown-user');
    const input = document.getElementById('dropdown-input');
    if (!dropdown || dropdown.style.display !== 'flex') return;
    if (dropdown.contains(event.target) || input.contains(event.target)) return;
    dropdown.style.display = 'none';
  });
}

/** Binds flatpickr initializations and date listeners (keeps logic). */
function bindDatePickersAndListeners() {
  document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#due-date-input", { dateFormat: "d/m/Y" });
  });
  document.getElementById('dateimg').addEventListener('click', function () {
    document.getElementById('due-date-input')._flatpickr.open();
  });
  document.addEventListener('DOMContentLoaded', function () {
    window.flatpickrInstance = flatpickr("#due-date-input", {
      dateFormat: "d/m/Y", allowInput: false, minDate: "today",
    });
  });
  flatpickr("#due-date-input", {
    dateFormat: "d/m/Y", minDate: "today", altInput: true, altFormat: "F j, Y", disableMobile: "true",
  });
  document.addEventListener('DOMContentLoaded', initializeDateInput);
  document.getElementById('due-date-input').addEventListener('input', validateDateInput);
}

/** Bootstraps dropdown-closer and datepicker bindings. */
function initContactsUI() {
  registerDropdownCloser();
  bindDatePickersAndListeners();
}
initContactsUI();
