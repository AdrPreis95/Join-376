// /**Sets default priority to Medium */
// let currentPriority = 'Medium';

// /**Global variables (Prio,Subtasks,Contacts,selectedContacts and Files)*/
// let priority = '';
// let subtasksArray = [];
// let allContacts = [];
// let selectedContacts = [];
// window.uploadedFiles = [];

// /**Fetch all task IDs from backend */
// async function getAllTaskIDs() {
//   try {
//     let response = await fetch(`${BASE_URL}/tasks.json`);
//     let tasksData = await response.json();
//     return tasksData ? extractIDs(tasksData) : [];
//   } catch (error) {
//     console.error("Error fetching Task IDs:", error);
//     return [];
//   }
// }

// /** Extract IDs from tasks data */
// function extractIDs(tasksData) {
//   let ids = Object.keys(tasksData).map(key => parseInt(tasksData[key].id));
//   return ids.filter(Number.isInteger);
// }

// /**Generate new task ID */
// async function generateNewID() {
//   let existingIDs = await getAllTaskIDs();
//   return Math.max(...existingIDs, 0) + 1;
// }

// /**Set task priority */
// function setPriority(prio) { priority = prio; }

// /** Create a new task */
// async function createTask() {
//   validateInput(); validateDateInput(); validateSelectCategory();
//   let { title, description, dueDate, category, color } = getTaskInputs();
//   if (!isTaskInputValid(title, description, dueDate, category)) return;
//   const files = uploadedFiles;
//   if (!validateFileLimits(files) || !areFileTypesValid(files)) return;
//   prepareSubtasksAndContacts();
//   let newID = await generateNewID();
//   const processedFiles = await processFiles(files);
//   let newTask = buildNewTask(newID, title, description, dueDate, category, color, processedFiles);
//   await saveTask(newTask);

// }

// /**Validate main task inputs */
// function isTaskInputValid(title, description, dueDate, category) {
//   const isTitleValid = title.trim() !== "";
//   const isDescriptionValid = description.trim() !== "";
//   const isDueDateValid = dueDate.match(/^\d{2}\/\d{2}\/\d{4}$/);
//   const isCategoryValid = category !== "";
//   return isTitleValid && isDescriptionValid && isDueDateValid && isCategoryValid;
// }

// /**Check if all files are valid */
// function areFileTypesValid(files) {
//   const allTypesValid = files.every(file => {
//     const type = file.type, name = file.name.toLowerCase();
//     const validImage = type.startsWith('image/') && /\.(png|jpe?g)$/.test(name);
//     const validPdf = type === 'application/pdf' && name.endsWith('.pdf');
//     return validImage || validPdf;
//   });
//   if (!allTypesValid) showSecurityOverlay("File type not allowed due to security restrictions.");
//   return allTypesValid;
// }

// /**Shows the red security warning overlay (exe,js,php file aso.)*/
// function showSecurityOverlay(message) {
//   const overlay = document.createElement("div");
//   overlay.className = "security-overlay";
//   overlay.innerText = message;
//   document.body.appendChild(overlay);
//   setTimeout(() => overlay.remove(), 2000);
// }

// /**Converts Files to Base64 */
// function convertToBase64(file) {
//   return new Promise((resolve) => {
//     const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
//     const maxSize = 1 * 1024 * 1024;
//     if (!allowedTypes.includes(file.type))
//       return alertType(file, resolve);
//     if (file.size > maxSize)
//       return alertSize(resolve, file);
//     const reader = new FileReader();
//     reader.onload = () => resolve({ base64: reader.result, name: file.name });
//     reader.onerror = () => resolve({ base64: "", name: file.name });
//     reader.readAsDataURL(file);
//   });
// }
// function alertType(file, resolve){
//   alert(`File type ${file.type} is not supported.`);
//   resolve({ base64: "", name: file.name });
// }
// function alertSize(resolve, file){
//   alert("File size too large. Maximum allowed: 1 MB.");
//   resolve({ base64: "", name: file.name });
// }

// /**Ensure subtasks & contacts have defaults */
// function prepareSubtasksAndContacts() { prepareSubtasks(); prepareContacts(); }

// /**Prepare subtasks */
// function prepareSubtasks() {
//   subtasksArray = subtasksArray.map(s => ({ ...s, status: s.status || 'not done' }));
// }

