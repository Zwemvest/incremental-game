import { Task, ZONES, SkillType, TaskType } from "./zones.js";
import { GAMESTATE } from "./game.js";
import { ItemDefinition, ITEMS, ItemType } from "./items.js";
import { PerkType } from "./perks.js";

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
    const xp_mult = 0.25;
    return task_progress * xp_mult * task.definition.xp_mult;
}

export function calcSkillXpNeeded(skill: Skill): number {
    return calcSkillXpNeededAtLevel(skill.level);
}

export function calcSkillXpNeededAtLevel(level: number): number {
    const exponent_base = 1.02;
    const mult = 1;

    return Math.pow(exponent_base, level) * mult;
}

function addSkillXp(skill: SkillType, xp: number) {
    var skill_entry = getSkill(skill);

    skill_entry.progress += xp;
    const xp_to_level_up = calcSkillXpNeeded(skill_entry);

    if (skill_entry.progress >= xp_to_level_up) {
        skill_entry.progress -= xp_to_level_up;
        skill_entry.level += 1;
    }
}

function removeTemporarySkillBonuses() {
    for (var skill of GAMESTATE.skills.values()) {
        skill.speed_modifier = 1;
    }
}

export function calcSkillTaskProgressMultiplier(skill_type: SkillType): number {
    var mult = 1;

    const exponent = 1.01;
    var skill = getSkill(skill_type);
    mult *= Math.pow(exponent, skill.level);
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

export function getSkill(skill: SkillType): Skill {
    const ret = GAMESTATE.skills[skill];
    if (!ret) {
        console.log("Couldn't find skill");
        return new Skill(skill);
    }
    return ret;
}

function initializeSkills() {
    for (let i = 0; i < SkillType.Count; i++) {
        GAMESTATE.skills.push(new Skill(i));
    }
}

// MARK: Tasks

export function calcTaskCost(task: Task): number {
    const base_cost = 10;
    return base_cost * task.definition.cost_multiplier;
}

export function calcTaskProgressMultiplier(task: Task): number {
    var mult = 1;

    for (const skill_type of task.definition.skills) {
        mult *= calcSkillTaskProgressMultiplier(skill_type);
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
        console.log(GAMESTATE.active_task);
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

    updateEnabledTasks();
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

function resetTasks() {
    initializeTasks();
    updateEnabledTasks();
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

    doEnergyReset();
}

function doEnergyReset() {
    GAMESTATE.current_zone = 0;
    resetTasks();

    GAMESTATE.current_energy = GAMESTATE.max_energy;
    GAMESTATE.energy_reset_count += 1;

    removeTemporarySkillBonuses();
    halveItemCounts();
}

// MARK: Items

function addItem(item: ItemType, count: number) {
    var oldValue = GAMESTATE.items.get(item) ?? 0;
    GAMESTATE.items.set(item, oldValue + count);
}

export function clickItem(item: ItemType) {
    var definition = ITEMS[item] as ItemDefinition;
    var oldValue = GAMESTATE.items.get(item) ?? 0;

    if (oldValue <= 0) {
        console.error("Not held item?");
        return;
    }

    definition.on_consume(oldValue);
    GAMESTATE.items.set(item, 0);
}

function halveItemCounts() {
    for (var [key, value] of GAMESTATE.items) {
        GAMESTATE.items.set(key, Math.ceil(value / 2));
    }
}

// MARK: Perks
function addPerk(perk: PerkType) {
    if (perk == PerkType.EnergySpell && !hasPerk(perk))
    {
        GAMESTATE.max_energy += 50;
    }

    GAMESTATE.perks.set(perk, true);
}

export function hasPerk(perk: PerkType): boolean {
    return GAMESTATE.perks.get(perk) == true;
}

// MARK: Gamestate

export class Gamestate {
    tick_interval_ms = 100;

    tasks: Task[] = [];
    active_task: Task | null = null;
    current_zone: number = 0;

    skills: Skill[] = [];
    items: Map<ItemType, number> = new Map();
    perks: Map<PerkType, boolean> = new Map();

    current_energy = 100;
    max_energy = 100;
    energy_reset_count = 0;

    public start() {
        resetTasks();
        initializeSkills();
    }
}

function advanceZone() {
    GAMESTATE.current_zone += 1;
    resetTasks();
}

export function updateGamestate() {
    updateActiveTask();
    checkEnergyReset();
}

(window as any).setProgressMult = (new_mult: number) => progress_mult = new_mult;
