// /**This Function is al Fallback for the User Avatar Colors.If undefined or Null he gets color code Purple*/
// function __colBy(name, email, id, color){
//   if (typeof color === 'string' && /^#?[0-9A-F]{6}$/i.test(color))
//     return color[0]==='#' ? color : ('#'+color);
//   if (typeof ensureColor === 'function')
//     return ensureColor({ name: name||'', email: email||'', id: id||'' });
//   return '#6E52FF';
// };

// /**This function contains the HTML template for a task as a card on the board.*/
// function getTask(id, category, classCategory, title, description, prioIcon) {
//     return `
//     <div class="task-card" id="${id}" draggable="true" ondragstart="startDragging(${id})" ondragend="removeDragging(${id})"
//      ontouchstart="onTouch(event, ${id});" ontouchend="cancel()" ontouchmove="cancel()" onclick="showOverlayDetailsTask(${id}); event.stopPropagation()">
//         <div>
//             <label class="category-${classCategory}">${category}</label>
//         </div>
//         <h4>${title}</h4>
//         <p class="description-p">${description}</p>
//         <div class="subtasks" id="subtask-${id}">

//         </div>
//         <div class="task-footer">
//             <div class="assigned-task">
//             <div id="assigned-user-${id}" class="assigned-user-container">

//             </div>
//             <div class="more-user" id="more-user-${id}">

//             </div>
//         </div>
//         <button><img src=${prioIcon} alt="priority"></button>
//         </div>
//     </div>
//     `
// };

// /**This function returns an HTML template which indicates that the respective list is not filled.*/
// function getClearList(list) {
//     return `
//     <div class="list-no-task">
//         <p>No tasks ${list}</p>
//     </div>
//     `
// };

// /**This function returns the HTML template for the progress display of the subtask.*/
// function getSubtask(doneTasks, allSubtasks, progress) {
//     return `
//     <div class="progress-border"><div id="subtask-progress" class="subtask-progress" style="width: ${progress}%;"></div></div>
//     <p>${doneTasks}/${allSubtasks} Subtasks</p>
//     `
// };

// /**This function creates the HTML template with the initial letters of the users and the color for the background.*/
// function getFirstLetterName(firstLetters, color) {
//     const col = __colBy(firstLetters, '', '', color);
//     return `
//     <div style="background-color: ${col};" class="assigned-user">
//         <p>${firstLetters}</p>
//     </div>
//     `;
// };

// /**This function creates an HTML template if more users are specified that cannot be displayed due to a lack of space.*/
// function getMoreUser(quantity) {
//     return `
//     <p>+ ${quantity}</p>
//     `
// };

// /*** This function creates the HTML template for the overlay when the detail view is opened.*/
// function getOverlayDetails(id, classCategory, category, title, description, dueDate, priority, prioIcon) {
//     return `
//     <div class="content-overlay">
//         <div class="header-overlay">
//             <label class="category-overlay category-${classCategory}">${category}</label>
//             <div class="close-overlay">
//                 <img onclick="closeOverlay()" class="close-icon" src="./assets/icons/close.svg" alt="close">
//             </div>    
//         </div>
//         <h3>${title}</h3>
//         <p>${description}</p>
//         <div class="due-date-overlay">
//             <h4>Due date:</h4>
//             <p>${dateFormatter(dueDate)}</p>
//         </div>
//         <div class="priority-overlay">
//             <h4>Priority:</h4>
//             <div class="priority-container-overlay">
//                 <p>${priority}</p>
//                 <img src="${prioIcon}" alt="prioIcon">
//             </div>
//         </div>
//         <div>
//             <h4>Assigned To:</h4>
//             <div id="user-names-overlay">

//             </div>
//             <div id="more-user-overlay">

//             </div>
//         </div>
//         <h4 id="subtask-headline-overlay">Subtasks</h4>
//         <div>
//             <div id="subtasks-overlay">

//             </div>
//         </div>
// <h4 style="margin-top: 20px;">Attached files:</h4>
// <div class="task-file viewer-gallery" id="viewer-${id}"></div>


