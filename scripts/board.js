function changeColorAssignedUser() {
    let colors = ['#FC71FF', '#462F8A', '#FF7A00', '#1FD7C1'];
    let colorsLength = colors.length;
    let indexColor = (Math.random() * colorsLength);

    document.getElementById('assigned1').style.background = colors[indexColor];
}