import { Task, ZONES, SkillType, TaskType, TASK_LOOKUP, TaskDefinition, SKILL_DEFINITIONS, SkillDefinition } from "./zones.js";
import { GAMESTATE } from "./game.js";
import { HASTE_MULT, ItemDefinition, ITEMS, ITEMS_TO_NOT_AUTO_USE, ItemType } from "./items.js";
import { PerkType } from "./perks.js";
import { SkillUpContext, EventType, RenderEvent, GainedPerkContext, UsedItemContext, UnlockedTaskContext, UnlockedSkillContext, EventContext } from "./events.js";

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
            if (hasPerk(PerkType.PurgedBureaucracy)) {
                mult *= 1.3;
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
            if (hasPerk(PerkType.WalkWithoutRhythm)) {
                mult *= 1.4;
            }
            break;
        case SkillType.Combat:
            if (hasPerk(PerkType.VillageHero)) {
                mult *= 1.2;
            }
            if (hasPerk(PerkType.GoblinScourge)) {
                mult *= 1.3;
            }
            break;
        case SkillType.Survival:
            if (hasPerk(PerkType.SunkenTreasure)) {
                mult *= 1.3;
            }
            break;
        case SkillType.Fortitude:
            if (hasPerk(PerkType.GoblinScourge)) {
                mult *= 1.3;
            }
            if (hasPerk(PerkType.SunkenTreasure)) {
                mult *= 1.3;
            }
            break;
        case SkillType.Druid:
            if (hasPerk(PerkType.LostTemple)) {
                mult *= 1.5;
            }
            break;
        case SkillType.Travel:
            if (hasPerk(PerkType.ExperiencedTraveler)) {
                mult *= 1.5;
            }
            if (hasPerk(PerkType.WalkWithoutRhythm)) {
                mult *= 1.2;
            }
            break;
        case SkillType.Crafting:
            if (hasPerk(PerkType.PurgedBureaucracy)) {
                mult *= 1.3;
            }
            break;
    }

    switch (skill_type) {
        case SkillType.Combat:
        case SkillType.Fortitude:
            mult *= calcPowerSpeedBonusAtLevel(GAMESTATE.power);
            break;

        case SkillType.Study:
        case SkillType.Magic:
        case SkillType.Druid:
            mult *= calcAttunementSpeedBonusAtLevel(GAMESTATE.attunement);
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

function storeLoopStartNumbersForNextGameOver() {
    for (let i = 0; i < SkillType.Count; i++) {
        GAMESTATE.skills_at_start_of_reset[i] = getSkill(i).level;
    }

    GAMESTATE.attunement_at_start_of_reset = GAMESTATE.attunement;
    GAMESTATE.power_at_start_of_reset = GAMESTATE.power;
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

    if (task.hasted) {
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
        active_task = pickNextTaskInAutomationQueue();
    }
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
        if (!task.hasted && GAMESTATE.queued_scrolls_of_haste > 0) {
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

    if (fully_finished && task.task_definition.unlocks_task >= 0) {
        unlockTask(task.task_definition.unlocks_task);
    }

    addPower(calcPowerGain(task));
    addAttunement(calcAttunementGain(task));

    if (!GAMESTATE.repeat_tasks || fully_finished) {
        GAMESTATE.active_task = null;
    }

    if (task.task_definition.type == TaskType.Prestige) {
        GAMESTATE.is_at_end_of_content = true;
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
            if (task.hidden_by_default && !GAMESTATE.unlocked_tasks.includes(task.id)) {
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
    if (GAMESTATE.unlocked_tasks.includes(task_id)) {
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

    if (is_single_tick && hasPerk(PerkType.MinorTimeCompression)) {
        drain *= 0.2;
    }

    if (hasPerk(PerkType.HighAltitudeClimbing)) {
        drain *= 0.8;
    }

    if (hasPerk(PerkType.ReflectionsOnTheJourney)) {
        const zone_diff = GAMESTATE.highest_zone - task.task_definition.zone_id;
        drain *= Math.pow(0.95, zone_diff);
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
    if (hasPerk(PerkType.EnergeticMemory)) {
        GAMESTATE.max_energy += (GAMESTATE.current_zone + 1) / 10;
    }

    GAMESTATE.current_zone = 0;
    resetTasks();

    GAMESTATE.current_energy = GAMESTATE.max_energy;
    GAMESTATE.energy_reset_count += 1;
    GAMESTATE.is_in_game_over = false;
    GAMESTATE.automation_mode = AutomationMode.Off;
    GAMESTATE.queued_scrolls_of_haste = 0;

    removeTemporarySkillBonuses();
    halveItemCounts();
    storeLoopStartNumbersForNextGameOver();
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

function autoUseItems() {
    if (!GAMESTATE.auto_use_items) {
        return;
    }

    for (var [key, value] of GAMESTATE.items) {
        if (ITEMS_TO_NOT_AUTO_USE.includes(key)) {
            continue;
        }

        if (value > 0) {
            clickItem(key, true);
        }
    }
}

// MARK: Perks
function addPerk(perk: PerkType) {
    if (hasPerk(perk)) {
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

// MARK: Extra stats

function addPower(amount: number) {
    if (amount <= 0) {
        return;
    }

    if (!GAMESTATE.has_unlocked_power) {
        const event = new RenderEvent(EventType.UnlockedPower, new EventContext());
        GAMESTATE.queueRenderEvent(event);
        GAMESTATE.has_unlocked_power = true;
    }
    GAMESTATE.power += amount;
}

export function calcPowerGain(task: Task) {
    if (task.task_definition.type != TaskType.Boss) {
        return 0;
    }

    const mult = task.task_definition.zone_id - 1; // First boss is zone 3, which is internally 2
    const powerAmount = 5 * mult;
    return powerAmount;
}

export function calcPowerSpeedBonusAtLevel(level: number): number {
    return 1 + level / 100;
}

export function calcAttunementSpeedBonusAtLevel(level: number): number {
    return 1 + level / 1000;
}

function addAttunement(amount: number) {
    GAMESTATE.attunement += amount;
}

export function calcAttunementGain(task: Task): number {
    if (!hasPerk(PerkType.Attunement)) {
        return 0;
    }

    const attunement_skills = [SkillType.Druid, SkillType.Magic, SkillType.Study];
    if (!attunement_skills.some(skill => task.task_definition.skills.includes(skill))) {
        return 0;
    }

    const zone_mult = task.task_definition.zone_id + 1;
    return zone_mult;
}

// MARK: Automation

export enum AutomationMode {
    All,
    Zone,
    Off,
}

export function toggleAutomation(task: Task) {
    if (!hasPerk(PerkType.DeepTrance)) {
        return;
    }

    if (!GAMESTATE.automation_prios.has(task.task_definition.zone_id)) {
        GAMESTATE.automation_prios.set(task.task_definition.zone_id, []);
    }

    var prios = GAMESTATE.automation_prios.get(task.task_definition.zone_id) as number[];
    if (prios.includes(task.task_definition.id)) {
        prios.splice(prios.indexOf(task.task_definition.id), 1);
    }
    else {
        prios.push(task.task_definition.id);
        // Ensure travel always happens last
        prios.sort((a, b) => {
            const task_a = TASK_LOOKUP.get(a) as TaskDefinition;
            const task_b = TASK_LOOKUP.get(b) as TaskDefinition;
            if (task_a.type == TaskType.Travel || task_b.type == TaskType.Travel) {
                return task_a.type == TaskType.Travel ? 1 : -1;
            }
            return 0;
        });
    }
}

function pickNextTaskInAutomationQueue(): Task | null {
    if (GAMESTATE.automation_mode == AutomationMode.Off) {
        return null;
    }

    var prios = GAMESTATE.automation_prios.get(GAMESTATE.current_zone);
    if (!prios) {
        return null;
    }

    for (const task_id of prios) {
        for (const task of GAMESTATE.tasks) {
            if (task.task_definition.id != task_id) {
                continue;
            }

            if (!task.enabled) {
                break
            }

            return task;
        }
    }

    return null;
}

// MARK: Persistence

export const SAVE_LOCATION = "incrementalGameSave";

export function saveGame() {
    const saveData: any = {};

    for (const key in GAMESTATE) {
        if (key == "active_task") {
            continue; // This would feel weird for the player if was persisted
        }
        if (key == "automation_mode") {
            continue;
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
    highest_zone: number = 0;

    repeat_tasks = true;
    automation_mode = AutomationMode.Off;
    automation_prios: Map<number, number[]> = new Map();
    auto_use_items = false;

    skills_at_start_of_reset: number[] = [];
    power_at_start_of_reset = 0;
    attunement_at_start_of_reset = 0;

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

    power = 0;
    has_unlocked_power = false;

    attunement = 0;

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
    GAMESTATE.highest_zone = Math.max(GAMESTATE.highest_zone, GAMESTATE.current_zone);
    if (GAMESTATE.automation_mode == AutomationMode.Zone) {
        GAMESTATE.automation_mode = AutomationMode.Off;
    }

    resetTasks();
}

export function updateGamestate() {
    if (GAMESTATE.is_in_game_over) {
        return;
    }

    autoUseItems();
    updateActiveTask();
    checkEnergyReset();
}

(window as any).setProgressMult = (new_mult: number) => progress_mult = new_mult;
(window as any).saveGame = () => saveGame();
(window as any).doEnergyReset = () => doEnergyReset();
