let moving = null;

let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];

let timer = null;

const mainContent = document.querySelector('.main-content');
const boardLists = document.getElementById('board-lists');

document.addEventListener('mousemove', function (e) {
    if (moving) {
        moving.style.left = e.pageX + 'px';
        moving.style.top = e.pageY + 'px';
    }
});

document.addEventListener('touchmove', function (e) {
    if (moving) {
        e.preventDefault();
        const touch = e.touches[0];
        moving.style.left = touch.pageX + 'px';
        moving.style.top = touch.pageY + 'px';

        scrollToPoint(e, touch);
    }
}, { passive: false });

/**
 * This function scrolls the div .board-lists according to the touch
 * @param {Event} e
 */

function scrollToPoint(e, touch) {
    const elementsBottom = getElementsFromPoint(e);
    if (elementsBottom.length > 0) {
        const rect = boardLists.getBoundingClientRect();
        const scrollThreshold = 30; // Distance from edges to trigger scroll
        const scrollSpeed = 10; // Adjust scroll speed as needed
        if (touch.clientY - rect.top < scrollThreshold) { // Scroll upwards if near the top of the board-lists
            boardLists.scrollTop -= scrollSpeed;
            mainContent.scrollTop = boardLists.scrollTop - 10;
        }
        if (touch.clientY + rect.top > rect.height - scrollThreshold) { // Scroll downwards if near the bottom of the board-lists
            boardLists.scrollTop += scrollSpeed;
            mainContent.scrollTop = boardLists.scrollTop;
        }
    }
}

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
        for (moving = event.target.parentElement; !moving.classList.contains('task-card'); 
            moving = moving.parentElement);// Loop through parent elements
    } else {
        moving = event.target;
    }

    moving.dataset.originalHeight = moving.clientHeight + "px"; // Save the original width and height as custom properties on the element
    moving.dataset.originalWidth = moving.clientWidth + "px";

    moving.style.height = moving.clientHeight + "px"; // Set the width and height to fixed values based on the element's current size
    moving.style.width = moving.clientWidth + "px";
    moving.style.position = 'fixed';
    moving.style.zIndex = '10';
    setPickUpPosition(event, moving);
}

/**
 * This function sets the position of the picked up element
 * @param {Event} e 
 * @param {HTMLElement} moving
 */
function setPickUpPosition(e, moving) {
    const touch = e.touches[0];
    if (touch) {
         // assuming a single touchpoint
        moving.style.left = touch.pageX + 'px';
        moving.style.top = touch.pageY + 'px';
    } else {
        moving.style.left = e.pageX + 'px';
        moving.style.top = e.pageY + 'px';
    }
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
            moving.style.left = event.clientX 
            moving.style.top = event.clientY
        } else {
            // touchmove - assuming a single touchpoint
            moving.style.left = event.changedTouches[0].clientX 
            moving.style.top = event.changedTouches[0].clientY 
        }
    }
}

/**
 * This function gets the element according to the point
 * @param {Event} event 
 */
function getElementsFromPoint(event) {
    if (event.clientX) {
        return document.elementsFromPoint(event.clientX, event.clientY);
    } else {
        return document.elementsFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
}

/**
 * This function drops the element according to the drop zone
 * @param {Event} event 
 */
function drop(event) {
    if (moving) {
        if (event.currentTarget.classList.contains('list')) {
            let target = getElementsFromPoint(event);

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
    if (target.at('div.list') != undefined)
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
