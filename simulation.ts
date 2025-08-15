import { Task, ZONES, SkillType, TaskType, TASK_LOOKUP, TaskDefinition } from "./zones.js";
import { GAMESTATE } from "./game.js";
import { ItemDefinition, ITEMS, ItemType } from "./items.js";
import { PerkType } from "./perks.js";
import { SkillUpContext, EventType, RenderEvent, GainedPerkContext, UsedItemContext } from "./events.js";

// MARK: Skills

var progress_mult = 1;

export class Skill {
    type: SkillType;
    level: number = 0;
    progress: number = 0;
    speed_modifier: number = 1;

    constructor(type: SkillType) {
        this.type = type;
    }
}

export function calcSkillXp(task: Task, task_progress: number): number {
    const xp_mult = 8;
    var xp = task_progress * xp_mult * task.definition.xp_mult;

    if (hasPerk(PerkType.Writing)) {
        xp *= 1.5;
    }

    xp *= Math.pow(1.1, task.definition.zone_id);

    return xp;
}

export function calcSkillXpNeeded(skill: Skill): number {
    return calcSkillXpNeededAtLevel(skill.level);
}

export function calcSkillXpNeededAtLevel(level: number): number {
    const exponent_base = 1.02;
    const base_amount = 10;

    return Math.pow(exponent_base, level) * base_amount;
}

function addSkillXp(skill: SkillType, xp: number) {
    var skill_entry = getSkill(skill);

    skill_entry.progress += xp;
    var xp_to_level_up = calcSkillXpNeeded(skill_entry);

    const old_level = skill_entry.level;
    while (skill_entry.progress >= xp_to_level_up) {
        skill_entry.progress -= xp_to_level_up;
        skill_entry.level += 1;
        xp_to_level_up = calcSkillXpNeeded(skill_entry);
    }

    if (skill_entry.level > old_level) {
        const context: SkillUpContext = { skill: skill_entry.type, new_level: skill_entry.level };
        const event = new RenderEvent(EventType.SkillUp, context);
        GAMESTATE.queueRenderEvent(event);
    }
}

function removeTemporarySkillBonuses() {
    for (var skill of GAMESTATE.skills.values()) {
        skill.speed_modifier = 1;
    }
}

export function calcSkillTaskProgressMultiplierFromLevel(level: number): number {
    const exponent = 1.01;
    return Math.pow(exponent, level);
}

function calcSkillTaskProgressWithoutLevel(skill_type: SkillType): number {
    var mult = 1;

    var skill = getSkill(skill_type);
    mult *= skill.speed_modifier;

    switch (skill_type) {
        case SkillType.Study:
            if (hasPerk(PerkType.Reading)) {
                mult *= 1.5;
            }
            break;
        case SkillType.Charisma:
            if (hasPerk(PerkType.VillagerGratitude)) {
                mult *= 1.5;
            }
            break;
        case SkillType.Magic:
            if (hasPerk(PerkType.Amulet)) {
                mult *= 1.5;
            }
            break;
    }

    return mult;
}

export function calcSkillTaskProgressMultiplier(skill_type: SkillType): number {
    var skill = getSkill(skill_type);
    var mult = calcSkillTaskProgressWithoutLevel(skill_type);
    mult *= calcSkillTaskProgressMultiplierFromLevel(skill.level);
    return mult;
}

export function getSkill(skill: SkillType): Skill {
    const ret = GAMESTATE.skills[skill];
    if (!ret) {
        console.error("Couldn't find skill");
        return new Skill(skill);
    }
    return ret;
}

function initializeSkills() {
    for (let i = 0; i < SkillType.Count; i++) {
        GAMESTATE.skills.push(new Skill(i));
        GAMESTATE.skills_at_start_of_reset.push(0);
    }
}

function storeSkillLevelsForNextGameOver() {
    for (let i = 0; i < SkillType.Count; i++) {
        GAMESTATE.skills_at_start_of_reset[i] = getSkill(i).level;
    }
}


// MARK: Tasks

export function calcTaskCost(task: Task): number {
    const base_cost = 10;
    const zone_exponent = 1.7;
    const zone_mult = Math.pow(zone_exponent, task.definition.zone_id);

    return base_cost * task.definition.cost_multiplier * zone_mult;
}