//         <div class="footer-overlay">
//             <div class="footer-link-overlay" id="delete-container" onclick="deleteTask(${id})">
//                 <svg class="ico" width="17" height="18" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M3.5 18C2.95 18 2.47917 17.8042 2.0875 17.4125C1.69583 17.0208 1.5 16.55 1.5 16V3C1.21667 3 0.979167 2.90417 0.7875 2.7125C0.595833 2.52083 0.5 2.28333 0.5 2C0.5 1.71667 0.595833 1.47917 0.7875 1.2875C0.979167 1.09583 1.21667 1 1.5 1H5.5C5.5 0.716667 5.59583 0.479167 5.7875 0.2875C5.97917 0.0958333 6.21667 0 6.5 0H10.5C10.7833 0 11.0208 0.0958333 11.2125 0.2875C11.4042 0.479167 11.5 0.716667 11.5 1H15.5C15.7833 1 16.0208 1.09583 16.2125 1.2875C16.4042 1.47917 16.5 1.71667 16.5 2C16.5 2.28333 16.4042 2.52083 16.2125 2.7125C16.0208 2.90417 15.7833 3 15.5 3V16C15.5 16.55 15.3042 17.0208 14.9125 17.4125C14.5208 17.8042 14.05 18 13.5 18H3.5ZM3.5 3V16H13.5V3H3.5ZM5.5 13C5.5 13.2833 5.59583 13.5208 5.7875 13.7125C5.97917 13.9042 6.21667 14 6.5 14C6.78333 14 7.02083 13.9042 7.2125 13.7125C7.40417 13.5208 7.5 13.2833 7.5 13V6C7.5 5.71667 7.40417 5.47917 7.2125 5.2875C7.02083 5.09583 6.78333 5 6.5 5C6.21667 5 5.97917 5.09583 5.7875 5.2875C5.59583 5.47917 5.5 5.71667 5.5 6V13ZM9.5 13C9.5 13.2833 9.59583 13.5208 9.7875 13.7125C9.97917 13.9042 10.2167 14 10.5 14C10.7833 14 11.0208 13.9042 11.2125 13.7125C11.4042 13.5208 11.5 13.2833 11.5 13V6C11.5 5.71667 11.4042 5.47917 11.2125 5.2875C11.0208 5.09583 10.7833 5 10.5 5C10.2167 5 9.97917 5.09583 9.7875 5.2875C9.59583 5.47917 9.5 5.71667 9.5 6V13Z" class="svg-fill"/>
//                 </svg>
//                 <p class="del">Delete</p>
//             </div>
//             <div>
//                 <span>|</span>
//             </div>
//             <div class="footer-link-overlay" id="edit-container" onclick="editTask(${id}, '${title}', '${description}', '${dueDate}', '${priority}')">
//                 <svg class="icor" width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
//                     <mask id="mask0_239929_2406" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25">
//                         <rect x="0.682129" y="0.396729" width="24" height="24" fill="#D9D9D9"/>
//                     </mask>
//                     <g mask="url(#mask0_239929_2406)">
//                         <path d="M5.68213 19.3967H7.08213L15.7071 10.7717L14.3071 9.37173L5.68213 17.9967V19.3967ZM19.9821 9.32173L15.7321 5.12173L17.1321 3.72173C17.5155 3.3384 17.9863 3.14673 18.5446 3.14673C19.103 3.14673 19.5738 3.3384 19.9571 3.72173L21.3571 5.12173C21.7405 5.50506 21.9405 5.96756 21.9571 6.50923C21.9738 7.0509 21.7905 7.5134 21.4071 7.89673L19.9821 9.32173ZM18.5321 10.7967L7.93213 21.3967H3.68213V17.1467L14.2821 6.54673L18.5321 10.7967Z"/>
//                     </g>
//                 </svg>
//                 <p class="edit">Edit</p>
//             </div>
//         </div
//     </div>    
//     `
// };

// /**This function creates an HTML template for the user in the overlay.*/
// function getUserNamesOverlay(firstLetter, userName, color) {
//     const col = __colBy(userName, '', '', color);
//     return `
//     <div class="username-overlay">
//         <div style="background-color: ${col};" id="assigned-user-overlay">
//             <p>${firstLetter}</p>
//         </div>
//         <p class="username">${userName}</p>
//     </div>
//     `;
// };

// /**This function creates an HTML template if there are more users in the task that cannot all be displayed in the overlay.*/
// function getMoreUserOverlay(quantity) {
//     return `
//     <p>... ${quantity} weitere.</p>
//     `
// };

// /**This function creates an HTML template for the overlay and the display of the subtasks.*/
// function getSubtasksOverlay(id, subtaskId, status, title, statusIcon) {
//     return `
//     <div class="subtask-overlay">
//         <a onclick="changeStatusSubtask('${id}', '${subtaskId}', '${status}')"><img src="${statusIcon}" alt="status"></a>
//         <p>${title}</p>
//     </div>    
//     `
// };

// /**This function creates an HTML template for the overlay and the edit mode.*/
// function getOverlayEdit(id, title, description, dueDate) {
//     return `
//     <div class="content-overlay">
//         <div class="header-overlay-edit">
//             <div class ="close-overlay">
//                 <img onclick="closeOverlay()" class="close-icon" src="./assets/icons/close.svg" alt="close">
//             </div>    
//         </div>
//         <div class="overlay-edit-container">
//             <div class="overlay-edit-container">
//                 <label class="edit-overlay-label"  for="title">Title</label>
//                 <input class="overlay-input-field" type="text" maxlength="20" placeholder="${title}" id="overlay-title">
//             </div>
//             <div class="overlay-edit-container">
//                 <label class="edit-overlay-label" for="description">Description</label>
//                 <textarea class="overlay-textarea" type="text" class="overlay-input-field" maxlength="50" placeholder="${description}" id="overlay-description"></textarea>
//             </div>
//             <div class="overlay-edit-container">
//                 <label class="edit-overlay-label" for="due-date">Due date</label>
//                 <div class="overlay-input-field-date">
//                     <input type="date" pattern="\d{2}/\d{2}/\d{4}" name="date" onkeypress="formatDueDate(event)" id="due-date-input" placeholder="${dueDate}" maxlength="10"/>
//                     <img src="./assets/icons/date_icon.svg" style="cursor: pointer;" alt ="calendar" id="calendar-icon">
//                 </div>
//             </div>
//             <div class="overlay-priority-container">
//                 <label for="priority">Priority</label>
//                 <div class="prio-label-container">
//                     <div onclick="changePriority('Urgent')" id="urgent-label" class="prio-label"><p id="urgent-text">Urgent</p><img id="urgent-icon" src="./assets/icons/urgent_icon.png" alt="urgent"></div>
//                     <div onclick="changePriority('Medium')" id="medium-label" class="prio-label"><p id="medium-text">Medium</p><img id="medium-icon"src="./assets/icons/medium_icon.png" alt="medium"></div>
//                     <div onclick="changePriority('Low')" id="low-label" class="prio-label"><p id="low-text">Low</p><img id="low-icon" src="./assets/icons/low_icon.png" alt="low"></div>
//                 </div>    
//             </div>
//             <div class="overlay-edit-container">
//                 <label class="edit-overlay-label" for="assigned-to">Assigned to</label>
//                 <div onclick="openDropdownAssigned(${id})" id="assigned-container" class="assigned-menu-overlay">
//                     <input type="text" placeholder="Select contacts"></input>
//                     <img id="arrow-dropdown" src="./assets/icons/arrow_drop_down.png">
//                 </div>
//             </div>          
//             </div>
//             <div class="d-none" id="selected-user-dropdown">
//                 <div class="dropdown-container" id="user-dropdown">

//                 </div>
//             </div>

//            <div id="user-names-edit-overlay"></div>

