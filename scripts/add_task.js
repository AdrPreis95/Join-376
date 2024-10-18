let priority = '';
let subtasksArray = [];

async function getAllTaskIDs() {
    try {
        
        let response = await fetch(`${BASE_URL}/tasks.json`);
        let tasksData = await response.json();
        
        if (tasksData) {
           
            let ids = Object.keys(tasksData).map(key => tasksData[key].id);
            return ids;
        } else {
            return [];
        }
    } catch (error) {
        console.error("cannot get the id from Tasks:", error);
        return [];
    }
}

async function generateNewID() {
    let existingIDs = await getAllTaskIDs();
    let newID = Math.max(...existingIDs, 0) + 1;
    return newID;
}


function setPriority(prio) {
    priority = prio;
}

async function createTask() {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dueDate = document.getElementById('date').value;
    let category = document.getElementById('selectcategory').value;
    let subtask = document.getElementById('addsubtasks').value;

    if (title === '') {
        alert('Please enter a title');
        return;
    }
    if (description === '') {
        alert('Please enter a description');
        return;
    }
    if (dueDate === '') {
        alert('Please enter a due date');
        return;
    }
    let newID = await generateNewID();

    let newTask = {
        id: newID,
        title: title,
        description: description,
        dueDate: dueDate,
        prio: priority,
        category: category,
        subtasks: subtasksArray

    };

    await fetch(BASE_URL + '/tasks.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
    });

    alert('Task successfully created!');
    subtasksArray = [];
    document.getElementById('subtask-list').innerHTML = '';
}

function resetPriorityButtons() {
    let redButton = document.getElementById('prio-red');
    redButton.style.backgroundColor = '';
    redButton.style.color = '';
    let redImg = redButton.querySelector('img');
    redImg.style.filter = '';

    let orangeButton = document.getElementById('prio-orange');
    orangeButton.style.backgroundColor = '';
    orangeButton.style.color = '';
    let orangeImg = orangeButton.querySelector('img');
    orangeImg.style.filter = '';

    let greenButton = document.getElementById('prio-green');
    greenButton.style.backgroundColor = '';
    greenButton.style.color = '';
    let greenImg = greenButton.querySelector('img');
    greenImg.style.filter = '';
}

function changeColor(element, color) {
    resetPriorityButtons();
    element.style.backgroundColor = color;
    element.style.color = '#FFFFFF';
    let img = element.querySelector('img');
    img.style.filter = 'brightness(0) invert(1)';

    if (element.id === 'prio-red') {
        setPriority('Urgent');
    } else if (element.id === 'prio-orange') {
        setPriority('Medium');
    } else if (element.id === 'prio-green') {
        setPriority('Low');
    }
}

function addSubtask() {
    let showIcons = document.getElementById('show-icons');
    let addSubtaskButton = document.getElementById('add-subtask');

    if (showIcons) {
        showIcons.style.display = "flex";
    }

    if (addSubtaskButton) {
        addSubtaskButton.style.display = "none";
    }
}

function clearSubtaskInput() {
    let subtaskInput = document.getElementById('addsubtasks');

    if (subtaskInput) {
        subtaskInput.value = '';
    }
}

function confirmSubtask() {
    let subtaskList = document.getElementById('subtask-list');
    let subtaskCount = subtaskList.getElementsByTagName('li').length;

    if (subtaskCount >= 2) {
        alert("You can only add2 subtasks.");
        return;
    }

    let subtaskValue = document.getElementById('addsubtasks').value;

    if (subtaskValue === '') {
        alert("Please enter a subtask.");
        return;
    }

    let li = document.createElement('li');
    li.innerHTML = `<div>
    <span class="dot">•</span>
    <span class="subtask-text">${subtaskValue}</span>
        </div>
        <div class="icons">
            <button class="icon-btn" onclick="editSubtask(this)">
                <img src="./assets/icons/edit_icon.png" alt="EditIcon" style="height:20px;">
            </button>
            <div class="ul-icons-seperator"></div>
            <button class="icon-btn" onclick="deleteSubtask(this)">
                <img src="./assets/icons/delete_icon.png" alt="DeleteIcon" style="height:20px;">
            </button>
        </div>
    `;

    subtaskList.appendChild(li);

    subtasksArray.push({ title: subtaskValue });

    document.getElementById('addsubtasks').value = '';
    document.getElementById('show-icons').style.display = "none";
    document.getElementById('add-subtask').style.display = "inline-block";
}

function editSubtask(editBtn) {
    let subtaskText = editBtn.parentElement.previousElementSibling;
    let newSubtask = prompt("Edit subtask:", subtaskText.textContent);
    if (newSubtask !== null && newSubtask !== '') {
        subtaskText.textContent = newSubtask;
    }
}

function deleteSubtask(deleteBtn) {
    let subtaskToDelete = deleteBtn.parentElement.parentElement;
    subtaskToDelete.remove();
}
