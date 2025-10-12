/**Sets default priority to Medium */
let currentPriority = 'Medium';

/**Global variables (Prio,Subtasks,Contacts,selectedContacts and Files)*/
let priority = '';
let subtasksArray = [];
let allContacts = [];
let selectedContacts = [];
window.uploadedFiles = [];

/**Fetch all task IDs from backend */
async function getAllTaskIDs() {
  try {
    let response = await fetch(`${BASE_URL}/tasks.json`);
    let tasksData = await response.json();
    return tasksData ? extractIDs(tasksData) : [];
  } catch (error) {
    console.error("Error fetching Task IDs:", error);
    return [];
  }
}

/** Extract IDs from tasks data */
function extractIDs(tasksData) {
  let ids = Object.keys(tasksData).map(key => parseInt(tasksData[key].id));
  return ids.filter(Number.isInteger);
}

/**Generate new task ID */
async function generateNewID() {
  let existingIDs = await getAllTaskIDs();
  return Math.max(...existingIDs, 0) + 1;
}

/**Set task priority */
function setPriority(prio) { priority = prio; }

/** Create a new task */
async function createTask() {
  validateInput(); validateDateInput(); validateSelectCategory();
  let { title, description, dueDate, category, color } = getTaskInputs();
  if (!isTaskInputValid(title, description, dueDate, category)) return;
  const files = uploadedFiles;
  if (!validateFileLimits(files) || !areFileTypesValid(files)) return;
  prepareSubtasksAndContacts();
  let newID = await generateNewID();
  const processedFiles = await processFiles(files);
  let newTask = buildNewTask(newID, title, description, dueDate, category, color, processedFiles);
  await saveTask(newTask);
}

/**Validate main task inputs */
function isTaskInputValid(title, description, dueDate, category) {
  const isTitleValid = title.trim() !== "";
  const isDescriptionValid = description.trim() !== "";
  const isDueDateValid = dueDate.match(/^\d{2}\/\d{2}\/\d{4}$/);
  const isCategoryValid = category !== "";
  return isTitleValid && isDescriptionValid && isDueDateValid && isCategoryValid;
}

/**Check if all files are valid */
function areFileTypesValid(files) {
  const allTypesValid = files.every(file => {
    const type = file.type, name = file.name.toLowerCase();
    const validImage = type.startsWith('image/') && /\.(png|jpe?g)$/.test(name);
    const validPdf = type === 'application/pdf' && name.endsWith('.pdf');
    return validImage || validPdf;
  });
  if (!allTypesValid) showSecurityOverlay("File type not allowed due to security restrictions.");
  return allTypesValid;
}

/**Shows the red security warning overlay (exe,js,php file aso.)*/
function showSecurityOverlay(message) {
  const overlay = document.createElement("div");
  overlay.className = "security-overlay";
  overlay.innerText = message;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 2000);
}

/**Converts Files to Base64 */
function convertToBase64(file) {
  return new Promise((resolve) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    const maxSize = 1 * 1024 * 1024;
    if (!allowedTypes.includes(file.type))
      return alertType(file, resolve);
    if (file.size > maxSize)
      return alertSize(resolve, file);
    const reader = new FileReader();
    reader.onload = () => resolve({ base64: reader.result, name: file.name });
    reader.onerror = () => resolve({ base64: "", name: file.name });
    reader.readAsDataURL(file);
  });
}
function alertType(file, resolve){
  alert(`File type ${file.type} is not supported.`);
  resolve({ base64: "", name: file.name });
}
function alertSize(resolve, file){
  alert("File size too large. Maximum allowed: 1 MB.");
  resolve({ base64: "", name: file.name });
}

/**Ensure subtasks & contacts have defaults */
function prepareSubtasksAndContacts() { prepareSubtasks(); prepareContacts(); }

/**Prepare subtasks */
function prepareSubtasks() {
  subtasksArray = subtasksArray.map(s => ({ ...s, status: s.status || 'not done' }));
}

/**Prepare contacts */
function prepareContacts() {
  selectedContacts = selectedContacts.map(contact => {
    let firstName = contact.firstName || '';
    let lastName = contact.lastName || '';
    let name = contact.name || `${firstName} ${lastName}`;
    let color = contact.color || generateColor();
    return { name, firstName, lastName, color, email: contact.email || '', phone: contact.phone || '' };
  });
}