//          <div>
//         <div class="overlay-edit-container">
//         <label class="edit-overlay-label">Upload</label>
//        <div id="edit-overlay-file-preview">
//        </div>
//       </div>
//       </div>

// <div class="overlay-edit-container">
//                 <label class="edit-overlay-label" for="subtask-edit">Subtasks</label>
//                 <div class="overlay-edit-subtask">
//                     <input class="overlay-input-field" placeholder="Add subtask" type="text" name="subtask-edit" id="subtask-edit" maxlength="20"/>
//                     <div id="create-subtask-overlay" onclick="editMode(${id})">
//                         <img class="hover-container" id="add-subtask-overlay-edit" src="./assets/icons/add_subtask.png" alt="add">
//                     </div>
//                 </div>
//             </div>
//             <div id="warn-emptyinput-container">

//             </div>
//             <div id="subtasks-overlay-edit">

//             </div>
//             <div class="button-ok-container">
//                 <button class="button-ok" onclick="saveEdit(${id})"><p>Ok</p><img src="./assets/icons/check.svg" alt=""></button>
//             </div>
//         </div>
//     </div>   
//     `
// };

// /**This function returns the HTML template for the contact bubble.*/
// function getContactName(id,name,color,f1,f2,urlIcon){
//   const col = __colBy(name, '', id, color);
//   return `
// <div class="contact-container-overlay"
//      data-name="${name}" data-id="${id}"
//      onclick="rowToggleAssigned(this)">
//   <div class="user-name-overlay">
//     <div class="user-initials-overlay" style="background-color:${col}">
//       <p>${f1}${f2}</p>
//     </div>
//     <p class="user-name-text">${name}</p>
//   </div>
//   <div class="checkbox-cont">
//     <img id="checkbox-contact-${name}" src="${urlIcon}" class="toggle-icon" alt=""
//          onclick="event.stopPropagation(); rowToggleAssigned(this.closest('.contact-container-overlay'))">
//   </div>
// </div>`;
// };


// /**This function returns the HTML template for the initial letters of the user.*/
// function getUserInititalsOverlayEdit(color, firstLetter) {
//     const col = __colBy(firstLetter, '', '', color);
//     return `
//     <div style="background-color: ${col};" class="assigned-user-overlay-edit">
//         <p>${firstLetter}</p>
//     </div>
//     `;
// };

// /**This function returns the HTML template for the number of additional users that can no longer be displayed.*/
// function getMoreUserOverlayEdit(userslength) {
//     return `
//     <div class="user-initials-overlay">
//         <p>+ ${userslength}</p>
//     </div>
//     `
// };

// /**This function returns the HTML template for editing the subtasks.*/
// function getSubtaskOverlayIcons(id) {
//     return `
//     <div class="hover-container">
//         <img onclick="clearSubtaskInput()" id="add-subtask-overlay-edit" src="./assets/icons/close.png" alt="close">
//     </div>    
//     <p>|</p>
//     <div class="hover-container">
//         <img onclick="createSubtaskOverlay(${id})" id="add-subtask-overlay-edit" src="./assets/icons/check.png" alt="check">
//     </div>
//     `
// };

// /**This function returns the HTML template for the add icon when hovering.*/
// function getSubtaskOverlayAddIcon() {
//     return `
//     <div class="hover-container">
//         <img id="add-subtask-overlay-edit" src="./assets/icons/add_subtask.png" alt="add">
//     </div>
//     `
// };

// /**This function returns the HTML template for editing the subtasks in the overlay.*/
// function getSubtasksOverlayEdit(subtask, id, i) {
//     return `
//     <div class="overlay-edit-subtask-list" id="list-${i}">
//         <ul>
//             <li>${subtask}</li>
//         </ul>
//         <div class="subtask-edit-icons">
//             <img onclick="editSubtask(${id}, '${subtask}')" src="./assets/icons/edit_icon.png">
//             <p>|</p>
//             <img onclick="deleteSubtask(${id}, '${subtask}')" src="./assets/icons/delete_icon.png">
//         </div>
//     </div>
//     `
// };

// /**This function returns the HTML template when editing the subtasks in the overlay.*/
// function getSubtasksOverlayEditInput(subtask, id) {
//     return `
//     <input id="change-subtask-input" placeholder="${subtask}" maxlength="20"></input>
//     <div class="subtask-edit-icons">
//         <img onclick="deleteSubtask(${id}, '${subtask}')" src="./assets/icons/delete_icon.png">
//         <p>|</p>
//         <img onclick="saveEditSubtask(${id}, '${subtask}')" src="./assets/icons/check.png">
//     </div>
//     `
// };

// /**This function returns the HTML template which tells the user that the input field is empty.*/
// function getWarningEmptyInput() {
//     return `
//     <p>Please enter a change <br> to the subtask.</p>
//     `
// };




