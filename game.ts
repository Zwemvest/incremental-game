import { TaskDefinition, Task } from "./tasks.js";
import { TASKS } from "./tasks.js";

var TASKS_DIV = document.getElementById("tasks");

class Gamestate
{
    tasks: Task[] = [];

    public initializeTasks()
    {
        for (const task of TASKS) {
            this.tasks.push(new Task(task));
        }
    }
}

function clickTask(task: Task)
{
    task.progress += 1;
}

function createTaskDiv(task: Task, tasks_div: HTMLElement)
{
    const task_div = document.createElement("div");
    task_div.className = "task";

    const button = document.createElement("button");
    button.className = "task-button";
    button.addEventListener("click", () => {clickTask(task);});

    task_div.appendChild(button);

    tasks_div.appendChild(task_div);
    task.html_element = task_div;
}

function createTasks(gamestate: Gamestate)
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

function updateTaskRendering(gamestate: Gamestate) {
    for (const task of gamestate.tasks) {
        var button = task.html_element?.getElementsByClassName("task-button")[0];
        if (!button)
        {
            continue;
        }
        button.textContent = `${task.definition.name} - ${task.progress}/${task.definition.max_progress}`;
    }
}

function gameLoop(gamestate: Gamestate) {
    updateTaskRendering(gamestate);
}

var gamestate = new Gamestate();
gamestate.initializeTasks();
createTasks(gamestate);


setInterval(gameLoop, 100, gamestate);
