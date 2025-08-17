import { Task, ZONES, SkillType, TaskType, TASK_LOOKUP, TaskDefinition, SKILL_DEFINITIONS, SkillDefinition } from "./zones.js";
import { GAMESTATE } from "./game.js";
import { HASTE_MULT, ItemDefinition, ITEMS, ItemType } from "./items.js";
import { PerkType } from "./perks.js";
import { SkillUpContext, EventType, RenderEvent, GainedPerkContext, UsedItemContext, UnlockedTaskContext, UnlockedSkillContext } from "./events.js";

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
    var xp = task_progress * xp_mult * task.task_definition.xp_mult;

    if (hasPerk(PerkType.Writing)) {
        xp *= 1.5;
    }

    xp *= Math.pow(1.25, task.task_definition.zone_id);

    return xp;
}

export function calcSkillXpNeeded(skill: Skill): number {
    return calcSkillXpNeededAtLevel(skill.level, skill.type);
}

export function calcSkillXpNeededAtLevel(level: number, skill_type: SkillType): number {
    const exponent_base = 1.02;
    const base_amount = 10;
    const skill_modifier = (SKILL_DEFINITIONS[skill_type] as SkillDefinition).xp_needed_mult;

    return Math.pow(exponent_base, level) * base_amount * skill_modifier;
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
            if (hasPerk(PerkType.VillageHero)) {
                mult *= 1.2;
            }
            if (hasPerk(PerkType.UndergroundConnection)) {
                mult *= 1.2;
            }
            break;
        case SkillType.Magic:
            if (hasPerk(PerkType.Amulet)) {
                mult *= 1.5;
            }
            break;
        case SkillType.Subterfuge:
            if (hasPerk(PerkType.UndergroundConnection)) {
                mult *= 1.4;
            }
            break;
        case SkillType.Combat:
            if (hasPerk(PerkType.VillageHero)) {
                mult *= 1.2;
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
    const zone_exponent = 1.75;
    const zone_mult = Math.pow(zone_exponent, task.task_definition.zone_id);

    return base_cost * task.task_definition.cost_multiplier * zone_mult;
}

export function calcTaskProgressMultiplier(task: Task): number {
    var mult = 1;

    var skill_level_mult = 1;
    for (const skill_type of task.task_definition.skills) {
        skill_level_mult *= calcSkillTaskProgressMultiplierFromLevel(getSkill(skill_type).level);
    }

    // Avoid multi-skill tasks scaling much faster than all other tasks
    mult *= Math.pow(skill_level_mult, 1 / task.task_definition.skills.length);

    for (const skill_type of task.task_definition.skills) {
        mult *= calcSkillTaskProgressWithoutLevel(skill_type);
    }

    if (task.hasted)
    {
        mult *= HASTE_MULT;
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
        modifyEnergy(-calcEnergyDrainPerTick(active_task, progress >= cost));
        for (const skill of active_task.task_definition.skills) {
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
        if (!task.hasted && GAMESTATE.queued_scrolls_of_haste > 0)
        {
            task.hasted = true;
            GAMESTATE.queued_scrolls_of_haste--;
        }
    }
}

function finishTask(task: Task) {
    if (task.task_definition.type == TaskType.Travel) {
        advanceZone();
    }

    if (task.task_definition.item != ItemType.Count) {
        addItem(task.task_definition.item, 1);
    }

    task.reps += 1;
    if (task.reps < task.task_definition.max_reps) {
        task.progress = 0;
    }

    task.hasted = false;

    const fully_finished = task.reps == task.task_definition.max_reps;
    if (fully_finished && task.task_definition.perk != PerkType.Count) {
        addPerk(task.task_definition.perk);
    }

    if (fully_finished && task.task_definition.unlocks_task >= 0)
    {
        unlockTask(task.task_definition.unlocks_task);
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
        const finished = task.reps >= task.task_definition.max_reps;
        task.enabled = !finished;
        has_unfinished_mandatory_task = has_unfinished_mandatory_task || (task.task_definition.type == TaskType.Mandatory && !finished);
    }

    if (has_unfinished_mandatory_task) {
        for (var task of GAMESTATE.tasks) {
            if (task.task_definition.type == TaskType.Travel) {
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
            if (task.hidden_by_default && !GAMESTATE.unlocked_tasks.includes(task.id))
            {
                continue;
            }

            GAMESTATE.tasks.push(new Task(task));
            for (const skill of task.skills) {
                if (!GAMESTATE.unlocked_skills.includes(skill)) {   
                    GAMESTATE.unlocked_skills.push(skill);
                    const context: UnlockedSkillContext = { skill: skill };
                    const event = new RenderEvent(EventType.UnlockedSkill, context);
                    GAMESTATE.queueRenderEvent(event);
                }
            }
        }
    }

    updateEnabledTasks();
}

export function toggleRepeatTasks() {
    GAMESTATE.repeat_tasks = !GAMESTATE.repeat_tasks;
}

function unlockTask(task_id: number) {
    if (GAMESTATE.unlocked_tasks.includes(task_id))
    {
        return;
    }

    const task = TASK_LOOKUP.get(task_id) as TaskDefinition;
    GAMESTATE.unlocked_tasks.push(task_id);
    GAMESTATE.tasks.push(new Task(task));

    const context: UnlockedTaskContext = { task_definition: task };
    const event = new RenderEvent(EventType.UnlockedTask, context);
    GAMESTATE.queueRenderEvent(event);
}

// MARK: Energy

function modifyEnergy(delta: number) {
    GAMESTATE.current_energy += delta;
}

export function calcEnergyDrainPerTick(task: Task, is_single_tick: boolean): number {
    var drain = 1;
    
    if (is_single_tick && hasPerk(PerkType.MinorTimeCompression))
    {
        drain *= 0.2;
    }

    if (hasPerk(PerkType.HighAltitudeClimbing))
    {
        drain *= 0.8;
    }

    return drain;
}

function checkEnergyReset() {
    if (GAMESTATE.current_energy > 0) {
        return;
    }

    GAMESTATE.is_in_game_over = true;
    GAMESTATE.current_energy = 0;
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
        if (key == "task_definition") {
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
        var value = data[key];

        // Convert it back to a Map if that's what we want
        if ((GAMESTATE as any)[key] instanceof Map) {
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
    unlocked_tasks: number[] = [];
    current_zone: number = 0;
    repeat_tasks = true;

    skills_at_start_of_reset: number[] = [];
    skills: Skill[] = [];
    unlocked_skills: SkillType[] = [];
    perks: Map<PerkType, boolean> = new Map();
    items: Map<ItemType, number> = new Map();
    queued_scrolls_of_haste = 0;

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
