
function getTask(id, category, classCategory, title, description, prioIcon) {
    return `
    <div class="task-card" id="${id}" draggable="true" ondragstart="startDragging(${id})" onclick="showOverlayDetailsTask(${id})">
        <div>
            <label class="category-${classCategory}">${category}</label>
        </div>
        <h4>${title}</h4>
        <p>${description}</p>
        <div class="subtasks" id="subtask-${id}">

        </div>
        <div class="task-footer">
            <div class="assigned-task">
            <div id="assigned-user-${id}" class="assigned-user-container">

            </div>
        </div>
        <button><img src=${prioIcon} alt="priority"></button>
        </div>
    </div>
    `
}

function getClearList(list) {
    return `
    <div class="list-no-task">
        <p>No tasks ${list}</p>
    </div>
    `
}

function getSubtask(doneTasks, allSubtasks, progress) {
    return `
    <div class="progress-border"><div id="subtask-progress" class="subtask-progress" style="width: ${progress}%;"></div></div>
    <p>${doneTasks}/${allSubtasks} Subtasks</p>
    `
}

function getFirstLetterName(firstLetters) {
    return `
    <div class="assigned-user">
        <p>${firstLetters}</p>
    </div>
    `
}

function getOverlayDetails(id, classCategory, category, title, description, dueDate, priority, prioIcon) {
    return `
    <div class="content-overlay">
        <div class="header-overlay">
            <label class="category-overlay category-${classCategory}">${category}</label>
            <img onclick="closeOverlay()" class="close-icon" src="./assets/icons/close.svg" alt="close">
        </div>
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="due-date-overlay">
            <h4>Due date:</h4>
            <p>${dueDate}</p>
        </div>
        <div class="priority-overlay">
            <h4>Priority:</h4>
            <div class="priority-container-overlay">
                <p>${priority}</p>
                <img src="${prioIcon}" alt="prioIcon">
            </div>
        </div>
        <div>
            <h4>Assigned To:</h4>
            <div id="user-names-overlay">

            </div>
        </div>
        <h4>Subtasks</h4>
        <div>
            <div id="subtasks-overlay">

            </div>
        </div>
        <div class="footer-overlay">
            <div class="footer-link-overlay" onclick="deleteTask(${id})">
                <img id="delete-icon" src="./assets/icons/delete.svg" alt="delete"><p id="footer-delete">Delete</p>
            </div>
            <div>
                <span>|</span>
            </div>
            <div class="footer-link-overlay" onclick="editTask(${id}, '${title}', '${description}', '${dueDate}', '${priority}')">
                <img id="edit-icon" src="./assets/icons/edit.svg" alt="edit"><p id="footer-edit">Edit</p>
            </div>
        </div
    </div>    
    `
}

function getUserNamesOverlay(firstLetter, userName) {
    return `
    <div class="username-overlay">
        <div id="assigned-user-overlay">
            <p>${firstLetter}</p>
        </div>
        <p class="username">${userName}</p>
    </div>
    `
}

function getSubtasksOverlay(title, status) {
    return `
    <div class="subtask-overlay">
        <a onclick="test('${title}')"><img src="${status}" alt="status"></img></a>
        <p>${title}</p>
    </div>    
    `
}

function getOverlayEdit(id, title, description) {
    return `
    <div class="content-overlay">
        <div class="header-overlay-edit">
            <img onclick="closeOverlay()" class="close-icon" src="./assets/icons/close.svg" alt="close">
        </div>
        <div class="overlay-edit-container">
            <div class="overlay-edit-container">
                <label class="edit-overlay-label"  for="title">Title</label>
                <input class="overlay-input-field" type="text" maxlength="20" placeholder="${title}" id="overlay-title">
            </div>
            <div class="overlay-edit-container">
                <label class="edit-overlay-label" for="description">Description</label>
                <textarea class="overlay-textarea" type="text" class="overlay-input-field" maxlength="50" placeholder="${description}" id="overlay-description"></textarea>
            </div>
            <div class="overlay-edit-container">
                <label class="edit-overlay-label" for="due-date">Due date</label>
                <div class="overlay-input-field-date">
                    <input type="date" id="due-date-input">
                    <img src="./assets/icons/date_icon.svg" alt ="calender">
                </div>
            </div>
            <div class="overlay-priority-container">
                <label for="priority">Priority</label>
                <div class="prio-label-container">
                    <div id="urgent-label" class="prio-label"><p id="urgent-text">Urgent</p><img src="./assets/icons/urgent_icon.png" alt="urgent"></div>
                    <div id="medium-label" class="prio-label"><p>Medium</p><img src="./assets/icons/medium_icon.png" alt="medium"></div>
                    <div id="low-label" class="prio-label"><p>Low</p><img src="./assets/icons/low_icon.png" alt="low"></div>
                </div>    
            </div>
            <div class="overlay-edit-container">
                <label class="edit-overlay-label" for="assigned-to">Assigned to</label>
                <select name="assigned-from" id="assigned-to">
                    <option autofocus value="">Select contacts to assign</option>
                </select>
            </div>
            <div class="button-ok-container">
                <button class="button-ok" onclick="saveEdit(${id})"><p>Ok</p><img src="./assets/icons/check.svg" alt=""></button>
            </div>
        </div>
    </div>    
    `
}

function getContactName(name) {
    return `
    <option value="${name}">${name}</option>
    `
}