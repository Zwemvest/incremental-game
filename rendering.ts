import { Task, TaskDefinition, Skill, ZONES } from "./zones.js";
import { clickTask, SkillProgress, calcSkillXpNeeded, calcSkillXpNeededAtLevel, calcTaskProgressMultiplier, calcSkillProgress, calcEnergyDrainPerTick } from "./simulation.js";
import { GAMESTATE, RENDERING } from "./game.js";

// MARK: Skills

let SKILL_NAMES = ["Charisma", "Study", "Combat", "Search", "Subterfuge", "Crafting", "Survival", "Travel", "Magic"];

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

// MARK: Tasks

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

    const skillsUsed = document.createElement("p");
    skillsUsed.className = "skills-used-text";
    var skillText = "Skills used: ";
    var skillStrings: string[] = [];
    for (const skill of task.definition.skills) {
        const name = SKILL_NAMES[skill];
        if (name) {
            skillStrings.push(name);
        }
    }
    skillText += skillStrings.join(", ");
    skillsUsed.textContent = skillText;

    task_div.appendChild(button);
    task_div.appendChild(progressBar);
    task_div.appendChild(skillsUsed);

    setupTooltip(task_div, function () {
        var tooltip = task.definition.name;

        tooltip += `<br><br>Estimated energy used: ${estimateTotalTaskEnergyConsumption(task)}`;
        tooltip += `<br>Estimated time: ${estimateTaskTimeInSeconds(task)}s`;
        tooltip += "<br>Estimated levels up:";

        for (const skill of task.definition.skills) {
            const skill_progress = GAMESTATE.getSkill(skill);
            const name = SKILL_NAMES[skill];
            if (!name) {
                continue;
            }

            var xp_gained = calcSkillProgress(task.definition.max_progress);
            var resulting_level = skill_progress.level;
            var xp_needed = calcSkillXpNeeded(skill_progress) - skill_progress.progress;

            while (xp_gained > xp_needed) {
                xp_gained -= xp_needed;
                resulting_level += 1;
                xp_needed = calcSkillXpNeededAtLevel(resulting_level);
            }

            tooltip += `<br>${name}: ${resulting_level - skill_progress.level}`;
        }

        return tooltip;
    });

    tasks_div.appendChild(task_div);
    rendering.task_elements.set(task.definition, task_div);
}

function updateTaskRendering() {
    if (GAMESTATE.energy_reset_count != RENDERING.energy_reset_count) {
        RENDERING.energy_reset_count = GAMESTATE.energy_reset_count;
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

function estimateTotalTaskTicks(task: Task): number {
    const progress_mult = calcTaskProgressMultiplier(task);
    const num_ticks = Math.ceil(task.definition.max_progress / progress_mult);
    return num_ticks;
}

function estimateTaskTimeInSeconds(task: Task): number {
    return estimateTotalTaskTicks(task) * GAMESTATE.tick_interval_ms / 1000;
}

// MARK: Energy
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

function estimateTotalTaskEnergyConsumption(task: Task): number {
    return estimateTotalTaskTicks(task) * calcEnergyDrainPerTick(task);
}

// MARK: Tooltips
type tooltipLambda = () => string;
interface ElementWithTooltip extends Element {
    generateTooltip?: tooltipLambda;
}

function setupTooltip(element: ElementWithTooltip, callback: tooltipLambda) {
    element.generateTooltip = callback;
    element.addEventListener("pointerenter", (e) => {
        showTooltip(element);
    });
    element.addEventListener("pointerleave", (e) => {
        RENDERING.tooltip_element.style.display = "none";
    });
}

// MARK: Rendering

export class Rendering {
    tooltip_element: HTMLElement;
    energy_element: HTMLElement;
    task_elements: Map<TaskDefinition, ElementWithTooltip> = new Map();
    skill_elements: Map<Skill, HTMLElement> = new Map();

    energy_reset_count: number = 0;
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

        var tooltip_div = document.getElementById("tooltip");
        if (tooltip_div) {
            this.tooltip_element = tooltip_div;
        }
        else {
            console.error("The element with ID 'tooltip' was not found.");
            this.tooltip_element = new HTMLElement();
        }

        setupZone();
    }
}

function checkZone() {
    if (RENDERING.current_zone == GAMESTATE.current_zone) {
        return;
    }

    RENDERING.current_zone = GAMESTATE.current_zone;
    RENDERING.createTasks();
    setupZone();
}

function setupZone() {
    var zone_name = document.getElementById("zone-name");
    if (!zone_name) {
        console.error("The element with ID 'zone-name' was not found.");
        return;
    }

    const zone = ZONES[GAMESTATE.current_zone];
    if (zone) {
        zone_name.textContent = `Zone ${GAMESTATE.current_zone + 1} - ${zone.name}`;
    }
}

function showTooltip(element: ElementWithTooltip) {
    if (!element.generateTooltip) {
        console.error("No generateTooltip callback");
        return;
    }

    const elementRect = element.getBoundingClientRect();
    const x = elementRect.right;
    const y = elementRect.top;

    var tooltip_element = RENDERING.tooltip_element;
    tooltip_element.innerHTML = element.generateTooltip();

    tooltip_element.style.left = x + "px";
    tooltip_element.style.top = y + "px";
    tooltip_element.style.display = "block";
}

export function updateRendering() {
    checkZone();
    updateTaskRendering();
    updateSkillRendering();
    updateEnergyRendering();
}
