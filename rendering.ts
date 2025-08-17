import { Task, TaskDefinition, SkillType, ZONES, TaskType, SKILL_DEFINITIONS, SkillDefinition } from "./zones.js";
import { clickTask, Skill, calcSkillXpNeeded, calcSkillXpNeededAtLevel, calcTaskProgressMultiplier, calcSkillXp, calcEnergyDrainPerTick, clickItem, calcTaskCost, calcSkillTaskProgressMultiplier, getSkill, hasPerk, doEnergyReset, calcSkillTaskProgressMultiplierFromLevel, saveGame, SAVE_LOCATION, toggleRepeatTasks, calcAttunementGain, calcPowerGain, toggleAutomation, AutomationMode } from "./simulation.js";
import { GAMESTATE, RENDERING } from "./game.js";
import { ItemType, ItemDefinition, ITEMS, HASTE_MULT } from "./items.js";
import { PerkDefinition, PerkType, PERKS } from "./perks.js";
import { EventType, GainedPerkContext, SkillUpContext, UnlockedSkillContext, UnlockedTaskContext, UsedItemContext } from "./events.js";

// MARK: Skills

function createSkillDiv(skill: Skill, skills_div: HTMLElement) {
    const skill_div = document.createElement("div");
    skill_div.className = "skill";

    const skill_definition = SKILL_DEFINITIONS[skill.type] as SkillDefinition;
    const name = document.createElement("div");
    name.className = "skill-name";
    name.textContent = `${skill_definition.name}`;

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.width = "0%";
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.appendChild(progressFill);

    skill_div.appendChild(name);
    skill_div.appendChild(progressBar);

    setupTooltip(skill_div, function () {
        var tooltip = `<h3>${skill_definition.name}</h3>`;
        tooltip += `Speed multiplier: x${calcSkillTaskProgressMultiplier(skill.type).toFixed(2)}`;
        tooltip += `<br>XP: ${skill.progress.toFixed(2)}/${calcSkillXpNeeded(skill).toFixed(2)}`;
        return tooltip;
    });

    skills_div.appendChild(skill_div);
    RENDERING.skill_elements.set(skill.type, skill_div);
}

function recreateSkills() {
    var skills_div = document.getElementById("skills");
    if (!skills_div) {
        console.error("The element with ID 'skills' was not found.");
        return;
    }
    skills_div.innerHTML = "";

    for (const skill of GAMESTATE.skills) {
        if (GAMESTATE.unlocked_skills.includes(skill.type)) {
            createSkillDiv(skill, skills_div);
        }
    }
}

function updateSkillRendering() {
    for (const skill of GAMESTATE.skills) {
        if (!GAMESTATE.unlocked_skills.includes(skill.type)) {
            continue;
        }

        var element = RENDERING.skill_elements.get(skill.type) as HTMLElement;
        var fill = element.querySelector<HTMLDivElement>(".progress-fill");
        if (fill) {
            fill.style.width = `${skill.progress * 100 / calcSkillXpNeeded(skill)}%`;
        }

        var name = element.querySelector<HTMLDivElement>(".skill-name");
        if (name) {
            const skill_definition = SKILL_DEFINITIONS[skill.type] as SkillDefinition;
            const new_html = `${skill_definition.name}<br>(${skill.level})`;
            // Avoid flickering in the debugger
            if (new_html != name.innerHTML) {
                name.innerHTML = new_html;
            }
        }
    }
}

// MARK: Tasks

let TASK_TYPE_NAMES = ["Normal", "Travel", "Mandatory", "Boss"];

