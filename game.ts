import { TaskDefinition, Task } from "./tasks.js";
import { TASKS } from "./tasks.js";

var TASKS_DIV = document.getElementById("tasks");

class Gamestate
{
    tasks: Task[] = [];
    active_task: Task | null = null;

    public initializeTasks()
    {
        for (const task of TASKS) {
            this.tasks.push(new Task(task));
        }
    }
}

function clickTask(task: Task)
{
    if (gamestate.active_task == task)
    {
        gamestate.active_task = null;
    }
    else
    {
        gamestate.active_task = task;
    }
}

function createTaskDiv(task: Task, tasks_div: HTMLElement)
{
    const task_div = document.createElement("div");
    task_div.className = "task";

    const button = document.createElement("button");
    button.className = "task-button";
    button.textContent = `${task.definition.name}`;
    button.addEventListener("click", () => {clickTask(task);});

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.width = "0%";
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.appendChild(progressFill);

    task_div.appendChild(button);
    task_div.appendChild(progressBar);

    tasks_div.appendChild(task_div);
    task.html_element = task_div;
}

function createTasks()
{
    if (!TASKS_DIV)
    {
        console.error("The element with ID 'tasks' was not found.");
        return;
    }
    TASKS_DIV.innerHTML = "";

    for (const task of gamestate.tasks) {
        createTaskDiv(task, TASKS_DIV);
    }
}

function updateTaskRendering() {
    for (const task of gamestate.tasks) {
        var fill = task.html_element?.querySelector<HTMLDivElement>(".progress-fill");
        if (!fill)
        {
            continue;
        }
        
        fill.style.width = `${task.progress * 100 / task.definition.max_progress}%`;
    }
}

function updateActiveTask() {
    var active_task = gamestate.active_task;
    if (!active_task)
    {
        return;
    }
    
    if (active_task.progress < active_task.definition.max_progress)
    {
        active_task.progress += 1;
    }
}

function gameLoop() {
    updateActiveTask();


    updateTaskRendering();
}

var gamestate = new Gamestate();
gamestate.initializeTasks();
createTasks();


setInterval(gameLoop, 100);