// /**Prepare contacts */
// function prepareContacts() {
//   selectedContacts = selectedContacts.map(contact => {
//     let firstName = contact.firstName || '';
//     let lastName = contact.lastName || '';
//     let name = contact.name || `${firstName} ${lastName}`;
//     let color = contact.color || generateColor();
//     return { name, firstName, lastName, color, email: contact.email || '', phone: contact.phone || '' };
//   });
// }

// /**Get form inputs for new task */
// function getTaskInputs() {
//   let title = document.getElementById('title').value;
//   let description = document.getElementById('description').value;
//   let dateInput = document.getElementById('due-date-input') || document.getElementById('date-div');
//   let dueDate = dateInput.value || dateInput.textContent;
//   let category = document.getElementById('selectcategory').value;
//   let color = getRandomColor();
//   return { title, description, dueDate, category, color };
// }

// /**Build task object */
// function buildNewTask(id, title, description, dueDate, category, color, files = []) {
//   return { id, title, description, dueDate, color, prio: priority, category, list: "to-do",
//            subtasks: subtasksArray, assignedTo: selectedContacts, files };
// }

// /**Save task to backend */
// async function saveTask(newTask) {
//   formatDueDateForSave(newTask);
//   try {
//     await fetch(`${BASE_URL}/tasks/${newTask.id - 1}.json`, {
//       method: 'PATCH', headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(newTask),
//     });
//     handleSaveSuccess();
//   } catch (error) {
//     console.error("Task Save Error:", error);
//   }
// }

// /**Format due date before save */
// function formatDueDateForSave(task) {
//   let [day, month, year] = task.dueDate.split('/');
//   task.dueDate = `${year}-${month}-${day}`;
// }

// /**Handle successful save */
// function handleSaveSuccess() {
//   const successOverlay = document.getElementById('success-overlay');
//   if (!successOverlay) return console.error('Success overlay not found.');
//   Object.assign(successOverlay.style, { display: 'flex', justifyContent: 'center', alignItems: 'center' });
//   setTimeout(() => {
//     successOverlay.style.display = 'none';
//     if (document.body.id === "overlay-mode") clearInputsAndCloseOverlay();
//     else window.location.href = 'board.html';
//   }, 3000);
// }

// /**Reset all priority buttons */
// function resetPriorityButtons() {
//   resetButton('prio-red'); resetButton('prio-orange'); resetButton('prio-green');
// }

// /**Reset one priority button */
// function resetButton(buttonId) {
//   let button = document.getElementById(buttonId);
//   button.style.backgroundColor = '';
//   button.style.color = '';
//   button.querySelector('img').style.filter = '';
// }

// /**Change selected priority button color */
// function changeColor(element, color) {
//   resetPriorityButtons();
//   applyButtonColor(element, color);
//   if (element.id === 'prio-red') setPriority('Urgent');
//   else if (element.id === 'prio-orange') setPriority('Medium');
//   else if (element.id === 'prio-green') setPriority('Low');
// }

// window.addEventListener('DOMContentLoaded', function () {
//   const defaultButton = document.getElementById('prio-orange');
//   if (defaultButton) { changeColor(defaultButton, 'orange'); setPriority('Medium'); }
// });

// /**Apply style to active priority button */
// function applyButtonColor(element, color) {
//   element.style.backgroundColor = color;
//   element.style.color = '#FFFFFF';
//   element.querySelector('img').style.filter = 'brightness(0) invert(1)';
// }

// /**Show subtask input */
// function addSubtask() {
//   toggleShowIcons(true);
//   toggleAddSubtaskButton(false);
// }

// /*Listens to user input in the subtask field and toggles icons/plus button 
//  * depending on whether the input is empty or not.  */
// document.getElementById('addsubtasks').addEventListener('input', function () {
//   let value = this.value.trim();
//   if (value.length > 0) { toggleShowIcons(true); toggleAddSubtaskButton(false); }
//   else { toggleShowIcons(false); toggleAddSubtaskButton(true); }
// });

// /**Toggle subtask icons */
// function toggleShowIcons(show) {
//   document.getElementById('show-icons').style.display = show ? "flex" : "none";
// }

