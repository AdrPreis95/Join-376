
const SVG_DELETE = `
<svg class="ico" width="17" height="18" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Delete">
  <path
    d="M3.5 18C2.95 18 2.47917 17.8042 2.0875 17.4125C1.69583 17.0208 1.5 16.55 1.5 16V3C1.21667 3 0.979167 2.90417 0.7875 2.7125C0.595833 2.52083 0.5 2.28333 0.5 2C0.5 1.71667 0.595833 1.47917 0.7875 1.2875C0.979167 1.09583 1.21667 1 1.5 1H5.5C5.5 0.716667 5.59583 0.479167 5.7875 0.2875C5.97917 0.0958333 6.21667 0 6.5 0H10.5C10.7833 0 11.0208 0.0958333 11.2125 0.2875C11.4042 0.479167 11.5 0.716667 11.5 1H15.5C15.7833 1 16.0208 1.09583 16.2125 1.2875C16.4042 1.47917 16.5 1.71667 16.5 2C16.5 2.28333 16.4042 2.52083 16.2125 2.7125C16.0208 2.90417 15.7833 3 15.5 3V16C15.5 16.55 15.3042 17.0208 14.9125 17.4125C14.5208 17.8042 14.05 18 13.5 18H3.5ZM3.5 3V16H13.5V3H3.5ZM5.5 13C5.5 13.2833 5.59583 13.5208 5.7875 13.7125C5.97917 13.9042 6.21667 14 6.5 14C6.78333 14 7.02083 13.9042 7.2125 13.7125C7.40417 13.5208 7.5 13.2833 7.5 13V6C7.5 5.71667 7.40417 5.47917 7.2125 5.2875C7.02083 5.09583 6.78333 5 6.5 5C6.21667 5 5.97917 5.09583 5.7875 5.2875C5.59583 5.47917 5.5 5.71667 5.5 6V13ZM9.5 13C9.5 13.2833 9.59583 13.5208 9.7875 13.7125C9.97917 13.9042 10.2167 14 10.5 14C10.7833 14 11.0208 13.9042 11.2125 13.7125C11.4042 13.5208 11.5 13.2833 11.5 13V6C11.5 5.71667 11.4042 5.47917 11.2125 5.2875C11.02083 5.09583 10.78333 5 10.5 5C10.2167 5 9.97917 5.09583 9.7875 5.2875C9.59583 5.47917 9.5 5.71667 9.5 6V13Z"
    class="svg-fill"
  />
</svg>`;

const SVG_EDIT = `
<svg class="icor" width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Edit">
  <mask id="mask0_239929_2406" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25">
    <rect x="0.682129" y="0.396729" width="24" height="24" fill="#D9D9D9"/>
  </mask>
  <g mask="url(#mask0_239929_2406)">
    <path d="M5.68213 19.3967H7.08213L15.7071 10.7717L14.3071 9.37173L5.68213 17.9967V19.3967ZM19.9821 9.32173L15.7321 5.12173L17.1321 3.72173C17.5155 3.3384 17.9863 3.14673 18.5446 3.14673C19.103 3.14673 19.5738 3.3384 19.9571 3.72173L21.3571 5.12173C21.7405 5.50506 21.9405 5.96756 21.9571 6.50923C21.9738 7.0509 21.7905 7.5134 21.4071 7.89673L19.9821 9.32173ZM18.5321 10.7967L7.93213 21.3967H3.68213V17.1467L14.2821 6.54673L18.5321 10.7967Z"/>
  </g>
</svg>`;

const SEP = `
<span class="sep" aria-hidden="true">|</span>`;

const CLOSE_BTN = `
<div class="close-overlay">
  <button type="button" class="close-icon-btn" aria-label="Close overlay" onclick="closeOverlay()">
    <img class="close-icon" src="./assets/icons/close.svg" alt="">
  </button>
</div>`;

const ASSIGNED_HEAD = `
<section aria-labelledby="assigned-title">
  <h4 id="assigned-title">Assigned To:</h4>
  <div id="user-names-overlay" role="list"></div>
  <div id="more-user-overlay"></div>
</section>`;

const SUBTASKS_BLOCK = `
<section aria-labelledby="subtask-headline-overlay">
  <h4 id="subtask-headline-overlay">Subtasks</h4>
  <div>
    <div id="subtasks-overlay"></div>
  </div>
</section>`;



const _ovHeader = (cls, cat) => `
<section class="header-overlay" role="region" aria-label="Task header">
  <label class="category-overlay category-${cls}">${cat}</label>
  ${CLOSE_BTN}
</section>`;

const _ovDue = d => `
<div class="due-date-overlay">
  <h4>Due date:</h4>
  <p><time datetime="${d || ''}">${dateFormatter(d)}</time></p>
</div>`;

const _ovPrio = (t, i) => `
<div class="priority-overlay" aria-label="Priority">
  <h4>Priority:</h4>
  <div class="priority-container-overlay" role="img" aria-label="${t}">
    <p>${t}</p>
    <img src="${i}" alt="">
  </div>
</div>`;

