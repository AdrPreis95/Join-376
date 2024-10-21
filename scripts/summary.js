function onLoadFunc() {
    updateGreeting(); 
    setUserInitials();
}

function updateGreeting(){
    const greeting = document.querySelector(".greeting");
    const user = document.querySelector(".user");
    user.innerHTML = "";

    //If the user is logged in and not as guest
    if (loggedUser.name != null && loggedUser.name != "guest") {
        greeting.innerHTML = `Good ${getTimeOfDay()},`;
        user.innerHTML =  loggedUser.name;
    }else{
        greeting.innerHTML = `Good ${getTimeOfDay()}`;
    }

    // Get the actual time 
    const now = new Date();

    // Calculate the time remaining until the next full hour
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);

    const timeUntilNextHour = nextHour - now;

    // Set a timeout to call the function again at the next full hour
    setTimeout(updateGreeting, timeUntilNextHour);
}

function getTimeOfDay() {
    // Times of day data
    const times = [
        { greet: 'Morning', start: 5, end: 12 },
        { greet: 'Afternoon', start: 12, end: 17 },
        { greet: 'Evening', start: 17, end: 20 },
        { greet: 'Night', start: 20, end: 23 }];

    // Use Date constructor to get current time
    var now = new Date();

    // Get hours from Date object
    const hours = now.getHours();
    
    // Use times array to default time to night
    var currentTime = times[3];

    // Iterate through times of day
    for (var i = 0; i < 3; i++) {
        // If this time of day matches
        if (hours >= times[i].start && hours < times[i].end) {
            // Store correct time of day
            currentTime = times[i];
        }
    }

    return currentTime.greet;
}