// /**Toggle add-subtask button */
// function toggleAddSubtaskButton(show) {
//   document.getElementById('add-subtask').style.display = show ? "inline-block" : "none";
// }

// /**Clear subtask input */
// function clearSubtaskInput() { document.getElementById('addsubtasks').value = ''; }

// /**Confirm and add new subtask */
// function confirmSubtask() {
//   let subtaskValue = document.getElementById('addsubtasks').value.trim();
//   if (subtaskValue) addSubtaskToList(subtaskValue);
// }

// // Event Key (Enter) for also add the Subtask
// document.getElementById('addsubtasks').addEventListener('keydown', function (event) {
//   if (event.key === 'Enter') { event.preventDefault(); confirmSubtask(); }
// });

// /**Add new subtask to list */
// function addSubtaskToList(subtaskValue) {
//   let li = createSubtaskElement(subtaskValue);
//   document.getElementById('subtask-list').appendChild(li);
//   subtasksArray.push({ title: subtaskValue });
//   resetSubtaskInputs();
// }

// /**Create subtask element */
// function createSubtaskElement(subtaskValue) {
//   let li = document.createElement('li');
//   li.innerHTML = `<div class="limit-cont"><span class="dot">•</span>
//                   <span class="subtask-text">${subtaskValue}</span></div>
//                   <div class="icons">
//                       <button class="icon-btn" onclick="editSubtask(this)">
//                           <img src="./assets/icons/edit_icon.png" alt="Edit" style="height:20px;">
//                       </button>
//                       <div class="ul-icons-seperator"></div>
//                       <button class="icon-btn" onclick="deleteSubtask(this)">
//                           <img src="./assets/icons/delete_icon.png" alt="Delete" style="height:20px;">
//                       </button>
//                   </div>`;
//   return li;
// }

// /**Reset subtask UI */
// function resetSubtaskInputs() { clearSubtaskInput(); toggleShowIcons(false); toggleAddSubtaskButton(true); }

// /**Edit subtask text */
// function editSubtask(editBtn) {
//   let subtaskText = editBtn.parentElement.previousElementSibling.querySelector('.subtask-text');
//   enableSubtaskEditing(subtaskText);
// }

// /** Enable editing for subtask */
// function enableSubtaskEditing(subtaskText) {
//   let originalText = subtaskText.textContent;
//   subtaskText.contentEditable = "true";
//   subtaskText.focus();
//   const onInput = () => { if (subtaskText.textContent.length > 36) subtaskText.textContent = subtaskText.textContent.slice(0, 36); };
//   const onKey = (e) => { if (e.key === "Enter") { e.preventDefault(); subtaskText.blur(); } };
//   const onBlur = () => {
//     let newText = subtaskText.textContent.trim();
//     subtaskText.textContent = newText || originalText;
//     updateSubtaskArray(originalText, subtaskText.textContent);
//     subtaskText.contentEditable = "false";
//     subtaskText.removeEventListener('input', onInput);
//     subtaskText.removeEventListener('keydown', onKey);
//     subtaskText.removeEventListener('blur', onBlur);
//   };
//   subtaskText.addEventListener('input', onInput);
//   subtaskText.addEventListener('keydown', onKey);
//   subtaskText.addEventListener('blur', onBlur);
// }

// /**Update subtask array after edit */
// function updateSubtaskArray(oldText, newText) {
//   let index = subtasksArray.findIndex(subtask => subtask.title === oldText);
//   if (index !== -1) subtasksArray[index].title = newText;
// }

// /**Deletes a subtask */ 
// function deleteSubtask(deleteBtn) { deleteBtn.closest('li').remove(); }

// /**Get random color for user Avatars */ 
// function getRandomColor() { return generateColor(); }

// /**Load contacts from backend */ 
// async function loadContacts() {
//   let userAsContact = createUserAsContact();
//   try {
//     let response = await fetch(`${BASE_URL}/contacts.json`);
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     let contacts = await response.json();
//     allContacts = processContacts(contacts, userAsContact);
//     displayContacts(allContacts);
//   } catch (error) {
//     console.error('Error loading contacts:', error);
//   }
// }

// /**Create logged-in user as contact */ 
// function createUserAsContact() {
//   return {
//     email: loggedUser.email,
//     id: 0,
//     firstName: loggedUser.name.split(' ')[0],
//     lastName: loggedUser.name.split(' ').slice(1).join(' ') || '(You)',
//     phone: '000000'
//   };
// }

