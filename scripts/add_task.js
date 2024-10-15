function openDropdown() {

    let dropdown = document.getElementById("dropdown-user");
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
    document.getElementById('cont-left').style.height = "fit-content";
}

window.onclick = function (event) {

    let dropdown = document.getElementById("dropdown-user");
    let inputField = document.getElementById("dropdown-input");
    if (!inputField.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = "none";
    }
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

function dateContainer() {

    document.getElementById('date').addEventListener('input', function () {
        let value = this.value.replace(/[^0-9]/g, '');
        let length = value.length;
        if (length >= 2 && value[2] !== '/') {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (length >= 5 && value[5] !== '/') {
            value = value.slice(0, 5) + '/' + value.slice(5);
        }
        this.value = value.slice(0, 10);
    });
    document.getElementById('date').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            confirmDate(this.value);
        }
    });

    function confirmDate(date) {
        alert("Datum bestätigt: " + date);
    }
}

window.onload = function () {
    dateContainer();
};


