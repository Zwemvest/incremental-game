import { Task, ZONES, Skill, TaskType } from "./zones.js";
import { GAMESTATE } from "./game.js";

// MARK: Skills

export class SkillProgress {
    skill: Skill;
    level: number = 0;
    progress: number = 0;

    constructor(skill: Skill) {
        this.skill = skill;
    }
}

function calcSkillProgressPerTick(progress: number): number {
    return progress;
}

export function calcSkillXpNeeded(skill: SkillProgress): number {
    const exponent_base = 1.02;
    const mult = 1;

    return Math.pow(exponent_base, skill.level) * mult;
}

function addSkillXp(skill: Skill, xp: number) {
    var skill_entry = GAMESTATE.getSkill(skill);

    skill_entry.progress += xp;
    const xp_to_level_up = calcSkillXpNeeded(skill_entry);

    if (skill_entry.progress >= xp_to_level_up) {
        skill_entry.progress -= xp_to_level_up;
        skill_entry.level += 1;
    }
}

// MARK: Tasks

function calcTaskProgressPerTick(task: Task): number {
    var progress = 1;

    for (const skill of task.definition.skills) {
        const exponent = 1.01;
        progress *= Math.pow(exponent, GAMESTATE.getSkill(skill).level);
    }

    return progress;
}

function updateActiveTask() {
    var active_task = GAMESTATE.active_task;
    if (!active_task) {
        return;
    }

    if (active_task.progress < active_task.definition.max_progress) {
        const progress = calcTaskProgressPerTick(active_task);
        active_task.progress += progress;
        modifyEnergy(-calcEnergyDrainPerTick(active_task));
        for (const skill of active_task.definition.skills) {
            addSkillXp(skill, calcSkillProgressPerTick(progress));
        }

        if (active_task.progress >= active_task.definition.max_progress)
        {
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

function finishTask(task: Task)
{
    if (task.definition.type == TaskType.Travel)
    {
        advanceZone();
    }
}

// MARK: Energy

function modifyEnergy(delta: number) {
    GAMESTATE.current_energy += delta;
}

function calcEnergyDrainPerTick(task: Task): number {
    return 1;
}

function checkEnergyReset() {
    if (GAMESTATE.current_energy > 0) {
        GAMESTATE.did_energy_reset_this_tick = false;
        return;
    }

    doEnergyReset();
}

function doEnergyReset() {
    GAMESTATE.current_zone = 0;
    GAMESTATE.initializeTasks();
    GAMESTATE.current_energy = GAMESTATE.max_energy;
    GAMESTATE.did_energy_reset_this_tick = true;
}

// MARK: Gamestate

export class Gamestate {
    tasks: Task[] = [];
    active_task: Task | null = null;
    current_zone: number = 0;

    skills: SkillProgress[] = [];

    current_energy = 100;
    max_energy = 100;
    did_energy_reset_this_tick = false;

    public initializeTasks() {
        this.active_task = null;
        this.tasks = [];

        const zone = ZONES[this.current_zone];
        if (zone) {
            for (const task of zone.tasks) {
                this.tasks.push(new Task(task));
            }
        }
    }

    private initializeSkills() {
        for (let i = 0; i < Skill.Count; i++) {
            this.skills.push(new SkillProgress(i));
        }
    }

    constructor() {
        this.initializeTasks();
        this.initializeSkills();
    }

    public getSkill(skill: Skill): SkillProgress {
        const ret = this.skills[skill];
        if (!ret) {
            console.log("Couldn't find skill");
            return new SkillProgress(skill);
        }
        return ret;
    }
}

function advanceZone() {
    GAMESTATE.current_zone += 1;
    GAMESTATE.initializeTasks();
}

export function updateGamestate() {
    updateActiveTask();
    checkEnergyReset();
}
