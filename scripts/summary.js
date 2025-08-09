/**
 Initialize the tasks,users,sets the user initials and greets ervery user
 */
function onLoadFunc() {
    updateGreeting(); 
    setUserInitials();
    showUrgentTasks();
    showTasksOnList();
}


/**
 This funtion updates the greeting message for every login 
 */
function updateGreeting(){
    const greeting = document.querySelector(".greeting");
    const user = document.querySelector(".user");
    user.innerHTML = "";

    if (loggedUser.name != null && loggedUser.name != "guest") {
        greeting.innerHTML = `Good ${getTimeOfDay()},`;
        user.innerHTML =  loggedUser.name;
    }else{
        greeting.innerHTML = `Good ${getTimeOfDay()}`;
    }

    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const timeUntilNextHour = nextHour - now;
    setTimeout(updateGreeting, timeUntilNextHour);
}

/**
 This function updated the time for the greeting message (Good Morning , Afternoon aso.)
 */
function getTimeOfDay() {
    const times = [
        { greet: 'Morning', start: 5, end: 12 },
        { greet: 'Afternoon', start: 12, end: 17 },
        { greet: 'Evening', start: 17, end: 20 },
        { greet: 'Night', start: 20, end: 23 }];
    var now = new Date();
    const hours = now.getHours();
    var currentTime = times[3];

    for (var i = 0; i < 3; i++) {
        if (hours >= times[i].start && hours < times[i].end)
            currentTime = times[i];
    }

    return currentTime.greet;
}


/**
 This function displays urgent tasks in summary upcomming date ,by priority
 */
async function showUrgentTasks() {
    let tasks = await fetch(BASE_URL + "/tasks.json")
    let tasksJson = await tasks.json();
    tasksJson = Array.isArray(tasksJson) ? tasksJson : Object.values(tasksJson);
    const getUrgentTasks = (tasksJson, prio) =>
    tasksJson.filter(task => task.prio == prio);

    let urgentTasks = getUrgentTasks(tasksJson, "Urgent");

    document.getElementById("show-urgent").innerHTML = urgentTasks.length;

    if (urgentTasks.length > 0) {
        let deadline = "";
    
        for(var i = 0 ; i < urgentTasks.length; i++){
            deadline = compareDates(deadline, urgentTasks[i].dueDate);
        }

        const formattedDate = new Date(deadline)
        .toLocaleDateString({},
        {timeZone:"UTC",month:"long", day:"2-digit", year:"numeric"}
        );

        document.getElementById("priory-date").innerHTML = formattedDate;
    } else {
        document.getElementById("priory-date").innerHTML = "--";
    }    
}

/**
 checks the date time 
 */
function compareDates(d1, d2){
    let date1 = new Date(d1).getTime();
    let date2 = new Date(d2).getTime();
  
    if (date1 < date2) {
      return d1;
    } else {
      return d2;
    }
}


/**
 Shows all the tasks and stats and prioritys of all the tasks
 */
async function showTasksOnList() {
    let tasks = await fetch(BASE_URL + "/tasks.json")
    let tasksJson = await tasks.json();
    tasksJson = Array.isArray(tasksJson) ? tasksJson : Object.values(tasksJson);
    const getTasksOnList = (tasksJson, list) =>
    tasksJson.filter(task => task.list == list);

    let toDoTasks = getTasksOnList(tasksJson, "to-do");
    let doneTasks = getTasksOnList(tasksJson, "done");
    let inProgressTasks = getTasksOnList(tasksJson, "in-progress");
    let awaitFeedbackTasks = getTasksOnList(tasksJson, "await-feedback");

    document.getElementById("show-todos").innerHTML = toDoTasks.length;
    document.getElementById("show-done").innerHTML = doneTasks.length;
    document.getElementById("show-tasks-board").innerHTML = tasksJson.length;
    document.getElementById("show-tasks-progress").innerHTML = inProgressTasks.length;
    document.getElementById("show-tasks-await-feedback").innerHTML = awaitFeedbackTasks.length;
}


/**
 Redirect to the Board HTML 
 */
function redirectToBoard() {
    window.location.href = "./board.html";
}