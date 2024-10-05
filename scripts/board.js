
function toggleSubtask() {
    let refIcon = document.getElementById('click-subtaks');
    let refSubtask = document.getElementById('subtasks');  

    if(refIcon.getAttribute('src') == './assets/icons/priority_open_down_icon.png') {
        refIcon.setAttribute('src', './assets/icons/urgent_icon.png');
        refSubtask.innerHTML = getSubtask();
    } else if(refIcon.getAttribute('src') == './assets/icons/urgent_icon.png') {
        refIcon.setAttribute('src', './assets/icons/priority_open_down_icon.png');
        refSubtask.innerHTML = "";
    }
}