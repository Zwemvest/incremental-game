import { Task, TaskDefinition, TASKS, Skill } from "./tasks.js";

// MARK: Skills

let SKILL_NAMES = ["Studying", "Travel"];

class SkillProgress
{
    skill: Skill;
    level: number = 0;
    progress: number = 0;

    constructor(skill: Skill)
    {
        this.skill = skill;
    }
}

function addSkillXp(skill: Skill, xp: number) {
    var skill_entry = GAMESTATE.skills[skill];
    if (!skill_entry)
    {
        console.error("Skill not found");
        return;
    }

    skill_entry.progress += xp;
    const xp_to_level_up = 100;

    if (skill_entry.progress >= xp_to_level_up)
    {
        skill_entry.progress -= xp_to_level_up;
        skill_entry.level += 1;
    }
}

// MARK: Rendering

function createTaskDiv(task: Task, tasks_div: HTMLElement, rendering: Rendering)
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
    rendering.task_elements.set(task.definition, task_div);
}

function createSkillDiv(skill: SkillProgress, skills_div: HTMLElement, rendering: Rendering)
{
    const skill_div = document.createElement("div");
    skill_div.className = "skill";

    const name = document.createElement("div");
    name.className = "skill-name";
    name.textContent = `${SKILL_NAMES[skill.skill]}`;

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.width = "0%";
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.appendChild(progressFill);

    skill_div.appendChild(name);
    skill_div.appendChild(progressBar);

    skills_div.appendChild(skill_div);
    rendering.skill_elements.set(skill.skill, skill_div);
}

class Rendering
{
    task_elements: Map<TaskDefinition, HTMLElement> = new Map();
    skill_elements: Map<Skill, HTMLElement> = new Map();

    private createTasks()
    {
        var tasks_div = document.getElementById("tasks");
        if (!tasks_div)
        {
            console.error("The element with ID 'tasks' was not found.");
            return;
        }
        tasks_div.innerHTML = "";

        for (const task of GAMESTATE.tasks) {
            createTaskDiv(task, tasks_div, this);
        }
    }

    private createSkills()
    {
        var skills_div = document.getElementById("skills");
        if (!skills_div)
        {
            console.error("The element with ID 'skills' was not found.");
            return;
        }
        skills_div.innerHTML = "";

        for (const skill of GAMESTATE.skills) {
            createSkillDiv(skill, skills_div, this);
        }
    }

    constructor()
    {
        this.createTasks();
        this.createSkills();
    }
}

// MARK: Gamestate

class Gamestate
{
    tasks: Task[] = [];
    active_task: Task | null = null;

    skills: SkillProgress[] = [];

    private initializeTasks()
    {
        for (const task of TASKS) {
            this.tasks.push(new Task(task));
        }
    }

    private initializeSkills()
    {
        for (let i = 0; i < Skill.Count; i++) {
            this.skills.push(new SkillProgress(i));
        }
    }

    constructor()
    {
        this.initializeTasks();
        this.initializeSkills();
    }
}

function clickTask(task: Task)
{
    if (GAMESTATE.active_task == task)
    {
        GAMESTATE.active_task = null;
    }
    else
    {
        GAMESTATE.active_task = task;
    }
}

function updateTaskRendering() {
    for (const task of GAMESTATE.tasks) {
        var fill = RENDERING.task_elements.get(task.definition)?.querySelector<HTMLDivElement>(".progress-fill");
        if (!fill)
        {
            continue;
        }
        
        fill.style.width = `${task.progress * 100 / task.definition.max_progress}%`;
    }
}

function updateSkillRendering() {
    for (const skill of GAMESTATE.skills) {
        var fill = RENDERING.skill_elements.get(skill.skill)?.querySelector<HTMLDivElement>(".progress-fill");
        if (fill)
        {
             fill.style.width = `${skill.progress}%`;
        }
        
        var name = RENDERING.skill_elements.get(skill.skill)?.querySelector<HTMLDivElement>(".skill-name");
        if (name)
        {
            const new_html = `${SKILL_NAMES[skill.skill]}<br>(${skill.level})`;
            // Avoid flickering in the debugger
            if (new_html != name.innerHTML)
            {
                name.innerHTML = new_html;
            }
        }
    }
}

function updateGamestate() {
    updateActiveTask();
}

function updateRendering() {
    updateTaskRendering();
    updateSkillRendering();
}

function updateActiveTask() {
    var active_task = GAMESTATE.active_task;
    if (!active_task)
    {
        return;
    }
    
    if (active_task.progress < active_task.definition.max_progress)
    {
        active_task.progress += 1;
        for (const skill of active_task.definition.skills)
        {
            addSkillXp(skill, 5);
        }
    }
}

function gameLoop() {
    updateGamestate();
    updateRendering();
}

var GAMESTATE = new Gamestate();
var RENDERING = new Rendering();

setInterval(gameLoop, 100);