// /* ===== Konstanten (nur Markup-Snippets) ===== */
// const SVG_DELETE = `<svg class="ico" width="17" height="18" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 18C2.95 18 2.47917 17.8042 2.0875 17.4125C1.69583 17.0208 1.5 16.55 1.5 16V3C1.21667 3 0.979167 2.90417 0.7875 2.7125C0.595833 2.52083 0.5 2.28333 0.5 2C0.5 1.71667 0.595833 1.47917 0.7875 1.2875C0.979167 1.09583 1.21667 1 1.5 1H5.5C5.5 0.716667 5.59583 0.479167 5.7875 0.2875C5.97917 0.0958333 6.21667 0 6.5 0H10.5C10.7833 0 11.0208 0.0958333 11.2125 0.2875C11.4042 0.479167 11.5 0.716667 11.5 1H15.5C15.7833 1 16.0208 1.09583 16.2125 1.2875C16.4042 1.47917 16.5 1.71667 16.5 2C16.5 2.28333 16.4042 2.52083 16.2125 2.7125C16.0208 2.90417 15.7833 3 15.5 3V16C15.5 16.55 15.3042 17.0208 14.9125 17.4125C14.5208 17.8042 14.05 18 13.5 18H3.5ZM3.5 3V16H13.5V3H3.5ZM5.5 13C5.5 13.2833 5.59583 13.5208 5.7875 13.7125C5.97917 13.9042 6.21667 14 6.5 14C6.78333 14 7.02083 13.9042 7.2125 13.7125C7.40417 13.5208 7.5 13.2833 7.5 13V6C7.5 5.71667 7.40417 5.47917 7.2125 5.2875C7.02083 5.09583 6.78333 5 6.5 5C6.21667 5 5.97917 5.09583 5.7875 5.2875C5.59583 5.47917 5.5 5.71667 5.5 6V13ZM9.5 13C9.5 13.2833 9.59583 13.5208 9.7875 13.7125C9.97917 13.9042 10.2167 14 10.5 14C10.7833 14 11.0208 13.9042 11.2125 13.7125C11.4042 13.5208 11.5 13.2833 11.5 13V6C11.5 5.71667 11.4042 5.47917 11.2125 5.2875C11.0208 5.09583 10.7833 5 10.5 5C10.2167 5 9.97917 5.09583 9.7875 5.2875C9.59583 5.47917 9.5 5.71667 9.5 6V13Z" class="svg-fill"/></svg>`;
// const SVG_EDIT = `<svg class="icor" width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg"><mask id="mask0_239929_2406" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25"><rect x="0.682129" y="0.396729" width="24" height="24" fill="#D9D9D9"/></mask><g mask="url(#mask0_239929_2406)"><path d="M5.68213 19.3967H7.08213L15.7071 10.7717L14.3071 9.37173L5.68213 17.9967V19.3967ZM19.9821 9.32173L15.7321 5.12173L17.1321 3.72173C17.5155 3.3384 17.9863 3.14673 18.5446 3.14673C19.103 3.14673 19.5738 3.3384 19.9571 3.72173L21.3571 5.12173C21.7405 5.50506 21.9405 5.96756 21.9571 6.50923C21.9738 7.0509 21.7905 7.5134 21.4071 7.89673L19.9821 9.32173ZM18.5321 10.7967L7.93213 21.3967H3.68213V17.1467L14.2821 6.54673L18.5321 10.7967Z"/></g></svg>`;
// const SEP = `<div><span>|</span></div>`;
// const CLOSE_BTN = `<div class="close-overlay"><img onclick="closeOverlay()" class="close-icon" src="./assets/icons/close.svg" alt="close"></div>`;
// const ASSIGNED_HEAD = `<div><h4>Assigned To:</h4><div id="user-names-overlay"></div><div id="more-user-overlay"></div></div>`;
// const SUBTASKS_BLOCK = `<h4 id="subtask-headline-overlay">Subtasks</h4><div><div id="subtasks-overlay"></div></div>`;

// /* ===== One-Line-Helper (Output identisch) ===== */
// const _ovHeader = (cls, cat) => `<div class="header-overlay"><label class="category-overlay category-${cls}">${cat}</label>${CLOSE_BTN}</div>`;
// const _ovDue = d => `<div class="due-date-overlay"><h4>Due date:</h4><p>${dateFormatter(d)}</p></div>`;
// const _ovPrio = (t, i) => `<div class="priority-overlay"><h4>Priority:</h4><div class="priority-container-overlay"><p>${t}</p><img src="${i}" alt="prioIcon"></div></div>`;
// const _ovFiles = id => `<h4 style="margin-top:20px;">Attached files:</h4><div class="task-file viewer-gallery" id="viewer-${id}"></div>`;
// const _edHeader = () => `<div class="header-overlay-edit">${CLOSE_BTN}</div>`;
// const _edTitle = t => `<div class="overlay-edit-container"><label class="edit-overlay-label" for="title">Title</label><input class="overlay-input-field" type="text" maxlength="20" placeholder="${t}" id="overlay-title"></div>`;
// const _edDesc = d => `<div class="overlay-edit-container"><label class="edit-overlay-label" for="description">Description</label><textarea class="overlay-textarea" maxlength="50" placeholder="${d}" id="overlay-description"></textarea></div>`;
// const _edDate = v => `<div class="overlay-edit-container"><label class="edit-overlay-label" for="due-date">Due date</label><div class="overlay-input-field-date"><input type="date" pattern="\\d{2}/\\d{2}/\\d{4}" name="date" onkeypress="formatDueDate(event)" id="due-date-input" placeholder="${v}" maxlength="10"/><img src="./assets/icons/date_icon.svg" style="cursor:pointer;" alt="calendar" id="calendar-icon"></div></div>`;
// const _edPrio = () => `<div class="overlay-priority-container"><label for="priority">Priority</label><div class="prio-label-container"><div onclick="changePriority('Urgent')" id="urgent-label" class="prio-label"><p id="urgent-text">Urgent</p><img id="urgent-icon" src="./assets/icons/urgent_icon.png" alt="urgent"></div><div onclick="changePriority('Medium')" id="medium-label" class="prio-label"><p id="medium-text">Medium</p><img id="medium-icon" src="./assets/icons/medium_icon.png" alt="medium"></div><div onclick="changePriority('Low')" id="low-label" class="prio-label"><p id="low-text">Low</p><img id="low-icon" src="./assets/icons/low_icon.png" alt="low"></div></div></div>`;
// const _edAssign = id => `<div class="overlay-edit-container"><label class="edit-overlay-label" for="assigned-to">Assigned to</label><div onclick="openDropdownAssigned(${id})" id="assigned-container" class="assigned-menu-overlay"><input type="text" placeholder="Select contacts"><img id="arrow-dropdown" src="./assets/icons/arrow_drop_down.png"></div></div><div class="d-none" id="selected-user-dropdown"><div class="dropdown-container" id="user-dropdown"></div></div><div id="user-names-edit-overlay"></div>`;
// const _edUpload = () => `<div><div class="overlay-edit-container"><label class="edit-overlay-label">Upload</label><div id="edit-overlay-file-preview"></div></div></div>`;
// const _edSubBlock = id => `<div class="overlay-edit-container"><label class="edit-overlay-label" for="subtask-edit">Subtasks</label><div class="overlay-edit-subtask"><input class="overlay-input-field" placeholder="Add subtask" type="text" name="subtask-edit" id="subtask-edit" maxlength="20"/><div class="hover-container" id="create-subtask-overlay" onclick="editMode(${id})"><img class="hover-container" id="add-subtask-overlay-edit" src="./assets/icons/add_subtask.png" alt="add"></div></div></div><div id="warn-emptyinput-container"></div><div id="subtasks-overlay-edit"></div>`;
// const _edOk = id => `<div class="button-ok-container"><button class="button-ok" onclick="saveEdit(${id})"><p>Ok</p><img src="./assets/icons/check.svg" alt=""></button></div>`;

