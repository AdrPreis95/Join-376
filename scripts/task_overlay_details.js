// /**Applies the given CSS content to the iframe.*/
// function applyStylesToIframe(iframe, cssContent) {
//   iframe.onload = function () {
//     const doc = iframe.contentDocument || iframe.contentWindow.document;
//     if (!doc) return console.error("Iframe document not accessible");
//     const style = doc.createElement("style");
//     style.type = "text/css";
//     style.textContent = cssContent;
//     const head = doc.head || doc.getElementsByTagName("head")[0];
//     if (head) head.appendChild(style);
//     else console.error("Iframe head not found");
//   };
// }

// /**Function: closeTaskOverlay
//  Description: Hides the task overlay and resets its contents.*/
// function closeTaskOverlay() {
//   const overlay = document.getElementById('task-overlay');
//   if (overlay) { overlay.style.display = 'none'; clearTask(); }
// }

// /**Function to clear the overlay Inputs*/
// function clearInputsAndCloseOverlay() {
//   const overlay = document.getElementById('taskoverlay');
//   if (overlay) { overlay.classList.remove('nohidden'); overlay.classList.add('gethidden'); }
//   clearTask();
// }

// /**Opens the User Dropdown */
// async function openDropdown() {
//   const dropdown = document.getElementById('dropdown-user');
//   const willOpen = dropdown.style.display !== "flex";
//   dropdown.style.display = willOpen ? "flex" : "none";
//   if (willOpen) {
//     await getContactsCached(false);
//     displayContacts(allContacts);
//     synchronizeCheckboxes();
//   }
// }

// /**Closes the dropdown when clicking outside.*/
// function closeDropdownOnClickOutside(event) {
//   const dropdown = document.getElementById('dropdown-user');
//   const container = document.querySelector('.dropdown');
//   if (dropdown && container && !container.contains(event.target)) dropdown.style.display = 'none';
//   document.getElementById('dropdown-input').value = '';
// }
// document.addEventListener('click', closeDropdownOnClickOutside);

// /**Generates initials for a contact.*/
// function getInitials(contact) {
//   let initials = '';
//   if (contact.firstName) initials += contact.firstName.charAt(0);
//   if (contact.lastName) initials += contact.lastName.charAt(0);
//   if (!initials && contact.name) initials = contact.name.charAt(0);
//   return initials;
// }

// /**Gets the full name of a contact for the Avatar Icon Initials*/
// function getFullName(contact) {
//   return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
// }

// /**Clears all task-related inputs and resets the form.*/
// function clearTask() {
//   clearInputs();
//   clearSubtaskList();
//   resetPriorityButtons();
//   displayContacts(allContacts);
//   clearAssignedContacts();
//   resetFilesUI();
//   setDefaultPriorityButton();
// }
// function resetFilesUI(){
//   uploadedFiles = [];
//   document.getElementById('file-preview-container').innerHTML = '';
//   document.getElementById('file-limit-warning').style.display = 'none';
// }
// function setDefaultPriorityButton(){
//   const defaultButton = document.getElementById('prio-orange');
//   if (defaultButton) { changeColor(defaultButton, 'orange'); setPriority('Medium'); }
// }

// /**Clears the input fields for the task.*/
// function clearInputs() {
//   document.getElementById("title").value = '';
//   document.getElementById("description").value = '';
//   document.getElementById("due-date-input").value = '';
//   document.getElementById("selectcategory").value = '';
//   document.getElementById("addsubtasks").value = '';
//   document.getElementById("dropdown-input").value = '';
//   resetCustomSelectUI(document.getElementById('custom-select'));
// }
// function resetCustomSelectUI(customSelect){
//   const selected = customSelect.querySelector(".selected");
//   const options = customSelect.querySelector(".options");
//   const msg = document.getElementById('category-error-message');
//   if (selected) selected.textContent = "Select Category";
//   if (options) options.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
//   if (customSelect) customSelect.classList.remove("error");
//   if (msg) msg.style.display = "none";
// }

// /**This function removes all content from the element with the ID "picked-user-avatar",*/
// function clearAssignedContacts() {
//   document.getElementById("picked-user-avatar").innerHTML = '';
// }

// /**Clears the subtask list and resets the array.*/
// function clearSubtaskList() {
//   document.getElementById("subtask-list").innerHTML = '';
//   subtasksArray = [];
//   selectedContacts = [];
// }

// /**Validates the title input field.*/
// function validateInput() {
//   const input = document.getElementById('title');
//   const errorMessage = document.getElementById('error-message');
//   if (input.value.trim() === "") {
//     input.classList.add('error'); input.style.border = '2px solid red'; errorMessage.style.display = 'block';
//   } else {
//     input.classList.remove('error'); input.style.border = 'none'; errorMessage.style.display = 'none';
//   }
// }
// document.getElementById('title').addEventListener('input', validateInput);

