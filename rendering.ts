import { Task, TaskDefinition, Skill } from "./zones.js";
import { clickTask, SkillProgress, calcSkillXpNeeded } from "./simulation.js";
import { GAMESTATE, RENDERING } from "./game.js";

let SKILL_NAMES = ["Studying", "Travel"];

function createTaskDiv(task: Task, tasks_div: HTMLElement, rendering: Rendering) {
    const task_div = document.createElement("div");
    task_div.className = "task";

    const button = document.createElement("button");
    button.className = "task-button";
    button.textContent = `${task.definition.name}`;
    button.addEventListener("click", () => { clickTask(task); });

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

function createSkillDiv(skill: SkillProgress, skills_div: HTMLElement, rendering: Rendering) {
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

export class Rendering {
    energy_element: HTMLElement;
    task_elements: Map<TaskDefinition, HTMLElement> = new Map();
    skill_elements: Map<Skill, HTMLElement> = new Map();

    current_zone: number = 0;

    public createTasks() {
        var tasks_div = document.getElementById("tasks");
        if (!tasks_div) {
            console.error("The element with ID 'tasks' was not found.");
            return;
        }
        tasks_div.innerHTML = "";

        for (const task of GAMESTATE.tasks) {
            createTaskDiv(task, tasks_div, this);
        }
    }

    private createSkills() {
        var skills_div = document.getElementById("skills");
        if (!skills_div) {
            console.error("The element with ID 'skills' was not found.");
            return;
        }
        skills_div.innerHTML = "";

        for (const skill of GAMESTATE.skills) {
            createSkillDiv(skill, skills_div, this);
        }
    }

    constructor() {
        this.createTasks();
        this.createSkills();
        var energy_div = document.getElementById("energy");
        if (energy_div) {
            this.energy_element = energy_div;
        }
        else {
            console.error("The element with ID 'energy' was not found.");
            this.energy_element = new HTMLElement();
        }
    }
}

function updateTaskRendering() {
    if (RENDERING.current_zone != GAMESTATE.current_zone)
    {
        RENDERING.current_zone = GAMESTATE.current_zone;
        RENDERING.createTasks();
    }

    // TODO - Track this with a reset count instead
    if (GAMESTATE.did_energy_reset_this_tick) {
        RENDERING.createTasks();
    }

    for (const task of GAMESTATE.tasks) {
        var fill = RENDERING.task_elements.get(task.definition)?.querySelector<HTMLDivElement>(".progress-fill");
        if (!fill) {
            continue;
        }

        fill.style.width = `${task.progress * 100 / task.definition.max_progress}%`;
    }
}

function updateSkillRendering() {
    for (const skill of GAMESTATE.skills) {
        var fill = RENDERING.skill_elements.get(skill.skill)?.querySelector<HTMLDivElement>(".progress-fill");
        if (fill) {
            fill.style.width = `${skill.progress * 100 / calcSkillXpNeeded(skill)}%`;
        }

        var name = RENDERING.skill_elements.get(skill.skill)?.querySelector<HTMLDivElement>(".skill-name");
        if (name) {
            const new_html = `${SKILL_NAMES[skill.skill]}<br>(${skill.level})`;
            // Avoid flickering in the debugger
            if (new_html != name.innerHTML) {
                name.innerHTML = new_html;
            }
        }
    }
}

function updateEnergyRendering() {
    var fill = RENDERING.energy_element.querySelector<HTMLDivElement>(".progress-fill");
    if (fill) {
        fill.style.width = `${GAMESTATE.current_energy * 100 / GAMESTATE.max_energy}%`;
    }

    var value = RENDERING.energy_element.querySelector<HTMLDivElement>(".progress-value");
    if (value) {
        const new_html = `${GAMESTATE.current_energy}`;
        // Avoid flickering in the debugger
        if (new_html != value.innerHTML) {
            value.textContent = new_html;
        }
    }
}

export function updateRendering() {
    updateTaskRendering();
    updateSkillRendering();
    updateEnergyRendering();
}
