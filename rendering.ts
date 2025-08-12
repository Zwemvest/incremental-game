import { Task, TaskDefinition, SkillType, ZONES, TaskType } from "./zones.js";
import { clickTask, Skill, calcSkillXpNeeded, calcSkillXpNeededAtLevel, calcTaskProgressMultiplier, calcSkillXp, calcEnergyDrainPerTick, clickItem, calcTaskCost, calcSkillTaskProgressMultiplier, getSkill, hasPerk } from "./simulation.js";
import { GAMESTATE, RENDERING } from "./game.js";
import { ItemType, ItemDefinition, ITEMS } from "./items.js";
import { PerkDefinition, PerkType, PERKS } from "./perks.js";

// MARK: Skills

let SKILL_NAMES = ["Charisma", "Study", "Combat", "Search", "Subterfuge", "Crafting", "Survival", "Travel", "Magic"];

function createSkillDiv(skill: Skill, skills_div: HTMLElement, rendering: Rendering) {
    const skill_div = document.createElement("div");
    skill_div.className = "skill";

    const name = document.createElement("div");
    name.className = "skill-name";
    name.textContent = `${SKILL_NAMES[skill.type]}`;

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.width = "0%";
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.appendChild(progressFill);

    skill_div.appendChild(name);
    skill_div.appendChild(progressBar);

    setupTooltip(skill_div, function () {
        var tooltip = `${SKILL_NAMES[skill.type]}`;
        tooltip += `<br>Speed multiplier: x${calcSkillTaskProgressMultiplier(skill.type).toFixed(2)}`;
        tooltip += `<br>XP: ${skill.progress.toFixed(2)}/${calcSkillXpNeeded(skill).toFixed(2)}`;
        return tooltip;
    });

    skills_div.appendChild(skill_div);
    rendering.skill_elements.set(skill.type, skill_div);
}