// /* ===== Öffentliche API (alle ≤14 Zeilen) ===== */
// function __colBy(name, email, id, color) {
//     if (typeof color === 'string' && /^#?[0-9A-F]{6}$/i.test(color))
//         return color[0] === '#' ? color : '#' + color;
//     if (typeof ensureColor === 'function')
//         return ensureColor({ name: name || '', email: email || '', id: id || '' });
//     return '#6E52FF';
// }

// function getTask(id, category, classCategory, title, description, prioIcon) {
//     return `<div class="task-card" id="${id}" draggable="true" ondragstart="startDragging(${id})" ondragend="removeDragging(${id})" ontouchstart="onTouch(event, ${id});" ontouchend="cancel()" ontouchmove="cancel()" onclick="showOverlayDetailsTask(${id}); event.stopPropagation()"><div><label class="category-${classCategory}">${category}</label></div><h4>${title}</h4><p class="description-p">${description}</p><div class="subtasks" id="subtask-${id}"></div><div class="task-footer"><div class="assigned-task"><div id="assigned-user-${id}" class="assigned-user-container"></div><div class="more-user" id="more-user-${id}"></div></div><button><img src=${prioIcon} alt="priority"></button></div></div>`;
// }

// function getClearList(list) {
//     return `<div class="list-no-task"><p>No tasks ${list}</p></div>`;
// }

// function getSubtask(doneTasks, allSubtasks, progress) {
//     return `<div class="progress-border"><div id="subtask-progress" class="subtask-progress" style="width:${progress}%;"></div></div><p>${doneTasks}/${allSubtasks} Subtasks</p>`;
// }

// function getFirstLetterName(firstLetters, color) {
//     const col = __colBy(firstLetters, '', '', color);
//     return `<div style="background-color:${col};" class="assigned-user"><p>${firstLetters}</p></div>`;
// }

// function getMoreUser(quantity) {
//     return `<p>+ ${quantity}</p>`;
// }

// function getOverlayDetails(id, classCategory, category, title, description, dueDate, priority, prioIcon) {
//     return `<div class="content-overlay">${_ovHeader(classCategory, category)}<h3>${title}</h3><p>${description}</p>${_ovDue(dueDate)}${_ovPrio(priority, prioIcon)}${ASSIGNED_HEAD}${SUBTASKS_BLOCK}${_ovFiles(id)}<div class="footer-overlay"><div class="footer-link-overlay" id="delete-container" onclick="deleteTask(${id})">${SVG_DELETE}<p class="del">Delete</p></div>${SEP}<div class="footer-link-overlay" id="edit-container" onclick="editTask(${id}, '${title}', '${description}', '${dueDate}', '${priority}')">${SVG_EDIT}<p class="edit">Edit</p></div></div></div>`;
// }

// function getUserNamesOverlay(firstLetter, userName, color) {
//     const col = __colBy(userName, '', '', color);
//     return `<div class="username-overlay"><div style="background-color:${col};" id="assigned-user-overlay"><p>${firstLetter}</p></div><p class="username">${userName}</p></div>`;
// }

// function getMoreUserOverlay(quantity) {
//     return `<p>... ${quantity} weitere.</p>`;
// }

// function getSubtasksOverlay(id, subtaskId, status, title, statusIcon) {
//     return `<div class="subtask-overlay"><a onclick="changeStatusSubtask('${id}','${subtaskId}','${status}')"><img src="${statusIcon}" alt="status"></a><p>${title}</p></div>`;
// }

// function getOverlayEdit(id, title, description, dueDate) {
//     return `<div class="content-overlay">${_edHeader()}<div class="overlay-edit-container">${_edTitle(title)}${_edDesc(description)}${_edDate(dueDate)}${_edPrio()}${_edAssign(id)}${_edUpload()}${_edSubBlock(id)}${_edOk(id)}</div></div>`;
// }

// function getContactName(id, name, color, f1, f2, urlIcon) {
//     const col = __colBy(name, '', id, color);
//     return `<div class="contact-container-overlay" data-name="${name}" data-id="${id}" onclick="rowToggleAssigned(this)"><div class="user-name-overlay"><div class="user-initials-overlay" style="background-color:${col}"><p>${f1}${f2}</p></div><p class="user-name-text">${name}</p></div><div class="checkbox-cont"><img id="checkbox-contact-${name}" src="${urlIcon}" class="toggle-icon" alt="" onclick="event.stopPropagation(); rowToggleAssigned(this.closest('.contact-container-overlay'))"></div></div>`;
// }

// function getUserInititalsOverlayEdit(color, firstLetter) {
//     const col = __colBy(firstLetter, '', '', color);
//     return `<div style="background-color:${col};" class="assigned-user-overlay-edit"><p>${firstLetter}</p></div>`;
// }

// function getMoreUserOverlayEdit(userslength) {
//     return `<div class="user-initials-overlay"><p>+ ${userslength}</p></div>`;
// }