const _ovFiles = id => `
<section aria-labelledby="attached-files-title">
  <h4 id="attached-files-title" style="margin-top:20px;">Attached files:</h4>
  <div class="task-file viewer-gallery" id="viewer-${id}" role="list"></div>
</section>`;

const _edHeader = () => `
<div class="header-overlay-edit">
  ${CLOSE_BTN}
</div>`;

const _edTitle = t => `
<div class="overlay-edit-container">
  <label class="edit-overlay-label" for="overlay-title">Title</label>
  <input class="overlay-input-field" type="text" maxlength="20" placeholder="${t}" id="overlay-title" aria-describedby="overlay-title-hint">
</div>`;

const _edDesc = d => `
<div class="overlay-edit-container">
  <label class="edit-overlay-label" for="overlay-description">Description</label>
  <textarea class="overlay-textarea" maxlength="50" placeholder="${d}" id="overlay-description" aria-describedby="overlay-description-hint"></textarea>
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
    <img src="./assets/icons/date_icon.svg" style="cursor:pointer;" alt="calendar" id="calendar-icon" role="button" tabindex="0" aria-label="Open date picker">
  </div>
</div>`;

const _edPrio = () => `
<div class="overlay-priority-container" aria-label="Priority">
  <label for="priority">Priority</label>
  <div class="prio-label-container" role="group" aria-label="Priority options">
    <div onclick="changePriority('Urgent')" id="urgent-label" class="prio-label" role="button" tabindex="0" aria-pressed="false">
      <p id="urgent-text">Urgent</p>
      <img id="urgent-icon" src="./assets/icons/urgent_icon.png" alt="">
    </div>
    <div onclick="changePriority('Medium')" id="medium-label" class="prio-label" role="button" tabindex="0" aria-pressed="true">
      <p id="medium-text">Medium</p>
      <img id="medium-icon" src="./assets/icons/medium_icon.png" alt="">
    </div>
    <div onclick="changePriority('Low')" id="low-label" class="prio-label" role="button" tabindex="0" aria-pressed="false">
      <p id="low-text">Low</p>
      <img id="low-icon" src="./assets/icons/low_icon.png" alt="">
    </div>
  </div>
</div>`;

const _edAssign = id => `
<div class="overlay-edit-container">
  <label class="edit-overlay-label" for="assigned-to">Assigned to</label>
  <div onclick="openDropdownAssigned(${id})" id="assigned-container" class="assigned-menu-overlay" role="combobox" aria-expanded="false" aria-owns="selected-user-dropdown">
    <input id="assigned-to" type="text" placeholder="Select contacts" aria-autocomplete="list" aria-controls="selected-user-dropdown">
    <img id="arrow-dropdown" src="./assets/icons/arrow_drop_down.png" alt="" role="button" tabindex="0" aria-label="Open contacts dropdown">
  </div>
</div>
<div class="d-none" id="selected-user-dropdown" role="listbox">
  <div class="dropdown-container" id="user-dropdown" role="list"></div>
</div>
<div id="user-names-edit-overlay" role="list"></div>`;

const _edUpload = () => `
<div>
  <div class="overlay-edit-container">
    <label class="edit-overlay-label">Upload</label>
    <div id="edit-overlay-file-preview" role="list"></div>
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
      aria-describedby="warn-emptyinput-container">
    <div class="hover-container" id="create-subtask-overlay" onclick="editMode(${id})" role="group" aria-label="Subtask actions">
      <img class="hover-container" id="add-subtask-overlay-edit" src="./assets/icons/add_subtask.png" alt="add subtask">
    </div>
  </div>
</div>
<div id="warn-emptyinput-container" aria-live="polite"></div>
<div id="subtasks-overlay-edit" role="list"></div>`;

const _edOk = id => `
<div class="button-ok-container">
  <button class="button-ok" type="button" onclick="saveEdit(${id})" aria-label="Save changes">
    <p>Ok</p>
    <img src="./assets/icons/check.svg" alt="">
  </button>
</div>`;



const _taskHeader = (classCategory, category) => `
<div role="group" aria-label="Category">
  <label class="category-${classCategory}">${category}</label>
</div>`;

const _taskMain = (id, title, description) => `
<h4>${title}</h4>
<p class="description-p">${description}</p>
<div class="subtasks" id="subtask-${id}" role="group" aria-label="Subtasks progress"></div>`;

const _taskFooter = (id, prioIcon) => `
<div class="task-footer">
  <div class="assigned-task" aria-label="Assigned users">
    <div id="assigned-user-${id}" class="assigned-user-container" role="list"></div>
    <div class="more-user" id="more-user-${id}"></div>
  </div>
  <button type="button" aria-label="Priority">
    <img src="${prioIcon}" alt="">
  </button>
</div>`;

const _detailsBody = (classCategory, category, title, description, dueDate, priority, prioIcon, id) => `
${_ovHeader(classCategory, category)}
<h3 id="task-title-details">${title}</h3>
<p>${description}</p>
${_ovDue(dueDate)}
${_ovPrio(priority, prioIcon)}
${ASSIGNED_HEAD}
${SUBTASKS_BLOCK}
${_ovFiles(id)}
`;

