
let priority = '';

function setPriority(prio) {
    priority = prio;
}

async function createTask() {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dueDate = document.getElementById('date').value;
    let category = document.getElementById('selectcategory').value;

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
    if (priority === '') {
        alert('Please select a priority');
        return;
    }

    let newTask = {
        title: title,
        description: description,
        dueDate: dueDate,
        prio: priority,
        category: category,
    };

    await fetch(BASE_URL + '/tasks.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
    });

    alert('Task successfully created!');
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
