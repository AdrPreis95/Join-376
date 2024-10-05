
function getTask(category, classCategory, title, description, firstLetterNames) {
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
                <div class="assigned-user" style="background-color: #462F8A;">
                <p>${firstLetterNames}</p>
            </div>
            <div class="assigned-user">
                <p>EM</p>
            </div>
        </div>
        <button onclick="toggleSubtask()"><img id="click-subtaks" src="./assets/icons/priority_open_down_icon.png" alt="open"></button>
        </div>
    </div>
    `
}

function getSubtask() {
    return `
    <div class="progress-border"><div id="subtask-progress" class="subtask-progress" style="width: 50%;"></div></div>
    <p>1/2 Subtasks</p>
    `
}