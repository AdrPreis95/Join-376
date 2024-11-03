let moving = null;

let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];


let timer = null;

function cancel() {
    clearTimeout(timer);
    timer = null;
}

function onTouch(event, id) {
    timer = setTimeout(() => longPressed(event, id), 500);
}

function longPressed(event, id) {
    pickup(event);
    startDragging(id);
    removeDragging(id);
}


function pickup(event) {
    if (!event.target.classList.contains('task-card')) {
        moving = event.target.parentElement;
    } else {
        moving = event.target;
    }

    // Save the original width and height as custom properties on the element
    moving.dataset.originalHeight = moving.clientHeight + "px";
    moving.dataset.originalWidth = moving.clientWidth + "px";

    // Set the width and height to fixed values based on the element's current size
    moving.style.height = moving.clientHeight + "px";
    moving.style.width = moving.clientWidth + "px";
    moving.style.position = 'fixed';
    moving.style.zIndex = '10'; 
}

function move(event) {
    if (!event.target.classList.contains('task-card'))
        return;
    if (moving) {
        event.stopImmediatePropagation();
        if (event.clientX) {
            // mousemove
            moving.style.left = event.clientX - moving.clientWidth / 2;
            moving.style.top = event.clientY - moving.clientHeight / 2;
        } else {
            // touchmove - assuming a single touchpoint
            moving.style.left = event.changedTouches[0].clientX - moving.clientWidth / 2;
            moving.style.top = event.changedTouches[0].clientY - moving.clientHeight / 2;
        }
    }
}

function drop(event) {
    if (moving) {
        if (event.currentTarget.classList.contains('list')) {
            let target = null;
            if (event.clientX) {
                target = document.elementsFromPoint(event.clientX, event.clientY);
            } else {
                target = document.elementsFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            }

            let targetList = '';

            if (target[0].className != undefined) {
                targetList = (target[0].className == "task-card") ? target[1] : target.at('div.list').children.item(1);
            }

            if (targetList) {
                if (!targetList.contains(moving)) {
                    let list = targetList.className;
                    if (listNames.includes(list)) {
                        changeList(list);
                    }
                }
            }
        }

        // reset our element
        if (moving.style) {
            moving.style.left = '';
            moving.style.top = '';
            moving.style.height = '';
            moving.style.width = '';
            moving.style.position = '';
            moving.style.zIndex = '';
        }

        moving = null;
    }
}