function createTaskDiv(task: Task, tasks_div: HTMLElement, rendering: Rendering) {
    const task_div = document.createElement("div");
    task_div.className = "task";
    task_div.classList.add(Object.values(TaskType)[task.task_definition.type] as string);

    const task_upper_div = document.createElement("div");
    task_upper_div.className = "task-upper";

    const task_button = document.createElement("button");
    task_button.className = "task-button";
    task_button.textContent = `${task.task_definition.name}`;
    task_button.addEventListener("click", () => { clickTask(task); });
    task_button.addEventListener("contextmenu", (e) => { e.preventDefault(); toggleAutomation(task); });

    const task_automation = document.createElement("div");
    task_automation.className = "task-automation";
    task_button.appendChild(task_automation);

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
    for (const skill of task.task_definition.skills) {
        const skill_definition = SKILL_DEFINITIONS[skill] as SkillDefinition;
        const name = skill_definition.name;
        if (name) {
            skillStrings.push(name);
        }
    }
    skillText += skillStrings.join(", ");
    skillsUsed.textContent = skillText;

    if (task.task_definition.item != ItemType.Count) {
        var item_indicator = document.createElement("div");
        item_indicator.className = "task-item-indicator";
        item_indicator.classList.add("indicator");
        item_indicator.textContent = ITEMS[task.task_definition.item]?.icon as string;
        task_button.appendChild(item_indicator);
    }

    if (task.task_definition.perk != PerkType.Count && !hasPerk(task.task_definition.perk)) {
        var perk_indicator = document.createElement("div");
        perk_indicator.className = "task-perk-indicator";
        perk_indicator.classList.add("indicator");
        perk_indicator.textContent = PERKS[task.task_definition.perk]?.icon as string;
        task_button.appendChild(perk_indicator);
    }

    const task_reps_div = document.createElement("div");
    task_reps_div.className = "task-reps";

    if (task.task_definition.type != TaskType.Travel) {
        for (var i = 0; i < task.task_definition.max_reps; ++i) {
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
        var tooltip = `<h3>${task.task_definition.name}</h3>`;

        tooltip += `<p>Type: ${TASK_TYPE_NAMES[task.task_definition.type]}</p>`;

        if (task.task_definition.item != ItemType.Count) {
            tooltip += `<p>Gives item ${ITEMS[task.task_definition.item]?.icon}${ITEMS[task.task_definition.item]?.name}</p>`;
        }

        if (task.task_definition.perk != PerkType.Count && !hasPerk(task.task_definition.perk)) {
            tooltip += `<p>Gives a permanent Perk</p>`;
        }

        tooltip += `Estimated energy used: ${maxDecimals(estimateTotalTaskEnergyConsumption(task), 2)}`;
        const task_ticks = estimateTotalTaskTicks(task);
        if (task_ticks == 1) {
            tooltip += `<br>Estimated time: one tick`;
        }
        else {
            tooltip += `<br>Estimated time: ${estimateTaskTimeInSeconds(task)}s`;
        }
        tooltip += "<br>Estimated levels up:";

        for (const skill of task.task_definition.skills) {
            const skill_progress = getSkill(skill);
            const skill_definition = SKILL_DEFINITIONS[skill] as SkillDefinition;
            const name = skill_definition.name;
            if (!name) {
                continue;
            }

            var xp_gained = calcSkillXp(task, calcTaskCost(task));
            var resulting_level = skill_progress.level;
            var xp_needed = calcSkillXpNeeded(skill_progress) - skill_progress.progress;

            while (xp_gained > xp_needed) {
                xp_gained -= xp_needed;
                resulting_level += 1;
                xp_needed = calcSkillXpNeededAtLevel(resulting_level, skill);
            }

            const levels_diff = resulting_level - skill_progress.level;
            if (levels_diff > 0) {
                tooltip += `<br>${name}: ${resulting_level - skill_progress.level}`;
            } else {
                const level_percentage = xp_gained / calcSkillXpNeeded(skill_progress) * 100;
                tooltip += `<br>${name}: ${level_percentage.toFixed(1)}% of a level`;
            }
        }

        if (task.task_definition.xp_mult != 1) {
            tooltip += `<br><br>XP multiplier: ${task.task_definition.xp_mult}`;
        }

        const attunement_gain = calcAttunementGain(task);
        if (attunement_gain > 0) {
            tooltip += `<br><br>Gives ${attunement_gain} Attunement`;
        }

        const power_gain = calcPowerGain(task);
        if (power_gain > 0 && GAMESTATE.has_unlocked_power) {
            tooltip += `<br><br>Gives ${power_gain} Power`;
        }

        if (task_button.disabled) {
            if (task.task_definition.type == TaskType.Travel) {
                tooltip += `<br><br>Disabled until you complete the Mandatory tasks`;
            }
            else if (task.reps >= task.task_definition.max_reps) {
                tooltip += `<br><br>Disabled due to being fully completed`;
            }
            else {
                console.error("Task disabled for unknown reason");
            }
        }

        return tooltip;
    });

    tasks_div.appendChild(task_div);
    rendering.task_elements.set(task.task_definition, task_div);
}