function updateSkillRendering() {
    for (const skill of GAMESTATE.skills) {
        var element = RENDERING.skill_elements.get(skill.type) as HTMLElement;
        var fill = element.querySelector<HTMLDivElement>(".progress-fill");
        if (fill) {
            fill.style.width = `${skill.progress * 100 / calcSkillXpNeeded(skill)}%`;
        }

        var name = element.querySelector<HTMLDivElement>(".skill-name");
        if (name) {
            const new_html = `${SKILL_NAMES[skill.type]}<br>(${skill.level})`;
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
    task_div.classList.add(Object.values(TaskType)[task.definition.type] as string);

    const task_upper_div = document.createElement("div");
    task_upper_div.className = "task-upper";

    const task_button = document.createElement("button");
    task_button.className = "task-button";
    task_button.textContent = `${task.definition.name}`;
    task_button.addEventListener("click", () => { clickTask(task); });

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

    if (task.definition.item != ItemType.Count)
    {
        var item_indicator = document.createElement("div");
        item_indicator.className = "task-item-indicator";
        item_indicator.textContent = ITEMS[task.definition.item]?.icon as string;
        task_button.appendChild(item_indicator);
    }

    if (task.definition.perk != PerkType.Count && !hasPerk(task.definition.perk))
    {
        var item_indicator = document.createElement("div");
        item_indicator.className = "task-perk-indicator";
        item_indicator.textContent = PERKS[task.definition.perk]?.icon as string;
        task_button.appendChild(item_indicator);
    }

    const task_reps_div = document.createElement("div");
    task_reps_div.className = "task-reps";

    if (task.definition.type != TaskType.Travel)
    {
        for (var i = 0; i < task.definition.max_reps; ++i)
        {
            const task_rep_div = document.createElement("div");
            task_rep_div.className = "task-rep";
            task_reps_div.appendChild(task_rep_div);
        }
    }

    task_upper_div.appendChild(task_button);
    task_upper_div.appendChild(task_reps_div);

    task_div.appendChild(task_upper_div);
    task_div.appendChild(progressBar);
    task_div.appendChild(skillsUsed);

    setupTooltip(task_div, function () {
        var tooltip = task.definition.name;

        if (task.definition.item != ItemType.Count)
        {
            tooltip += `<br><br>Gives item ${ITEMS[task.definition.item]?.icon}${ITEMS[task.definition.item]?.name}`;
        }

        if (task.definition.perk != PerkType.Count && !hasPerk(task.definition.perk))
        {
            tooltip += `<br><br>Gives a permanent Perk`;
        }

        tooltip += `<br><br>Estimated energy used: ${estimateTotalTaskEnergyConsumption(task)}`;
        tooltip += `<br>Estimated time: ${estimateTaskTimeInSeconds(task)}s`;
        tooltip += "<br>Estimated levels up:";

        for (const skill of task.definition.skills) {
            const skill_progress = getSkill(skill);
            const name = SKILL_NAMES[skill];
            if (!name) {
                continue;
            }

            var xp_gained = calcSkillXp(task, calcTaskCost(task));
            var resulting_level = skill_progress.level;
            var xp_needed = calcSkillXpNeeded(skill_progress) - skill_progress.progress;

            while (xp_gained > xp_needed) {
                xp_gained -= xp_needed;
                resulting_level += 1;
                xp_needed = calcSkillXpNeededAtLevel(resulting_level);
            }

            tooltip += `<br>${name}: ${resulting_level - skill_progress.level}`;

            if (task.definition.xp_mult != 1)
            {
                tooltip += `<br><br>XP multiplier: ${task.definition.xp_mult}`;
            }
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
        var task_element = RENDERING.task_elements.get(task.definition) as HTMLElement;
        var fill = task_element.querySelector<HTMLDivElement>(".progress-fill");
        if (fill) {
            fill.style.width = `${task.progress * 100 / calcTaskCost(task)}%`;
        }
        else {
            console.error("No progress-fill");
        }
        
        var button = task_element.querySelector<HTMLInputElement>(".task-button");
        if (button)
        {
            button.disabled = !task.enabled;
        }
        else {
            console.error("No task-button");
        }

        var reps = task_element.getElementsByClassName("task-rep");
        for (var i = 0; i < task.reps; ++i)
        {
            (reps[i] as HTMLElement).classList.add("finished");
        }
    }
}

function estimateTotalTaskTicks(task: Task): number {
    const progress_mult = calcTaskProgressMultiplier(task);
    const num_ticks = Math.ceil(calcTaskCost(task) / progress_mult);
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

// MARK: Items

function createItemDiv(item: ItemType, items_div: HTMLElement)
{
    const item_div = document.createElement("div");
    item_div.className = "item";

    var item_definition = ITEMS[item] as ItemDefinition;

    const button = document.createElement("button");
    button.className = "item-button";
    button.addEventListener("click", () => { clickItem(item); });

    item_div.appendChild(button);

    setupTooltip(item_div, function () {
        var tooltip = item_definition.name;
        tooltip += `<br>${item_definition.tooltip}`;
        return tooltip;
    });

    items_div.appendChild(item_div);
    RENDERING.item_elements.set(item, item_div);
}

function createItems() {
    var items_div = document.getElementById("items");
    if (!items_div) {
        console.error("The element with ID 'items' was not found.");
        return;
    }

    items_div.innerHTML = "";

    for (const item of GAMESTATE.items.keys())
    {
        createItemDiv(item, items_div);
    }
}

function updateItems() {
    var needs_recreation = false;
    for (const item of GAMESTATE.items.keys())
    {
        if (!RENDERING.item_elements.has(item))
        {
            needs_recreation = true;
        }
    }

    if (needs_recreation)
    {
        createItems();
    }

    for (const item of GAMESTATE.items.keys())
    {
        var element = RENDERING.item_elements.get(item) as HTMLElement;
        var button = element.querySelector<HTMLInputElement>(".item-button");
        if (button)
        {
            var item_definition = ITEMS[item] as ItemDefinition;
            var item_count = GAMESTATE.items.get(item);
            const text = `${item_definition.icon} (${item_count})`;
            if (text != button.textContent)
            {
                button.textContent = text;
            }

            button.disabled = item_count == 0;
        }
        else
        {
            console.error("Couldn't find item-button");
        }
    }
}

// MARK: Perks

function createPerkDiv(perk: PerkType, perks_div: HTMLElement) {
    const perk_div = document.createElement("div");
    perk_div.className = "perk";

    var perk_definition = PERKS[perk] as PerkDefinition;

    perk_div.textContent = perk_definition.icon;

    setupTooltip(perk_div, function () {
        var tooltip = perk_definition.name;
        tooltip += `<br>${perk_definition.tooltip}`;
        return tooltip;
    });

    perks_div.appendChild(perk_div);
    RENDERING.perk_elements.set(perk, perk_div);
}

function createPerks() {
    var perks_div = document.getElementById("perks");
    if (!perks_div) {
        console.error("The element with ID 'perks' was not found.");
        return;
    }

    perks_div.innerHTML = "";

    for (const perk of GAMESTATE.perks.keys())
    {
        createPerkDiv(perk, perks_div);
    }
}

function updatePerks() {
    if (GAMESTATE.perks.size != RENDERING.perk_elements.size)
    {
        createPerks();
    }
}

// MARK: Rendering

export class Rendering {
    tooltip_element: HTMLElement;
    energy_element: HTMLElement;
    task_elements: Map<TaskDefinition, ElementWithTooltip> = new Map();
    skill_elements: Map<SkillType, HTMLElement> = new Map();
    item_elements: Map<ItemType, HTMLElement> = new Map();
    perk_elements: Map<PerkType, HTMLElement> = new Map();

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
    }

    public start()
    {
        this.createTasks();
        this.createSkills();

        setupZone();
        createPerks();
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
    updateItems();
    updatePerks();
}