export function calcTaskProgressMultiplier(task: Task): number {
    var mult = 1;

    var skill_level_mult = 1;
    for (const skill_type of task.definition.skills) {
        skill_level_mult *= calcSkillTaskProgressMultiplierFromLevel(getSkill(skill_type).level);
    }

    // Avoid multi-skill tasks scaling much faster than all other tasks
    mult *= Math.pow(skill_level_mult, 1 / task.definition.skills.length);

    for (const skill_type of task.definition.skills) {
        mult *= calcSkillTaskProgressWithoutLevel(skill_type);
    }

    return mult * progress_mult;
}

function calcTaskProgressPerTick(task: Task): number {
    return calcTaskProgressMultiplier(task);
}

function updateActiveTask() {
    var active_task = GAMESTATE.active_task;
    if (!active_task) {
        return;
    }

    const cost = calcTaskCost(active_task);
    if (active_task.progress < cost) {
        const progress = calcTaskProgressPerTick(active_task);
        active_task.progress += progress;
        modifyEnergy(-calcEnergyDrainPerTick(active_task));
        for (const skill of active_task.definition.skills) {
            addSkillXp(skill, calcSkillXp(active_task, progress));
        }

        if (active_task.progress >= cost) {
            finishTask(active_task);
        }
    }
}

export function clickTask(task: Task) {
    if (GAMESTATE.active_task == task) {
        GAMESTATE.active_task = null;
    }
    else {
        GAMESTATE.active_task = task;
    }
}

function finishTask(task: Task) {
    if (task.definition.type == TaskType.Travel) {
        advanceZone();
    }

    if (task.definition.item != ItemType.Count) {
        addItem(task.definition.item, 1);
    }

    task.reps += 1;
    if (task.reps < task.definition.max_reps) {
        task.progress = 0;
    }

    if (task.reps == task.definition.max_reps && task.definition.perk != PerkType.Count) {
        addPerk(task.definition.perk);
    }

    if (!GAMESTATE.repeat_tasks)
    {
        GAMESTATE.active_task = null;
    }

    updateEnabledTasks();
    saveGame();
}

function updateEnabledTasks() {
    var has_unfinished_mandatory_task = false;

    for (var task of GAMESTATE.tasks) {
        const finished = task.reps >= task.definition.max_reps;
        task.enabled = !finished;
        has_unfinished_mandatory_task = has_unfinished_mandatory_task || (task.definition.type == TaskType.Mandatory && !finished);
    }

    if (has_unfinished_mandatory_task) {
        for (var task of GAMESTATE.tasks) {
            if (task.definition.type == TaskType.Travel) {
                task.enabled = false;
            }
        }
    }
}

export function resetTasks() {
    initializeTasks();
    updateEnabledTasks();
    GAMESTATE.is_at_end_of_content = false;
}

function initializeTasks() {
    GAMESTATE.active_task = null;
    GAMESTATE.tasks = [];

    const zone = ZONES[GAMESTATE.current_zone];
    if (zone) {
        for (const task of zone.tasks) {
            GAMESTATE.tasks.push(new Task(task));
        }
    }

    updateEnabledTasks();
}

export function toggleRepeatTasks() {
    GAMESTATE.repeat_tasks = !GAMESTATE.repeat_tasks;
}

// MARK: Energy

function modifyEnergy(delta: number) {
    GAMESTATE.current_energy += delta;
}

export function calcEnergyDrainPerTick(task: Task): number {
    return 1;
}

function checkEnergyReset() {
    if (GAMESTATE.current_energy > 0) {
        return;
    }

    GAMESTATE.is_in_game_over = true;
}

export function doEnergyReset() {
    GAMESTATE.current_zone = 0;
    resetTasks();

    GAMESTATE.current_energy = GAMESTATE.max_energy;
    GAMESTATE.energy_reset_count += 1;
    GAMESTATE.is_in_game_over = false;

    removeTemporarySkillBonuses();
    halveItemCounts();
    storeSkillLevelsForNextGameOver();
    saveGame();
}

// MARK: Items

function addItem(item: ItemType, count: number) {
    var oldValue = GAMESTATE.items.get(item) ?? 0;
    GAMESTATE.items.set(item, oldValue + count);
}

export function clickItem(item: ItemType, use_all: boolean) {
    var definition = ITEMS[item] as ItemDefinition;
    var old_value = GAMESTATE.items.get(item) ?? 0;

    if (old_value <= 0) {
        console.error("Not held item?");
        return;
    }

    const num_used = use_all ? old_value : 1;
    definition.on_consume(num_used);
    GAMESTATE.items.set(item, old_value - num_used);

    const context: UsedItemContext = { item: item, count: num_used };
    const event = new RenderEvent(EventType.UsedItem, context);
    GAMESTATE.queueRenderEvent(event);
}