function recreateTasks() {
    RENDERING.createTasks();
}

function updateTaskRendering() {
    if (GAMESTATE.energy_reset_count != RENDERING.energy_reset_count) {
        RENDERING.energy_reset_count = GAMESTATE.energy_reset_count;
        recreateTasks();
    }

    for (const task of GAMESTATE.tasks) {
        var task_element = RENDERING.task_elements.get(task.task_definition) as HTMLElement;
        var fill = task_element.querySelector<HTMLDivElement>(".progress-fill");
        if (fill) {
            fill.style.width = `${task.progress * 100 / calcTaskCost(task)}%`;
        }
        else {
            console.error("No progress-fill");
        }

        var button = task_element.querySelector<HTMLInputElement>(".task-button");
        if (button) {
            button.disabled = !task.enabled;
        }
        else {
            console.error("No task-button");
        }

        var automation = task_element.querySelector<HTMLDivElement>(".task-automation");
        if (automation) {
            var prios = GAMESTATE.automation_prios.get(GAMESTATE.current_zone);
            if (prios) {
                const index = prios.indexOf(task.task_definition.id);
                const index_str = index >= 0 ? `${index + 1}` : "";
                if (automation.textContent != index_str) {
                    automation.textContent = index_str;
                }
            }
        }
        else {
            console.error("No task-automation");
        }

        if (task.task_definition.type != TaskType.Travel) {
            var reps = task_element.getElementsByClassName("task-rep");
            for (var i = 0; i < task.reps; ++i) {
                (reps[i] as HTMLElement).classList.add("finished");
            }
        }
    }
}

function estimateTotalTaskTicks(task: Task): number {
    var progress_mult = calcTaskProgressMultiplier(task);
    if (!task.hasted && GAMESTATE.queued_scrolls_of_haste > 0) {
        progress_mult *= HASTE_MULT;
    }

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
        const new_html = `${GAMESTATE.current_energy.toFixed(0)}`;
        // Avoid flickering in the debugger
        if (new_html != value.innerHTML) {
            value.textContent = new_html;
        }
    }
}