// /**Submits the Form Field*/
// function submitForm() {
//   validateInput();
//   const input = document.getElementById('title');
//   if (input.value.trim() !== "") { alert("Formular erfolgreich abgesendet!"); }
// }
// document.getElementById('title').addEventListener('input', validateInput);

// /** adds the uploaded file */
// function uploadFile(){
//   let data = document.getElementById('file-select');
// }

// const customSelect = document.getElementById("custom-select");
// const select = document.getElementById("selectcategory");
// const selected = customSelect.querySelector(".selected");
// const options = customSelect.querySelector(".options");

// initDropdown(customSelect, select, selected, options);
// document.getElementById('selectcategory').addEventListener('change', validateSelectCategory);

// /** opens and close the Dropdown, check user selected or not */
// function initDropdown(customSelect, select, selected, options) {
//   customSelect.addEventListener("click", () => toggleOptionsDisplay(options));
//   attachOutsideClickCloser(customSelect, options);
//   handleOptionClick(select, selected, options);
// }
// function toggleOptionsDisplay(options){
//   options.style.display = options.style.display === "block" ? "none" : "block";
// }
// function attachOutsideClickCloser(customSelect, options){
//   document.addEventListener("click", (e) => {
//     if (!customSelect.contains(e.target)) options.style.display = "none";
//   });
// }

// /** Handles click events for custom select options. */
// function handleOptionClick(select, selected, options) {
//   options.querySelectorAll("li").forEach(option => {
//     option.addEventListener("click", (e) => {
//       e.stopPropagation();
//       select.value = option.getAttribute("data-value");
//       selected.textContent = option.textContent;
//       select.dispatchEvent(new Event("change"));
//       applyCategorySelection(options, option);
//     });
//   });
// }
// function applyCategorySelection(options, option){
//   options.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
//   option.classList.add("selected");
//   options.style.display = "none";
// }

// /** Validates the category select field. */
// function validateSelectCategory() {
//   const selectCategory = document.getElementById('selectcategory');
//   const customSelect = document.getElementById('custom-select');
//   const msg = document.getElementById('category-error-message');
//   if (isCategoryEmpty(selectCategory)) showCategoryError(customSelect, msg);
//   else hideCategoryError(customSelect, msg);
// }

// /** Checks if the category select field is empty. */
// function isCategoryEmpty(selectCategory) {
//   return selectCategory.value === "";
// }

// /** Displays the category error message and adds error styling. */
// function showCategoryError(customSelect, categoryErrorMessage) {
//   customSelect.classList.add('error');
//   categoryErrorMessage.style.display = 'block';
// }

// /** Hides the category error message and removes error styling. */
// function hideCategoryError(customSelect, categoryErrorMessage) {
//   customSelect.classList.remove('error');
//   categoryErrorMessage.style.display = 'none';
// }


/** Injects CSS text into an iframe’s <head> after load. */
function applyStylesToIframe(iframe, cssContent) {
  iframe.onload = function () {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return console.error("Iframe document not accessible");
    const style = doc.createElement("style");
    style.type = "text/css";
    style.textContent = cssContent;
    const head = doc.head || doc.getElementsByTagName("head")[0];
    head ? head.appendChild(style) : console.error("Iframe head not found");
  };
}

/** Hides the #task-overlay and clears its content. */
function closeTaskOverlay() {
  const overlay = document.getElementById('task-overlay');
  if (overlay) { overlay.style.display = 'none'; clearTask(); }
}

/** Hides the add-task overlay and clears inputs. */
function clearInputsAndCloseOverlay() {
  const overlay = document.getElementById('taskoverlay');
  if (overlay) { overlay.classList.remove('nohidden'); overlay.classList.add('gethidden'); }
  clearTask();
}

/** Toggles the assignee dropdown and refreshes its content. */
async function openDropdown() {
  const dropdown = document.getElementById('dropdown-user');
  const willOpen = dropdown.style.display !== "flex";
  dropdown.style.display = willOpen ? "flex" : "none";
  if (willOpen) { await getContactsCached(false); displayContacts(allContacts); synchronizeCheckboxes(); }
}

/** Closes the dropdown when clicking outside the container. */
function closeDropdownOnClickOutside(event) {
  const dropdown = document.getElementById('dropdown-user');
  const container = document.querySelector('.dropdown');
  if (dropdown && container && !container.contains(event.target)) dropdown.style.display = 'none';
  document.getElementById('dropdown-input').value = '';
}
document.addEventListener('click', closeDropdownOnClickOutside);

/** Builds initials from first/last or name fallback. */
function getInitials(contact) {
  let ini = '';
  if (contact.firstName) ini += contact.firstName.charAt(0);
  if (contact.lastName) ini += contact.lastName.charAt(0);
  if (!ini && contact.name) ini = contact.name.charAt(0);
  return ini;
}

/** Returns the contact full name used for avatars. */
function getFullName(contact) {
  return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
}

