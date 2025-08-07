import type { Task } from "./tasks.js";
import { TASKS } from "./tasks.js";

var TASKS_DIV = document.getElementById("tasks");

function createTaskDiv(task: Task)
{
    const task_div = document.createElement("div");
    task_div.className = "task";

    const button = document.createElement("button");
    button.textContent = task.name;

    task_div.appendChild(button);

    TASKS_DIV.appendChild(task_div);
}

function renderTasks() {
    TASKS_DIV.innerHTML = "";

    for (const task of TASKS) {
        createTaskDiv(task);
    }
}

renderTasks();