// /**Format contact into first/last name*/
// function formatContact(contact) {
//   let firstName = '', lastName = '';
//   if (contact.name) {
//     const parts = contact.name.split(' ');
//     firstName = parts[0]; lastName = parts.slice(1).join(' ');
//   } else {
//     firstName = contact.firstName || ''; lastName = contact.lastName || '';
//   }
//   return { ...contact, firstName, lastName };
// }

// /**Close overlay from iframe*/
// function closeOverlayFromIframe() {
//   if (window.parent && typeof window.parent.closeTaskOverlay === 'function') {
//     window.parent.closeTaskOverlay();
//   } else {
//     console.warn("closeTaskOverlay() not available in parent window");
//   }
// }


/** Sets default priority to Medium. */
let currentPriority = 'Medium';

/** Global state for priority, subtasks, contacts, selections and files. */
let priority = '';
let subtasksArray = [];
let allContacts = [];
let selectedContacts = [];
window.uploadedFiles = [];

/** Fetches all task IDs from backend. */
async function getAllTaskIDs() {
  try {
    const res = await fetch(`${BASE_URL}/tasks.json`);
    const data = await res.json();
    return data ? extractIDs(data) : [];
  } catch (e) {
    console.error("Error fetching Task IDs:", e);
    return [];
  }
}

/** Extracts numeric IDs from tasks data. */
function extractIDs(tasksData) {
  const ids = Object.keys(tasksData).map(k => parseInt(tasksData[k].id));
  return ids.filter(Number.isInteger);
}

/** Generates a new incremental task ID. */
async function generateNewID() {
  const existing = await getAllTaskIDs();
  return Math.max(...existing, 0) + 1;
}

/** Sets current task priority. */
function setPriority(prio) { priority = prio; }

/** Creates a new task after validating inputs and files. */
async function createTask() {
  validateInput(); validateDateInput(); validateSelectCategory();
  const { title, description, dueDate, category, color } = getTaskInputs();
  if (!isTaskInputValid(title, description, dueDate, category)) return;
  const files = uploadedFiles;
  if (!validateFileLimits(files) || !areFileTypesValid(files)) return;
  prepareSubtasksAndContacts();
  const newID = await generateNewID();
  const processedFiles = await processFiles(files);
  const newTask = buildNewTask(newID, title, description, dueDate, category, color, processedFiles);
  await saveTask(newTask);
}

/** Validates main task inputs. */
function isTaskInputValid(title, description, dueDate, category) {
  const t = title.trim() !== "";
  const d = description.trim() !== "";
  const dd = /^\d{2}\/\d{2}\/\d{4}$/.test(dueDate);
  const c = category !== "";
  return t && d && dd && c;
}

/** Checks if all attached files are of allowed types. */
function areFileTypesValid(files) {
  const ok = files.every(file => {
    const type = file.type, name = file.name.toLowerCase();
    const img = type.startsWith('image/') && /\.(png|jpe?g)$/.test(name);
    const pdf = type === 'application/pdf' && name.endsWith('.pdf');
    return img || pdf;
  });
  if (!ok) showSecurityOverlay("File type not allowed due to security restrictions.");
  return ok;
}

/** Shows the red security warning overlay. */
function showSecurityOverlay(message) {
  const overlay = document.createElement("div");
  overlay.className = "security-overlay";
  overlay.innerText = message;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 2000);
}

/** Converts a File to Base64 with type/size checks. */
function convertToBase64(file) {
  return new Promise((resolve) => {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    const max = 1 * 1024 * 1024;
    if (!allowed.includes(file.type)) return alertType(file, resolve);
    if (file.size > max) return alertSize(resolve, file);
    const r = new FileReader();
    r.onload = () => resolve({ base64: r.result, name: file.name });
    r.onerror = () => resolve({ base64: "", name: file.name });
    r.readAsDataURL(file);
  });
}

/** Alerts when file type is unsupported and resolves empty payload. */
function alertType(file, resolve) {
  alert(`File type ${file.type} is not supported.`);
  resolve({ base64: "", name: file.name });
}

