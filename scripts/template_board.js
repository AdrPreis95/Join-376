
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
        <h4 id="subtask-headline-overlay">Subtasks</h4>
        <div>
            <div id="subtasks-overlay">

            </div>
        </div>
        <div class="footer-overlay">
            <div class="footer-link-overlay" id="delete-container" onclick="deleteTask(${id})">
                <svg width="17" height="18" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 18C2.95 18 2.47917 17.8042 2.0875 17.4125C1.69583 17.0208 1.5 16.55 1.5 16V3C1.21667 3 0.979167 2.90417 0.7875 2.7125C0.595833 2.52083 0.5 2.28333 0.5 2C0.5 1.71667 0.595833 1.47917 0.7875 1.2875C0.979167 1.09583 1.21667 1 1.5 1H5.5C5.5 0.716667 5.59583 0.479167 5.7875 0.2875C5.97917 0.0958333 6.21667 0 6.5 0H10.5C10.7833 0 11.0208 0.0958333 11.2125 0.2875C11.4042 0.479167 11.5 0.716667 11.5 1H15.5C15.7833 1 16.0208 1.09583 16.2125 1.2875C16.4042 1.47917 16.5 1.71667 16.5 2C16.5 2.28333 16.4042 2.52083 16.2125 2.7125C16.0208 2.90417 15.7833 3 15.5 3V16C15.5 16.55 15.3042 17.0208 14.9125 17.4125C14.5208 17.8042 14.05 18 13.5 18H3.5ZM3.5 3V16H13.5V3H3.5ZM5.5 13C5.5 13.2833 5.59583 13.5208 5.7875 13.7125C5.97917 13.9042 6.21667 14 6.5 14C6.78333 14 7.02083 13.9042 7.2125 13.7125C7.40417 13.5208 7.5 13.2833 7.5 13V6C7.5 5.71667 7.40417 5.47917 7.2125 5.2875C7.02083 5.09583 6.78333 5 6.5 5C6.21667 5 5.97917 5.09583 5.7875 5.2875C5.59583 5.47917 5.5 5.71667 5.5 6V13ZM9.5 13C9.5 13.2833 9.59583 13.5208 9.7875 13.7125C9.97917 13.9042 10.2167 14 10.5 14C10.7833 14 11.0208 13.9042 11.2125 13.7125C11.4042 13.5208 11.5 13.2833 11.5 13V6C11.5 5.71667 11.4042 5.47917 11.2125 5.2875C11.0208 5.09583 10.7833 5 10.5 5C10.2167 5 9.97917 5.09583 9.7875 5.2875C9.59583 5.47917 9.5 5.71667 9.5 6V13Z" class="svg-fill"/>
                </svg>
                <p>Delete</p>
            </div>
            <div>
                <span>|</span>
            </div>
            <div class="footer-link-overlay" id="edit-container" onclick="editTask(${id}, '${title}', '${description}', '${dueDate}', '${priority}')">
                <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_239929_2406" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25">
                        <rect x="0.682129" y="0.396729" width="24" height="24" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_239929_2406)">
                        <path d="M5.68213 19.3967H7.08213L15.7071 10.7717L14.3071 9.37173L5.68213 17.9967V19.3967ZM19.9821 9.32173L15.7321 5.12173L17.1321 3.72173C17.5155 3.3384 17.9863 3.14673 18.5446 3.14673C19.103 3.14673 19.5738 3.3384 19.9571 3.72173L21.3571 5.12173C21.7405 5.50506 21.9405 5.96756 21.9571 6.50923C21.9738 7.0509 21.7905 7.5134 21.4071 7.89673L19.9821 9.32173ZM18.5321 10.7967L7.93213 21.3967H3.68213V17.1467L14.2821 6.54673L18.5321 10.7967Z"/>
                    </g>
                </svg>
                <p>Edit</p>
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

function getSubtasksOverlay(id, subtaskId, status, title, statusIcon) {
    return `
    <div class="subtask-overlay">
        <a onclick="changeStatusSubtask('${id}', '${subtaskId}', '${status}')"><img src="${statusIcon}" alt="status"></a>
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
                    <div onclick="changePriority('Urgent')" id="urgent-label" class="prio-label"><p id="urgent-text">Urgent</p><img id="urgent-icon" src="./assets/icons/urgent_icon.png" alt="urgent"></div>
                    <div onclick="changePriority('Medium')" id="medium-label" class="prio-label"><p id="medium-text">Medium</p><img id="medium-icon"src="./assets/icons/medium_icon.png" alt="medium"></div>
                    <div onclick="changePriority('Low')" id="low-label" class="prio-label"><p id="low-text">Low</p><img id="low-icon" src="./assets/icons/low_icon.png" alt="low"></div>
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