/**Get form inputs for new task */
function getTaskInputs() {
  let title = document.getElementById('title').value;
  let description = document.getElementById('description').value;
  let dateInput = document.getElementById('due-date-input') || document.getElementById('date-div');
  let dueDate = dateInput.value || dateInput.textContent;
  let category = document.getElementById('selectcategory').value;
  let color = getRandomColor();
  return { title, description, dueDate, category, color };
}

/**Build task object */
function buildNewTask(id, title, description, dueDate, category, color, files = []) {
  return { id, title, description, dueDate, color, prio: priority, category, list: "to-do",
           subtasks: subtasksArray, assignedTo: selectedContacts, files };
}

/**Save task to backend */
async function saveTask(newTask) {
  formatDueDateForSave(newTask);
  try {
    await fetch(`${BASE_URL}/tasks/${newTask.id - 1}.json`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
    handleSaveSuccess();
  } catch (error) {
    console.error("Task Save Error:", error);
  }
}

/**Format due date before save */
function formatDueDateForSave(task) {
  let [day, month, year] = task.dueDate.split('/');
  task.dueDate = `${year}-${month}-${day}`;
}

/**Handle successful save */
function handleSaveSuccess() {
  const successOverlay = document.getElementById('success-overlay');
  if (!successOverlay) return console.error('Success overlay not found.');
  Object.assign(successOverlay.style, { display: 'flex', justifyContent: 'center', alignItems: 'center' });
  setTimeout(() => {
    successOverlay.style.display = 'none';
    if (document.body.id === "overlay-mode") clearInputsAndCloseOverlay();
    else window.location.href = 'board.html';
  }, 3000);
}

/**Reset all priority buttons */
function resetPriorityButtons() {
  resetButton('prio-red'); resetButton('prio-orange'); resetButton('prio-green');
}

/**Reset one priority button */
function resetButton(buttonId) {
  let button = document.getElementById(buttonId);
  button.style.backgroundColor = '';
  button.style.color = '';
  button.querySelector('img').style.filter = '';
}

/**Change selected priority button color */
function changeColor(element, color) {
  resetPriorityButtons();
  applyButtonColor(element, color);
  if (element.id === 'prio-red') setPriority('Urgent');
  else if (element.id === 'prio-orange') setPriority('Medium');
  else if (element.id === 'prio-green') setPriority('Low');
}

window.addEventListener('DOMContentLoaded', function () {
  const defaultButton = document.getElementById('prio-orange');
  if (defaultButton) { changeColor(defaultButton, 'orange'); setPriority('Medium'); }
});

/**Apply style to active priority button */
function applyButtonColor(element, color) {
  element.style.backgroundColor = color;
  element.style.color = '#FFFFFF';
  element.querySelector('img').style.filter = 'brightness(0) invert(1)';
}

/**Show subtask input */
function addSubtask() {
  toggleShowIcons(true);
  toggleAddSubtaskButton(false);
}

/*Listens to user input in the subtask field and toggles icons/plus button 
 * depending on whether the input is empty or not.  */
document.getElementById('addsubtasks').addEventListener('input', function () {
  let value = this.value.trim();
  if (value.length > 0) { toggleShowIcons(true); toggleAddSubtaskButton(false); }
  else { toggleShowIcons(false); toggleAddSubtaskButton(true); }
});

/**Toggle subtask icons */
function toggleShowIcons(show) {
  document.getElementById('show-icons').style.display = show ? "flex" : "none";
}

/**Toggle add-subtask button */
function toggleAddSubtaskButton(show) {
  document.getElementById('add-subtask').style.display = show ? "inline-block" : "none";
}

/**Clear subtask input */
function clearSubtaskInput() { document.getElementById('addsubtasks').value = ''; }

/**Confirm and add new subtask */
function confirmSubtask() {
  let subtaskValue = document.getElementById('addsubtasks').value.trim();
  if (subtaskValue) addSubtaskToList(subtaskValue);
}

// Event Key (Enter) for also add the Subtask
document.getElementById('addsubtasks').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') { event.preventDefault(); confirmSubtask(); }
});