function estimateTotalTaskEnergyConsumption(task: Task): number {
    const num_ticks = estimateTotalTaskTicks(task);
    return num_ticks * calcEnergyDrainPerTick(task, num_ticks == 1);
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

function setupInfoTooltips() {
    const item_info = document.querySelector<HTMLElement>("#items .section-info");

    if (!item_info) {
        console.error("No item info element");
        return;
    }

    setupTooltip(item_info, function () {
        var tooltip = `<h3>Items</h3>`;
        tooltip += `Items can be used to get bonuses that last until the next Energy Reset`;
        tooltip += `<br>The bonuses stack additively; 2 +100% results in 3x speed, not 4x`;
        tooltip += `<br>Right-click to use all rather than just one`;
        return tooltip;
    });

    const perk_info = document.querySelector<HTMLElement>("#perks .section-info");

    if (!perk_info) {
        console.error("No perk info element");
        return;
    }

    setupTooltip(perk_info, function () {
        var tooltip = `<h3>Perks</h3>`;
        tooltip += `Perks are permanent bonuses with a variety of effects`;
        tooltip += `<br>The bonuses stack multiplicatively; 2 +100% results in 4x speed, not 3x`;
        return tooltip;
    });
}

// MARK: Items

function createItemDiv(item: ItemType, items_div: HTMLElement) {
    const button = document.createElement("button");
    button.className = "item-button";
    button.classList.add("element");

    var item_definition = ITEMS[item] as ItemDefinition;

    button.addEventListener("click", () => { clickItem(item, false); });
    button.addEventListener("contextmenu", (e) => { e.preventDefault(); clickItem(item, true); });

    setupTooltip(button, function () {
        var tooltip = `<h3>${item_definition.name}</h3>`;
        tooltip += `${item_definition.tooltip}`;
        return tooltip;
    });

    items_div.appendChild(button);
    RENDERING.item_elements.set(item, button);
}

function createItems() {
    var items_div = document.getElementById("items-list");
    if (!items_div) {
        console.error("The element with ID 'items-list' was not found.");
        return;
    }

    items_div.innerHTML = "";

    for (const item of GAMESTATE.items.keys()) {
        createItemDiv(item, items_div);
    }
}

function updateItems() {
    var needs_recreation = false;
    for (const item of GAMESTATE.items.keys()) {
        if (!RENDERING.item_elements.has(item)) {
            needs_recreation = true;
        }
    }

    if (needs_recreation) {
        createItems();
    }

    for (const item of GAMESTATE.items.keys()) {
        var button = RENDERING.item_elements.get(item) as HTMLInputElement;
        if (button) {
            var item_definition = ITEMS[item] as ItemDefinition;
            var item_count = GAMESTATE.items.get(item);
            const text = `${item_definition.icon} (${item_count})`;
            if (text != button.textContent) {
                button.textContent = text;
            }

            button.disabled = item_count == 0;
        }
        else {
            console.error("Couldn't find item-button");
        }
    }
}

function setupAutoUseItemsControl() {
    if (!hasPerk(PerkType.DeepTrance)) {
        return;
    }

    var item_control = document.createElement("button");
    item_control.className = "element";

    function setItemControlName() {
        item_control.textContent = GAMESTATE.auto_use_items ? "Auto Use Items" : "Manual Use Items";
    }
    setItemControlName();

    item_control.addEventListener("click", () => {
        GAMESTATE.auto_use_items = !GAMESTATE.auto_use_items;
        setItemControlName();
    });

    setupTooltip(item_control, function () {
        var tooltip = `<h3>${item_control.textContent}</h3>`;

        tooltip += "Toggle between items being used automatically, and only being used manually";
        tooltip += "<br>Won't use the Scroll of Haste";

        return tooltip;
    });

    RENDERING.controls_list_element.appendChild(item_control);
}

// MARK: Perks

function createPerkDiv(perk: PerkType, perks_div: HTMLElement) {
    const perk_div = document.createElement("div");
    perk_div.className = "perk";
    perk_div.classList.add("element");

    const perk_text = document.createElement("span");
    perk_text.className = "perk-text";

    var perk_definition = PERKS[perk] as PerkDefinition;

    perk_text.textContent = perk_definition.icon;

    setupTooltip(perk_div, function () {
        var tooltip = `<h3>${perk_definition.name}</h3>`;
        tooltip += `${perk_definition.tooltip}`;
        return tooltip;
    });

    perk_div.appendChild(perk_text);
    perks_div.appendChild(perk_div);
    RENDERING.perk_elements.set(perk, perk_div);
}

function createPerks() {
    var perks_div = document.getElementById("perks-list");
    if (!perks_div) {
        console.error("The element with ID 'perks-list' was not found.");
        return;
    }

    perks_div.innerHTML = "";

    for (const perk of GAMESTATE.perks.keys()) {
        createPerkDiv(perk, perks_div);
    }
}

function updatePerks() {
    if (GAMESTATE.perks.size != RENDERING.perk_elements.size) {
        createPerks();
    }
}

// MARK: Game over

function populateGameOver(game_over_div: HTMLElement) {
    game_over_div.style.display = "flex";

    var skill_gain = game_over_div.querySelector("#game-over-skillgain");
    if (!skill_gain) {
        console.error("No skill gain text");
        return;
    }

    skill_gain.innerHTML = "";

    var skill_gains: [SkillType, number][] = [];

    for (let i = 0; i < SkillType.Count; i++) {
        const current_level = getSkill(i).level;
        const starting_level = GAMESTATE.skills_at_start_of_reset[i] as number;
        const skill_diff = current_level - starting_level;

        if (skill_diff > 0) {
            skill_gains.push([i, skill_diff]);

        }
    }

    // Biggest gain first
    skill_gains.sort((a, b) => b[1] - a[1]);

    for (const [skill, skill_diff] of skill_gains) {
        var skill_gain_text = document.createElement("p");
        const skill_definition = SKILL_DEFINITIONS[skill] as SkillDefinition;
        skill_gain_text.textContent = `${skill_definition.name}: +${skill_diff} (x${calcSkillTaskProgressMultiplierFromLevel(skill_diff).toFixed(2)} speed)`;

        skill_gain.appendChild(skill_gain_text);
    };

    if (skill_gains.length == 0) {
        var skill_gain_text = document.createElement("p");
        skill_gain_text.textContent = `None`;

        skill_gain.appendChild(skill_gain_text);
    }

    var reset_count = game_over_div.querySelector("#game-over-reset-count");
    if (!reset_count) {
        console.error("No reset count text");
        return;
    }

    reset_count.textContent = `You've now done your ${formatOrdinal(GAMESTATE.energy_reset_count + 1)} energy reset`;
}

function setupGameOverRestartListener(game_over_div: HTMLElement) {
    var button = game_over_div.querySelector("#game-over-dismiss");

    if (!button) {
        console.error("No game over button");
        return;
    }

    button.addEventListener("click", () => {
        game_over_div.style.display = "none";
        doEnergyReset();
    });
}

function populateEndOfContent(end_of_content_div: HTMLElement) {
    end_of_content_div.style.display = "flex";

    var reset_count = end_of_content_div.querySelector("#end-of-content-reset-count");
    if (!reset_count) {
        console.error("No reset count text");
        return;
    }

    reset_count.textContent = `You've done ${GAMESTATE.energy_reset_count} energy resets`;
}

function updateGameOver() {
    const showing_game_over = RENDERING.game_over_element.style.display != "none";
    if (!showing_game_over && GAMESTATE.is_in_game_over) {
        populateGameOver(RENDERING.game_over_element);
    }

    const showing_end_of_content = RENDERING.end_of_content_element.style.display != "none";
    if (!showing_end_of_content && GAMESTATE.is_at_end_of_content) {
        populateEndOfContent(RENDERING.end_of_content_element);
    }
}

// MARK: Formatting

function formatOrdinal(n: number): string {
    const suffix = ["th", "st", "nd", "rd"];
    const remainder = n % 100;
    return n + ((suffix[(remainder - 20) % 10] || suffix[remainder] || suffix[0]) as string);
}

function maxDecimals(n: Number, maxDecimals: number): string {
    const exactDecimals = n.toFixed(maxDecimals);
    return Number(exactDecimals).toString(); // Trim trailing zeroes
}

// MARK: Settings

function setupSettings(settings_div: HTMLElement) {
    var open_button = document.querySelector("#open-settings");

    if (!open_button) {
        console.error("No open settings button");
        return;
    }

    open_button.addEventListener("click", () => {
        settings_div.style.display = "flex";
    });

    setupTooltip(open_button, function () {
        var tooltip = `<h3>Open Settings Menu</h3>`;
        return tooltip;
    });

    var close_button = settings_div.querySelector("#close-settings");

    if (!close_button) {
        console.error("No close settings button");
        return;
    }


    close_button.addEventListener("click", () => {
        settings_div.style.display = "none";
    });

    setupTooltip(close_button, function () {
        var tooltip = `<h3>Close Settings Menu</h3>`;
        return tooltip;
    });

    setupPersistence(settings_div);
}

// MARK: Settings: Saves

function setupPersistence(settings_div: HTMLElement) {
    var save_button = settings_div.querySelector("#save");

    if (!save_button) {
        console.error("No save button");
        return;
    }

    save_button.addEventListener("click", () => {
        saveGame();
        const save_data = localStorage.getItem(SAVE_LOCATION);
        if (!save_data) {
            console.error("No save data");
            return;
        }

        var file_name = `Incremental_save_Reset_${GAMESTATE.energy_reset_count}_energy_${GAMESTATE.current_energy.toFixed(0)}.json`;

        const blob = new Blob([save_data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    setupTooltip(save_button, function () {
        var tooltip = `<h3>Export Save</h3>`;
        tooltip += `Save the game's progress to disk`;
        return tooltip;
    });

    var load_button = settings_div.querySelector("#load");

    if (!load_button) {
        console.error("No load button");
        return;
    }

    load_button.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.addEventListener("change", (e) => {
            var element = e.target as HTMLInputElement;
            const file = (element.files as FileList)[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileText = event.target?.result as string;
                localStorage.setItem(SAVE_LOCATION, fileText as string);
                location.reload();
            };
            reader.readAsText(file);
        });

        input.click();
    });

    setupTooltip(load_button, function () {
        var tooltip = `<h3>Import Save</h3>`;
        tooltip += `Load the game's progress from disk`;
        return tooltip;
    });
}

// MARK: Events

function handleEvents() {
    var events = GAMESTATE.popRenderEvents();
    var messages = RENDERING.messages_element;
    for (var event of events) {
        const message_div = document.createElement("div");
        message_div.className = "message";

        switch (event.type) {
            case EventType.SkillUp:
                {
                    var skill_context = event.context as SkillUpContext;
                    const skill_definition = SKILL_DEFINITIONS[skill_context.skill] as SkillDefinition;
                    message_div.textContent = `${skill_definition.name} is now ${skill_context.new_level}`;
                    break;
                }
            case EventType.GainedPerk:
                {
                    var perk_context = event.context as GainedPerkContext;
                    const perk = PERKS[perk_context.perk] as PerkDefinition;
                    message_div.innerHTML = `Unlocked ${perk.icon}${perk.name}`;
                    message_div.innerHTML += `<br>${perk.tooltip}`;
                    setupControls(); // Show the automation controls
                    break;
                }
            case EventType.UsedItem:
                {
                    var item_context = event.context as UsedItemContext;
                    const item = ITEMS[item_context.item] as ItemDefinition;
                    message_div.innerHTML = `Used ${item_context.count} ${item.icon}${item.name}`;
                    message_div.innerHTML += `<br>${item.get_effect_text(item_context.count)}`;
                    break;
                }
            case EventType.UnlockedTask:
                {
                    var unlock_context = event.context as UnlockedTaskContext;
                    message_div.innerHTML = `Unlocked task ${unlock_context.task_definition.name}`;
                    recreateTasks();
                    break;
                }
            case EventType.UnlockedSkill:
                {
                    var unlock_skill_context = event.context as UnlockedSkillContext;
                    const skill_definition = SKILL_DEFINITIONS[unlock_skill_context.skill] as SkillDefinition;
                    message_div.innerHTML = `Unlocked skill ${skill_definition.name}`;
                    recreateSkills();
                    break;
                }
            case EventType.UnlockedPower:
                {
                    message_div.innerHTML = `Unlocked Power mechanic`;
                    message_div.innerHTML += `<br>Boosts Combat and Fortitude`;
                    recreateTasks();
                    break;
                }
            default:
                break;
        }

        messages.insertBefore(message_div, messages.firstChild);

        while (messages.children.length > 5) {
            messages.removeChild(messages.lastElementChild as Element);
        }

        setTimeout(() => {
            if (message_div.parentNode) {
                messages.removeChild(message_div);
            }
        }, 5000);
    }
}

// MARK: Controls

function setupControls() {
    RENDERING.controls_list_element.innerHTML = "";

    setupRepeatTasksControl();
    setupAutomationControls();
    setupAutoUseItemsControl();
}

function setupRepeatTasksControl() {
    var rep_control = document.createElement("button");
    rep_control.className = "element";

    function setRepControlName() {
        rep_control.textContent = GAMESTATE.repeat_tasks ? "Repeat Tasks" : "Don't Repeat Tasks";
    }
    setRepControlName();

    rep_control.addEventListener("click", () => {
        toggleRepeatTasks();
        setRepControlName();
    });

    setupTooltip(rep_control, function () {
        var tooltip = `<h3>${rep_control.textContent}</h3>`;

        tooltip += "Toggle between repeating Tasks if they have multiple reps, or only doing a single rep";

        return tooltip;
    });

    RENDERING.controls_list_element.appendChild(rep_control);
}

// MARK: Controls - Automation

function setupAutomationControls() {
    if (!hasPerk(PerkType.DeepTrance)) {
        return;
    }

    var automation = document.createElement("div");
    automation.className = "automation";

    var automation_text = document.createElement("div");
    automation_text.className = "automation-text";
    automation.textContent = "Automation";

    var all_control = document.createElement("button");
    var zone_control = document.createElement("button");

    all_control.textContent = "All";
    zone_control.textContent = "Zone";

    function setAutomationClasses() {
        all_control.className = GAMESTATE.automation_mode == AutomationMode.All ? "on" : "off";
        zone_control.className = GAMESTATE.automation_mode == AutomationMode.Zone ? "on" : "off";
    }

    setAutomationClasses();

    all_control.addEventListener("click", () => {
        GAMESTATE.automation_mode = GAMESTATE.automation_mode == AutomationMode.All ? AutomationMode.Off : AutomationMode.All;
        setAutomationClasses();
    });
    zone_control.addEventListener("click", () => {
        GAMESTATE.automation_mode = GAMESTATE.automation_mode == AutomationMode.Zone ? AutomationMode.Off : AutomationMode.Zone;
        setAutomationClasses();
    });

    setupTooltip(all_control, function () {
        var tooltip = `<h3>Automate ${all_control.textContent}</h3>`;

        tooltip += "Toggle between automating tasks in all zones, and not automating";
        tooltip += "<br>Right-click tasks to designate them as automated";
        tooltip += "<br>They'll be executed in the order you right-clicked them, as indicated by the number in their corner";

        return tooltip;
    });

    setupTooltip(zone_control, function () {
        var tooltip = `<h3> Automate${zone_control.textContent}</h3>`;

        tooltip += "Toggle between automating tasks in the current zone, and not automating";
        tooltip += "<br>Right-click tasks to designate them as automated";
        tooltip += "<br>They'll be executed in the order you right-clicked them, as indicated by the number in their corner";

        return tooltip;
    });

    automation.appendChild(automation_text);
    automation.appendChild(all_control);
    automation.appendChild(zone_control);
    RENDERING.controls_list_element.appendChild(automation);
}

// MARK: Extra stats

function updateExtraStats() {
    if (GAMESTATE.has_unlocked_power && RENDERING.power_element.style.display == "none") {
        RENDERING.power_element.style.display = "block";
        setupTooltip(RENDERING.power_element, function () {
            var tooltip = `<h3>💪Power: ${GAMESTATE.power.toFixed(0)}</h3>`;

            tooltip += `Increases Combat and Fortitude speed by ${GAMESTATE.power}%`;

            return tooltip;
        });
    }

    const power_text = `💪Power: ${GAMESTATE.power.toFixed(0)}`;
    if (RENDERING.power_element.textContent != power_text) {
        RENDERING.power_element.textContent = power_text;
    }

    if (hasPerk(PerkType.Attunement) && RENDERING.attunement_element.style.display == "none") {
        RENDERING.attunement_element.style.display = "block";
        setupTooltip(RENDERING.attunement_element, function () {
            var tooltip = `<h3>🌀Attunement: ${GAMESTATE.attunement.toFixed(0)}</h3>`;

            tooltip += `Increases Study, Magic, and Druid speed by ${GAMESTATE.attunement / 10}%`;

            return tooltip;
        });
    }

    const attunement_text = `🌀Attunement: ${GAMESTATE.attunement.toFixed(0)}`;
    if (RENDERING.attunement_element.textContent != attunement_text) {
        RENDERING.attunement_element.textContent = attunement_text;
    }
}

// MARK: Rendering

export class Rendering {
    tooltip_element: HTMLElement;
    game_over_element: HTMLElement;
    end_of_content_element: HTMLElement;
    settings_element: HTMLElement;
    energy_element: HTMLElement;
    messages_element: HTMLElement;
    power_element: HTMLElement;
    attunement_element: HTMLElement;
    task_elements: Map<TaskDefinition, ElementWithTooltip> = new Map();
    skill_elements: Map<SkillType, HTMLElement> = new Map();
    item_elements: Map<ItemType, HTMLElement> = new Map();
    perk_elements: Map<PerkType, HTMLElement> = new Map();
    controls_list_element: HTMLElement;

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

    constructor() {
        function getElement(name: string): HTMLElement {
            var energy_div = document.getElementById(name);
            if (energy_div) {
                return energy_div;
            }
            else {
                console.error(`The element with ID '${name}' was not found.`);
                return new HTMLElement();
            }
        }

        this.energy_element = getElement("energy");

        setupTooltip(this.energy_element, function () {
            var tooltip = `<h3>Energy - ${GAMESTATE.current_energy.toFixed(0)}/${GAMESTATE.max_energy.toFixed(0)}</h3>`;
            tooltip += `Energy goes down over time while you have a Task active`;
            tooltip += `<br>Tasks with multiple skills scale by the square or cube root of the skill level bonuses`;
            tooltip += `<br>Bonuses not from levels (E.G., from Items and Perks) are not scaled down this way`;
            return tooltip;
        });

        this.tooltip_element = getElement("tooltip");
        this.game_over_element = getElement("game-over-overlay");
        this.end_of_content_element = getElement("game-over-overlay");
        this.game_over_element = getElement("end-of-content-overlay");
        this.settings_element = getElement("settings-overlay");
        this.game_over_element = getElement("game-over-overlay");
        this.messages_element = getElement("messages");
        this.controls_list_element = getElement("controls-list");
        this.power_element = getElement("power");
        this.attunement_element = getElement("attunement");
    }

    public initialize() {
        setupGameOverRestartListener(this.game_over_element);
        setupSettings(this.settings_element);
        setupControls();
        setupInfoTooltips();
    }

    public start() {
        this.createTasks();
        recreateSkills();

        setupZone();
        createPerks();

        updateRendering();

        // Unhide the game now that it's ready
        (document.getElementById("game-area") as HTMLElement).style.display = "block";
    }
}

function checkZone() {
    if (RENDERING.current_zone == GAMESTATE.current_zone) {
        return;
    }

    RENDERING.current_zone = GAMESTATE.current_zone;
    recreateTasks();
    setupControls();
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
    const x = elementRect.right + window.scrollX;
    const y = elementRect.top + window.scrollY;

    var tooltip_element = RENDERING.tooltip_element;
    tooltip_element.innerHTML = element.generateTooltip();

    tooltip_element.style.left = x + "px";
    tooltip_element.style.top = y + "px";
    tooltip_element.style.display = "block";
}

export function updateRendering() {
    handleEvents();
    checkZone();
    updateTaskRendering();
    updateSkillRendering();
    updateEnergyRendering();
    updateItems();
    updatePerks();
    updateExtraStats();
    updateGameOver();
}