function halveItemCounts() {
    for (var [key, value] of GAMESTATE.items) {
        GAMESTATE.items.set(key, Math.ceil(value / 2));
    }
}

// MARK: Perks
function addPerk(perk: PerkType) {
    if(hasPerk(perk))
    {
        return;
    }

    if (perk == PerkType.EnergySpell) {
        GAMESTATE.max_energy += 50;
    }

    GAMESTATE.perks.set(perk, true);
    
    const context: GainedPerkContext = { perk: perk };
    const event = new RenderEvent(EventType.GainedPerk, context);
    GAMESTATE.queueRenderEvent(event);
}

export function hasPerk(perk: PerkType): boolean {
    return GAMESTATE.perks.get(perk) == true;
}

// MARK: Persistence

export const SAVE_LOCATION = "incrementalGameSave";

export function saveGame() {
    const saveData: any = {};

    for (const key in GAMESTATE) {
        if (key == "active_task") {
            continue; // This would feel weird for the player if was persisted
        }

        if (GAMESTATE.hasOwnProperty(key)) {
            const value = (GAMESTATE as any)[key];
            // Check if the value is a Map and convert it to an array
            if (value instanceof Map) {
                saveData[key] = Array.from(value.entries());
            } else {
                saveData[key] = value;
            }
        }
    }

    // Save to localStorage
    const json = JSON.stringify(saveData, (key, value) => {
        if (typeof value === 'object' && value !== null && 'id' in value) {
            return value.id; // Replace object with its ID
        }
        return value;
    });

    localStorage.setItem(SAVE_LOCATION, json);
}

function parseSave(save: string): any {
    const data = JSON.parse(save, function (key, value) {
        if (key == "definition") {
            return TASK_LOOKUP.get(value); // Replace ID with the actual object
        }
        return value;
    });

    return data;
}

function loadGame(): boolean {
    const saved_game = localStorage.getItem(SAVE_LOCATION);
    if (!saved_game) {
        return false;
    }

    try {
        const data = parseSave(saved_game);
        loadGameFromData(data);
    } catch (e) {
        return false;
    }

    return true;
}

function loadGameFromData(data: any) {
    Object.keys(data).forEach(key => {
        const value = data[key];
        // Check if the value is an array of entries and convert it back to a Map
        if (Array.isArray(value) && value.every(entry => Array.isArray(entry) && entry.length === 2)) {
            (GAMESTATE as any)[key] = new Map(value);
        } else {
            (GAMESTATE as any)[key] = value;
        }
    });
}

// MARK: Gamestate

export class Gamestate {
    tick_interval_ms = 100;

    tasks: Task[] = [];
    active_task: Task | null = null;
    current_zone: number = 0;
    repeat_tasks = true;

    skills_at_start_of_reset: number[] = [];
    skills: Skill[] = [];
    items: Map<ItemType, number> = new Map();
    perks: Map<PerkType, boolean> = new Map();

    is_in_game_over = false;
    is_at_end_of_content = false;
    current_energy = 100;
    max_energy = 100;
    energy_reset_count = 0;

    pending_render_events: RenderEvent[] = [];

    public start() {
        if (!loadGame()) {
            this.initialize();
        }
    }

    public initialize() {
        resetTasks();
        initializeSkills();
    }

    public popRenderEvents(): RenderEvent[] {
        var events = this.pending_render_events;
        this.pending_render_events = [];
        return events;
    }

    public queueRenderEvent(event: RenderEvent) {
        this.pending_render_events.push(event);
    }
}

function advanceZone() {
    if ((GAMESTATE.current_zone + 1) >= ZONES.length) {
        GAMESTATE.is_at_end_of_content = true;
        return;
    }

    GAMESTATE.current_zone += 1;
    resetTasks();
}

export function updateGamestate() {
    if (GAMESTATE.is_in_game_over) {
        return;
    }

    updateActiveTask();
    checkEnergyReset();
}

(window as any).setProgressMult = (new_mult: number) => progress_mult = new_mult;
(window as any).saveGame = () => saveGame();
(window as any).doEnergyReset = () => doEnergyReset();
