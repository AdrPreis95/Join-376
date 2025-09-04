/**Applies the given CSS content to the iframe.*/
function applyStylesToIframe(iframe, cssContent) {
    iframe.onload = function () {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDocument) {
            const styleElement = iframeDocument.createElement("style");
            styleElement.type = "text/css";
            styleElement.textContent = cssContent;
            const head = iframeDocument.head || iframeDocument.getElementsByTagName("head")[0];
            if (head) {
                head.appendChild(styleElement);
            } else {
                console.error("Iframe head not found");
            }
        } else {
            console.error("Iframe document not accessible");}};
}

/**Function: closeTaskOverlay
 Description: Hides the task overlay and resets its contents.*/
function closeTaskOverlay() {
    const overlay = document.getElementById('task-overlay');
    if (overlay) {
        overlay.style.display = 'none'; 
        clearTask(); 
    }
}

/**Function to clear the overlay Inputs*/
function clearInputsAndCloseOverlay() {
    const overlay = document.getElementById('taskoverlay');
    if (overlay) {
        overlay.classList.remove('nohidden');
        overlay.classList.add('gethidden');
    }
    clearTask();
}

/**Opens the User Dropdown */
async function openDropdown() {
  const dropdown = document.getElementById('dropdown-user');
  const willOpen = dropdown.style.display !== "flex";
  dropdown.style.display = willOpen ? "flex" : "none";

  if (willOpen) {
    // hol Kontakte aus Cache (ändert sich nicht jedes Mal)
    const contacts = await getContactsCached(false);
    displayContacts(allContacts);      // hier mit contact.color rendern
    synchronizeCheckboxes();
  }
}

/**Closes the dropdown when clicking outside.*/
function closeDropdownOnClickOutside(event) {
    const dropdown = document.getElementById('dropdown-user');
    const container = document.querySelector('.dropdown');
    if (dropdown && container && !container.contains(event.target)) {
        dropdown.style.display = 'none';
    }
    document.getElementById('dropdown-input').value = '';
}
document.addEventListener('click', closeDropdownOnClickOutside);

/**Generates initials for a contact.*/
function getInitials(contact) {
    let initials = '';
    if (contact.firstName) initials += contact.firstName.charAt(0);
    if (contact.lastName) initials += contact.lastName.charAt(0);
    if (!initials && contact.name) initials = contact.name.charAt(0);
    return initials;
}

/**Gets the full name of a contact for the Avatar Icon Initials*/
function getFullName(contact) {
    return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
}

/**Clears all task-related inputs and resets the form.*/
function clearTask() {
    clearInputs();
    clearSubtaskList();
    resetPriorityButtons();
    displayContacts(allContacts);
    clearAssignedContacts();
    uploadedFiles = [];
    document.getElementById('file-preview-container').innerHTML = '';
    document.getElementById('file-limit-warning').style.display = 'none';
    const defaultButton = document.getElementById('prio-orange');
    if (defaultButton) {
        changeColor(defaultButton, 'orange');
        setPriority('Medium');
    }
}

/**Clears the input fields for the task.*/
function clearInputs() {
    document.getElementById("title").value = '';
    document.getElementById("description").value = '';
    document.getElementById("due-date-input").value = '';
    document.getElementById("selectcategory").value = '';
    document.getElementById("addsubtasks").value = '';
    document.getElementById("dropdown-input").value = '';

}

/**This function removes all content from the element with the ID "picked-user-avatar",*/
function clearAssignedContacts() {
    document.getElementById("picked-user-avatar").innerHTML = '';
}

/**Clears the subtask list and resets the array.*/
function clearSubtaskList() {
    document.getElementById("subtask-list").innerHTML = '';
    subtasksArray = [];
    selectedContacts = [];
}

/**Validates the title input field.*/
function validateInput() {
    const input = document.getElementById('title');
    const errorMessage = document.getElementById('error-message');

    if (input.value.trim() === "") {
        input.classList.add('error');
        input.style.border = '2px solid red';
        errorMessage.style.display = 'block';
    } else {
        input.classList.remove('error');
        input.style.border = 'none';
        errorMessage.style.display = 'none';
    }
}

document.getElementById('title').addEventListener('input', validateInput);

/**Submits the Form Field*/
function submitForm() {
    validateInput();

    const input = document.getElementById('title');
    if (input.value.trim() !== "") {
        alert("Formular erfolgreich abgesendet!");
    }
}

document.getElementById('title').addEventListener('input', validateInput);

/** adds the uploaded file */
function uploadFile(){
  let data = document.getElementById('file-select');
}
const customSelect = document.getElementById("custom-select");
const select = document.getElementById("selectcategory");
const selected = customSelect.querySelector(".selected");
const options = customSelect.querySelector(".options");

initDropdown(customSelect, select, selected, options);
document.getElementById('selectcategory').addEventListener('change', validateSelectCategory);

/** Öffnen/Schließen des Dropdowns */
function initDropdown(customSelect, select, selected, options) {
  customSelect.addEventListener("click", () => {
    options.style.display = options.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!customSelect.contains(e.target)) options.style.display = "none";
  });

  handleOptionClick(select, selected, options);
}

/** Klick auf eine Option */
function handleOptionClick(select, selected, options) {
  options.querySelectorAll("li").forEach(option => {
    option.addEventListener("click", () => {
      select.value = option.getAttribute("data-value");
      selected.textContent = option.textContent;
      select.dispatchEvent(new Event("change")); // trigger Validation

      // bisherige Auswahl löschen
      options.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
     
      option.classList.add("selected");

      options.style.display = "none";
    });
  });
}
function validateSelectCategory() {
  const selectCategory = document.getElementById('selectcategory');
  const customSelect = document.getElementById('custom-select');
  const categoryErrorMessage = document.getElementById('category-error-message');

  if (isCategoryEmpty(selectCategory)) {
    showCategoryError(customSelect, categoryErrorMessage);
  } else {
    hideCategoryError(customSelect, categoryErrorMessage);
  }
}

function isCategoryEmpty(selectCategory) {
  return selectCategory.value === "";
}

function showCategoryError(customSelect, categoryErrorMessage) {
  customSelect.classList.add('error');
  categoryErrorMessage.style.display = 'block';
}

function hideCategoryError(customSelect, categoryErrorMessage) {
  customSelect.classList.remove('error');
  categoryErrorMessage.style.display = 'none';
}