/** Alerts for oversized file and resolves empty payload. */
function alertSize(resolve, file) {
  alert("File size too large. Maximum allowed: 1 MB.");
  resolve({ base64: "", name: file.name });
}

/** Ensures subtasks and contacts have default values. */
function prepareSubtasksAndContacts() { prepareSubtasks(); prepareContacts(); }

/** Normalizes subtasks with default status. */
function prepareSubtasks() {
  subtasksArray = subtasksArray.map(s => ({ ...s, status: s.status || 'not done' }));
}

/** Normalizes selected contacts with names/colors. */
function prepareContacts() {
  selectedContacts = selectedContacts.map(c => {
    const firstName = c.firstName || '';
    const lastName = c.lastName || '';
    const name = c.name || `${firstName} ${lastName}`;
    const color = c.color || generateColor();
    return { name, firstName, lastName, color, email: c.email || '', phone: c.phone || '' };
  });
}

/** Reads task form inputs (DOM). */
function getTaskInputs() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const dateInput = document.getElementById('due-date-input') || document.getElementById('date-div');
  const dueDate = dateInput.value || dateInput.textContent;
  const category = document.getElementById('selectcategory').value;
  const color = getRandomColor();
  return { title, description, dueDate, category, color };
}

/** Builds a task object to persist. */
function buildNewTask(id, title, description, dueDate, category, color, files = []) {
  return { id, title, description, dueDate, color, prio: priority, category, list: "to-do",
           subtasks: subtasksArray, assignedTo: selectedContacts, files };
}

/** Saves a task to backend and handles success. */
async function saveTask(newTask) {
  formatDueDateForSave(newTask);
  try {
    await fetch(`${BASE_URL}/tasks/${newTask.id - 1}.json`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask),
    });
    handleSaveSuccess();
  } catch (e) { console.error("Task Save Error:", e); }
}

/** Converts dd/mm/yyyy to yyyy-mm-dd before save. */
function formatDueDateForSave(task) {
  const [day, month, year] = task.dueDate.split('/');
  task.dueDate = `${year}-${month}-${day}`;
}

/** Shows success overlay and redirects/closes overlay. */
function handleSaveSuccess() {
  const o = document.getElementById('success-overlay');
  if (!o) return console.error('Success overlay not found.');
  Object.assign(o.style, { display: 'flex', justifyContent: 'center', alignItems: 'center' });
  setTimeout(() => {
    o.style.display = 'none';
    if (document.body.id === "overlay-mode") clearInputsAndCloseOverlay();
    else window.location.href = 'board.html';
  }, 3000);
}

/** Resets all priority buttons to default. */
function resetPriorityButtons() {
  resetButton('prio-red');
  resetButton('prio-orange');
  resetButton('prio-green');
}

/** Resets a single priority button styles. */
function resetButton(buttonId) {
  const btn = document.getElementById(buttonId);
  btn.style.backgroundColor = '';
  btn.style.color = '';
  btn.querySelector('img').style.filter = '';
}

/** Changes selected priority button color and value. */
function changeColor(element, color) {
  resetPriorityButtons(); applyButtonColor(element, color);
  if (element.id === 'prio-red') setPriority('Urgent');
  else if (element.id === 'prio-orange') setPriority('Medium');
  else if (element.id === 'prio-green') setPriority('Low');
}

/** Sets default Medium priority on DOM ready. */
window.addEventListener('DOMContentLoaded', function () {
  const def = document.getElementById('prio-orange');
  if (def) { changeColor(def, 'orange'); setPriority('Medium'); }
});

/** Applies styles to the active priority button. */
function applyButtonColor(element, color) {
  element.style.backgroundColor = color;
  element.style.color = '#FFFFFF';
  element.querySelector('img').style.filter = 'brightness(0) invert(1)';
}

/** Shows subtask input controls. */
function addSubtask() {
  toggleShowIcons(true);
  toggleAddSubtaskButton(false);
}

/** Toggles icons/plus based on subtask input value. */
document.getElementById('addsubtasks').addEventListener('input', function () {
  const hasValue = this.value.trim().length > 0;
  toggleShowIcons(hasValue); toggleAddSubtaskButton(!hasValue);
});

/** Toggles the subtask action icons visibility. */
function toggleShowIcons(show) {
  document.getElementById('show-icons').style.display = show ? "flex" : "none";
}