/**Add new subtask to list */
function addSubtaskToList(subtaskValue) {
  let li = createSubtaskElement(subtaskValue);
  document.getElementById('subtask-list').appendChild(li);
  subtasksArray.push({ title: subtaskValue });
  resetSubtaskInputs();
}

/**Create subtask element */
function createSubtaskElement(subtaskValue) {
  let li = document.createElement('li');
  li.innerHTML = `<div class="limit-cont"><span class="dot">•</span>
                  <span class="subtask-text">${subtaskValue}</span></div>
                  <div class="icons">
                      <button class="icon-btn" onclick="editSubtask(this)">
                          <img src="./assets/icons/edit_icon.png" alt="Edit" style="height:20px;">
                      </button>
                      <div class="ul-icons-seperator"></div>
                      <button class="icon-btn" onclick="deleteSubtask(this)">
                          <img src="./assets/icons/delete_icon.png" alt="Delete" style="height:20px;">
                      </button>
                  </div>`;
  return li;
}

/**Reset subtask UI */
function resetSubtaskInputs() { clearSubtaskInput(); toggleShowIcons(false); toggleAddSubtaskButton(true); }

/**Edit subtask text */
function editSubtask(editBtn) {
  let subtaskText = editBtn.parentElement.previousElementSibling.querySelector('.subtask-text');
  enableSubtaskEditing(subtaskText);
}

/** Enable editing for subtask */
function enableSubtaskEditing(subtaskText) {
  let originalText = subtaskText.textContent;
  subtaskText.contentEditable = "true";
  subtaskText.focus();
  const onInput = () => { if (subtaskText.textContent.length > 36) subtaskText.textContent = subtaskText.textContent.slice(0, 36); };
  const onKey = (e) => { if (e.key === "Enter") { e.preventDefault(); subtaskText.blur(); } };
  const onBlur = () => {
    let newText = subtaskText.textContent.trim();
    subtaskText.textContent = newText || originalText;
    updateSubtaskArray(originalText, subtaskText.textContent);
    subtaskText.contentEditable = "false";
    subtaskText.removeEventListener('input', onInput);
    subtaskText.removeEventListener('keydown', onKey);
    subtaskText.removeEventListener('blur', onBlur);
  };
  subtaskText.addEventListener('input', onInput);
  subtaskText.addEventListener('keydown', onKey);
  subtaskText.addEventListener('blur', onBlur);
}

/**Update subtask array after edit */
function updateSubtaskArray(oldText, newText) {
  let index = subtasksArray.findIndex(subtask => subtask.title === oldText);
  if (index !== -1) subtasksArray[index].title = newText;
}

/**Deletes a subtask */ 
function deleteSubtask(deleteBtn) { deleteBtn.closest('li').remove(); }

/**Get random color for user Avatars */ 
function getRandomColor() { return generateColor(); }

/**Load contacts from backend */ 
async function loadContacts() {
  let userAsContact = createUserAsContact();
  try {
    let response = await fetch(`${BASE_URL}/contacts.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    let contacts = await response.json();
    allContacts = processContacts(contacts, userAsContact);
    displayContacts(allContacts);
  } catch (error) {
    console.error('Error loading contacts:', error);
  }
}

/**Create logged-in user as contact */ 
function createUserAsContact() {
  return {
    email: loggedUser.email,
    id: 0,
    firstName: loggedUser.name.split(' ')[0],
    lastName: loggedUser.name.split(' ').slice(1).join(' ') || '(You)',
    phone: '000000'
  };
}

/**Format contact into first/last name*/
function formatContact(contact) {
  let firstName = '', lastName = '';
  if (contact.name) {
    const parts = contact.name.split(' ');
    firstName = parts[0]; lastName = parts.slice(1).join(' ');
  } else {
    firstName = contact.firstName || ''; lastName = contact.lastName || '';
  }
  return { ...contact, firstName, lastName };
}

/**Close overlay from iframe*/
function closeOverlayFromIframe() {
  if (window.parent && typeof window.parent.closeTaskOverlay === 'function') {
    window.parent.closeTaskOverlay();
  } else {
    console.warn("closeTaskOverlay() not available in parent window");
  }
}