/** Clears task form, subtasks, files, selections and prio. */
function clearTask() {
  clearInputs();
  clearSubtaskList();
  resetPriorityButtons();
  displayContacts(allContacts);
  clearAssignedContacts();
  resetFilesUI();
  setDefaultPriorityButton();
}

/** Resets file UI state and hides file-limit warning. */
function resetFilesUI(){
  uploadedFiles = [];
  document.getElementById('file-preview-container').innerHTML = '';
  document.getElementById('file-limit-warning').style.display = 'none';
}

/** Sets Medium as default priority styling and value. */
function setDefaultPriorityButton(){
  const btn = document.getElementById('prio-orange');
  if (btn) { changeColor(btn, 'orange'); setPriority('Medium'); }
}

/** Clears all input fields and resets custom select UI. */
function clearInputs() {
  ['title','description','due-date-input','selectcategory','addsubtasks','dropdown-input']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  resetCustomSelectUI(document.getElementById('custom-select'));
}

/** Resets the custom select label, options, and error state. */
function resetCustomSelectUI(customSelect){
  if (!customSelect) return;
  const selected = customSelect.querySelector(".selected");
  const options = customSelect.querySelector(".options");
  const msg = document.getElementById('category-error-message');
  if (selected) selected.textContent = "Select Category";
  if (options) options.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
  customSelect.classList.remove("error");
  if (msg) msg.style.display = "none";
}

/** Clears picked-user avatar container content. */
function clearAssignedContacts() {
  const el = document.getElementById("picked-user-avatar");
  if (el) el.innerHTML = '';
}

/** Empties subtask list and resets related arrays. */
function clearSubtaskList() {
  const ul = document.getElementById("subtask-list");
  if (ul) ul.innerHTML = '';
  subtasksArray = [];
  selectedContacts = [];
}

/** Validates title input and toggles error UI accordingly. */
function validateInput() {
  const input = document.getElementById('title');
  const msg = document.getElementById('error-message');
  if (!input) return;
  if (input.value.trim() === "") { input.classList.add('error'); input.style.border = '2px solid red'; msg.style.display = 'block'; }
  else { input.classList.remove('error'); input.style.border = 'none'; msg.style.display = 'none'; }
}
document.getElementById('title')?.addEventListener('input', validateInput);

/** Validates title and shows a success alert on submit. */
function submitForm() {
  validateInput();
  const input = document.getElementById('title');
  if (input && input.value.trim() !== "") alert("Formular erfolgreich abgesendet!");
}

/** Placeholder for upload logic (kept to preserve hooks). */
function uploadFile(){ const data = document.getElementById('file-select'); /* no-op */ }

/** Initializes custom select dropdown behaviors. */
function initDropdown(customSelect, select, selected, options) {
  customSelect.addEventListener("click", () => toggleOptionsDisplay(options));
  attachOutsideClickCloser(customSelect, options);
  handleOptionClick(select, selected, options);
}
const customSelect = document.getElementById("custom-select");
const select = document.getElementById("selectcategory");
const selected = customSelect?.querySelector(".selected");
const options = customSelect?.querySelector(".options");
if (customSelect && select && selected && options) initDropdown(customSelect, select, selected, options);
document.getElementById('selectcategory')?.addEventListener('change', validateSelectCategory);

/** Toggles options list visibility. */
function toggleOptionsDisplay(options){
  options.style.display = options.style.display === "block" ? "none" : "block";
}

/** Closes options if clicking outside of the custom select. */
function attachOutsideClickCloser(customSelect, options){
  document.addEventListener("click", (e) => { if (!customSelect.contains(e.target)) options.style.display = "none"; });
}

/** Hooks option clicks to update select value and UI. */
function handleOptionClick(select, selected, options) {
  options.querySelectorAll("li").forEach(option => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      select.value = option.getAttribute("data-value");
      selected.textContent = option.textContent;
      select.dispatchEvent(new Event("change"));
      applyCategorySelection(options, option);
    });
  });
}

/** Applies selected styling and closes the options list. */
function applyCategorySelection(options, option){
  options.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
  option.classList.add("selected");
  options.style.display = "none";
}

/** Validates the category field and toggles error UI. */
function validateSelectCategory() {
  const sel = document.getElementById('selectcategory');
  const cs = document.getElementById('custom-select');
  const msg = document.getElementById('category-error-message');
  isCategoryEmpty(sel) ? showCategoryError(cs, msg) : hideCategoryError(cs, msg);
}

/** Returns true if category value is empty. */
function isCategoryEmpty(selectCategory) { return selectCategory.value === ""; }

/** Shows category error and adds error styling. */
function showCategoryError(customSelect, msg) { customSelect.classList.add('error'); msg.style.display = 'block'; }

/** Hides category error and removes error styling. */
function hideCategoryError(customSelect, msg) { customSelect.classList.remove('error'); msg.style.display = 'none'; }