// function getSubtaskOverlayIcons(id) {
//     return `<div class="hover-container"><img onclick="clearSubtaskInput()" id="add-subtask-overlay-edit" src="./assets/icons/close.png" alt="close"></div><p>|</p><div class="hover-container"><img onclick="createSubtaskOverlay(${id})" id="add-subtask-overlay-edit" src="./assets/icons/check.png" alt="check"></div>`;
// }

// function getSubtaskOverlayAddIcon() {
//     return `<div class="hover-container"><img id="add-subtask-overlay-edit" src="./assets/icons/add_subtask.png" alt="add"></div>`;
// }

// function getSubtasksOverlayEdit(subtask, id, i) {
//     return `<div class="overlay-edit-subtask-list" id="list-${i}"><ul><li>${subtask}</li></ul><div class="subtask-edit-icons"><img onclick="editSubtask(${id}, '${subtask}')" src="./assets/icons/edit_icon.png"><p>|</p><img onclick="deleteSubtask(${id}, '${subtask}')" src="./assets/icons/delete_icon.png"></div></div>`;
// }

// function getSubtasksOverlayEditInput(subtask, id) {
//     return `<input id="change-subtask-input" placeholder="${subtask}" maxlength="20"><div class="subtask-edit-icons"><img onclick="deleteSubtask(${id}, '${subtask}')" src="./assets/icons/delete_icon.png"><p>|</p><img onclick="saveEditSubtask(${id}, '${subtask}')" src="./assets/icons/check.png"></div>`;
// }

// function getWarningEmptyInput() {
//     return `<p>Please enter a change <br> to the subtask.</p>`;
// }











































/* ===== Konstanten (nur Markup-Snippets) ===== */
const SVG_DELETE = `
<svg class="ico" width="17" height="18" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M3.5 18C2.95 18 2.47917 17.8042 2.0875 17.4125C1.69583 17.0208 1.5 16.55 1.5 16V3C1.21667 3 0.979167 2.90417 0.7875 2.7125C0.595833 2.52083 0.5 2.28333 0.5 2C0.5 1.71667 0.595833 1.47917 0.7875 1.2875C0.979167 1.09583 1.21667 1 1.5 1H5.5C5.5 0.716667 5.59583 0.479167 5.7875 0.2875C5.97917 0.0958333 6.21667 0 6.5 0H10.5C10.7833 0 11.0208 0.0958333 11.2125 0.2875C11.4042 0.479167 11.5 0.716667 11.5 1H15.5C15.7833 1 16.0208 1.09583 16.2125 1.2875C16.4042 1.47917 16.5 1.71667 16.5 2C16.5 2.28333 16.4042 2.52083 16.2125 2.7125C16.0208 2.90417 15.7833 3 15.5 3V16C15.5 16.55 15.3042 17.0208 14.9125 17.4125C14.5208 17.8042 14.05 18 13.5 18H3.5ZM3.5 3V16H13.5V3H3.5ZM5.5 13C5.5 13.2833 5.59583 13.5208 5.7875 13.7125C5.97917 13.9042 6.21667 14 6.5 14C6.78333 14 7.02083 13.9042 7.2125 13.7125C7.40417 13.5208 7.5 13.2833 7.5 13V6C7.5 5.71667 7.40417 5.47917 7.2125 5.2875C7.02083 5.09583 6.78333 5 6.5 5C6.21667 5 5.97917 5.09583 5.7875 5.2875C5.59583 5.47917 5.5 5.71667 5.5 6V13ZM9.5 13C9.5 13.2833 9.59583 13.5208 9.7875 13.7125C9.97917 13.9042 10.2167 14 10.5 14C10.7833 14 11.0208 13.9042 11.2125 13.7125C11.4042 13.5208 11.5 13.2833 11.5 13V6C11.5 5.71667 11.4042 5.47917 11.2125 5.2875C11.02083 5.09583 10.78333 5 10.5 5C10.2167 5 9.97917 5.09583 9.7875 5.2875C9.59583 5.47917 9.5 5.71667 9.5 6V13Z"
    class="svg-fill"
  />
</svg>`;

const SVG_EDIT = `
<svg class="icor" width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
  <mask id="mask0_239929_2406" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25">
    <rect x="0.682129" y="0.396729" width="24" height="24" fill="#D9D9D9"/>
  </mask>
  <g mask="url(#mask0_239929_2406)">
    <path d="M5.68213 19.3967H7.08213L15.7071 10.7717L14.3071 9.37173L5.68213 17.9967V19.3967ZM19.9821 9.32173L15.7321 5.12173L17.1321 3.72173C17.5155 3.3384 17.9863 3.14673 18.5446 3.14673C19.103 3.14673 19.5738 3.3384 19.9571 3.72173L21.3571 5.12173C21.7405 5.50506 21.9405 5.96756 21.9571 6.50923C21.9738 7.0509 21.7905 7.5134 21.4071 7.89673L19.9821 9.32173ZM18.5321 10.7967L7.93213 21.3967H3.68213V17.1467L14.2821 6.54673L18.5321 10.7967Z"/>
  </g>
</svg>`;

const SEP = `
<div>
  <span>|</span>
</div>`;

const CLOSE_BTN = `
<div class="close-overlay">
  <img onclick="closeOverlay()" class="close-icon" src="./assets/icons/close.svg" alt="close">
</div>`;

const ASSIGNED_HEAD = `
<div>
  <h4>Assigned To:</h4>
  <div id="user-names-overlay"></div>
  <div id="more-user-overlay"></div>
</div>`;

const SUBTASKS_BLOCK = `
<h4 id="subtask-headline-overlay">Subtasks</h4>
<div>
  <div id="subtasks-overlay"></div>
</div>`;


/* ===== One-Line-Helper (Output identisch) ===== */
const _ovHeader = (cls, cat) => `
<div class="header-overlay">
  <label class="category-overlay category-${cls}">${cat}</label>
  ${CLOSE_BTN}
</div>`;

