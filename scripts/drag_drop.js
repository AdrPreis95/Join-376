let moving = null;

let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];


function pickup(event) {
    if (!event.target.classList.contains('task-card'))
        return;
    moving = event.target;

    moving.style.height = moving.clientHeight + 'px';
    moving.style.width = moving.clientWidth + 'px';
    moving.style.position = 'fixed';
    moving.style.zIndex = '10'; // Bringt das Element in den Vordergrund
}

function move(event) {
    if (!event.target.classList.contains('task-card'))
        return;
    if (moving) {
        event.stopImmediatePropagation();
        if (event.clientX) {
            // mousemove
            moving.style.left = event.clientX - moving.clientWidth/2;
            moving.style.top = event.clientY - moving.clientHeight/2;
        } else {
            // touchmove - assuming a single touchpoint
            moving.style.left = event.changedTouches[0].clientX - moving.clientWidth/2;
            moving.style.top = event.changedTouches[0].clientY - moving.clientHeight/2;
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

            let targetList = (target[0].className == "task-card")?  target[1] : target.at('div.list').children.item(1);
            if (targetList){
                if (!targetList.contains(moving)) {
                    let list = targetList.className;
                    if (listNames.includes(list)){
                        changeList(list);
                    } 
                }
            }
        }

        // reset our element
        moving.style.left = '';
        moving.style.top = '';
        moving.style.height = '';
        moving.style.width = '';
        moving.style.position = '';
        moving.style.zIndex = '';

        moving = null;
    }

    
}