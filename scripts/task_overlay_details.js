/**
* Applies the given CSS content to the iframe.
* @param {HTMLIFrameElement} iframe - The target iframe.
* @param {string} cssContent - The CSS content to apply.
*/
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
            console.error("Iframe document not accessible");
        }
    };
}
/**
 * Function: closeTaskOverlay
 * Description: Hides the task overlay and resets its contents.
 */
function closeTaskOverlay() {
    const overlay = document.getElementById('task-overlay');
    if (overlay) {
        overlay.style.display = 'none'; // Hide the overlay
        clearTask(); // Reset the overlay contents
    }
}

/**
 * Function to clear the overlay Inputs
 */
function clearInputsAndCloseOverlay() {
    const overlay = document.getElementById('taskoverlay');
    if (overlay) {
        overlay.classList.remove('nohidden');
        overlay.classList.add('gethidden');
    }
    clearTask();
}
function openDropdown() {
    let dropdown = document.getElementById('dropdown-user');
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";

    if (dropdown.style.display === "flex") {
        loadContacts().then(() => {
            synchronizeCheckboxes();
        });
    }
}

/**
* Closes the dropdown when clicking outside.
* @param {Event} event - The click event.
*/
function closeDropdownOnClickOutside(event) {
    const dropdown = document.getElementById('dropdown-user');
    const container = document.querySelector('.dropdown');
    if (dropdown && container && !container.contains(event.target)) {
        dropdown.style.display = 'none';
    }
    document.getElementById('dropdown-input').value = '';
}
document.addEventListener('click', closeDropdownOnClickOutside);

/**
 * Generates initials for a contact.
 * @param {Object} contact - The contact object.
 * @returns {string} The initials of the contact.
 */
function getInitials(contact) {
    let initials = '';
    if (contact.firstName) initials += contact.firstName.charAt(0);
    if (contact.lastName) initials += contact.lastName.charAt(0);
    if (!initials && contact.name) initials = contact.name.charAt(0);
    return initials;
}

/**
 * Gets the full name of a contact.
 * @param {Object} contact - The contact object.
 * @returns {string} The full name of the contact.
 */
function getFullName(contact) {
    return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
}

/**
 * Toggles the dropdown for user selection.
 */

/**
 * Clears all task-related inputs and resets the form.
 */
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

/**
 * Clears the input fields for the task.
 */
function clearInputs() {
    document.getElementById("title").value = '';
    document.getElementById("description").value = '';
    document.getElementById("due-date-input").value = '';
    document.getElementById("selectcategory").value = '';
    document.getElementById("addsubtasks").value = '';
    document.getElementById("dropdown-input").value = '';

}
/**
 
* This function removes all content from the element with the ID "picked-user-avatar",
*/
function clearAssignedContacts() {
    document.getElementById("picked-user-avatar").innerHTML = '';
}

/**
 * Clears the subtask list and resets the array.
 */
function clearSubtaskList() {
    document.getElementById("subtask-list").innerHTML = '';
    subtasksArray = [];
    selectedContacts = [];
}

/**
 * Validates the title input field.
 */
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

function submitForm() {
    validateInput();

    const input = document.getElementById('title');
    if (input.value.trim() !== "") {
        alert("Formular erfolgreich abgesendet!");
    }
}

document.getElementById('title').addEventListener('input', validateInput);


/**
 * Validates the category selection input.
 */
function validateSelectCategory() {
    const selectCategory = document.getElementById('selectcategory');
    const categoryErrorMessage = document.getElementById('category-error-message');

    if (isCategoryEmpty(selectCategory)) {
        showCategoryError(selectCategory, categoryErrorMessage);
    } else {
        hideCategoryError(selectCategory, categoryErrorMessage);
    }
}

function isCategoryEmpty(selectCategory) {
    return selectCategory.value === "";
}

function showCategoryError(selectCategory, categoryErrorMessage) {
    selectCategory.classList.add('error');
    selectCategory.style.border = '2px solid red';
    categoryErrorMessage.style.display = 'block';
}

function hideCategoryError(selectCategory, categoryErrorMessage) {
    selectCategory.classList.remove('error');
    selectCategory.style.border = 'none';
    categoryErrorMessage.style.display = 'none';
}


document.getElementById('selectcategory').addEventListener('change', validateSelectCategory);


/**
 * Checks if the category selection is empty.
 * @param {HTMLElement} selectCategory - The category selection element.
 * @returns {boolean} True if the category is empty, otherwise false.
 */
function isCategoryEmpty(selectCategory) {
    return selectCategory.value === "";
}

/**
 * Displays an error for the category selection input.
 * @param {HTMLElement} selectCategory - The category selection element.
 * @param {HTMLElement} categoryErrorMessage - The error message element.
 */
function showCategoryError(selectCategory, categoryErrorMessage) {
    selectCategory.classList.add('error');
    selectCategory.style.border = '2px solid red';
    categoryErrorMessage.style.display = 'block';
}

/**
 * Hides the error for the category selection input.
 * @param {HTMLElement} selectCategory - The category selection element.
 * @param {HTMLElement} categoryErrorMessage - The error message element.
 */
function hideCategoryError(selectCategory, categoryErrorMessage) {
    selectCategory.classList.remove('error');
    selectCategory.style.border = 'none';
    categoryErrorMessage.style.display = 'none';
}

/**
 * Sets the page mode based on whether it's in an overlay or not.
 */
document.addEventListener('DOMContentLoaded', function () {
    if (window !== window.top) {
        document.body.id = 'overlay-mode';
    } else {
        document.body.id = 'main-page';
    }
});
