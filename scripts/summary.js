// /**Initialize the tasks,users,sets the user initials and greets ervery user*/
// function onLoadFunc() {
//   updateGreeting();
//   setUserInitials();
//   showUrgentTasks();
//   showTasksOnList();
// }

// /**This funtion updates the greeting message for every login */
// function updateGreeting() {
//   const greeting = document.querySelector(".greeting");
//   const user = document.querySelector(".user");
//   user.innerHTML = "";
//   if (loggedUser.name != null && loggedUser.name != "guest") {
//     greeting.innerHTML = `Good ${getTimeOfDay()},`;
//     user.innerHTML = loggedUser.name;
//   } else {
//     greeting.innerHTML = `Good ${getTimeOfDay()}`;
//   }
//   setTimeout(updateGreeting, msUntilNextHour());
// }

// /**This function updated the time for the greeting message (Good Morning , Afternoon aso.)*/
// function getTimeOfDay() {
//   const times = [
//     { greet: 'Morning', start: 5, end: 12 },
//     { greet: 'Afternoon', start: 12, end: 17 },
//     { greet: 'Evening', start: 17, end: 20 },
//     { greet: 'Night', start: 20, end: 23 }
//   ];
//   const hours = new Date().getHours();
//   let currentTime = times[3];
//   for (let i = 0; i < 3; i++) if (hours >= times[i].start && hours < times[i].end) currentTime = times[i];
//   return currentTime.greet;
// }

// /**This function displays urgent tasks in summary upcomming date ,by priority*/
// async function showUrgentTasks() {
//   let tasks = await fetch(BASE_URL + "/tasks.json");
//   let tasksJson = await tasks.json();
//   tasksJson = Array.isArray(tasksJson) ? tasksJson : Object.values(tasksJson);
//   const getUrgentTasks = (arr, prio) => arr.filter(task => task.prio == prio);
//   const urgentTasks = getUrgentTasks(tasksJson, "Urgent");
//   document.getElementById("show-urgent").innerHTML = urgentTasks.length;
//   if (!urgentTasks.length) return document.getElementById("priory-date").innerHTML = "--";
//   let deadline = "";
//   for (let i = 0; i < urgentTasks.length; i++) deadline = compareDates(deadline, urgentTasks[i].dueDate);
//   document.getElementById("priory-date").innerHTML = formatDateUTC(deadline);
// }

// /**checks the date time */
// function compareDates(d1, d2) {
//   let date1 = new Date(d1).getTime();
//   let date2 = new Date(d2).getTime();
//   if (date1 < date2) {
//     return d1;
//   } else {
//     return d2;
//   }
// }

// /**Shows all the tasks and stats and prioritys of all the tasks*/
// async function showTasksOnList() {
//   let tasks = await fetch(BASE_URL + "/tasks.json");
//   let tasksJson = await tasks.json();
//   tasksJson = Array.isArray(tasksJson) ? tasksJson : Object.values(tasksJson);
//   const getTasksOnList = (arr, list) => arr.filter(task => task.list == list);
//   let toDoTasks = getTasksOnList(tasksJson, "to-do");
//   let doneTasks = getTasksOnList(tasksJson, "done");
//   let inProgressTasks = getTasksOnList(tasksJson, "in-progress");
//   let awaitFeedbackTasks = getTasksOnList(tasksJson, "await-feedback");
//   document.getElementById("show-todos").innerHTML = toDoTasks.length;
//   document.getElementById("show-done").innerHTML = doneTasks.length;
//   document.getElementById("show-tasks-board").innerHTML = tasksJson.length;
//   document.getElementById("show-tasks-progress").innerHTML = inProgressTasks.length;
//   document.getElementById("show-tasks-await-feedback").innerHTML = awaitFeedbackTasks.length;
// }

// /**Redirect to the Board HTML */
// function redirectToBoard() { window.location.href = "./board.html"; }