const _ovDue = d => `
<div class="due-date-overlay">
  <h4>Due date:</h4>
  <p>${dateFormatter(d)}</p>
</div>`;

const _ovPrio = (t, i) => `
<div class="priority-overlay">
  <h4>Priority:</h4>
  <div class="priority-container-overlay">
    <p>${t}</p>
    <img src="${i}" alt="prioIcon">
  </div>
</div>`;

const _ovFiles = id => `
<h4 style="margin-top:20px;">Attached files:</h4>
<div class="task-file viewer-gallery" id="viewer-${id}"></div>`;

const _edHeader = () => `
<div class="header-overlay-edit">
  ${CLOSE_BTN}
</div>`;

const _edTitle = t => `
<div class="overlay-edit-container">
  <label class="edit-overlay-label" for="title">Title</label>
  <input class="overlay-input-field" type="text" maxlength="20" placeholder="${t}" id="overlay-title">
</div>`;

const _edDesc = d => `
<div class="overlay-edit-container">
  <label class="edit-overlay-label" for="description">Description</label>
  <textarea class="overlay-textarea" maxlength="50" placeholder="${d}" id="overlay-description"></textarea>
</div>`;

const _edDate = v => `
<div class="overlay-edit-container">
  <label class="edit-overlay-label" for="due-date-input">Due date</label>
  <div class="overlay-input-field-date">
    <input
      id="due-date-input"
      type="text"
      placeholder="dd/mm/yyyy"
      inputmode="numeric"
      autocomplete="off"
      maxlength="10"
      aria-label="Due date"
    />
    <img src="./assets/icons/date_icon.svg" style="cursor:pointer;" alt="calendar" id="calendar-icon">
  </div>
</div>`;



const _edPrio = () => `
<div class="overlay-priority-container">
  <label for="priority">Priority</label>
  <div class="prio-label-container">
    <div onclick="changePriority('Urgent')" id="urgent-label" class="prio-label">
      <p id="urgent-text">Urgent</p>
      <img id="urgent-icon" src="./assets/icons/urgent_icon.png" alt="urgent">
    </div>
    <div onclick="changePriority('Medium')" id="medium-label" class="prio-label">
      <p id="medium-text">Medium</p>
      <img id="medium-icon" src="./assets/icons/medium_icon.png" alt="medium">
    </div>
    <div onclick="changePriority('Low')" id="low-label" class="prio-label">
      <p id="low-text">Low</p>
      <img id="low-icon" src="./assets/icons/low_icon.png" alt="low">
    </div>
  </div>
</div>`;

const _edAssign = id => `
<div class="overlay-edit-container">
  <label class="edit-overlay-label" for="assigned-to">Assigned to</label>
  <div onclick="openDropdownAssigned(${id})" id="assigned-container" class="assigned-menu-overlay">
    <input type="text" placeholder="Select contacts">
    <img id="arrow-dropdown" src="./assets/icons/arrow_drop_down.png">
  </div>
</div>
<div class="d-none" id="selected-user-dropdown">
  <div class="dropdown-container" id="user-dropdown"></div>
</div>
<div id="user-names-edit-overlay"></div>`;

const _edUpload = () => `
<div>
  <div class="overlay-edit-container">
    <label class="edit-overlay-label">Upload</label>
    <div id="edit-overlay-file-preview"></div>
  </div>
</div>`;

const _edSubBlock = id => `
<div class="overlay-edit-container">
  <label class="edit-overlay-label" for="subtask-edit">Subtasks</label>
  <div class="overlay-edit-subtask">
    <input
      class="overlay-input-field"
      placeholder="Add subtask"
      type="text"
      name="subtask-edit"
      id="subtask-edit"
      maxlength="20"
    />
    <div class="hover-container" id="create-subtask-overlay" onclick="editMode(${id})">
      <img class="hover-container" id="add-subtask-overlay-edit" src="./assets/icons/add_subtask.png" alt="add">
    </div>
  </div>
</div>
<div id="warn-emptyinput-container"></div>
<div id="subtasks-overlay-edit"></div>`;

const _edOk = id => `
<div class="button-ok-container">
  <button class="button-ok" onclick="saveEdit(${id})">
    <p>Ok</p>
    <img src="./assets/icons/check.svg" alt="">
  </button>
</div>`;


/* ===== Zusätzliche kleine Template-Helper zur Aufteilung ===== */
const _taskHeader = (classCategory, category) => `
<div>
  <label class="category-${classCategory}">${category}</label>
</div>`;

const _taskMain = (id, title, description) => `
<h4>${title}</h4>
<p class="description-p">${description}</p>
<div class="subtasks" id="subtask-${id}"></div>`;

const _taskFooter = (id, prioIcon) => `
<div class="task-footer">
  <div class="assigned-task">
    <div id="assigned-user-${id}" class="assigned-user-container"></div>
    <div class="more-user" id="more-user-${id}"></div>
  </div>
  <button>
    <img src=${prioIcon} alt="priority">
  </button>
</div>`;

const _detailsBody = (classCategory, category, title, description, dueDate, priority, prioIcon, id) => `
${_ovHeader(classCategory, category)}
<h3>${title}</h3>
<p>${description}</p>
${_ovDue(dueDate)}
${_ovPrio(priority, prioIcon)}
${ASSIGNED_HEAD}
${SUBTASKS_BLOCK}
${_ovFiles(id)}
`;