/** Toggles the add-subtask button visibility. */
function toggleAddSubtaskButton(show) {
  document.getElementById('add-subtask').style.display = show ? "inline-block" : "none";
}

/** Clears the subtask input field. */
function clearSubtaskInput() { document.getElementById('addsubtasks').value = ''; }

/** Confirms and adds a new subtask from input. */
function confirmSubtask() {
  const v = document.getElementById('addsubtasks').value.trim();
  if (v) addSubtaskToList(v);
}

/** Adds Enter-to-confirm behavior for subtask input. */
document.getElementById('addsubtasks').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') { e.preventDefault(); confirmSubtask(); }
});

/** Appends the subtask to list and updates state. */
function addSubtaskToList(subtaskValue) {
  const li = createSubtaskElement(subtaskValue);
  document.getElementById('subtask-list').appendChild(li);
  subtasksArray.push({ title: subtaskValue });
  resetSubtaskInputs();
}

/** Creates a subtask <li> element. */
function createSubtaskElement(subtaskValue) {
  const li = document.createElement('li');
  li.innerHTML =
    `<div class="limit-cont"><span class="dot">•</span>
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

/** Resets subtask input UI to default. */
function resetSubtaskInputs() {
  clearSubtaskInput();
  toggleShowIcons(false);
  toggleAddSubtaskButton(true);
}

/** Starts inline edit for a subtask item. */
function editSubtask(editBtn) {
  const text = editBtn.parentElement.previousElementSibling.querySelector('.subtask-text');
  enableSubtaskEditing(text);
}

/** Enables inline editing for a subtask text node. */
function enableSubtaskEditing(subtaskText) {
  const original = subtaskText.textContent;
  subtaskText.dataset.original = original;
  subtaskText.contentEditable = "true";
  subtaskText.focus();
  subtaskText.oninput = () => {
    if (subtaskText.textContent.length > 36) {
      subtaskText.textContent = subtaskText.textContent.slice(0, 36);
    }
  };
  subtaskText.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); subtaskText.blur(); } };
  subtaskText.onblur = () => handleSubtaskBlur(subtaskText);
}

/** Handles blur event of editable subtask and updates data. */
function handleSubtaskBlur(el) {
  const original = el.dataset.original || '';
  const newText = el.textContent.trim();
  el.textContent = newText || original;
  updateSubtaskArray(original, el.textContent);
  el.contentEditable = "false";
  el.oninput = el.onkeydown = el.onblur = null;
}

/** Updates the subtasks array with edited title. */
function updateSubtaskArray(oldText, newText) {
  const i = subtasksArray.findIndex(s => s.title === oldText);
  if (i !== -1) subtasksArray[i].title = newText;
}

/** Deletes a subtask list item. */
function deleteSubtask(deleteBtn) { deleteBtn.closest('li').remove(); }

/** Returns a random color for user avatars. */
function getRandomColor() { return generateColor(); }

/** Loads contacts from backend and displays them. */
async function loadContacts() {
  const userAsContact = createUserAsContact();
  try {
    const res = await fetch(`${BASE_URL}/contacts.json`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const contacts = await res.json();
    allContacts = processContacts(contacts, userAsContact);
    displayContacts(allContacts);
  } catch (e) { console.error('Error loading contacts:', e); }
}

/** Builds a contact for the logged-in user. */
function createUserAsContact() {
  return {
    email: loggedUser.email,
    id: 0,
    firstName: loggedUser.name.split(' ')[0],
    lastName: loggedUser.name.split(' ').slice(1).join(' ') || '(You)',
    phone: '000000'
  };
}

/** Ensures contact has first/last name fields. */
function formatContact(contact) {
  let firstName = '', lastName = '';
  if (contact.name) {
    const p = contact.name.split(' ');
    firstName = p[0]; lastName = p.slice(1).join(' ');
  } else {
    firstName = contact.firstName || ''; lastName = contact.lastName || '';
  }
  return { ...contact, firstName, lastName };
}

/** Closes the overlay from inside an iframe if available. */
function closeOverlayFromIframe() {
  if (window.parent && typeof window.parent.closeTaskOverlay === 'function') {
    window.parent.closeTaskOverlay();
  } else {
    console.warn("closeTaskOverlay() not available in parent window");
  }
}


