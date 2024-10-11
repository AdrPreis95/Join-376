function openDropdown() {
    document.getElementById('dropdown-user').style.display = "flex";
   
}
function changeColor(element, color) {
    if (element.getAttribute('data-active') === 'true') {
        element.style.backgroundColor = '';   
        element.style.color = '';             
        let img = element.querySelector('img');
        img.style.filter = '';                
        element.setAttribute('data-active', 'false'); 
    } else {
        element.style.backgroundColor = color;
        element.style.color = 'white';
        let img = element.querySelector('img');
        img.style.filter = 'brightness(0) invert(1)'; 
        element.setAttribute('data-active', 'true');  
    }
}