/* ===== Öffentliche API (alle ≤ 13 Zeilen) ===== */
function __colBy(name, email, id, color) {
  if (typeof color === 'string' && /^#?[0-9A-F]{6}$/i.test(color))
    return color[0] === '#' ? color : '#' + color;
  if (typeof ensureColor === 'function')
    return ensureColor({ name: name || '', email: email || '', id: id || '' });
  return '#6E52FF';
}

function getTask(id, category, classCategory, title, description, prioIcon) {
  return `
  <div class="task-card" id="${id}"
       draggable="true"
       ondragstart="startDragging(${id})"
       ondragend="removeDragging(${id})"
       ontouchstart="onTouch(event, ${id});"
       ontouchend="cancel()"
       ontouchmove="cancel()"
       onclick="showOverlayDetailsTask(${id}); event.stopPropagation()">
    ${_taskHeader(classCategory, category)}
    ${_taskMain(id, title, description)}
    ${_taskFooter(id, prioIcon)}
  </div>`;
}

function getClearList(list) {
  return `
  <div class="list-no-task">
    <p>No tasks ${list}</p>
  </div>`;
}

function getSubtask(doneTasks, allSubtasks, progress) {
  return `
  <div class="progress-border">
    <div id="subtask-progress" class="subtask-progress" style="width:${progress}%;"></div>
  </div>
  <p>${doneTasks}/${allSubtasks} Subtasks</p>`;
}

function getFirstLetterName(firstLetters, color) {
  const col = __colBy(firstLetters, '', '', color);
  return `
  <div style="background-color:${col};" class="assigned-user">
    <p>${firstLetters}</p>
  </div>`;
}

function getMoreUser(quantity) {
  return `<p>+ ${quantity}</p>`;
}

function getOverlayDetails(id, classCategory, category, title, description, dueDate, priority, prioIcon) {
  return `
  <div class="content-overlay">
    ${_detailsBody(classCategory, category, title, description, dueDate, priority, prioIcon, id)}
    <div class="footer-overlay">
      <div class="footer-link-overlay" id="delete-container" onclick="deleteTask(${id})">
        ${SVG_DELETE}
        <p class="del">Delete</p>
      </div>
      ${SEP}
      <div class="footer-link-overlay" id="edit-container"
           onclick="editTask(${id}, '${title}', '${description}', '${dueDate}', '${priority}')">
        ${SVG_EDIT}
        <p class="edit">Edit</p>
      </div>
    </div>
  </div>`;
}

function getUserNamesOverlay(firstLetter, userName, color) {
  const col = __colBy(userName, '', '', color);
  return `
  <div class="username-overlay">
    <div style="background-color:${col};" id="assigned-user-overlay">
      <p>${firstLetter}</p>
    </div>
    <p class="username">${userName}</p>
  </div>`;
}

function getMoreUserOverlay(quantity) {
  return `<p>... ${quantity} weitere.</p>`;
}

function getSubtasksOverlay(id, subtaskId, status, title, statusIcon) {
  return `
  <div class="subtask-overlay">
    <a onclick="changeStatusSubtask('${id}','${subtaskId}','${status}')">
      <img src="${statusIcon}" alt="status">
    </a>
    <p>${title}</p>
  </div>`;
}

function getOverlayEdit(id, title, description, dueDate) {
  return `
  <div class="content-overlay">
    ${_edHeader()}
    <div class="overlay-edit-container">
      ${_edTitle(title)}
      ${_edDesc(description)}
      ${_edDate(dueDate)}
      ${_edPrio()}
      ${_edAssign(id)}
      ${_edUpload()}
      ${_edSubBlock(id)}
      ${_edOk(id)}
    </div>
  </div>`;
}

function getContactName(id, name, color, f1, f2, urlIcon) {
  const col = __colBy(name, '', id, color);
  return `
  <div class="contact-container-overlay" data-name="${name}" data-id="${id}" onclick="rowToggleAssigned(this)">
    <div class="user-name-overlay">
      <div class="user-initials-overlay" style="background-color:${col}">
        <p>${f1}${f2}</p>
      </div>
      <p class="user-name-text">${name}</p>
    </div>
    <div class="checkbox-cont">
      <img id="checkbox-contact-${name}" src="${urlIcon}" class="toggle-icon" alt=""
           onclick="event.stopPropagation(); rowToggleAssigned(this.closest('.contact-container-overlay'))">
    </div>
  </div>`;
}

function getUserInititalsOverlayEdit(color, firstLetter) {
  const col = __colBy(firstLetter, '', '', color);
  return `
  <div style="background-color:${col};" class="assigned-user-overlay-edit">
    <p>${firstLetter}</p>
  </div>`;
}

function getMoreUserOverlayEdit(userslength) {
  return `
  <div class="user-initials-overlay">
    <p>+ ${userslength}</p>
  </div>`;
}

function getSubtaskOverlayIcons(id) {
  return `
  <div class="hover-container">
    <img onclick="clearSubtaskInput()" id="add-subtask-overlay-edit" src="./assets/icons/close.png" alt="close">
  </div>
  <p>|</p>
  <div class="hover-container">
    <img onclick="createSubtaskOverlay(${id})" id="add-subtask-overlay-edit" src="./assets/icons/check.png" alt="check">
  </div>`;
}

function getSubtaskOverlayAddIcon() {
  return `
  <div class="hover-container">
    <img id="add-subtask-overlay-edit" src="./assets/icons/add_subtask.png" alt="add">
  </div>`;
}

function getSubtasksOverlayEdit(subtask, id, i) {
  return `
  <div class="overlay-edit-subtask-list" id="list-${i}">
    <ul><li>${subtask}</li></ul>
    <div class="subtask-edit-icons">
      <img onclick="editSubtask(${id}, '${subtask}')" src="./assets/icons/edit_icon.png">
      <p>|</p>
      <img onclick="deleteSubtask(${id}, '${subtask}')" src="./assets/icons/delete_icon.png">
    </div>
  </div>`;
}

function getSubtasksOverlayEditInput(subtask, id) {
  return `
  <input id="change-subtask-input" placeholder="${subtask}" maxlength="20">
  <div class="subtask-edit-icons">
    <img onclick="deleteSubtask(${id}, '${subtask}')" src="./assets/icons/delete_icon.png">
    <p>|</p>
    <img onclick="saveEditSubtask(${id}, '${subtask}')" src="./assets/icons/check.png">
  </div>`;
}

function getWarningEmptyInput() {
  return `
  <p>Please enter a change <br> to the subtask.</p>`;
}
