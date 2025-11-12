/** Resolve a stable display color (hex) for a user or fallback. */
function __colBy(name, email, id, color) {
  if (typeof color === 'string' && /^#?[0-9A-F]{6}$/i.test(color))
    return color[0] === '#' ? color : '#' + color;
  if (typeof ensureColor === 'function')
    return ensureColor({ name: name || '', email: email || '', id: id || '' });
  return '#6E52FF';
};

/** Build a draggable task card markup. */
function getTask(id, category, classCategory, title, description, prioIcon) {
  return `
  <div class="task-card" id="${id}" role="article"
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
};

/** Render an empty-list placeholder. */
function getClearList(list) {
  return `
  <div class="list-no-task" role="status" aria-live="polite">
    <p>No tasks ${list}</p>
  </div>`;
};

/** Render a subtask progress bar with counts. */
function getSubtask(doneTasks, allSubtasks, progress) {
  return `
  <div class="progress-border" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
    <div id="subtask-progress" class="subtask-progress" style="width:${progress}%;"></div>
  </div>
  <p>${doneTasks}/${allSubtasks} Subtasks</p>`;
};

/** Render assigned user initials badge. */
function getFirstLetterName(firstLetters, color) {
  const col = __colBy(firstLetters, '', '', color);
  return `
  <div style="background-color:${col};" class="assigned-user" role="listitem" aria-label="User initials ${firstLetters}">
    <p>${firstLetters}</p>
  </div>`;
};

/** Render the "+N more users" label. */
function getMoreUser(quantity) {
  return `<p aria-label="More users">+ ${quantity}</p>`;
};

/** Build the task details overlay content. */
function getOverlayDetails(id, classCategory, category, title, description, dueDate, priority, prioIcon) {
  return `
  <div class="content-overlay" role="dialog" aria-modal="true" aria-labelledby="task-title-details">
    ${_detailsBody(classCategory, category, title, description, dueDate, priority, prioIcon, id)}
    <div class="footer-overlay">
      <div class="footer-link-overlay" id="delete-container" onclick="deleteTask(${id})" role="button" tabindex="0" aria-label="Delete task">
        ${SVG_DELETE}
        <p class="del">Delete</p></div>
      ${SEP}
      <div class="footer-link-overlay" id="edit-container"
           onclick="editTask(${id}, '${title}', '${description}', '${dueDate}', '${priority}')" role="button" tabindex="0" aria-label="Edit task">
        ${SVG_EDIT}
        <p class="edit">Edit</p></div>
    </div>
  </div>`;
};

/** Render one assigned username row for details overlay. */
function getUserNamesOverlay(firstLetter, userName, color) {
  const col = __colBy(userName, '', '', color);
  return `
  <div class="username-overlay" role="listitem">
    <div style="background-color:${col};" id="assigned-user-overlay" aria-hidden="true">
      <p>${firstLetter}</p>
    </div>
    <p class="username">${userName}</p>
  </div>`;
};

/** Render the "... N more" text for assigned users in overlay. */
function getMoreUserOverlay(quantity) {
  return `<p aria-label="More assigned users">... ${quantity} weitere.</p>`;
};

/** Render a single subtask row with toggle control. */
function getSubtasksOverlay(id, subtaskId, status, title, statusIcon) {
  const checked = status === 'done' ? 'true' : 'false';
  return `
  <div class="subtask-overlay" role="listitem">
    <a role="switch" aria-checked="${checked}" tabindex="0" onclick="changeStatusSubtask('${id}','${subtaskId}','${status}')">
      <img src="${statusIcon}" alt="">
    </a>
    <p>${title}</p>
  </div>`;
};

/** Build the edit overlay scaffold with all editable sections. */
function getOverlayEdit(id, title, description, dueDate) {
  return `
  <div class="content-overlay" role="dialog" aria-modal="true" aria-label="Edit task">
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
};

/** Render a contact row inside the assignee dropdown. */
function getContactName(id, name, color, f1, f2, urlIcon) {
  const col = __colBy(name, '', id, color);
  return `
  <div class="contact-container-overlay" data-name="${name}" data-id="${id}" onclick="rowToggleAssigned(this)" role="option" aria-selected="false">
    <div class="user-name-overlay">
      <div class="user-initials-overlay" style="background-color:${col}" aria-hidden="true">
        <p>${f1}${f2}</p></div>
      <p class="user-name-text">${name}</p>
    </div>
    <div class="checkbox-cont">
      <img id="checkbox-contact-${name}" src="${urlIcon}" class="toggle-icon" alt="toggle-Icon"
           role="button" tabindex="0"
           onclick="event.stopPropagation(); rowToggleAssigned(this.closest('.contact-container-overlay'))"></div>
  </div>`;
};

/** Render one initials bubble for the edit overlay. */
function getUserInititalsOverlayEdit(color, firstLetter) {
  const col = __colBy(firstLetter, '', '', color);
  return `
  <div style="background-color:${col};" class="assigned-user-overlay-edit" role="listitem" aria-label="Assigned ${firstLetter}">
    <p>${firstLetter}</p>
  </div>`;
};

/** Render the "+N" bubble for extra users in edit overlay. */
function getMoreUserOverlayEdit(userslength) {
  return `
  <div class="user-initials-overlay" role="status" aria-label="More users">
    <p>+ ${userslength}</p>
  </div>`;
};

/** Render confirm/cancel icons for subtask input row. */
function getSubtaskOverlayIcons(id) {
  return `
  <div class="hover-container" role="group" aria-label="Subtask confirm/cancel">
    <img onclick="clearSubtaskInput()" id="add-subtask-overlay-edit" src="./assets/icons/close.png" alt="cancel subtask">
  </div>
  <span aria-hidden="true">|</span>
  <div class="hover-container">
    <img onclick="createSubtaskOverlay(${id})" id="add-subtask-overlay-edit" src="./assets/icons/check.png" alt="confirm subtask">
  </div>`;
};

/** Render the default "add subtask" icon button. */
function getSubtaskOverlayAddIcon() {
  return `
  <div class="hover-container">
    <img id="add-subtask-overlay-edit" src="./assets/icons/add_subtask.png" alt="add subtask">
  </div>`;
};

/** Render one existing subtask line with edit/delete actions. */
function getSubtasksOverlayEdit(subtask, id, i) {
  return `
  <div class="overlay-edit-subtask-list" id="list-${i}" role="listitem">
    <ul><li>${subtask}</li></ul>
    <div class="subtask-edit-icons">
      <img onclick="editSubtask(${id}, '${subtask}')" src="./assets/icons/edit_icon.png" role="button" tabindex="0" aria-label="Edit subtask">
      <p aria-hidden="true">|</p>
      <img onclick="deleteSubtask(${id}, '${subtask}')" src="./assets/icons/delete_icon.png" role="button" tabindex="0" aria-label="Delete subtask">
    </div>
  </div>`;
};

/** Render the inline editor for a specific subtask. */
function getSubtasksOverlayEditInput(subtask, id) {
  return `
  <input id="change-subtask-input" placeholder="${subtask}" maxlength="20" aria-label="Change subtask">
  <div class="subtask-edit-icons">
    <img onclick="deleteSubtask(${id}, '${subtask}')" src="./assets/icons/delete_icon.png" role="button" tabindex="0" aria-label="Delete subtask">
    <p aria-hidden="true">|</p>
    <img onclick="saveEditSubtask(${id}, '${subtask}')" src="./assets/icons/check.png" role="button" tabindex="0" aria-label="Save subtask">
  </div>`;
};

/** Render warning text when subtask input is empty. */
function getWarningEmptyInput() {
  return `
  <p role="alert">Please enter a change <br> to the subtask.</p>`;
};
