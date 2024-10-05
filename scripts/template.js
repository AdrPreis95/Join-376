
function getTask(category, classCategory, title, description, firstLetterNames, prioIcon) {
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
                <div class="assigned-user"">
                <p>${firstLetterNames}</p>
            </div>
            <div class="assigned-user">
                <p>EM</p>
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
    <div class="progress-border"><div id="subtask-progress" class="subtask-progress" style="width: 50%;"></div></div>
    <p>1/2 Subtasks</p>
    `
}