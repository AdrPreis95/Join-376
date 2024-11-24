let moving = null;

let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];


let timer = null;

/**
 * This function resets timeout
 */
function cancel() {
    clearTimeout(timer);
    timer = null;
}

/**
 * This function checks the user touch is long pressed
 * @param {Event} event 
 * @param {String} id 
 */
function onTouch(event, id) {
    timer = setTimeout(() => longPressed(event, id), 500);
}

/**
 * This function starts the longpressed routines
 * @param {Event} event 
 * @param {String} id 
 */
function longPressed(event, id) {
    pickup(event);
    startDragging(id);
    removeDragging(id);
}

/**
 * This function checks and save the pressed element
 * @param {Event} event
 */
function pickup(event) {
    if (!event.target.classList.contains('task-card')) {
        moving = event.target.parentElement;
        if (!moving.classList.contains('task-card'))
            moving = moving.parentElement;
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

/**
 * This function checks and save the drop zone
 * @param {Event} event 
 */
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

/**
 * This function drops the element according to the drop zone
 * @param {Event} event 
 */
function drop(event) {
    if (moving) {
        if (event.currentTarget.classList.contains('list')) {
            let target = null;
            if (event.clientX) {
                target = document.elementsFromPoint(event.clientX, event.clientY);
            } else {
                target = document.elementsFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            }

            let targetList = setTargetList(target);

            checkTargetList(targetList, moving);
        }

        // reset our element
        removeDragging(moving.id);
        moving = resetElement(moving);
    }
}

/**
 * This function checks and returns the drop zone
 * @param {Element[]} target 
 */
function setTargetList(target) {
    if (target.at('div.list').childNodes[3] != undefined) {
        if (listNames.includes(target.at('div.list').childNodes[3].id)) {
            return target.at('div.list').childNodes[3];
        }
    }

    for (let index = 0; index < target.length; index++) {
        const element = target[index];
        if (listNames.includes(element.id))
            return element;
    }

}

/**
 * This function checks if the list does have the task and drags it
 * @param {HTMLElement} targetList
 * @param {HTMLElement} moving  
 */
function checkTargetList(targetList, moving) {
    if (targetList) {
        if (!targetList.contains(moving)) {
            let list = targetList.className;
            if (listNames.includes(list)) {
                changeList(list);
            }
        }
    }
}

/**
 * This function resets element
 * @param {HTMLElement} moving  
 */
function resetElement(moving) {
    if (moving.style) {
        moving.style.left = '';
        moving.style.top = '';
        moving.style.height = '';
        moving.style.width = '';
        moving.style.position = '';
        moving.style.zIndex = '';
    }

    return null;
}

document.addEventListener('mousemove', function (e) {
    if (moving) {
        moving.style.left = e.pageX + 'px';
        moving.style.top = e.pageY + 'px';
    }
});

document.addEventListener('touchmove', function (e) {
    if (moving) {
        // Get the touch coordinates
        const touch = e.touches[0];
        moving.style.left = touch.pageX + 'px';
        moving.style.top = touch.pageY + 'px';
    }
});