
function getTask(category, classCategory, title, description, prioIcon) {
    return `
    <div class="task-card">
        <div>
            <label class="category-${classCategory}">${category}</label>
        </div>
        <h4>${title}</h4>
        <p>${description}</p>
        <div class="subtasks" id="subtasks">

        </div>
        <div class="task-footer">
            <div class="assigned-task">
            <div class="assigned-user" id="assigned-user">

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

function getSubtask() {
    return `
    <div class="progress-border"><div id="subtask-progress" class="subtask-progress" style="width: {}%;"></div></div>
    <p>{}/{} Subtasks</p>
    `
}

function getFirstLetterName(firstLetters) {
    return `
    <p>${firstLetters}</p>
    `
}