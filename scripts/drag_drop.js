/**Array of Listnames for the Tasks Status,Moving and Timer null Value */
let moving = null;
let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];
let timer = null;
const mainContent = document.querySelector('.main-content');
const boardLists = document.getElementById('board-lists');

/**Eventlistener for the Mousemove (Desktop Version)*/
document.addEventListener('mousemove', function (e) {
    if (moving) {
        moving.style.left = e.pageX + 'px';
        moving.style.top = e.pageY + 'px';
    }
});

/**Eventlistener for the Touchmove (Mobile Version)*/
document.addEventListener('touchmove', function (e) {
    if (moving) {
        e.preventDefault();
        const touch = e.touches[0];
        moving.style.left = touch.pageX + 'px';
        moving.style.top = touch.pageY + 'px';

        scrollToPoint(e, touch);
    }
}, { passive: false });

/**This function scrolls the div .board-lists according to the touch*/
function scrollToPoint(e, touch) {
    const elementsBottom = getElementsFromPoint(e);
    if (elementsBottom.length > 0) {
        const rect = boardLists.getBoundingClientRect();
        const scrollThreshold = 30; 
        const scrollSpeed = 10; 
        if (touch.clientY - rect.top < scrollThreshold) { 
            boardLists.scrollTop -= scrollSpeed;
            mainContent.scrollTop = boardLists.scrollTop - 10;}
        if (touch.clientY + rect.top > rect.height - scrollThreshold) { 
            boardLists.scrollTop += scrollSpeed;
            mainContent.scrollTop = boardLists.scrollTop;}}
}

/**This function resets timeout*/
function cancel() {
    clearTimeout(timer);
    timer = null;
}

/**This function checks the user touch is long pressed*/
function onTouch(event, id) {
    timer = setTimeout(() => longPressed(event, id), 500);
}

/**This function starts the longpressed routines*/
function longPressed(event, id) {
    pickup(event);
    startDragging(id);
    removeDragging(id);
}

/**This function checks and save the pressed element*/
function pickup(event) {
    if (!event.target.classList.contains('task-card')) {
        for (moving = event.target.parentElement; !moving.classList.contains('task-card'); 
            moving = moving.parentElement);
    } else {
    moving = event.target;}
    moving.dataset.originalHeight = moving.clientHeight + "px"; 
    moving.dataset.originalWidth = moving.clientWidth + "px";
    moving.style.height = moving.clientHeight + "px"; 
    moving.style.width = moving.clientWidth + "px";
    moving.style.position = 'fixed';
    moving.style.zIndex = '10';
    setPickUpPosition(event, moving);
}

/**This function sets the position of the picked up element*/
function setPickUpPosition(e, moving) {
    const touch = e.touches[0];
    if (touch) {
        moving.style.left = touch.pageX + 'px';
        moving.style.top = touch.pageY + 'px';
    } else {
        moving.style.left = e.pageX + 'px';
        moving.style.top = e.pageY + 'px';
    }
}

/**This function checks and save the drop zone*/
function move(event) {
  if (!moving) return;
  const p = event.changedTouches ? event.changedTouches[0] : event;
  event.stopImmediatePropagation?.();
  moving.style.left = (p.clientX ?? p.pageX) + 'px';
  moving.style.top  = (p.clientY ?? p.pageY) + 'px';
}
window.move = move; 


/**This function gets the element according to the point*/
function getElementsFromPoint(event) {
    if (event.clientX) {
        return document.elementsFromPoint(event.clientX, event.clientY);
    } else {
        return document.elementsFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
}

/**This function drops the element according to the drop zone*/
function drop(event) {
    if (moving) {
        if (event.currentTarget.classList.contains('list')) {
            let target = getElementsFromPoint(event);
            let targetList = setTargetList(target);
        checkTargetList(targetList, moving);
        }
        removeDragging(moving.id);
        moving = resetElement(moving);
    }
}

/**This function checks and returns the drop zone*/
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

/**This function checks if the list does have the task and drags it*/
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

/**This function resets element*/
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