// /* ---------- tiny helpers (reine Auslagerung, keine Logikänderung) ---------- */
// function msUntilNextHour() {
//   const now = new Date();
//   const nextHour = new Date(now);
//   nextHour.setHours(now.getHours() + 1, 0, 0, 0);
//   return nextHour - now;
// }

// function formatDateUTC(d) {
//   return new Date(d).toLocaleDateString({},
//     { timeZone: "UTC", month: "long", day: "2-digit", year: "numeric" });
// }


/** Initializes dashboard greeting, initials and task counters. */
function onLoadFunc() {
  updateGreeting();
  setUserInitials();
  showUrgentTasks();
  showTasksOnList();
}

/** Updates the greeting periodically based on current user and time. */
function updateGreeting() {
  const greeting = document.querySelector(".greeting");
  const user = document.querySelector(".user");
  user.innerHTML = "";
  if (loggedUser.name != null && loggedUser.name != "guest") {
    greeting.innerHTML = `Good ${getTimeOfDay()},`;
    user.innerHTML = loggedUser.name;
  } else {
    greeting.innerHTML = `Good ${getTimeOfDay()}`;
  }
  setTimeout(updateGreeting, msUntilNextHour());
}

/** Returns Morning/Afternoon/Evening/Night based on current hour. */
function getTimeOfDay() {
  const times = [
    { greet: 'Morning', start: 5,  end: 12 },
    { greet: 'Afternoon', start: 12, end: 17 },
    { greet: 'Evening', start: 17, end: 20 },
    { greet: 'Night', start: 20, end: 23 }
  ];
  const h = new Date().getHours();
  let cur = times[3];
  for (let i = 0; i < 3; i++) if (h >= times[i].start && h < times[i].end) cur = times[i];
  return cur.greet;
}

/** Shows urgent task count and nearest urgent due date. */
async function showUrgentTasks() {
  let tasks = await fetch(BASE_URL + "/tasks.json");
  let tasksJson = await tasks.json();
  tasksJson = Array.isArray(tasksJson) ? tasksJson : Object.values(tasksJson);
  const urgentTasks = tasksJson.filter(t => t.prio == "Urgent");
  document.getElementById("show-urgent").innerHTML = urgentTasks.length;
  if (!urgentTasks.length) return document.getElementById("priory-date").innerHTML = "--";
  let deadline = "";
  for (let i = 0; i < urgentTasks.length; i++) deadline = compareDates(deadline, urgentTasks[i].dueDate);
  document.getElementById("priory-date").innerHTML = formatDateUTC(deadline);
}

/** Compares two date strings and returns the earlier one. */
function compareDates(d1, d2) {
  let date1 = new Date(d1).getTime();
  let date2 = new Date(d2).getTime();
  if (date1 < date2) {
    return d1;
  } else {
    return d2;
  }
}

/** Fetches tasks and updates per-list counters on the summary. */
async function showTasksOnList() {
  const res = await fetch(BASE_URL + "/tasks.json");
  let arr = await res.json();
  arr = Array.isArray(arr) ? arr : Object.values(arr);
  const count = l => arr.filter(t => t.list == l).length;
  document.getElementById("show-todos").innerHTML = count("to-do");
  document.getElementById("show-done").innerHTML = count("done");
  document.getElementById("show-tasks-board").innerHTML = arr.length;
  document.getElementById("show-tasks-progress").innerHTML = count("in-progress");
  document.getElementById("show-tasks-await-feedback").innerHTML = count("await-feedback");
}

/** Navigates to the board page. */
function redirectToBoard() { window.location.href = "./board.html"; }

/** Returns ms until the next full hour for scheduling updates. */
function msUntilNextHour() {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  return nextHour - now;
}

/** Formats a date string in UTC as long locale date. */
function formatDateUTC(d) {
  return new Date(d).toLocaleDateString({},
    { timeZone: "UTC", month: "long", day: "2-digit", year: "numeric" });
}
